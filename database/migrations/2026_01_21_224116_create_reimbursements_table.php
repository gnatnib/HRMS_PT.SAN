<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates reimbursements/expense claims table with approval workflow.
     */
    public function up(): void
    {
        // Expense categories
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Transport", "Meals", "Medical"
            $table->string('code')->unique();
            $table->decimal('budget_limit', 15, 2)->nullable(); // per month limit
            $table->boolean('requires_receipt')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Reimbursement requests
        Schema::create('reimbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('expense_category_id')->constrained();

            $table->string('title');
            $table->text('description');
            $table->date('expense_date');
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('IDR');

            // Receipt/proof uploads (JSON array of file paths)
            $table->json('receipt_files')->nullable();

            // Approval workflow
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'paid'])
                ->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Payment tracking
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();

            // Link to payroll if deducted there
            $table->foreignId('payslip_id')->nullable()->constrained();

            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
            $table->index(['expense_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reimbursements');
        Schema::dropIfExists('expense_categories');
    }
};
