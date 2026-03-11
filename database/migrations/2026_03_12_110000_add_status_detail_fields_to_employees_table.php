<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('status_reason', 100)->nullable()->after('employment_status');
            $table->text('status_notes')->nullable()->after('status_reason');
        });

        DB::table('employees')->where('employment_status', 'Permanent')->update(['employment_status' => 'Aktif']);
        DB::table('employees')->where('employment_status', 'Business Trip')->update(['employment_status' => 'Dinas Luar']);
        DB::table('employees')->where('employment_status', 'Probation')->update(['employment_status' => 'Masa Percobaan']);
        DB::table('employees')->where('employment_status', 'Leave')->update(['employment_status' => 'Cuti']);
        DB::table('employees')->where('employment_status', 'Sick')->update(['employment_status' => 'Izin', 'status_reason' => 'Sakit']);
        DB::table('employees')->where('employment_status', 'Permission')->update(['employment_status' => 'Izin', 'status_reason' => 'Keperluan Pribadi']);
        DB::table('employees')->where('employment_status', 'Intern')->update(['employment_status' => 'Aktif']);
        DB::table('employees')->where('is_active', false)->update(['employment_status' => 'Terminated']);
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['status_reason', 'status_notes']);
        });
    }
};
