<?php

namespace App\Http\Controllers;

use App\Exports\BankTransferExport;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Services\Payroll\PayrollService;
use App\Services\Payroll\PayslipPdfService;
use App\Services\Payroll\ThrService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

/**
 * PayrollController
 *
 * Controller untuk mengelola payroll, slip gaji, dan THR.
 * Menggunakan PayrollService untuk kalkulasi yang mematuhi regulasi Indonesia.
 */
class PayrollController extends Controller
{
    protected PayrollService $payrollService;
    protected ThrService $thrService;
    protected PayslipPdfService $pdfService;

    public function __construct(
        PayrollService $payrollService,
        ThrService $thrService,
        PayslipPdfService $pdfService
    ) {
        $this->payrollService = $payrollService;
        $this->thrService = $thrService;
        $this->pdfService = $pdfService;
    }

    /**
     * Menampilkan daftar periode payroll.
     */
    public function index()
    {
        $periods = PayrollPeriod::withCount('payslips')
            ->orderByDesc('start_date')
            ->get()
            ->map(function ($period) {
                return [
                    'id' => $period->id,
                    'name' => Carbon::parse($period->start_date)->translatedFormat('F Y'),
                    'status' => $period->status,
                    'employees' => $period->payslips_count,
                    'totalGross' => $period->total_gross,
                    'totalNet' => $period->total_net,
                    'totalBpjs' => $period->total_bpjs,
                    'totalPph21' => $period->total_pph21,
                    'paymentDate' => $period->payment_date?->format('Y-m-d'),
                ];
            });

        $currentPeriod = PayrollPeriod::where('status', 'paid')
            ->orderByDesc('start_date')
            ->first();

        $stats = [
            'totalNet' => $currentPeriod?->total_net ?? 0,
            'totalBpjs' => $currentPeriod?->total_bpjs ?? 0,
            'totalPph21' => $currentPeriod?->total_pph21 ?? 0,
            'employees' => Employee::where('is_active', true)->count(),
        ];

        // Trend data untuk chart (6 bulan terakhir)
        $trendData = PayrollPeriod::where('status', 'paid')
            ->orderBy('start_date')
            ->limit(6)
            ->get()
            ->map(function ($p) {
                return [
                    'month' => Carbon::parse($p->start_date)->format('M'),
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

    /**
     * Menjalankan proses payroll untuk periode tertentu.
     * Menggunakan PayrollService untuk kalkulasi yang akurat.
     */
    public function run(Request $request)
    {
        $validated = $request->validate([
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2020|max:2030',
        ]);

        $periodStart = Carbon::create($validated['period_year'], $validated['period_month'], 1);
        $periodEnd = $periodStart->copy()->endOfMonth();

        // Cek apakah periode sudah ada
        $existing = PayrollPeriod::where('start_date', $periodStart)->first();
        if ($existing) {
            return redirect()->back()->withErrors(['error' => 'Periode ini sudah diproses!']);
        }

        // Buat periode payroll baru
        $period = PayrollPeriod::create([
            'name' => $periodStart->translatedFormat('F Y'),
            'start_date' => $periodStart,
            'end_date' => $periodEnd,
            'status' => 'draft',
            'total_gross' => 0,
            'total_net' => 0,
            'total_bpjs' => 0,
            'total_pph21' => 0,
            'created_by' => auth()->user()?->name,
        ]);

        try {
            // Proses payroll menggunakan service
            $result = $this->payrollService->processPayroll($period);

            $message = "Payroll berhasil diproses untuk {$result['success_count']} karyawan!";
            if ($result['failed_count'] > 0) {
                $message .= " ({$result['failed_count']} gagal)";
            }

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal memproses payroll: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate payroll menggunakan PayrollService (alias untuk run).
     */
    public function generate(Request $request)
    {
        return $this->run($request);
    }

    /**
     * Finalisasi periode payroll (status: paid).
     */
    public function finalize(PayrollPeriod $period)
    {
        $period->update([
            'status' => 'paid',
            'payment_date' => now(),
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Proses pembayaran kasbon untuk semua payslip di periode ini
        $payslips = Payslip::where('payroll_period_id', $period->id)->get();
        foreach ($payslips as $payslip) {
            // TODO: Process loan payments if needed
        }

        return redirect()->back()->with('success', 'Payroll berhasil difinalisasi!');
    }

    /**
     * Menampilkan slip gaji karyawan.
     */
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
            'id' => $latestPayslip->id,
            'employee' => [
                'name' => $employee->full_name,
                'nik' => $employee->id,
                'position' => $employee->current_position,
                'department' => $employee->current_department,
                'bank' => $latestPayslip->bank_name ?? 'BCA',
                'accountNo' => $latestPayslip->bank_account ?? '-',
            ],
            'period' => Carbon::parse($latestPayslip->period->start_date)->translatedFormat('F Y'),
            'paymentDate' => $latestPayslip->period->payment_date?->translatedFormat('d F Y'),
            'earnings' => [
                ['name' => 'Gaji Pokok', 'amount' => $latestPayslip->basic_salary],
                ['name' => 'Tunjangan Harian', 'amount' => $latestPayslip->daily_allowance_total ?? 0],
                ['name' => 'Lembur', 'amount' => $latestPayslip->overtime_pay],
                ['name' => 'Reimbursement', 'amount' => $latestPayslip->reimbursement_total ?? 0],
            ],
            'deductions' => [
                ['name' => 'BPJS Kesehatan', 'amount' => $latestPayslip->bpjs_kes_employee ?? $latestPayslip->bpjs_kesehatan],
                ['name' => 'BPJS JHT', 'amount' => $latestPayslip->bpjs_tk_jht_employee ?? $latestPayslip->bpjs_jht],
                ['name' => 'BPJS JP', 'amount' => $latestPayslip->bpjs_tk_jp_employee ?? $latestPayslip->bpjs_jp],
                ['name' => 'PPh 21', 'amount' => $latestPayslip->pph21],
                ['name' => 'Cicilan Kasbon', 'amount' => $latestPayslip->loan_deduction],
            ],
            'totalEarnings' => $latestPayslip->total_earnings,
            'totalDeductions' => $latestPayslip->total_deductions,
            'netSalary' => $latestPayslip->net_salary,
            'pph21Category' => $latestPayslip->pph21_ter_category,
            'attendanceDays' => $latestPayslip->attendance_days_count,
        ];

        return Inertia::render('Payroll/Payslip', [
            'payslip' => $payslipData,
        ]);
    }

    /**
     * Download slip gaji dalam format PDF.
     * PDF dienkripsi dengan password = tanggal lahir karyawan (DDMMYYYY).
     */
    public function downloadSlip($payslipId)
    {
        $payslip = Payslip::with(['employee', 'period'])->findOrFail($payslipId);

        // Verifikasi akses: hanya pemilik atau admin yang bisa download
        $user = auth()->user();
        if ($user->employee_id !== $payslip->employee_id && !$user->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki akses ke slip gaji ini.');
        }

        return $this->pdfService->download($payslip);
    }

    /**
     * Stream slip gaji PDF ke browser (preview).
     */
    public function previewSlip($payslipId)
    {
        $payslip = Payslip::with(['employee', 'period'])->findOrFail($payslipId);

        return $this->pdfService->stream($payslip);
    }

    /**
     * Export data payroll ke CSV (format lama).
     */
    public function exportCsv(PayrollPeriod $period)
    {
        $payslips = Payslip::with('employee')
            ->where('payroll_period_id', $period->id)
            ->get();

        $csvData = [];
        $csvData[] = ['No', 'Nama Karyawan', 'Gaji Pokok', 'Tunjangan Harian', 'Lembur', 'Gross', 'BPJS', 'PPh21', 'Net', 'Bank', 'No Rek'];

        $no = 1;
        foreach ($payslips as $slip) {
            $csvData[] = [
                $no++,
                $slip->employee->full_name,
                $slip->basic_salary,
                $slip->daily_allowance_total ?? 0,
                $slip->overtime_pay,
                $slip->total_earnings,
                $slip->bpjs_kes_employee + $slip->bpjs_tk_jht_employee + $slip->bpjs_tk_jp_employee,
                $slip->pph21,
                $slip->net_salary,
                $slip->bank_name ?? 'BCA',
                $slip->bank_account ?? '-',
            ];
        }

        $filename = 'payroll_' . Carbon::parse($period->start_date)->format('Y-m') . '.csv';
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

    /**
     * Export data transfer bank dalam format yang kompatibel dengan KlikBCA.
     */
    public function exportBankTransfer(PayrollPeriod $period, Request $request)
    {
        $bankFormat = $request->get('bank', 'BCA');
        $export = new BankTransferExport($period, $bankFormat);

        return Excel::download($export, $export->getFileName());
    }

    /**
     * Menampilkan halaman THR.
     */
    public function thrIndex()
    {
        $thrData = $this->thrService->processThr();

        return Inertia::render('Payroll/Thr', [
            'thrData' => $thrData,
        ]);
    }

    /**
     * Generate THR untuk karyawan tertentu atau semua karyawan aktif.
     */
    public function generateThr(Request $request)
    {
        $employeeIds = $request->input('employee_ids'); // null = semua karyawan
        $calculationDate = $request->input('calculation_date')
            ? Carbon::parse($request->input('calculation_date'))
            : null;

        $result = $this->thrService->processThr($employeeIds, $calculationDate);

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => "THR berhasil dihitung untuk {$result['summary']['eligible_employees']} karyawan.",
        ]);
    }

    /**
     * Export data THR ke Excel.
     */
    public function exportThr(Request $request)
    {
        $thrResult = $this->thrService->processThr();
        $exportData = $this->thrService->formatForExport($thrResult);

        // Gunakan simple CSV export
        $filename = 'thr_' . now()->format('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w');

        // Header
        if (count($exportData) > 0) {
            fputcsv($handle, array_keys($exportData[0]));
        }

        // Data
        foreach ($exportData as $row) {
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
