<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Menjalankan migration.
     * Menambah kolom is_daily_allowance untuk mendukung tunjangan berbasis kehadiran
     * seperti uang makan dan transport.
     */
    public function up(): void
    {
        Schema::table('salary_components', function (Blueprint $table) {
            // Kolom untuk menandai komponen gaji yang dihitung per hari kehadiran
            // Contoh: Uang makan Rp 30.000/hari, Transport Rp 25.000/hari
            $table->boolean('is_daily_allowance')->default(false)->after('is_bpjs_applicable');
        });
    }

    /**
     * Membalikkan migration.
     */
    public function down(): void
    {
        Schema::table('salary_components', function (Blueprint $table) {
            $table->dropColumn('is_daily_allowance');
        });
    }
};
