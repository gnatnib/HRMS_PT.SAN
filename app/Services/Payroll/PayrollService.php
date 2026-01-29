<?php

namespace App\Services\Payroll;

use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\Fingerprint;
use App\Models\Loan;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\Reimbursement;
use App\Models\SalaryComponent;
use App\Traits\CalculatesBpjs;
use App\Traits\CalculatesPph21;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * PayrollService
 *
 * Engine utama untuk pemrosesan payroll bulanan yang mematuhi
 * regulasi ketenagakerjaan Indonesia (PPh 21 TER 2024, BPJS lengkap).
 *
 * Fitur:
 * - Perhitungan prorata untuk karyawan masuk/keluar tengah bulan
 * - Tunjangan harian berbasis kehadiran (uang makan/transport)
 * - BPJS Ketenagakerjaan & Kesehatan dengan max cap
 * - PPh 21 TER (Jan-Nov) dan Pasal 17 (Desember)
 * - Potongan kasbon otomatis
 * - Integrasi reimbursement
 */
class PayrollService
{
    use CalculatesBpjs, CalculatesPph21;

    /** @var int Tingkat resiko JKK default (1 = paling rendah) */
    protected int $defaultJkkRiskLevel = 1;

    /** @var float Denda per menit keterlambatan (default Rp 1.000/menit) */
    protected float $latePenaltyPerMinute = 1000;

    /** @var int Jumlah hari kerja standar dalam sebulan */
    protected int $standardWorkDays = 22;

    // ==========================================
    // METODE PERHITUNGAN PENDAPATAN
    // ==========================================

    /**
     * Menghitung gaji prorata untuk karyawan yang masuk/keluar tengah bulan.
     *
     * Rumus: (Hari Kerja Aktual / Total Hari Kerja Sebulan) * Gaji Pokok
     *
     * @param float $basicSalary Gaji pokok bulanan
     * @param int $workDays Jumlah hari kerja aktual karyawan
     * @param int $totalBusinessDays Total hari kerja dalam bulan tersebut
     * @return float Gaji prorata
     */
    public function calculateProrate(float $basicSalary, int $workDays, int $totalBusinessDays): float
    {
        if ($totalBusinessDays <= 0) {
            return 0;
        }

        $prorata = ($workDays / $totalBusinessDays) * $basicSalary;
        return round($prorata, 0);
    }

    /**
     * Menghitung tunjangan harian berdasarkan kehadiran.
     *
     * @param float $amountPerDay Nominal tunjangan per hari (misal: uang makan/transport)
     * @param int $attendanceCount Jumlah hari hadir
     * @return float Total tunjangan harian
     */
    public function calculateDailyAllowance(float $amountPerDay, int $attendanceCount): float
    {
        return round($amountPerDay * $attendanceCount, 0);
    }

    /**
     * Menghitung total tunjangan harian dari semua komponen tunjangan harian.
     *
     * @param int $employeeId ID karyawan
     * @param int $attendanceCount Jumlah hari hadir
     * @return float Total tunjangan harian
     */
    public function calculateAllDailyAllowances(int $employeeId, int $attendanceCount): float
    {
        // Ambil komponen gaji yang merupakan tunjangan harian
        $dailyComponents = SalaryComponent::where('is_daily_allowance', true)
            ->where('is_active', true)
            ->where('type', 'earning')
            ->get();

        $total = 0;
        foreach ($dailyComponents as $component) {
            $total += $this->calculateDailyAllowance(
                $component->default_amount ?? 0,
                $attendanceCount
            );
        }

        return $total;
    }

    // ==========================================
    // METODE PERHITUNGAN POTONGAN
    // ==========================================

    /**
     * Menghitung dan memproses potongan kasbon dari gaji.
     * Otomatis mengupdate saldo pinjaman setelah pemotongan.
     *
     * @param int $employeeId ID karyawan
     * @param int|null $payslipId ID payslip untuk pencatatan pembayaran
     * @return array Informasi potongan [total, loans => [loan_id => amount]]
     */
    public function calculateLoanDeduction(int $employeeId, ?int $payslipId = null): array
    {
        // Ambil semua pinjaman aktif yang siap dipotong
        $activeLoans = Loan::where('employee_id', $employeeId)
            ->where('status', 'active')
            ->where('is_active', true)
            ->where('remaining_balance', '>', 0)
            ->get();

        $totalDeduction = 0;
        $loanDeductions = [];

        foreach ($activeLoans as $loan) {
            // Ambil cicilan bulanan
            $installment = min($loan->monthly_deduction, $loan->remaining_balance);

            if ($installment > 0) {
                $totalDeduction += $installment;
                $loanDeductions[$loan->id] = $installment;
            }
        }

        return [
            'total' => round($totalDeduction, 0),
            'loans' => $loanDeductions,
        ];
    }

    /**
     * Memproses pembayaran cicilan pinjaman setelah payroll difinalisasi.
     *
     * @param array $loanDeductions Array [loan_id => amount]
     * @param int $payslipId ID payslip
     * @param Carbon $paymentDate Tanggal pembayaran
     * @return void
     */
    public function processLoanPayments(array $loanDeductions, int $payslipId, Carbon $paymentDate): void
    {
        foreach ($loanDeductions as $loanId => $amount) {
            $loan = Loan::find($loanId);
            if (!$loan) {
                continue;
            }

            // Update saldo pinjaman
            $newBalance = $loan->remaining_balance - $amount;
            $newPaidInstallments = $loan->installments_paid + 1;
            $newTotalPaid = $loan->total_paid + $amount;

            $loan->update([
                'remaining_balance' => max(0, $newBalance),
                'installments_paid' => $newPaidInstallments,
                'total_paid' => $newTotalPaid,
                'status' => $newBalance <= 0 ? 'completed' : 'active',
            ]);

            // Catat pembayaran
            $loan->payments()->create([
                'payslip_id' => $payslipId,
                'installment_number' => $newPaidInstallments,
                'amount' => $amount,
                'payment_date' => $paymentDate,
                'remaining_balance' => max(0, $newBalance),
            ]);
        }
    }

    /**
     * Menghitung denda keterlambatan.
     *
     * @param int $minutesLate Total menit keterlambatan dalam periode
     * @param float|null $penaltyPerMinute Denda per menit (opsional)
     * @return float Total denda
     */
    public function calculateLatePenalty(int $minutesLate, ?float $penaltyPerMinute = null): float
    {
        $rate = $penaltyPerMinute ?? $this->latePenaltyPerMinute;
        return round($minutesLate * $rate, 0);
    }

    // ==========================================
    // METODE BANTUAN KEHADIRAN
    // ==========================================

    /**
     * Menghitung jumlah hari hadir karyawan dalam periode payroll.
     *
     * @param int $employeeId ID karyawan
     * @param Carbon $startDate Tanggal mulai periode
     * @param Carbon $endDate Tanggal akhir periode
     * @return int Jumlah hari hadir
     */
    public function countAttendanceDays(int $employeeId, Carbon $startDate, Carbon $endDate): int
    {
        return Fingerprint::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->whereNotNull('check_in')
            ->count();
    }

    /**
     * Menghitung total menit keterlambatan dalam periode.
     *
     * @param int $employeeId ID karyawan
     * @param Carbon $startDate Tanggal mulai
     * @param Carbon $endDate Tanggal akhir
     * @param string $standardCheckIn Waktu check-in standar (HH:MM)
     * @return int Total menit terlambat
     */
    public function countLateMinutes(
        int $employeeId,
        Carbon $startDate,
        Carbon $endDate,
        string $standardCheckIn = '08:00'
    ): int {
        $fingerprints = Fingerprint::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->whereNotNull('check_in')
            ->get();

        $totalLateMinutes = 0;
        $checkInTime = Carbon::createFromFormat('H:i', $standardCheckIn);

        foreach ($fingerprints as $fp) {
            $actualCheckIn = Carbon::createFromFormat('H:i', $fp->check_in);
            if ($actualCheckIn->gt($checkInTime)) {
                $totalLateMinutes += $actualCheckIn->diffInMinutes($checkInTime);
            }
        }

        return $totalLateMinutes;
    }

    /**
     * Menghitung jumlah hari kerja dalam sebulan (exclude weekend dan libur).
     *
     * @param Carbon $startDate Tanggal mulai
     * @param Carbon $endDate Tanggal akhir
     * @return int Jumlah hari kerja
     */
    public function countBusinessDays(Carbon $startDate, Carbon $endDate): int
    {
        $days = 0;
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            // Skip Saturday (6) dan Sunday (0)
            if ($current->dayOfWeek !== Carbon::SATURDAY && $current->dayOfWeek !== Carbon::SUNDAY) {
                $days++;
            }
            $current->addDay();
        }

        // TODO: Kurangi dengan hari libur nasional dari tabel holidays

        return $days;
    }

    // ==========================================
    // METODE REIMBURSEMENT
    // ==========================================

    /**
     * Mengambil total reimbursement yang approved untuk dibayar bersama gaji.
     *
     * @param int $employeeId ID karyawan
     * @return float Total reimbursement
     */
    public function getApprovedReimbursements(int $employeeId): float
    {
        return Reimbursement::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereNull('paid_at')
            ->sum('amount');
    }

    /**
     * Menandai reimbursement sebagai sudah dibayar.
     *
     * @param int $employeeId ID karyawan
     * @param int $payslipId ID payslip
     * @return void
     */
    public function markReimbursementsAsPaid(int $employeeId, int $payslipId): void
    {
        Reimbursement::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereNull('paid_at')
            ->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payslip_id' => $payslipId,
            ]);
    }

    // ==========================================
    // METODE UTAMA GENERATE PAYSLIP
    // ==========================================

    /**
     * Generate payslip untuk satu karyawan.
     *
     * @param Employee $employee Model karyawan
     * @param PayrollPeriod $period Model periode payroll
     * @return Payslip Model payslip yang dibuat
     */
    public function generateEmployeePayslip(Employee $employee, PayrollPeriod $period): Payslip
    {
        $startDate = Carbon::parse($period->start_date);
        $endDate = Carbon::parse($period->end_date);
        $month = $startDate->month;

        // Ambil data gaji karyawan
        $salary = EmployeeSalary::where('employee_id', $employee->id)
            ->where('effective_date', '<=', $endDate)
            ->where(function ($q) use ($endDate) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $endDate);
            })
            ->orderByDesc('effective_date')
            ->first();

        $basicSalary = $salary->basic_salary ?? 0;

        // Hitung kehadiran
        $attendanceDays = $this->countAttendanceDays($employee->id, $startDate, $endDate);
        $businessDays = $this->countBusinessDays($startDate, $endDate);

        // Hitung prorata jika perlu (karyawan baru atau resign)
        $joinDate = $employee->timelines()->orderBy('start_date')->first()?->start_date;
        $isProrated = false;
        $proratedSalary = $basicSalary;

        if ($joinDate && Carbon::parse($joinDate)->gte($startDate)) {
            // Karyawan baru di bulan ini
            $isProrated = true;
            $workDays = $this->countBusinessDays(Carbon::parse($joinDate), $endDate);
            $proratedSalary = $this->calculateProrate($basicSalary, $workDays, $businessDays);
        }

        // Hitung tunjangan harian
        $dailyAllowance = $this->calculateAllDailyAllowances($employee->id, $attendanceDays);

        // Hitung denda keterlambatan
        $lateMinutes = $this->countLateMinutes($employee->id, $startDate, $endDate);
        $latePenalty = $this->calculateLatePenalty($lateMinutes);

        // Hitung overtime (dari tabel overtime_requests yang approved)
        $overtimePay = $this->calculateOvertimePay($employee->id, $startDate, $endDate);

        // Total pendapatan bruto
        $grossSalary = $proratedSalary + $dailyAllowance + $overtimePay;

        // Hitung BPJS
        $ptkpCode = $employee->ptkp_code ?? 'TK/0';
        $bpjs = $this->calculateAllBpjs($grossSalary, $this->defaultJkkRiskLevel);

        // Hitung PPh 21
        $pph21Result = $this->calculatePph21ForPayslip($employee, $grossSalary, $bpjs['total_employee'], $month, $ptkpCode);

        // Hitung potongan kasbon
        $loanDeduction = $this->calculateLoanDeduction($employee->id);

        // Ambil reimbursement
        $reimbursement = $this->getApprovedReimbursements($employee->id);

        // Total potongan dari gaji
        $totalDeductions = $bpjs['total_employee'] + $pph21Result['amount'] + $loanDeduction['total'] + $latePenalty;

        // Gaji bersih
        $netSalary = $grossSalary - $totalDeductions + $reimbursement;

        // Buat payslip
        $payslip = Payslip::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $employee->id,
            'basic_salary' => $basicSalary,
            'total_earnings' => $grossSalary + $reimbursement,
            'total_deductions' => $totalDeductions,
            'overtime_pay' => $overtimePay,

            // Detail BPJS Ketenagakerjaan
            'bpjs_tk_jht_company' => $bpjs['jht_company'],
            'bpjs_tk_jht_employee' => $bpjs['jht_employee'],
            'bpjs_tk_jkk' => $bpjs['jkk'],
            'bpjs_tk_jkm' => $bpjs['jkm'],
            'bpjs_tk_jp_company' => $bpjs['jp_company'],
            'bpjs_tk_jp_employee' => $bpjs['jp_employee'],

            // Detail BPJS Kesehatan
            'bpjs_kes_company' => $bpjs['kes_company'],
            'bpjs_kes_employee' => $bpjs['kes_employee'],

            // Legacy columns (untuk backward compatibility)
            'bpjs_kesehatan' => $bpjs['kes_employee'],
            'bpjs_jht' => $bpjs['jht_employee'],
            'bpjs_jp' => $bpjs['jp_employee'],
            'bpjs_jkk' => $bpjs['jkk'],
            'bpjs_jkm' => $bpjs['jkm'],

            // PPh 21
            'pph21' => $pph21Result['amount'],
            'pph21_ter_category' => $pph21Result['category'],
            'pph21_ptkp_code' => $ptkpCode,

            // Data kehadiran dan prorata
            'attendance_days_count' => $attendanceDays,
            'prorated_salary' => $isProrated ? $proratedSalary : 0,
            'daily_allowance_total' => $dailyAllowance,

            // Potongan lainnya
            'loan_deduction' => $loanDeduction['total'],
            'late_penalty' => $latePenalty,

            // Reimbursement
            'reimbursement_total' => $reimbursement,

            // Gaji bersih
            'net_salary' => $netSalary,

            'status' => 'draft',
            'created_by' => auth()->user()?->name ?? 'system',
        ]);

        return $payslip;
    }

    /**
     * Helper untuk menghitung PPh 21 dengan data YTD jika Desember.
     */
    protected function calculatePph21ForPayslip(
        Employee $employee,
        float $grossMonthly,
        float $bpjsMonthly,
        int $month,
        string $ptkpCode
    ): array {
        if ($month === 12) {
            // Ambil data YTD dari payslip sebelumnya
            $ytdData = Payslip::where('employee_id', $employee->id)
                ->whereHas('period', function ($q) {
                    $q->whereYear('start_date', now()->year);
                })
                ->selectRaw('SUM(total_earnings) as gross_ytd, SUM(bpjs_tk_jht_employee + bpjs_tk_jp_employee + bpjs_kes_employee) as bpjs_ytd, SUM(pph21) as pph21_ytd')
                ->first();

            return $this->calculatePph21(
                $grossMonthly,
                $ptkpCode,
                $month,
                $ytdData->gross_ytd ?? 0,
                $ytdData->bpjs_ytd ?? 0,
                $ytdData->pph21_ytd ?? 0
            );
        }

        return $this->calculatePph21($grossMonthly, $ptkpCode, $month);
    }

    /**
     * Menghitung overtime pay dari permintaan lembur yang disetujui.
     */
    protected function calculateOvertimePay(int $employeeId, Carbon $startDate, Carbon $endDate): float
    {
        // TODO: Implement berdasarkan tabel overtime_requests
        // Rumus Depnaker: Jam pertama 1.5x, jam berikutnya 2x dari upah per jam
        return 0;
    }

    // ==========================================
    // METODE PROSES PAYROLL MASSAL
    // ==========================================

    /**
     * Memproses payroll untuk semua karyawan aktif dalam periode tertentu.
     *
     * @param PayrollPeriod $period Model periode payroll
     * @return array Hasil pemrosesan [success, failed, totals]
     */
    public function processPayroll(PayrollPeriod $period): array
    {
        $employees = Employee::where('is_active', true)->get();

        $success = [];
        $failed = [];
        $totals = [
            'gross' => 0,
            'net' => 0,
            'bpjs_company' => 0,
            'bpjs_employee' => 0,
            'pph21' => 0,
        ];

        DB::beginTransaction();

        try {
            foreach ($employees as $employee) {
                try {
                    $payslip = $this->generateEmployeePayslip($employee, $period);

                    $success[] = $employee->id;

                    // Akumulasi total
                    $totals['gross'] += $payslip->total_earnings;
                    $totals['net'] += $payslip->net_salary;
                    $totals['bpjs_company'] += $payslip->bpjs_tk_jht_company
                        + $payslip->bpjs_tk_jkk
                        + $payslip->bpjs_tk_jkm
                        + $payslip->bpjs_tk_jp_company
                        + $payslip->bpjs_kes_company;
                    $totals['bpjs_employee'] += $payslip->total_deductions
                        - $payslip->pph21
                        - $payslip->loan_deduction
                        - ($payslip->late_penalty ?? 0);
                    $totals['pph21'] += $payslip->pph21;
                } catch (\Exception $e) {
                    $failed[] = [
                        'employee_id' => $employee->id,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Update totals di periode payroll
            $period->update([
                'total_gross' => $totals['gross'],
                'total_net' => $totals['net'],
                'total_bpjs' => $totals['bpjs_employee'],
                'total_pph21' => $totals['pph21'],
                'status' => 'processing',
            ]);

            DB::commit();

            return [
                'success_count' => count($success),
                'failed_count' => count($failed),
                'failed' => $failed,
                'totals' => $totals,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
