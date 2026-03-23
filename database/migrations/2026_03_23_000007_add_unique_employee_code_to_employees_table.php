<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add unique index to employee_code if column exists and index doesn't exist
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'employee_code')) {
                $table->string('employee_code', 20)->nullable()->unique()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropUnique(['employee_code']);
        });
    }
};
