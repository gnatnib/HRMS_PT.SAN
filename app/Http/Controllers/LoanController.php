<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LoanController extends Controller
{
    public function index()
    {
        $loans = Loan::with(['employee:id,first_name,last_name,employee_id', 'employee.contract:id,department_id', 'employee.contract.department:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'employee' => $loan->employee->first_name . ' ' . $loan->employee->last_name,
                    'employee_id' => $loan->employee->employee_id ?? '-',
                    'department' => $loan->employee->contract?->department?->name ?? '-',
                    'principal' => $loan->principal_amount,
                    'monthly' => $loan->monthly_deduction,
                    'remaining' => $loan->remaining_balance,
                    'installments' => $loan->installments_paid . '/' . $loan->installment_months,
                    'status' => $loan->status,
                ];
            });

        $stats = [
            'active' => Loan::where('status', 'active')->sum('remaining_balance'),
            'pending' => Loan::where('status', 'pending')->sum('principal_amount'),
            'monthly_deduction' => Loan::where('status', 'active')->sum('monthly_deduction'),
            'count_active' => Loan::where('status', 'active')->count(),
            'count_pending' => Loan::where('status', 'pending')->count(),
        ];

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'stats' => $stats,
        ]);
    }

    /**
     * Menampilkan detail loan beserta jadwal cicilan.
     */
    public function show(Loan $loan)
    {
        $loan->load(['employee:id,first_name,last_name,employee_id,birth_date', 'payments']);

        // Generate jadwal cicilan
        $schedule = $this->generateInstallmentSchedule($loan);

        // Get loan types for dropdown
        $loanTypes = [
            ['id' => 'koperasi', 'name' => 'Koperasi Karyawan'],
            ['id' => 'emergency', 'name' => 'Emergency Loan'],
            ['id' => 'education', 'name' => 'Education Loan'],
            ['id' => 'other', 'name' => 'Lainnya'],
        ];

        return Inertia::render('Finance/Loan/Detail', [
            'loan' => [
                'id' => $loan->id,
                'employee_id' => $loan->employee->employee_id ?? '-',
                'employee_name' => $loan->employee->first_name . ' ' . $loan->employee->last_name,
                'loan_name' => $loan->loan_type ?? 'Koperasi Karyawan',
                'principal_amount' => $loan->principal_amount,
                'total_installments' => $loan->installment_months,
                'interest_type' => $loan->interest_type ?? 'Flat',
                'interest_rate' => $loan->interest_rate ?? 0,
                'monthly_installment' => $loan->monthly_deduction,
                'remaining_amount' => $loan->remaining_balance,
                'paid_installments' => $loan->installments_paid,
                'purpose' => $loan->purpose,
                'effective_date' => $loan->start_date ?? $loan->created_at->format('Y-m-d'),
                'status' => $loan->status,
            ],
            'schedule' => $schedule,
            'loanTypes' => $loanTypes,
        ]);
    }

    /**
     * Generate jadwal cicilan berdasarkan loan.
     */
    private function generateInstallmentSchedule(Loan $loan): array
    {
        $schedule = [];
        $startDate = Carbon::parse($loan->start_date ?? $loan->created_at)->startOfMonth();
        $principal = (float) $loan->principal_amount;
        $totalInstallments = $loan->installment_months;
        $interestRate = (float) ($loan->interest_rate ?? 0);
        $interestType = $loan->interest_type ?? 'flat';

        $basicPayment = $principal / $totalInstallments;
        $remainingBalance = $principal;

        // Get existing payments
        $payments = $loan->payments->keyBy('installment_number');

        for ($i = 1; $i <= $totalInstallments; $i++) {
            $paymentDate = $startDate->copy()->addMonths($i - 1)->endOfMonth();

            // Calculate interest based on type
            if ($interestType === 'flat') {
                $interest = ($principal * ($interestRate / 100)) / $totalInstallments;
            } else {
                // Reducing balance
                $interest = $remainingBalance * ($interestRate / 100 / 12);
            }

            $totalPayment = $basicPayment + $interest;
            $remainingBalance = max(0, $remainingBalance - $basicPayment);

            // Check if already paid
            $isPaid = isset($payments[$i]);

            $schedule[] = [
                'installment' => $i,
                'payment_date' => $paymentDate->format('Y-m-d'),
                'basic_payment' => round($basicPayment, 0),
                'interest' => round($interest, 0),
                'total' => round($totalPayment, 0),
                'remaining' => round($remainingBalance, 0),
                'is_paid' => $isPaid,
            ];
        }

        return $schedule;
    }

    /**
     * Export jadwal cicilan ke CSV.
     */
    public function exportSchedule(Loan $loan)
    {
        $schedule = $this->generateInstallmentSchedule($loan);

        $filename = 'loan_schedule_' . $loan->id . '_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($schedule, $loan) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Installment', 'Payment Date', 'Basic Payment', 'Interest', 'Total', 'Remaining Loan']);

            foreach ($schedule as $row) {
                fputcsv($file, [
                    $row['installment'],
                    $row['payment_date'],
                    $row['basic_payment'],
                    $row['interest'],
                    $row['total'],
                    $row['remaining'],
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'principal_amount' => 'required|numeric|min:100000',
            'installment_months' => 'required|integer|min:1|max:24',
            'purpose' => 'required|string|max:500',
            'loan_type' => 'nullable|string',
            'interest_rate' => 'nullable|numeric|min:0',
            'interest_type' => 'nullable|in:flat,reducing',
        ]);

        $monthlyDeduction = $validated['principal_amount'] / $validated['installment_months'];
        $referenceNumber = 'LN' . date('Ymd') . str_pad(Loan::count() + 1, 4, '0', STR_PAD_LEFT);

        Loan::create([
            'employee_id' => $validated['employee_id'],
            'reference_number' => $referenceNumber,
            'principal_amount' => $validated['principal_amount'],
            'monthly_deduction' => $monthlyDeduction,
            'installment_months' => $validated['installment_months'],
            'installments_paid' => 0,
            'remaining_balance' => $validated['principal_amount'],
            'purpose' => $validated['purpose'],
            'loan_type' => $validated['loan_type'] ?? 'koperasi',
            'interest_rate' => $validated['interest_rate'] ?? 0,
            'interest_type' => $validated['interest_type'] ?? 'flat',
            'start_date' => now()->addMonth()->startOfMonth(),
            'end_date' => now()->addMonths($validated['installment_months'] + 1)->endOfMonth(),
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
            'installment_number' => 'nullable|integer',
        ]);

        LoanPayment::create([
            'loan_id' => $loan->id,
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'notes' => $validated['notes'] ?? null,
            'installment_number' => $validated['installment_number'] ?? $loan->installments_paid + 1,
            'remaining_balance' => $loan->remaining_balance - $validated['amount'],
        ]);

        $loan->increment('installments_paid');
        $loan->decrement('remaining_balance', $validated['amount']);

        if ($loan->remaining_balance <= 0) {
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
