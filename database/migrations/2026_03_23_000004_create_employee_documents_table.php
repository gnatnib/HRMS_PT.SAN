<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 50); // KTP, NPWP, BPJS, Ijazah, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size')->nullable(); // bytes
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('uploaded_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
