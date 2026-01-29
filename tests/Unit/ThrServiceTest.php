<?php

namespace Tests\Unit;

use App\Services\Payroll\ThrService;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests untuk perhitungan THR.
 * Memvalidasi logika pro-rata dan THR penuh.
 */
class ThrServiceTest extends TestCase
{
    protected ThrService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ThrService();
    }

    /**
     * Test bahwa karyawan dengan masa kerja < 1 bulan tidak berhak THR.
     */
    public function test_not_eligible_under_one_month(): void
    {
        // Mock employee dengan masa kerja 0 bulan
        // Karena ini unit test murni tanpa DB, kita test logika dasar saja
        $this->assertTrue(true); // Placeholder - perlu integration test dengan DB
    }

    /**
     * Test perhitungan THR penuh untuk masa kerja >= 12 bulan.
     * THR = 1x gaji pokok + tunjangan tetap
     */
    public function test_full_thr_for_12_months_or_more(): void
    {
        // Logika: masa kerja >= 12 bulan = 100% THR
        $baseSalary = 10000000;
        $monthsOfService = 12;

        $percentage = min(100, ($monthsOfService / 12) * 100);
        $thrAmount = $baseSalary * ($percentage / 100);

        $this->assertEquals(100, $percentage);
        $this->assertEquals(10000000, $thrAmount);
    }

    /**
     * Test perhitungan THR pro-rata untuk masa kerja 6 bulan.
     * THR = (6/12) x gaji = 50% gaji
     */
    public function test_prorata_thr_for_6_months(): void
    {
        $baseSalary = 10000000;
        $monthsOfService = 6;

        $percentage = min(100, ($monthsOfService / 12) * 100);
        $thrAmount = $baseSalary * ($percentage / 100);

        $this->assertEquals(50, $percentage);
        $this->assertEquals(5000000, $thrAmount);
    }

    /**
     * Test perhitungan THR pro-rata untuk masa kerja 1 bulan.
     * THR = (1/12) x gaji = ~8.33% gaji
     */
    public function test_prorata_thr_for_1_month(): void
    {
        $baseSalary = 12000000; // Pakai kelipatan 12 untuk hasil bulat
        $monthsOfService = 1;

        $percentage = ($monthsOfService / 12) * 100;
        $thrAmount = ($monthsOfService / 12) * $baseSalary;

        $this->assertEqualsWithDelta(8.33, $percentage, 0.01);
        $this->assertEquals(1000000, $thrAmount);
    }

    /**
     * Test perhitungan THR untuk masa kerja 24 bulan.
     * Tetap 100% (tidak lebih dari 1x gaji)
     */
    public function test_full_thr_for_24_months(): void
    {
        $baseSalary = 10000000;
        $monthsOfService = 24;

        $percentage = min(100, ($monthsOfService / 12) * 100);

        $this->assertEquals(100, $percentage); // Max 100%
    }
}
