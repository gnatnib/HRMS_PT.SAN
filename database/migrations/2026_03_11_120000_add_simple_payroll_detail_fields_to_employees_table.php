<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->date('taxable_date')->nullable()->after('salary_configuration');
            $table->string('bpjs_ketenagakerjaan', 50)->nullable()->after('npp_bpjs_ketenagakerjaan');
            $table->string('bpjs_kesehatan', 50)->nullable()->after('bpjs_ketenagakerjaan');
            $table->string('bpjs_kesehatan_family', 5)->nullable()->after('bpjs_kesehatan');
            $table->string('npwp', 30)->nullable()->after('bpjs_kesehatan_family');
            $table->string('currency', 10)->default('IDR')->after('npwp');
            $table->date('bpjs_ketenagakerjaan_date')->nullable()->after('currency');
            $table->date('bpjs_kesehatan_date')->nullable()->after('bpjs_ketenagakerjaan_date');
            $table->date('jaminan_pensiun_date')->nullable()->after('bpjs_kesehatan_date');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'taxable_date',
                'bpjs_ketenagakerjaan',
                'bpjs_kesehatan',
                'bpjs_kesehatan_family',
                'npwp',
                'currency',
                'bpjs_ketenagakerjaan_date',
                'bpjs_kesehatan_date',
                'jaminan_pensiun_date',
            ]);
        });
    }
};
