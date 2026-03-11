<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Add position, department, center foreign keys for employee list display
            if (!Schema::hasColumn('employees', 'position_id')) {
                $table->foreignId('position_id')->nullable()->after('contract_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('employees', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('position_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('employees', 'center_id')) {
                $table->foreignId('center_id')->nullable()->after('department_id')->constrained()->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['center_id']);
            $table->dropColumn(['position_id', 'department_id', 'center_id']);
        });
    }
};
