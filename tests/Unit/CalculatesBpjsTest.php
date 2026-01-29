<?php

namespace Tests\Unit;

use App\Services\Payroll\PayrollService;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests untuk perhitungan BPJS di PayrollService.
 * Memvalidasi persentase dan max cap sesuai regulasi Indonesia.
 */
class CalculatesBpjsTest extends TestCase
{
    protected PayrollService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PayrollService();
    }

    /**
     * Test perhitungan JHT perusahaan (3.7%).
     */
    public function test_calculate_jht_company(): void
    {
        $salary = 10000000;
        $expected = 370000; // 3.7% dari 10 juta

        $result = $this->service->calculateJhtCompany($salary);

        $this->assertEquals($expected, $result);
    }

    /**
     * Test perhitungan JHT karyawan (2%).
     */
    public function test_calculate_jht_employee(): void
    {
        $salary = 10000000;
        $expected = 200000; // 2% dari 10 juta

        $result = $this->service->calculateJhtEmployee($salary);

        $this->assertEquals($expected, $result);
    }

    /**
     * Test perhitungan JKK dengan berbagai tingkat resiko.
     */
    public function test_calculate_jkk_risk_levels(): void
    {
        $salary = 10000000;

        // Resiko sangat rendah (0.24%)
        $this->assertEquals(24000, $this->service->calculateJkk($salary, 1));

        // Resiko sedang (0.89%)
        $this->assertEquals(89000, $this->service->calculateJkk($salary, 3));

        // Resiko sangat tinggi (1.74%)
        $this->assertEquals(174000, $this->service->calculateJkk($salary, 5));
    }

    /**
     * Test perhitungan JKM (0.3%).
     */
    public function test_calculate_jkm(): void
    {
        $salary = 10000000;
        $expected = 30000; // 0.3% dari 10 juta

        $result = $this->service->calculateJkm($salary);

        $this->assertEquals($expected, $result);
    }

    /**
     * Test perhitungan JP dengan gaji di bawah max cap.
     */
    public function test_calculate_jp_below_cap(): void
    {
        $salary = 8000000;
        $expectedCompany = 160000; // 2% dari 8 juta
        $expectedEmployee = 80000; // 1% dari 8 juta

        $this->assertEquals($expectedCompany, $this->service->calculateJpCompany($salary));
        $this->assertEquals($expectedEmployee, $this->service->calculateJpEmployee($salary));
    }

    /**
     * Test perhitungan JP dengan gaji di atas max cap (Rp 10.042.300).
     * Harus menggunakan max cap sebagai dasar perhitungan.
     */
    public function test_calculate_jp_above_cap(): void
    {
        $salary = 15000000;
        $maxCap = 10042300;

        $expectedCompany = round($maxCap * 0.02, 0); // 2% dari max cap
        $expectedEmployee = round($maxCap * 0.01, 0); // 1% dari max cap

        $this->assertEquals($expectedCompany, $this->service->calculateJpCompany($salary));
        $this->assertEquals($expectedEmployee, $this->service->calculateJpEmployee($salary));
    }

    /**
     * Test perhitungan BPJS Kesehatan dengan gaji di bawah max cap.
     */
    public function test_calculate_bpjs_kesehatan_below_cap(): void
    {
        $salary = 8000000;
        $expectedCompany = 320000; // 4% dari 8 juta
        $expectedEmployee = 80000; // 1% dari 8 juta

        $this->assertEquals($expectedCompany, $this->service->calculateKesCompany($salary));
        $this->assertEquals($expectedEmployee, $this->service->calculateKesEmployee($salary));
    }

    /**
     * Test perhitungan BPJS Kesehatan dengan gaji di atas max cap (Rp 12.000.000).
     */
    public function test_calculate_bpjs_kesehatan_above_cap(): void
    {
        $salary = 20000000;
        $maxCap = 12000000;

        $expectedCompany = round($maxCap * 0.04, 0); // 4% dari max cap
        $expectedEmployee = round($maxCap * 0.01, 0); // 1% dari max cap

        $this->assertEquals($expectedCompany, $this->service->calculateKesCompany($salary));
        $this->assertEquals($expectedEmployee, $this->service->calculateKesEmployee($salary));
    }

    /**
     * Test perhitungan semua komponen BPJS sekaligus.
     */
    public function test_calculate_all_bpjs(): void
    {
        $salary = 10000000;

        $result = $this->service->calculateAllBpjs($salary, 1);

        $this->assertArrayHasKey('jht_company', $result);
        $this->assertArrayHasKey('jht_employee', $result);
        $this->assertArrayHasKey('jkk', $result);
        $this->assertArrayHasKey('jkm', $result);
        $this->assertArrayHasKey('jp_company', $result);
        $this->assertArrayHasKey('jp_employee', $result);
        $this->assertArrayHasKey('kes_company', $result);
        $this->assertArrayHasKey('kes_employee', $result);
        $this->assertArrayHasKey('total_company', $result);
        $this->assertArrayHasKey('total_employee', $result);

        // Verify totals
        $this->assertEquals(
            $result['jht_company'] + $result['jkk'] + $result['jkm'] + $result['jp_company'] + $result['kes_company'],
            $result['total_company']
        );
        $this->assertEquals(
            $result['jht_employee'] + $result['jp_employee'] + $result['kes_employee'],
            $result['total_employee']
        );
    }
}
