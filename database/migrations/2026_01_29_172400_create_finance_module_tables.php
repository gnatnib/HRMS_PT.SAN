<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration untuk tabel reimbursement_types dan cash_advances.
 * Digunakan untuk fitur Finance Module dengan Setting Reimbursement dan Cash Advance.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel setting jenis reimbursement
        Schema::create('reimbursement_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama reimbursement (Klaim Transportasi, Medical, dll)
            $table->string('code')->unique(); // Kode unik
            $table->decimal('limit_amount', 15, 2)->nullable(); // Limit nominal
            $table->boolean('is_unlimited')->default(false); // True jika unlimited
            $table->string('expired_type')->default('date'); // 'date' atau 'months'
            $table->date('expired_at')->nullable(); // Tanggal expired
            $table->integer('expired_months')->nullable(); // Validity period dalam bulan
            $table->date('effective_date'); // Tanggal berlaku
            $table->text('description')->nullable();
            $table->boolean('requires_receipt')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabel kebijakan cash advance (perjalanan dinas)
        Schema::create('cash_advance_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama policy (Perjalanan Dinas, Training, dll)
            $table->string('code')->unique();
            $table->decimal('max_amount', 15, 2)->nullable(); // Maksimal uang muka
            $table->integer('settlement_days')->default(7); // Deadline settlement (hari)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel cash advance requests
        Schema::create('cash_advances', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique(); // CA2026XXXXXX
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('policy_id')->constrained('cash_advance_policies');

            $table->date('request_date');
            $table->date('date_of_use'); // Tanggal penggunaan
            $table->decimal('amount', 15, 2); // Jumlah uang muka
            $table->text('purpose'); // Tujuan/keperluan (Dinas Bandung, dll)

            // Approval workflow
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'need_settlement', // Sudah approve, belum settlement
                'settled', // Sudah settlement
                'cancelled'
            ])->default('pending');

            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Settlement
            $table->decimal('settlement_amount', 15, 2)->nullable(); // Jumlah settlement
            $table->date('settlement_date')->nullable();
            $table->text('settlement_notes')->nullable();
            $table->json('settlement_receipts')->nullable(); // Upload bukti

            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
            $table->index(['request_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_advances');
        Schema::dropIfExists('cash_advance_policies');
        Schema::dropIfExists('reimbursement_types');
    }
};
