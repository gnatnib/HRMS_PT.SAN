<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reference_number',
        'principal_amount',
        'interest_rate',
        'installment_months',
        'monthly_deduction',
        'start_date',
        'end_date',
        'purpose',
        'loan_type',
        'interest_type',
        'status',
        'approved_by',
        'approved_at',
        'total_paid',
        'remaining_balance',
        'installments_paid',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'monthly_deduction' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'installment_months' => 'integer',
        'installments_paid' => 'integer',
        'approved_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }

    public function calculateInstallment(): float
    {
        if ($this->installment_months > 0) {
            return $this->principal_amount / $this->installment_months;
        }
        return 0;
    }
}
