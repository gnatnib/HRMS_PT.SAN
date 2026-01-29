<?php

namespace App\Http\Controllers;

use App\Models\Reimbursement;
use App\Models\ExpenseCategory;
use App\Models\ReimbursementType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ReimbursementController extends Controller
{
    /**
     * Menampilkan halaman settings jenis reimbursement.
     */
    public function settings()
    {
        $types = ReimbursementType::orderBy('name')->get()->map(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'limit' => $type->formatted_limit,
                'limit_amount' => $type->limit_amount,
                'is_unlimited' => $type->is_unlimited,
                'expired' => $type->formatted_expired,
                'expired_type' => $type->expired_type,
                'expired_at' => $type->expired_at?->format('Y-m-d'),
                'expired_months' => $type->expired_months,
                'effective_date' => $type->effective_date->format('Y-m-d'),
                'is_active' => $type->is_active,
                'requires_receipt' => $type->requires_receipt,
            ];
        });

        return Inertia::render('Finance/Reimbursement/Settings', [
            'types' => $types,
        ]);
    }

    /**
     * Menyimpan jenis reimbursement baru.
     */
    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:reimbursement_types,code',
            'is_unlimited' => 'boolean',
            'limit_amount' => 'nullable|numeric|min:0',
            'expired_type' => 'required|in:date,months',
            'expired_at' => 'nullable|date',
            'expired_months' => 'nullable|integer|min:1',
            'effective_date' => 'required|date',
            'requires_receipt' => 'boolean',
        ]);

        ReimbursementType::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'is_unlimited' => $validated['is_unlimited'] ?? false,
            'limit_amount' => $validated['is_unlimited'] ? null : $validated['limit_amount'],
            'expired_type' => $validated['expired_type'],
            'expired_at' => $validated['expired_type'] === 'date' ? $validated['expired_at'] : null,
            'expired_months' => $validated['expired_type'] === 'months' ? $validated['expired_months'] : null,
            'effective_date' => $validated['effective_date'],
            'requires_receipt' => $validated['requires_receipt'] ?? true,
            'is_active' => true,
            'created_by' => auth()->user()->name ?? 'System',
        ]);

        return back()->with('success', 'Jenis reimbursement berhasil ditambahkan.');
    }

    /**
     * Update jenis reimbursement.
     */
    public function updateType(Request $request, ReimbursementType $type)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_unlimited' => 'boolean',
            'limit_amount' => 'nullable|numeric|min:0',
            'expired_type' => 'required|in:date,months',
            'expired_at' => 'nullable|date',
            'expired_months' => 'nullable|integer|min:1',
            'effective_date' => 'required|date',
            'requires_receipt' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $type->update([
            'name' => $validated['name'],
            'is_unlimited' => $validated['is_unlimited'] ?? false,
            'limit_amount' => $validated['is_unlimited'] ? null : $validated['limit_amount'],
            'expired_type' => $validated['expired_type'],
            'expired_at' => $validated['expired_type'] === 'date' ? $validated['expired_at'] : null,
            'expired_months' => $validated['expired_type'] === 'months' ? $validated['expired_months'] : null,
            'effective_date' => $validated['effective_date'],
            'requires_receipt' => $validated['requires_receipt'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => auth()->user()->name ?? 'System',
        ]);

        return back()->with('success', 'Jenis reimbursement berhasil diupdate.');
    }

    /**
     * Hapus jenis reimbursement.
     */
    public function destroyType(ReimbursementType $type)
    {
        $type->delete();
        return back()->with('success', 'Jenis reimbursement berhasil dihapus.');
    }

    /**
     * Export reimbursement types to CSV.
     */
    public function exportTypes()
    {
        $types = ReimbursementType::orderBy('name')->get();

        $filename = 'reimbursement_types_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($types) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['No', 'Name', 'Limit', 'Expired In', 'Effective Date']);

            $no = 1;
            foreach ($types as $type) {
                fputcsv($file, [
                    $no++,
                    $type->name,
                    $type->formatted_limit,
                    $type->formatted_expired,
                    $type->effective_date->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ============ Existing Expense Request Methods ============

    public function index()
    {
        $requests = Reimbursement::with(['employee:id,first_name,last_name', 'category:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'employee' => $req->employee->first_name . ' ' . $req->employee->last_name,
                    'category' => $req->category->name ?? 'Other',
                    'title' => $req->title,
                    'amount' => $req->amount,
                    'date' => $req->date->format('Y-m-d'),
                    'status' => $req->status,
                    'receipts' => $req->receipt_path ? 1 : 0,
                ];
            });

        $categories = ExpenseCategory::all();

        $stats = [
            'pending' => Reimbursement::where('status', 'pending')->sum('amount'),
            'approved' => Reimbursement::where('status', 'approved')->whereMonth('created_at', now()->month)->sum('amount'),
            'count_pending' => Reimbursement::where('status', 'pending')->count(),
            'count_approved' => Reimbursement::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
        ];

        $categoryData = ExpenseCategory::withSum([
            'reimbursements' => function ($q) {
                $q->where('status', 'approved')->whereMonth('created_at', now()->month);
            }
        ], 'amount')->get()->map(function ($cat) {
            return [
                'name' => $cat->name,
                'value' => $cat->reimbursements_sum_amount ?? 0,
            ];
        });

        return Inertia::render('Reimbursement/Index', [
            'requests' => $requests,
            'categories' => $categories,
            'stats' => $stats,
            'categoryData' => $categoryData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        Reimbursement::create([
            'employee_id' => $validated['employee_id'],
            'expense_category_id' => $validated['expense_category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'receipt_path' => $receiptPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Pengajuan reimbursement berhasil!');
    }

    public function approve(Reimbursement $reimbursement)
    {
        $reimbursement->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Reimbursement disetujui!');
    }

    public function reject(Request $request, Reimbursement $reimbursement)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $reimbursement->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Reimbursement ditolak.');
    }

    public function destroy(Reimbursement $reimbursement)
    {
        if ($reimbursement->receipt_path) {
            Storage::disk('public')->delete($reimbursement->receipt_path);
        }
        $reimbursement->delete();

        return redirect()->back()->with('success', 'Reimbursement dihapus.');
    }
}
