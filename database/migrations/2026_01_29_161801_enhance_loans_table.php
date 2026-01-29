<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Menjalankan migration.
     * Menambah kolom tambahan untuk tabel loans agar mendukung
     * perhitungan bunga dan status aktif pinjaman.
     */
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            // Jumlah bunga yang dihitung (principal_amount * interest_rate / 100)
            $table->decimal('interest_amount', 15, 2)->default(0)->after('interest_rate');

            // Flag untuk menandai apakah pinjaman masih aktif untuk dipotong dari payroll
            // Berbeda dengan status, karena is_active bisa false meskipun status = 'active'
            // (misal: pemotongan ditunda sementara)
            $table->boolean('is_active')->default(true)->after('status');
        });
    }

    /**
     * Membalikkan migration.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn(['interest_amount', 'is_active']);
        });
    }
};
