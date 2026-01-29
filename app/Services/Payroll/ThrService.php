<?php

namespace App\Services\Payroll;

use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\Timeline;
use Carbon\Carbon;

/**
 * ThrService
 *
 * Service untuk perhitungan Tunjangan Hari Raya (THR) sesuai regulasi Indonesia.
 *
 * Aturan Perhitungan:
 * - Masa kerja >= 12 bulan: THR = 1x gaji pokok + tunjangan tetap
 * - Masa kerja < 12 bulan (minimal 1 bulan): THR = (masa kerja / 12) x gaji
 *
 * Referensi: PP No. 36 Tahun 2021 tentang Pengupahan
 */
class ThrService
{
    /** @var int Bulan minimal masa kerja untuk berhak THR */
    protected int $minimumMonthsForThr = 1;

    /** @var int Bulan penuh untuk mendapatkan THR 100% */
    protected int $fullThrMonths = 12;

    // ==========================================
    // METODE PERHITUNGAN
    // ==========================================

    /**
     * Menghitung THR untuk satu karyawan.
     *
     * @param Employee $employee Model karyawan
     * @param Carbon|null $calculationDate Tanggal perhitungan (default: sekarang)
     * @return array Hasil perhitungan THR [amount, months, percentage, base_salary]
     */
    public function calculateThr(Employee $employee, ?Carbon $calculationDate = null): array
    {
        $calcDate = $calculationDate ?? Carbon::now();

        // Hitung masa kerja dalam bulan
        $monthsOfService = $this->calculateMonthsOfService($employee, $calcDate);

        // Karyawan dengan masa kerja kurang dari 1 bulan tidak berhak THR
        if ($monthsOfService < $this->minimumMonthsForThr) {
            return [
                'amount' => 0,
                'months_of_service' => $monthsOfService,
                'percentage' => 0,
                'base_salary' => 0,
                'eligible' => false,
                'reason' => 'Masa kerja kurang dari 1 bulan',
            ];
        }

        // Ambil gaji pokok + tunjangan tetap
        $baseSalary = $this->getBaseSalaryForThr($employee, $calcDate);

        // Hitung persentase THR
        $percentage = min(100, ($monthsOfService / $this->fullThrMonths) * 100);

        // Hitung nominal THR
        if ($monthsOfService >= $this->fullThrMonths) {
            // THR penuh (1x gaji)
            $thrAmount = $baseSalary;
        } else {
            // THR prorata
            $thrAmount = ($monthsOfService / $this->fullThrMonths) * $baseSalary;
        }

        return [
            'amount' => round($thrAmount, 0),
            'months_of_service' => $monthsOfService,
            'percentage' => round($percentage, 2),
            'base_salary' => $baseSalary,
            'eligible' => true,
            'reason' => $monthsOfService >= $this->fullThrMonths
                ? 'THR penuh (masa kerja >= 12 bulan)'
                : 'THR pro-rata (masa kerja ' . $monthsOfService . ' bulan)',
        ];
    }

    /**
     * Menghitung masa kerja karyawan dalam bulan.
     *
     * @param Employee $employee Model karyawan
     * @param Carbon $referenceDate Tanggal acuan perhitungan
     * @return int Jumlah bulan masa kerja
     */
    protected function calculateMonthsOfService(Employee $employee, Carbon $referenceDate): int
    {
        // Ambil tanggal mulai kerja dari timeline pertama
        $firstTimeline = Timeline::where('employee_id', $employee->id)
            ->where('is_sequent', 1)
            ->orderBy('start_date')
            ->first();

        if (!$firstTimeline || !$firstTimeline->start_date) {
            return 0;
        }

        $startDate = Carbon::parse($firstTimeline->start_date);

        // Hitung selisih bulan
        $months = $startDate->diffInMonths($referenceDate);

        return max(0, $months);
    }

    /**
     * Mendapatkan gaji pokok + tunjangan tetap sebagai dasar perhitungan THR.
     *
     * @param Employee $employee Model karyawan
     * @param Carbon $referenceDate Tanggal acuan
     * @return float Gaji dasar untuk THR
     */
    protected function getBaseSalaryForThr(Employee $employee, Carbon $referenceDate): float
    {
        // Ambil data gaji terakhir
        $salary = EmployeeSalary::where('employee_id', $employee->id)
            ->where('effective_date', '<=', $referenceDate)
            ->where(function ($q) use ($referenceDate) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $referenceDate);
            })
            ->orderByDesc('effective_date')
            ->first();

        // Gaji pokok
        $basicSalary = $salary->basic_salary ?? 0;

        // TODO: Tambahkan tunjangan tetap dari employee_salary_components
        // Tunjangan tetap = tunjangan yang tidak bergantung pada kehadiran

        return $basicSalary;
    }

    // ==========================================
    // METODE PROSES MASSAL
    // ==========================================

    /**
     * Memproses THR untuk beberapa karyawan sekaligus.
     *
     * @param array|null $employeeIds Array ID karyawan (null = semua karyawan aktif)
     * @param Carbon|null $calculationDate Tanggal perhitungan
     * @return array Hasil pemrosesan [results, summary]
     */
    public function processThr(?array $employeeIds = null, ?Carbon $calculationDate = null): array
    {
        $calcDate = $calculationDate ?? Carbon::now();

        // Ambil karyawan
        $query = Employee::where('is_active', true);
        if ($employeeIds) {
            $query->whereIn('id', $employeeIds);
        }
        $employees = $query->get();

        $results = [];
        $summary = [
            'total_employees' => 0,
            'eligible_employees' => 0,
            'total_thr_amount' => 0,
            'full_thr_count' => 0,
            'prorata_thr_count' => 0,
            'not_eligible_count' => 0,
        ];

        foreach ($employees as $employee) {
            $thrResult = $this->calculateThr($employee, $calcDate);

            $results[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->full_name,
                'department' => $employee->current_department,
                'position' => $employee->current_position,
                ...$thrResult,
            ];

            $summary['total_employees']++;

            if ($thrResult['eligible']) {
                $summary['eligible_employees']++;
                $summary['total_thr_amount'] += $thrResult['amount'];

                if ($thrResult['months_of_service'] >= $this->fullThrMonths) {
                    $summary['full_thr_count']++;
                } else {
                    $summary['prorata_thr_count']++;
                }
            } else {
                $summary['not_eligible_count']++;
            }
        }

        return [
            'calculation_date' => $calcDate->format('Y-m-d'),
            'results' => $results,
            'summary' => $summary,
        ];
    }

    /**
     * Mengekspor hasil perhitungan THR ke format yang bisa diunduh.
     *
     * @param array $thrResults Hasil dari processThr()
     * @return array Data untuk export
     */
    public function formatForExport(array $thrResults): array
    {
        $exportData = [];

        foreach ($thrResults['results'] as $result) {
            $exportData[] = [
                'NIK' => $result['employee_id'],
                'Nama Karyawan' => $result['employee_name'],
                'Departemen' => $result['department'],
                'Jabatan' => $result['position'],
                'Masa Kerja (Bulan)' => $result['months_of_service'],
                'Gaji Dasar' => $result['base_salary'],
                'Persentase THR' => $result['percentage'] . '%',
                'Nominal THR' => $result['amount'],
                'Status' => $result['eligible'] ? 'Berhak' : 'Tidak Berhak',
                'Keterangan' => $result['reason'],
            ];
        }

        return $exportData;
    }
}
