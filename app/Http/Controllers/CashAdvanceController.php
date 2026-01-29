<?php

namespace App\Http\Controllers;

use App\Models\CashAdvance;
use App\Models\CashAdvancePolicy;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/**
 * Controller untuk mengelola Cash Advance (uang muka perjalanan dinas).
 * Mencakup pengajuan, approval, settlement, dan export.
 */
class CashAdvanceController extends Controller
{
    /**
     * Menampilkan daftar cash advance dengan filter.
     */
    public function index(Request $request)
    {
        $query = CashAdvance::with(['employee', 'policy', 'approver']);

        // Filter by policy
        if ($request->filled('policy_id')) {
            $query->byPolicy($request->policy_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_id', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($eq) use ($search) {
                        $eq->where('name', 'like', "%{$search}%")
                            ->orWhere('employee_id', 'like', "%{$search}%");
                    });
            });
        }

        $cashAdvances = $query->orderBy('created_at', 'desc')->paginate(10);
        $policies = CashAdvancePolicy::active()->get();

        // Stats
        $stats = [
            'total_pending' => CashAdvance::byStatus('pending')->sum('amount'),
            'total_approved' => CashAdvance::byStatus('approved')->sum('amount'),
            'total_need_settlement' => CashAdvance::byStatus('need_settlement')->sum('amount'),
            'count_pending' => CashAdvance::byStatus('pending')->count(),
            'count_need_settlement' => CashAdvance::byStatus('need_settlement')->count(),
        ];

        return Inertia::render('Finance/CashAdvance/Index', [
            'cashAdvances' => $cashAdvances,
            'policies' => $policies,
            'stats' => $stats,
            'filters' => $request->only(['policy_id', 'status', 'search']),
        ]);
    }

    /**
     * Menyimpan pengajuan cash advance baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'policy_id' => 'required|exists:cash_advance_policies,id',
            'date_of_use' => 'required|date|after:today',
            'amount' => 'required|numeric|min:10000',
            'purpose' => 'required|string|min:10',
        ]);

        // Cek policy limit
        $policy = CashAdvancePolicy::findOrFail($validated['policy_id']);
        if ($policy->max_amount && $validated['amount'] > $policy->max_amount) {
            return back()->withErrors(['amount' => "Jumlah melebihi batas policy ({$policy->max_amount})"]);
        }

        // Dapatkan employee dari user yang login
        $employeeId = Auth::user()->employee->id ?? 1;

        CashAdvance::create([
            'employee_id' => $employeeId,
            'policy_id' => $validated['policy_id'],
            'date_of_use' => $validated['date_of_use'],
            'amount' => $validated['amount'],
            'purpose' => $validated['purpose'],
            'status' => 'pending',
            'created_by' => Auth::user()->name ?? 'System',
        ]);

        return redirect()->route('finance.cash-advance.index')
            ->with('success', 'Pengajuan cash advance berhasil dibuat.');
    }

    /**
     * Approve cash advance.
     */
    public function approve(CashAdvance $cashAdvance)
    {
        if ($cashAdvance->status !== 'pending') {
            return back()->withErrors(['error' => 'Cash advance tidak dalam status pending.']);
        }

        $cashAdvance->update([
            'status' => 'need_settlement',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'updated_by' => Auth::user()->name ?? 'System',
        ]);

        return back()->with('success', 'Cash advance berhasil diapprove.');
    }

    /**
     * Reject cash advance.
     */
    public function reject(Request $request, CashAdvance $cashAdvance)
    {
        if ($cashAdvance->status !== 'pending') {
            return back()->withErrors(['error' => 'Cash advance tidak dalam status pending.']);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);

        $cashAdvance->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'updated_by' => Auth::user()->name ?? 'System',
        ]);

        return back()->with('success', 'Cash advance ditolak.');
    }

    /**
     * Settlement cash advance.
     */
    public function settle(Request $request, CashAdvance $cashAdvance)
    {
        if ($cashAdvance->status !== 'need_settlement') {
            return back()->withErrors(['error' => 'Cash advance tidak dalam status need settlement.']);
        }

        $validated = $request->validate([
            'settlement_amount' => 'required|numeric|min:0',
            'settlement_notes' => 'nullable|string',
        ]);

        $cashAdvance->update([
            'status' => 'settled',
            'settlement_amount' => $validated['settlement_amount'],
            'settlement_date' => now(),
            'settlement_notes' => $validated['settlement_notes'],
            'updated_by' => Auth::user()->name ?? 'System',
        ]);

        return back()->with('success', 'Settlement berhasil dicatat.');
    }

    /**
     * Export cash advances to CSV.
     */
    public function export(Request $request)
    {
        $cashAdvances = CashAdvance::with(['employee', 'policy'])
            ->orderBy('request_date', 'desc')
            ->get();

        $filename = 'cash_advance_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($cashAdvances) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Request ID',
                'Request Date',
                'Employee ID',
                'Employee Name',
                'Policy',
                'Purpose',
                'Amount',
                'Status',
                'Settlement Amount',
                'Settlement Date',
            ]);

            foreach ($cashAdvances as $ca) {
                fputcsv($file, [
                    $ca->request_id,
                    $ca->request_date->format('Y-m-d'),
                    $ca->employee->employee_id ?? '-',
                    $ca->employee->name ?? '-',
                    $ca->policy->name ?? '-',
                    $ca->purpose,
                    $ca->amount,
                    $ca->status,
                    $ca->settlement_amount,
                    $ca->settlement_date?->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Settings untuk policies.
     */
    public function settings()
    {
        $policies = CashAdvancePolicy::orderBy('name')->get();

        return Inertia::render('Finance/CashAdvance/Settings', [
            'policies' => $policies,
        ]);
    }

    /**
     * Store new policy.
     */
    public function storePolicy(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:cash_advance_policies,code',
            'max_amount' => 'nullable|numeric|min:0',
            'settlement_days' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        CashAdvancePolicy::create($validated);

        return back()->with('success', 'Policy berhasil ditambahkan.');
    }
}
