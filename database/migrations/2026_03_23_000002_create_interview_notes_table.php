<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained()->cascadeOnDelete();
            $table->string('stage', 30);
            $table->string('interviewer')->nullable();
            $table->dateTime('interview_date')->nullable();
            $table->text('notes')->nullable();
            $table->tinyInteger('rating')->nullable(); // 1-5
            $table->enum('result', ['pass', 'fail', 'pending'])->default('pending');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_notes');
    }
};
