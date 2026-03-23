<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('position');
            $table->string('source', 50)->default('Website');
            $table->enum('stage', ['applied', 'screening', 'interview', 'offering', 'hired', 'rejected'])->default('applied');
            $table->date('applied_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('resume_path')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('job_opening_id')->nullable()->constrained('job_openings')->nullOnDelete();
            $table->foreignId('converted_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
