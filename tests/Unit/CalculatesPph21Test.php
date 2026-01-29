<?php

namespace Tests\Unit;

use App\Services\Payroll\PayrollService;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests untuk perhitungan PPh 21 TER 2024.
 * Memvalidasi kategori TER dan perhitungan sesuai regulasi.
 */
class CalculatesPph21Test extends TestCase
{
    protected PayrollService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PayrollService();
    }

    /**
     * Test kategori TER berdasarkan PTKP.
     */
    public function test_get_ter_category(): void
    {
        // Kategori A
        $this->assertEquals('A', $this->service->getTerCategory('TK/0'));
        $this->assertEquals('A', $this->service->getTerCategory('TK/1'));
        $this->assertEquals('A', $this->service->getTerCategory('K/0'));

        // Kategori B
        $this->assertEquals('B', $this->service->getTerCategory('TK/2'));
        $this->assertEquals('B', $this->service->getTerCategory('K/1'));
        $this->assertEquals('B', $this->service->getTerCategory('K/2'));

        // Kategori C
        $this->assertEquals('C', $this->service->getTerCategory('K/3'));
    }

    /**
     * Test nilai PTKP.
     */
    public function test_get_ptkp_value(): void
    {
        $this->assertEquals(54000000, $this->service->getPtkpValue('TK/0'));
        $this->assertEquals(58500000, $this->service->getPtkpValue('K/0'));
        $this->assertEquals(72000000, $this->service->getPtkpValue('K/3'));
    }

    /**
     * Test PPh 21 TER untuk gaji rendah (tidak kena pajak).
     */
    public function test_pph21_ter_low_income(): void
    {
        // Gaji 5 juta dengan status TK/0 = 0% (tidak kena pajak)
        $result = $this->service->calculatePph21Ter(5000000, 'TK/0');
        $this->assertEquals(0, $result);
    }

    /**
     * Test PPh 21 TER untuk gaji menengah.
     */
    public function test_pph21_ter_medium_income(): void
    {
        // Gaji 10 juta dengan status TK/0 = 2% (berdasarkan tabel TER A)
        $result = $this->service->calculatePph21Ter(10000000, 'TK/0');
        $this->assertEquals(200000, $result); // 2% dari 10 juta
    }

    /**
     * Test PPh 21 TER untuk gaji tinggi.
     */
    public function test_pph21_ter_high_income(): void
    {
        // Gaji 50 juta dengan status TK/0
        $result = $this->service->calculatePph21Ter(50000000, 'TK/0');
        $this->assertGreaterThan(0, $result);
    }

    /**
     * Test perhitungan method utama untuk Jan-Nov (TER).
     */
    public function test_calculate_pph21_january_to_november(): void
    {
        $salary = 10000000;
        $ptkpCode = 'TK/0';

        // Bulan Januari (1) - harus menggunakan TER
        $result = $this->service->calculatePph21($salary, $ptkpCode, 1);

        $this->assertEquals('TER', $result['method']);
        $this->assertEquals('A', $result['category']);
        $this->assertArrayHasKey('amount', $result);
    }

    /**
     * Test perhitungan method untuk Desember (Pasal 17).
     */
    public function test_calculate_pph21_december(): void
    {
        $salaryMonthly = 10000000;
        $ptkpCode = 'TK/0';
        $grossYtd = 110000000; // 11 bulan x 10 juta
        $bpjsYtd = 4400000; // Estimasi BPJS 11 bulan
        $pph21PaidYtd = 2200000; // Estimasi PPh 11 bulan

        $result = $this->service->calculatePph21(
            $salaryMonthly,
            $ptkpCode,
            12,
            $grossYtd,
            $bpjsYtd,
            $pph21PaidYtd
        );

        $this->assertEquals('PASAL_17', $result['method']);
        $this->assertArrayHasKey('amount', $result);
    }

    /**
     * Test perhitungan pajak progresif Pasal 17.
     */
    public function test_progressive_tax_calculation(): void
    {
        // PKP 100 juta:
        // - 60 juta pertama: 5% = 3 juta
        // - 40 juta berikutnya: 15% = 6 juta
        // Total = 9 juta

        $ptkpCode = 'TK/0';
        $ptkpValue = $this->service->getPtkpValue($ptkpCode);

        // Gross annual yang menghasilkan PKP 100 juta
        $grossAnnual = 100000000 + $ptkpValue; // PKP + PTKP
        $bpjsAnnual = 0; // Simplifikasi untuk test

        $result = $this->service->calculatePph21December(
            $grossAnnual,
            $ptkpCode,
            $bpjsAnnual,
            0 // Belum ada yang dibayar
        );

        $expectedTax = (60000000 * 0.05) + (40000000 * 0.15);
        $this->assertEquals($expectedTax, $result);
    }
}
