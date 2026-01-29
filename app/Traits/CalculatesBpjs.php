<?php

namespace App\Traits;

/**
 * Trait CalculatesBpjs
 *
 * Trait untuk perhitungan BPJS Ketenagakerjaan dan BPJS Kesehatan
 * sesuai dengan regulasi Indonesia terbaru.
 *
 * Persentase BPJS Ketenagakerjaan:
 * - JHT (Jaminan Hari Tua): 5.7% (3.7% perusahaan, 2% karyawan)
 * - JKK (Jaminan Kecelakaan Kerja): 0.24% - 1.74% (perusahaan, tergantung resiko)
 * - JKM (Jaminan Kematian): 0.3% (perusahaan)
 * - JP (Jaminan Pensiun): 3% (2% perusahaan, 1% karyawan) - Max Cap berlaku
 *
 * Persentase BPJS Kesehatan:
 * - 5% dari gaji (4% perusahaan, 1% karyawan) - Max Cap berlaku
 */
trait CalculatesBpjs
{
    // ==========================================
    // KONSTANTA BPJS KETENAGAKERJAAN
    // ==========================================

    /** @var float Persentase JHT yang ditanggung perusahaan */
    protected float $jhtCompanyRate = 3.7;

    /** @var float Persentase JHT yang ditanggung karyawan */
    protected float $jhtEmployeeRate = 2.0;

    /** @var float Persentase JKM yang ditanggung perusahaan */
    protected float $jkmRate = 0.3;

    /** @var float Persentase JP yang ditanggung perusahaan */
    protected float $jpCompanyRate = 2.0;

    /** @var float Persentase JP yang ditanggung karyawan */
    protected float $jpEmployeeRate = 1.0;

    /** @var float Batas atas upah untuk perhitungan JP (per Januari 2024) */
    protected float $jpMaxCap = 10042300;

    // ==========================================
    // KONSTANTA BPJS KESEHATAN
    // ==========================================

    /** @var float Persentase BPJS Kesehatan yang ditanggung perusahaan */
    protected float $kesCompanyRate = 4.0;

    /** @var float Persentase BPJS Kesehatan yang ditanggung karyawan */
    protected float $kesEmployeeRate = 1.0;

    /** @var float Batas atas upah untuk perhitungan BPJS Kesehatan */
    protected float $kesMaxCap = 12000000;

    // ==========================================
    // TARIF JKK BERDASARKAN TINGKAT RESIKO
    // ==========================================

    /**
     * Tingkat resiko JKK dan persentasenya.
     * Kelompok I (sangat rendah): 0.24%
     * Kelompok II (rendah): 0.54%
     * Kelompok III (sedang): 0.89%
     * Kelompok IV (tinggi): 1.27%
     * Kelompok V (sangat tinggi): 1.74%
     */
    protected array $jkkRiskRates = [
        1 => 0.24, // Kelompok I - Sangat Rendah (kantor, jasa)
        2 => 0.54, // Kelompok II - Rendah (retail, F&B)
        3 => 0.89, // Kelompok III - Sedang (manufaktur ringan)
        4 => 1.27, // Kelompok IV - Tinggi (konstruksi)
        5 => 1.74, // Kelompok V - Sangat Tinggi (pertambangan, minyak)
    ];

    // ==========================================
    // METODE PERHITUNGAN BPJS KETENAGAKERJAAN
    // ==========================================

    /**
     * Menghitung JHT (Jaminan Hari Tua) perusahaan.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai JHT yang ditanggung perusahaan
     */
    public function calculateJhtCompany(float $grossSalary): float
    {
        return round($grossSalary * ($this->jhtCompanyRate / 100), 0);
    }

    /**
     * Menghitung JHT (Jaminan Hari Tua) karyawan.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai JHT yang ditanggung karyawan
     */
    public function calculateJhtEmployee(float $grossSalary): float
    {
        return round($grossSalary * ($this->jhtEmployeeRate / 100), 0);
    }

    /**
     * Menghitung JKK (Jaminan Kecelakaan Kerja).
     * Seluruhnya ditanggung perusahaan.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @param int $riskLevel Tingkat resiko pekerjaan (1-5)
     * @return float Nilai JKK
     */
    public function calculateJkk(float $grossSalary, int $riskLevel = 1): float
    {
        $rate = $this->jkkRiskRates[$riskLevel] ?? $this->jkkRiskRates[1];
        return round($grossSalary * ($rate / 100), 0);
    }

    /**
     * Menghitung JKM (Jaminan Kematian).
     * Seluruhnya ditanggung perusahaan.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai JKM
     */
    public function calculateJkm(float $grossSalary): float
    {
        return round($grossSalary * ($this->jkmRate / 100), 0);
    }

    /**
     * Menghitung JP (Jaminan Pensiun) perusahaan.
     * Terapkan Max Cap (batas atas upah).
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai JP yang ditanggung perusahaan
     */
    public function calculateJpCompany(float $grossSalary): float
    {
        $cappedSalary = min($grossSalary, $this->jpMaxCap);
        return round($cappedSalary * ($this->jpCompanyRate / 100), 0);
    }

    /**
     * Menghitung JP (Jaminan Pensiun) karyawan.
     * Terapkan Max Cap (batas atas upah).
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai JP yang ditanggung karyawan
     */
    public function calculateJpEmployee(float $grossSalary): float
    {
        $cappedSalary = min($grossSalary, $this->jpMaxCap);
        return round($cappedSalary * ($this->jpEmployeeRate / 100), 0);
    }

    // ==========================================
    // METODE PERHITUNGAN BPJS KESEHATAN
    // ==========================================

    /**
     * Menghitung BPJS Kesehatan yang ditanggung perusahaan.
     * Terapkan Max Cap (batas atas upah).
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai BPJS Kesehatan perusahaan
     */
    public function calculateKesCompany(float $grossSalary): float
    {
        $cappedSalary = min($grossSalary, $this->kesMaxCap);
        return round($cappedSalary * ($this->kesCompanyRate / 100), 0);
    }

    /**
     * Menghitung BPJS Kesehatan yang ditanggung karyawan.
     * Terapkan Max Cap (batas atas upah).
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Nilai BPJS Kesehatan karyawan
     */
    public function calculateKesEmployee(float $grossSalary): float
    {
        $cappedSalary = min($grossSalary, $this->kesMaxCap);
        return round($cappedSalary * ($this->kesEmployeeRate / 100), 0);
    }

    // ==========================================
    // METODE AGREGAT
    // ==========================================

    /**
     * Menghitung semua komponen BPJS sekaligus.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @param int $jkkRiskLevel Tingkat resiko JKK (1-5)
     * @return array Array berisi semua komponen BPJS
     */
    public function calculateAllBpjs(float $grossSalary, int $jkkRiskLevel = 1): array
    {
        return [
            // BPJS Ketenagakerjaan
            'jht_company' => $this->calculateJhtCompany($grossSalary),
            'jht_employee' => $this->calculateJhtEmployee($grossSalary),
            'jkk' => $this->calculateJkk($grossSalary, $jkkRiskLevel),
            'jkm' => $this->calculateJkm($grossSalary),
            'jp_company' => $this->calculateJpCompany($grossSalary),
            'jp_employee' => $this->calculateJpEmployee($grossSalary),

            // BPJS Kesehatan
            'kes_company' => $this->calculateKesCompany($grossSalary),
            'kes_employee' => $this->calculateKesEmployee($grossSalary),

            // Total
            'total_company' => $this->calculateJhtCompany($grossSalary)
                + $this->calculateJkk($grossSalary, $jkkRiskLevel)
                + $this->calculateJkm($grossSalary)
                + $this->calculateJpCompany($grossSalary)
                + $this->calculateKesCompany($grossSalary),
            'total_employee' => $this->calculateJhtEmployee($grossSalary)
                + $this->calculateJpEmployee($grossSalary)
                + $this->calculateKesEmployee($grossSalary),
        ];
    }

    /**
     * Menghitung total potongan BPJS dari gaji karyawan.
     *
     * @param float $grossSalary Gaji bruto karyawan
     * @return float Total potongan BPJS dari gaji
     */
    public function calculateTotalBpjsEmployeeDeduction(float $grossSalary): float
    {
        return $this->calculateJhtEmployee($grossSalary)
            + $this->calculateJpEmployee($grossSalary)
            + $this->calculateKesEmployee($grossSalary);
    }
}
