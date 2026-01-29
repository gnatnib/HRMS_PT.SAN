<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Employee ID and Organization
            $table->string('employee_code', 20)->nullable()->after('id');
            $table->string('barcode', 50)->nullable()->after('employee_code');
            $table->date('join_date')->nullable()->after('contract_id');
            $table->string('email')->nullable()->after('mobile_number');

            // Payroll fields
            $table->decimal('basic_salary', 15, 2)->default(0)->after('is_active');
            $table->string('ptkp_status', 10)->default('TK/0')->after('basic_salary');
            $table->string('tax_configuration', 20)->default('Gross')->after('ptkp_status');
            $table->string('prorate_type', 50)->default('Based on Working Day')->after('tax_configuration');
            $table->boolean('count_holiday_as_working_day')->default(false)->after('prorate_type');
            $table->string('salary_type', 20)->default('Monthly')->after('count_holiday_as_working_day');
            $table->string('salary_configuration', 20)->default('Taxable')->after('salary_type');
            $table->string('overtime_status', 20)->default('Eligible')->after('salary_configuration');
            $table->string('employee_tax_status', 30)->default('Pegawai Tetap')->after('overtime_status');

            // BPJS fields
            $table->string('jht_configuration', 20)->default('Default')->after('employee_tax_status');
            $table->string('bpjs_kesehatan_config', 30)->default('By Company')->after('jht_configuration');
            $table->string('jaminan_pensiun_config', 20)->default('Default')->after('bpjs_kesehatan_config');
            $table->string('npp_bpjs_ketenagakerjaan', 50)->nullable()->after('jaminan_pensiun_config');

            // Bank info
            $table->string('bank_name', 50)->nullable()->after('npp_bpjs_ketenagakerjaan');
            $table->string('bank_account_number', 30)->nullable()->after('bank_name');
            $table->string('bank_account_holder', 100)->nullable()->after('bank_account_number');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'employee_code',
                'barcode',
                'join_date',
                'email',
                'basic_salary',
                'ptkp_status',
                'tax_configuration',
                'prorate_type',
                'count_holiday_as_working_day',
                'salary_type',
                'salary_configuration',
                'overtime_status',
                'employee_tax_status',
                'jht_configuration',
                'bpjs_kesehatan_config',
                'jaminan_pensiun_config',
                'npp_bpjs_ketenagakerjaan',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
            ]);
        });
    }
};
