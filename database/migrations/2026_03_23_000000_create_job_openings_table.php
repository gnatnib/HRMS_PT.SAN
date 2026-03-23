<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_openings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('department')->nullable();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->enum('urgency', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['open', 'closed', 'on_hold'])->default('open');
            $table->integer('vacancy_count')->default(1);
            $table->string('location')->nullable();
            $table->string('employment_type', 30)->default('Full-time');
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_openings');
    }
};
