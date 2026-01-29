<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Fix column naming inconsistencies in shifts and employee_shift tables.
     */
    public function up(): void
    {
        // Fix shifts table column names
        Schema::table('shifts', function (Blueprint $table) {
            $table->renameColumn('tolerance_late', 'late_tolerance');
            $table->renameColumn('tolerance_early_leave', 'early_leave_tolerance');
        });

        // Fix employee_shift pivot table
        Schema::table('employee_shift', function (Blueprint $table) {
            $table->renameColumn('effective_date', 'date');
            $table->dropColumn('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->renameColumn('late_tolerance', 'tolerance_late');
            $table->renameColumn('early_leave_tolerance', 'tolerance_early_leave');
        });

        Schema::table('employee_shift', function (Blueprint $table) {
            $table->renameColumn('date', 'effective_date');
            $table->date('end_date')->nullable()->after('effective_date');
        });
    }
};
