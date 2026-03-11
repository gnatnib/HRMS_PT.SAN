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
            if (!Schema::hasColumn('employees', 'training_courses')) {
                $table->json('training_courses')->nullable()->after('education');
            }
            if (!Schema::hasColumn('employees', 'work_experience')) {
                $table->json('work_experience')->nullable()->after('training_courses');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['training_courses', 'work_experience']);
        });
    }
};
