<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates employee loans (kasbon) table with automatic salary deduction.
     */
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');

            $table->string('reference_number')->unique();
            $table->decimal('principal_amount', 15, 2); // Original loan amount
            $table->decimal('interest_rate', 5, 2)->default(0); // Annual rate
            $table->integer('installment_months'); // Number of months to repay
            $table->decimal('monthly_deduction', 15, 2); // Amount per payroll

            $table->date('start_date'); // First deduction date
            $table->date('end_date'); // Last deduction date

            $table->text('purpose')->nullable();

            // Approval
            $table->enum('status', ['pending', 'approved', 'active', 'completed', 'cancelled'])
                ->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();

            // Tracking
            $table->decimal('total_paid', 15, 2)->default(0);
            $table->decimal('remaining_balance', 15, 2);
            $table->integer('installments_paid')->default(0);

            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
        });

        // Loan payment history (linked to payslips)
        Schema::create('loan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->onDelete('cascade');
            $table->foreignId('payslip_id')->nullable()->constrained();
            $table->integer('installment_number');
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->decimal('remaining_balance', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_payments');
        Schema::dropIfExists('loans');
    }
};
