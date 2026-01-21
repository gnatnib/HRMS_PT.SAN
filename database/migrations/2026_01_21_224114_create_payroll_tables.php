<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates comprehensive payroll tables including BPJS and PPh 21 support.
     */
    public function up(): void
    {
        // Salary components (definitions)
        Schema::create('salary_components', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Basic Salary", "Transport Allowance"
            $table->string('code')->unique(); // e.g., "BASIC", "TRANS"
            $table->enum('type', ['earning', 'deduction']);
            $table->enum('calculation_type', ['fixed', 'percentage', 'formula']);
            $table->decimal('default_amount', 15, 2)->nullable();
            $table->decimal('percentage_base', 5, 2)->nullable(); // % of basic salary
            $table->boolean('is_taxable')->default(true);
            $table->boolean('is_bpjs_applicable')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Employee salaries (individual salary setup)
        Schema::create('employee_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->decimal('basic_salary', 15, 2);
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'effective_date']);
        });

        // Employee salary components (variable pay setup per employee)
        Schema::create('employee_salary_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_salary_id')->constrained()->onDelete('cascade');
            $table->foreignId('salary_component_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });

        // Payroll periods
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "January 2024"
            $table->date('start_date');
            $table->date('end_date');
            $table->date('payment_date');
            $table->enum('status', ['draft', 'processing', 'approved', 'paid'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->unique(['start_date', 'end_date']);
        });

        // Payslips
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');

            // Summary amounts
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('total_earnings', 15, 2);
            $table->decimal('total_deductions', 15, 2);
            $table->decimal('overtime_pay', 15, 2)->default(0);

            // BPJS Deductions (Indonesian social security)
            $table->decimal('bpjs_kesehatan', 15, 2)->default(0); // Health
            $table->decimal('bpjs_jht', 15, 2)->default(0); // Old age security
            $table->decimal('bpjs_jp', 15, 2)->default(0); // Pension
            $table->decimal('bpjs_jkk', 15, 2)->default(0); // Work accident
            $table->decimal('bpjs_jkm', 15, 2)->default(0); // Death insurance

            // Tax
            $table->decimal('pph21', 15, 2)->default(0); // Indonesian income tax

            // Loans/advances deducted
            $table->decimal('loan_deduction', 15, 2)->default(0);

            // Final pay
            $table->decimal('net_salary', 15, 2);

            $table->enum('status', ['draft', 'finalized', 'paid'])->default('draft');
            $table->string('bank_account')->nullable();
            $table->string('bank_name')->nullable();

            // Encrypted payslip file path
            $table->string('payslip_file')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->unique(['payroll_period_id', 'employee_id']);
            $table->index(['employee_id', 'status']);
        });

        // Payslip line items (detailed breakdown)
        Schema::create('payslip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payslip_id')->constrained()->onDelete('cascade');
            $table->foreignId('salary_component_id')->nullable()->constrained();
            $table->string('description');
            $table->enum('type', ['earning', 'deduction']);
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslip_items');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('employee_salary_components');
        Schema::dropIfExists('employee_salaries');
        Schema::dropIfExists('salary_components');
    }
};
