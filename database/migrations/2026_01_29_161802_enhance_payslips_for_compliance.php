<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Menjalankan migration.
     * Memperkaya tabel payslips dengan detail BPJS terpisah (company/employee),
     * metadata PPh 21 TER, dan kolom pendukung untuk kepatuhan regulasi Indonesia.
     */
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            // ==========================================
            // BPJS KETENAGAKERJAAN - Detail Terpisah
            // ==========================================

            // JHT (Jaminan Hari Tua): 3.7% perusahaan, 2% karyawan
            $table->decimal('bpjs_tk_jht_company', 15, 2)->default(0)->after('bpjs_jkm');
            $table->decimal('bpjs_tk_jht_employee', 15, 2)->default(0)->after('bpjs_tk_jht_company');

            // JKK (Jaminan Kecelakaan Kerja): 0.24% - 1.74% perusahaan (tergantung resiko)
            $table->decimal('bpjs_tk_jkk', 15, 2)->default(0)->after('bpjs_tk_jht_employee');

            // JKM (Jaminan Kematian): 0.3% perusahaan
            $table->decimal('bpjs_tk_jkm', 15, 2)->default(0)->after('bpjs_tk_jkk');

            // JP (Jaminan Pensiun): 2% perusahaan, 1% karyawan - Max Cap Rp 10.042.300
            $table->decimal('bpjs_tk_jp_company', 15, 2)->default(0)->after('bpjs_tk_jkm');
            $table->decimal('bpjs_tk_jp_employee', 15, 2)->default(0)->after('bpjs_tk_jp_company');

            // ==========================================
            // BPJS KESEHATAN - Detail Terpisah
            // ==========================================

            // Kesehatan: 4% perusahaan, 1% karyawan - Max Cap Rp 12.000.000
            $table->decimal('bpjs_kes_company', 15, 2)->default(0)->after('bpjs_tk_jp_employee');
            $table->decimal('bpjs_kes_employee', 15, 2)->default(0)->after('bpjs_kes_company');

            // ==========================================
            // PPH 21 - Metadata TER 2024
            // ==========================================

            // Kategori TER: A (TK/0, TK/1, K/0), B (TK/2, TK/3, K/1, K/2), C (K/3+)
            $table->string('pph21_ter_category', 5)->nullable()->after('pph21');

            // Kode PTKP: TK/0, TK/1, TK/2, TK/3, K/0, K/1, K/2, K/3
            $table->string('pph21_ptkp_code', 10)->nullable()->after('pph21_ter_category');

            // ==========================================
            // DATA KEHADIRAN DAN PRORATA
            // ==========================================

            // Jumlah hari hadir untuk perhitungan tunjangan harian
            $table->integer('attendance_days_count')->default(0)->after('pph21_ptkp_code');

            // Gaji prorata untuk karyawan masuk/keluar tengah bulan
            $table->decimal('prorated_salary', 15, 2)->default(0)->after('attendance_days_count');

            // Total tunjangan harian (uang makan + transport * hari hadir)
            $table->decimal('daily_allowance_total', 15, 2)->default(0)->after('prorated_salary');

            // ==========================================
            // KOMPONEN TAMBAHAN
            // ==========================================

            // Total reimbursement yang dibayarkan bersamaan gaji
            $table->decimal('reimbursement_total', 15, 2)->default(0)->after('daily_allowance_total');

            // Nominal THR jika ada pembayaran THR di periode ini
            $table->decimal('thr_amount', 15, 2)->default(0)->after('reimbursement_total');

            // Denda keterlambatan
            $table->decimal('late_penalty', 15, 2)->default(0)->after('thr_amount');
        });
    }

    /**
     * Membalikkan migration.
     */
    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_tk_jht_company',
                'bpjs_tk_jht_employee',
                'bpjs_tk_jkk',
                'bpjs_tk_jkm',
                'bpjs_tk_jp_company',
                'bpjs_tk_jp_employee',
                'bpjs_kes_company',
                'bpjs_kes_employee',
                'pph21_ter_category',
                'pph21_ptkp_code',
                'attendance_days_count',
                'prorated_salary',
                'daily_allowance_total',
                'reimbursement_total',
                'thr_amount',
                'late_penalty',
            ]);
        });
    }
};
