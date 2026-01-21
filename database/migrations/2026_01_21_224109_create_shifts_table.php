<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates shifts table for rostering system (Morning/Night/Rotating shifts).
     */
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Morning Shift", "Night Shift"
            $table->string('code')->unique(); // e.g., "SHIFT-A", "SHIFT-B"
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('break_duration')->default(60); // minutes
            $table->integer('tolerance_late')->default(15); // minutes before marked late
            $table->integer('tolerance_early_leave')->default(15); // minutes
            $table->boolean('is_overnight')->default(false); // for night shifts crossing midnight
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Employee-Shift assignment (for rotating schedules)
        Schema::create('employee_shift', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('shift_id')->constrained()->onDelete('cascade');
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'effective_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_shift');
        Schema::dropIfExists('shifts');
    }
};
