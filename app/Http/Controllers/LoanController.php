<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index()
    {
        $loans = Loan::with(['employee:id,first_name,last_name', 'employee.contract:id,department_id', 'employee.contract.department:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'employee' => $loan->employee->first_name . ' ' . $loan->employee->last_name,
                    'department' => $loan->employee->contract?->department?->name ?? '-',
                    'principal' => $loan->principal_amount,
                    'monthly' => $loan->monthly_installment,
                    'remaining' => $loan->remaining_amount,
                    'installments' => $loan->paid_installments . '/' . $loan->total_installments,
                    'status' => $loan->status,
                ];
            });

        $stats = [
            'active' => Loan::where('status', 'active')->sum('remaining_amount'),
            'pending' => Loan::where('status', 'pending')->sum('principal_amount'),
            'monthly_deduction' => Loan::where('status', 'active')->sum('monthly_installment'),
            'count_active' => Loan::where('status', 'active')->count(),
            'count_pending' => Loan::where('status', 'pending')->count(),
        ];

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'principal_amount' => 'required|numeric|min:100000',
            'total_installments' => 'required|integer|min:1|max:24',
            'purpose' => 'required|string|max:500',
        ]);

        $monthlyInstallment = $validated['principal_amount'] / $validated['total_installments'];

        Loan::create([
            'employee_id' => $validated['employee_id'],
            'principal_amount' => $validated['principal_amount'],
            'monthly_installment' => $monthlyInstallment,
            'total_installments' => $validated['total_installments'],
            'paid_installments' => 0,
            'remaining_amount' => $validated['principal_amount'],
            'purpose' => $validated['purpose'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Pengajuan kasbon berhasil!');
    }

    public function approve(Loan $loan)
    {
        $loan->update([
            'status' => 'active',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'start_deduction_date' => now()->addMonth()->startOfMonth(),
        ]);

        return redirect()->back()->with('success', 'Kasbon disetujui! Potongan dimulai bulan depan.');
    }

    public function reject(Request $request, Loan $loan)
    {
        $loan->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Kasbon ditolak.');
    }

    public function recordPayment(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:200',
        ]);

        LoanPayment::create([
            'loan_id' => $loan->id,
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $loan->increment('paid_installments');
        $loan->decrement('remaining_amount', $validated['amount']);

        if ($loan->remaining_amount <= 0) {
            $loan->update(['status' => 'completed']);
        }

        return redirect()->back()->with('success', 'Pembayaran tercatat!');
    }

    public function destroy(Loan $loan)
    {
        $loan->payments()->delete();
        $loan->delete();

        return redirect()->back()->with('success', 'Kasbon dihapus.');
    }
}
