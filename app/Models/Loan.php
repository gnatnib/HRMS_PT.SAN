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
        'principal_amount',
        'monthly_installment',
        'total_installments',
        'paid_installments',
        'remaining_amount',
        'purpose',
        'status',
        'approved_by',
        'approved_at',
        'start_deduction_date',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'monthly_installment' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'total_installments' => 'integer',
        'paid_installments' => 'integer',
        'approved_at' => 'datetime',
        'start_deduction_date' => 'date',
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
        if ($this->total_installments > 0) {
            return $this->principal_amount / $this->total_installments;
        }
        return 0;
    }
}
