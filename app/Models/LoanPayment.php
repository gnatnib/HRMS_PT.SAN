<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model LoanPayment
 *
 * Menyimpan riwayat pembayaran cicilan pinjaman yang terhubung ke payslip.
 */
class LoanPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'payslip_id',
        'installment_number',
        'amount',
        'payment_date',
        'remaining_balance',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
        'payment_date' => 'date',
        'installment_number' => 'integer',
    ];

    // Relasi ke pinjaman
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    // Relasi ke payslip
    public function payslip(): BelongsTo
    {
        return $this->belongsTo(Payslip::class);
    }
}
