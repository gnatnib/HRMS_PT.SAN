<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates overtime requests table with Depnaker (Indonesian labor law) multipliers.
     */
    public function up(): void
    {
        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('total_hours', 5, 2);

            // Depnaker overtime multipliers:
            // - First hour: 1.5x
            // - Next hours: 2x
            // - Weekend/Holiday first 8 hours: 2x
            // - Weekend/Holiday next hours: 3x, 4x
            $table->decimal('multiplier', 3, 2)->default(1.50);
            $table->decimal('calculated_pay', 12, 2)->nullable();

            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // For linking to actual clock out data
            $table->foreignId('fingerprint_id')->nullable()->constrained();

            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'date']);
            $table->index(['status', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
    }
};
