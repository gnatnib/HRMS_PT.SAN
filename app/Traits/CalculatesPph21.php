<?php

namespace App\Traits;

/**
 * Trait CalculatesPph21
 *
 * Trait untuk perhitungan Pajak Penghasilan Pasal 21 (PPh 21)
 * sesuai dengan regulasi Indonesia - Tarif Efektif Rata-rata (TER) 2024.
 *
 * Aturan Perhitungan:
 * - Januari - November: Gunakan Tarif Efektif Rata-rata (TER)
 * - Desember: Gunakan perhitungan tahunan dengan Tarif Pasal 17
 *
 * Kategori TER berdasarkan status PTKP:
 * - Kategori A: TK/0, TK/1, K/0
 * - Kategori B: TK/2, TK/3, K/1, K/2
 * - Kategori C: K/3 dan seterusnya
 */
trait CalculatesPph21
{
    // ==========================================
    // PTKP (Penghasilan Tidak Kena Pajak) 2024
    // ==========================================

    /**
     * Nilai PTKP tahunan berdasarkan status.
     * TK = Tidak Kawin, K = Kawin
     * Angka menunjukkan jumlah tanggungan (max 3)
     */
    protected array $ptkpValues = [
        'TK/0' => 54000000,  // Tidak Kawin tanpa tanggungan
        'TK/1' => 58500000,  // Tidak Kawin + 1 tanggungan
        'TK/2' => 63000000,  // Tidak Kawin + 2 tanggungan
        'TK/3' => 67500000,  // Tidak Kawin + 3 tanggungan
        'K/0' => 58500000,  // Kawin tanpa tanggungan
        'K/1' => 63000000,  // Kawin + 1 tanggungan
        'K/2' => 67500000,  // Kawin + 2 tanggungan
        'K/3' => 72000000,  // Kawin + 3 tanggungan
    ];

    // ==========================================
    // KATEGORI TER BERDASARKAN STATUS PTKP
    // ==========================================

    /**
     * Mapping status PTKP ke kategori TER.
     */
    protected array $terCategories = [
        'TK/0' => 'A',
        'TK/1' => 'A',
        'K/0' => 'A',
        'TK/2' => 'B',
        'TK/3' => 'B',
        'K/1' => 'B',
        'K/2' => 'B',
        'K/3' => 'C',
    ];

    // ==========================================
    // TABEL TER 2024 (Tarif Efektif Rata-rata)
    // Persentase berdasarkan penghasilan bruto bulanan
    // ==========================================

    /**
     * Tabel TER Kategori A.
     * Format: [batas_atas => persentase]
     */
    protected array $terTableA = [
        5400000 => 0,
        5650000 => 0.25,
        5950000 => 0.50,
        6300000 => 0.75,
        6750000 => 1.00,
        7500000 => 1.25,
        8550000 => 1.50,
        9650000 => 1.75,
        10050000 => 2.00,
        10350000 => 2.25,
        10700000 => 2.50,
        11050000 => 3.00,
        11600000 => 3.50,
        12500000 => 4.00,
        13750000 => 5.00,
        15100000 => 6.00,
        16950000 => 7.00,
        19750000 => 8.00,
        24150000 => 9.00,
        26450000 => 10.00,
        28000000 => 11.00,
        30050000 => 12.00,
        32400000 => 13.00,
        35400000 => 14.00,
        39100000 => 15.00,
        43850000 => 16.00,
        47800000 => 17.00,
        51400000 => 18.00,
        56300000 => 19.00,
        62200000 => 20.00,
        68600000 => 21.00,
        77500000 => 22.00,
        89000000 => 23.00,
        103000000 => 24.00,
        125000000 => 25.00,
        157000000 => 26.00,
        206000000 => 27.00,
        337000000 => 28.00,
        454000000 => 29.00,
        550000000 => 30.00,
        695000000 => 31.00,
        910000000 => 32.00,
        1400000000 => 33.00,
        PHP_FLOAT_MAX => 34.00,
    ];

    /**
     * Tabel TER Kategori B.
     */
    protected array $terTableB = [
        6200000 => 0,
        6500000 => 0.25,
        6850000 => 0.50,
        7300000 => 0.75,
        9200000 => 1.00,
        10750000 => 1.50,
        11250000 => 2.00,
        11600000 => 2.50,
        12600000 => 3.00,
        13600000 => 4.00,
        14950000 => 5.00,
        16400000 => 6.00,
        18450000 => 7.00,
        21850000 => 8.00,
        26000000 => 9.00,
        27700000 => 10.00,
        29350000 => 11.00,
        31450000 => 12.00,
        33950000 => 13.00,
        37100000 => 14.00,
        41100000 => 15.00,
        45800000 => 16.00,
        49500000 => 17.00,
        53800000 => 18.00,
        58500000 => 19.00,
        64000000 => 20.00,
        71000000 => 21.00,
        80000000 => 22.00,
        93000000 => 23.00,
        109000000 => 24.00,
        129000000 => 25.00,
        163000000 => 26.00,
        211000000 => 27.00,
        374000000 => 28.00,
        459000000 => 29.00,
        555000000 => 30.00,
        704000000 => 31.00,
        957000000 => 32.00,
        1405000000 => 33.00,
        PHP_FLOAT_MAX => 34.00,
    ];

    /**
     * Tabel TER Kategori C.
     */
    protected array $terTableC = [
        6600000 => 0,
        6950000 => 0.25,
        7350000 => 0.50,
        7800000 => 0.75,
        8850000 => 1.00,
        9800000 => 1.25,
        10950000 => 1.50,
        11200000 => 1.75,
        12050000 => 2.00,
        12950000 => 3.00,
        14150000 => 4.00,
        15550000 => 5.00,
        17050000 => 6.00,
        19500000 => 7.00,
        22700000 => 8.00,
        26600000 => 9.00,
        28100000 => 10.00,
        30100000 => 11.00,
        32600000 => 12.00,
        35400000 => 13.00,
        38900000 => 14.00,
        43000000 => 15.00,
        47400000 => 16.00,
        51200000 => 17.00,
        55800000 => 18.00,
        60400000 => 19.00,
        66700000 => 20.00,
        74500000 => 21.00,
        83200000 => 22.00,
        95600000 => 23.00,
        110000000 => 24.00,
        134000000 => 25.00,
        169000000 => 26.00,
        221000000 => 27.00,
        390000000 => 28.00,
        463000000 => 29.00,
        561000000 => 30.00,
        709000000 => 31.00,
        965000000 => 32.00,
        1419000000 => 33.00,
        PHP_FLOAT_MAX => 34.00,
    ];

    // ==========================================
    // TARIF PASAL 17 (untuk perhitungan Desember)
    // ==========================================

    /**
     * Layer tarif progresif Pasal 17 UU PPh.
     * Format: [batas_atas_tahunan => persentase]
     */
    protected array $pasal17Rates = [
        60000000 => 5,   // 0 - 60 juta: 5%
        250000000 => 15,  // 60 - 250 juta: 15%
        500000000 => 25,  // 250 - 500 juta: 25%
        5000000000 => 30,  // 500 juta - 5M: 30%
        PHP_FLOAT_MAX => 35, // > 5M: 35%
    ];

    // ==========================================
    // METODE PERHITUNGAN
    // ==========================================

    /**
     * Mendapatkan kategori TER berdasarkan kode PTKP.
     *
     * @param string $ptkpCode Kode PTKP (TK/0, K/1, dll)
     * @return string Kategori TER (A, B, atau C)
     */
    public function getTerCategory(string $ptkpCode): string
    {
        return $this->terCategories[$ptkpCode] ?? 'A';
    }

    /**
     * Mendapatkan nilai PTKP berdasarkan kode.
     *
     * @param string $ptkpCode Kode PTKP
     * @return float Nilai PTKP tahunan
     */
    public function getPtkpValue(string $ptkpCode): float
    {
        return $this->ptkpValues[$ptkpCode] ?? $this->ptkpValues['TK/0'];
    }

    /**
     * Menghitung PPh 21 menggunakan TER (untuk Jan-Nov).
     *
     * @param float $grossMonthly Penghasilan bruto bulanan
     * @param string $ptkpCode Kode PTKP karyawan
     * @return float Nilai PPh 21 bulanan
     */
    public function calculatePph21Ter(float $grossMonthly, string $ptkpCode): float
    {
        $category = $this->getTerCategory($ptkpCode);

        // Pilih tabel TER yang sesuai
        $terTable = match ($category) {
            'A' => $this->terTableA,
            'B' => $this->terTableB,
            'C' => $this->terTableC,
            default => $this->terTableA,
        };

        // Cari persentase yang sesuai
        $rate = 0;
        foreach ($terTable as $limit => $percentage) {
            if ($grossMonthly <= $limit) {
                $rate = $percentage;
                break;
            }
        }

        return round($grossMonthly * ($rate / 100), 0);
    }

    /**
     * Menghitung PPh 21 menggunakan Tarif Pasal 17 (untuk Desember).
     * Ini adalah perhitungan tahunan yang kemudian dikurangi PPh yang sudah dipotong Jan-Nov.
     *
     * @param float $grossAnnual Penghasilan bruto tahunan (total Jan-Des)
     * @param string $ptkpCode Kode PTKP karyawan
     * @param float $bpjsAnnual Total potongan BPJS tahunan
     * @param float $pph21PaidYtd PPh 21 yang sudah dipotong Jan-Nov
     * @return float Nilai PPh 21 untuk bulan Desember
     */
    public function calculatePph21December(
        float $grossAnnual,
        string $ptkpCode,
        float $bpjsAnnual,
        float $pph21PaidYtd
    ): float {
        // Hitung Penghasilan Neto Tahunan
        $netAnnual = $grossAnnual - $bpjsAnnual;

        // Kurangi PTKP
        $ptkp = $this->getPtkpValue($ptkpCode);
        $taxableIncome = max(0, $netAnnual - $ptkp);

        // Hitung PPh 21 tahunan dengan tarif progresif Pasal 17
        $annualTax = $this->calculateProgressiveTax($taxableIncome);

        // PPh 21 Desember = PPh 21 Tahunan - PPh 21 yang sudah dipotong
        $decemberTax = max(0, $annualTax - $pph21PaidYtd);

        return round($decemberTax, 0);
    }

    /**
     * Menghitung pajak progresif berdasarkan Tarif Pasal 17.
     *
     * @param float $taxableIncome Penghasilan Kena Pajak (PKP)
     * @return float Total pajak
     */
    protected function calculateProgressiveTax(float $taxableIncome): float
    {
        $tax = 0;
        $remaining = $taxableIncome;
        $previousLimit = 0;

        foreach ($this->pasal17Rates as $limit => $rate) {
            if ($remaining <= 0) {
                break;
            }

            $bracket = min($remaining, $limit - $previousLimit);
            $tax += $bracket * ($rate / 100);
            $remaining -= $bracket;
            $previousLimit = $limit;
        }

        return round($tax, 0);
    }

    /**
     * Menghitung PPh 21 bulanan (otomatis pilih TER atau Pasal 17).
     *
     * @param float $grossMonthly Penghasilan bruto bulanan
     * @param string $ptkpCode Kode PTKP karyawan
     * @param int $month Bulan perhitungan (1-12)
     * @param float|null $grossYtd Penghasilan bruto YTD (wajib untuk Desember)
     * @param float|null $bpjsYtd Total BPJS YTD (wajib untuk Desember)
     * @param float|null $pph21PaidYtd PPh 21 yang sudah dipotong YTD (wajib untuk Desember)
     * @return array Array berisi nilai PPh 21 dan metadata
     */
    public function calculatePph21(
        float $grossMonthly,
        string $ptkpCode,
        int $month,
        ?float $grossYtd = null,
        ?float $bpjsYtd = null,
        ?float $pph21PaidYtd = null
    ): array {
        $category = $this->getTerCategory($ptkpCode);

        if ($month >= 1 && $month <= 11) {
            // Gunakan TER untuk Jan-Nov
            $pph21 = $this->calculatePph21Ter($grossMonthly, $ptkpCode);
            $method = 'TER';
        } else {
            // Gunakan Tarif Pasal 17 untuk Desember
            $grossAnnual = ($grossYtd ?? $grossMonthly * 11) + $grossMonthly;
            $bpjsAnnual = $bpjsYtd ?? 0;
            $paidYtd = $pph21PaidYtd ?? 0;

            $pph21 = $this->calculatePph21December($grossAnnual, $ptkpCode, $bpjsAnnual, $paidYtd);
            $method = 'PASAL_17';
        }

        return [
            'amount' => $pph21,
            'method' => $method,
            'category' => $category,
            'ptkp_code' => $ptkpCode,
            'ptkp_value' => $this->getPtkpValue($ptkpCode),
        ];
    }
}
