<?php

namespace App\Http\Controllers;

use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\Employee;
use App\Models\SalaryComponent;
use App\Models\EmployeeSalary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index()
    {
        $periods = PayrollPeriod::withCount('payslips')
            ->orderByDesc('period_start')
            ->get()
            ->map(function ($period) {
                return [
                    'id' => $period->id,
                    'name' => Carbon::parse($period->period_start)->format('F Y'),
                    'status' => $period->status,
                    'employees' => $period->payslips_count,
                    'totalGross' => $period->total_gross,
                    'totalNet' => $period->total_net,
                    'paymentDate' => $period->payment_date?->format('Y-m-d'),
                ];
            });

        $currentPeriod = PayrollPeriod::where('status', 'paid')
            ->orderByDesc('period_start')
            ->first();

        $stats = [
            'totalNet' => $currentPeriod?->total_net ?? 0,
            'totalBpjs' => $currentPeriod?->total_bpjs ?? 0,
            'totalPph21' => $currentPeriod?->total_pph21 ?? 0,
            'employees' => Employee::where('is_active', true)->count(),
        ];

        // Trend data for chart
        $trendData = PayrollPeriod::where('status', 'paid')
            ->orderBy('period_start')
            ->limit(6)
            ->get()
            ->map(function ($p) {
                return [
                    'month' => Carbon::parse($p->period_start)->format('M'),
                    'gross' => round($p->total_gross / 1000000, 0),
                    'net' => round($p->total_net / 1000000, 0),
                ];
            });

        return Inertia::render('Payroll/Index', [
            'periods' => $periods,
            'stats' => $stats,
            'trendData' => $trendData,
        ]);
    }

    public function run(Request $request)
    {
        $validated = $request->validate([
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2020|max:2030',
        ]);

        $periodStart = Carbon::create($validated['period_year'], $validated['period_month'], 1);
        $periodEnd = $periodStart->copy()->endOfMonth();

        // Check if period already exists
        $existing = PayrollPeriod::where('period_start', $periodStart)->first();
        if ($existing) {
            return redirect()->back()->withErrors(['error' => 'Periode ini sudah diproses!']);
        }

        // Create payroll period
        $period = PayrollPeriod::create([
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'status' => 'draft',
            'total_gross' => 0,
            'total_net' => 0,
            'total_bpjs' => 0,
            'total_pph21' => 0,
        ]);

        // Get all active employees and create payslips
        $employees = Employee::where('is_active', true)->with('contract')->get();

        $totalGross = 0;
        $totalNet = 0;
        $totalBpjs = 0;
        $totalPph21 = 0;

        foreach ($employees as $employee) {
            // Simplified salary calculation
            $basicSalary = 8000000; // Default basic salary
            $allowances = 1500000; // Fixed allowances
            $overtime = 0; // TODO: Calculate from overtime requests

            $grossSalary = $basicSalary + $allowances + $overtime;

            // BPJS calculations (simplified)
            $bpjsKesehatan = $grossSalary * 0.01; // 1% employee
            $bpjsJht = $grossSalary * 0.02; // 2% employee
            $bpjsJp = $grossSalary * 0.01; // 1% employee
            $totalBpjsEmployee = $bpjsKesehatan + $bpjsJht + $bpjsJp;

            // PPh 21 (simplified - 5% for income under 60jt)
            $pph21 = ($grossSalary - $totalBpjsEmployee) * 0.05;

            $netSalary = $grossSalary - $totalBpjsEmployee - $pph21;

            Payslip::create([
                'payroll_period_id' => $period->id,
                'employee_id' => $employee->id,
                'basic_salary' => $basicSalary,
                'total_allowances' => $allowances,
                'total_overtime' => $overtime,
                'gross_salary' => $grossSalary,
                'total_bpjs' => $totalBpjsEmployee,
                'total_pph21' => $pph21,
                'total_deductions' => $totalBpjsEmployee + $pph21,
                'net_salary' => $netSalary,
            ]);

            $totalGross += $grossSalary;
            $totalNet += $netSalary;
            $totalBpjs += $totalBpjsEmployee;
            $totalPph21 += $pph21;
        }

        $period->update([
            'total_gross' => $totalGross,
            'total_net' => $totalNet,
            'total_bpjs' => $totalBpjs,
            'total_pph21' => $totalPph21,
        ]);

        return redirect()->back()->with('success', 'Payroll berhasil diproses untuk ' . $employees->count() . ' karyawan!');
    }

    public function finalize(PayrollPeriod $period)
    {
        $period->update([
            'status' => 'paid',
            'payment_date' => now(),
        ]);

        return redirect()->back()->with('success', 'Payroll berhasil difinalisasi!');
    }

    public function payslip(Request $request, $employeeId = null)
    {
        $employee = $employeeId
            ? Employee::findOrFail($employeeId)
            : (auth()->user()->employee ?? null);

        if (!$employee) {
            return redirect()->back()->withErrors(['error' => 'Karyawan tidak ditemukan']);
        }

        $latestPayslip = Payslip::with('period')
            ->where('employee_id', $employee->id)
            ->whereHas('period', fn($q) => $q->where('status', 'paid'))
            ->orderByDesc('created_at')
            ->first();

        if (!$latestPayslip) {
            return Inertia::render('Payroll/Payslip', [
                'payslip' => null,
            ]);
        }

        $payslipData = [
            'employee' => [
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'nik' => $employee->id,
                'position' => $employee->contract?->position?->name ?? '-',
                'department' => $employee->contract?->department?->name ?? '-',
                'bank' => 'BCA',
                'accountNo' => '1234567890',
            ],
            'period' => Carbon::parse($latestPayslip->period->period_start)->format('F Y'),
            'paymentDate' => $latestPayslip->period->payment_date?->format('d F Y'),
            'earnings' => [
                ['name' => 'Gaji Pokok', 'amount' => $latestPayslip->basic_salary],
                ['name' => 'Tunjangan', 'amount' => $latestPayslip->total_allowances],
                ['name' => 'Lembur', 'amount' => $latestPayslip->total_overtime],
            ],
            'deductions' => [
                ['name' => 'BPJS', 'amount' => $latestPayslip->total_bpjs],
                ['name' => 'PPh 21', 'amount' => $latestPayslip->total_pph21],
            ],
            'totalEarnings' => $latestPayslip->gross_salary,
            'totalDeductions' => $latestPayslip->total_deductions,
            'netSalary' => $latestPayslip->net_salary,
        ];

        return Inertia::render('Payroll/Payslip', [
            'payslip' => $payslipData,
        ]);
    }

    public function exportCsv(PayrollPeriod $period)
    {
        $payslips = Payslip::with('employee')
            ->where('payroll_period_id', $period->id)
            ->get();

        $csvData = [];
        $csvData[] = ['No', 'Nama Karyawan', 'Gaji Pokok', 'Tunjangan', 'Lembur', 'Gross', 'BPJS', 'PPh21', 'Net', 'Bank', 'No Rek'];

        $no = 1;
        foreach ($payslips as $slip) {
            $csvData[] = [
                $no++,
                $slip->employee->first_name . ' ' . $slip->employee->last_name,
                $slip->basic_salary,
                $slip->total_allowances,
                $slip->total_overtime,
                $slip->gross_salary,
                $slip->total_bpjs,
                $slip->total_pph21,
                $slip->net_salary,
                'BCA',
                '1234567890',
            ];
        }

        $filename = 'payroll_' . Carbon::parse($period->period_start)->format('Y-m') . '.csv';
        $handle = fopen('php://temp', 'w');
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
