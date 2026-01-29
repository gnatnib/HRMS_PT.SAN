<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model PayrollPeriod
 *
 * Menyimpan data periode payroll (bulanan).
 */
class PayrollPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'payment_date',
        'status',
        'total_gross',
        'total_net',
        'total_bpjs',
        'total_pph21',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'date',
        'approved_at' => 'datetime',
        'total_gross' => 'decimal:2',
        'total_net' => 'decimal:2',
        'total_bpjs' => 'decimal:2',
        'total_pph21' => 'decimal:2',
    ];

    // Relasi ke payslips
    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    // Relasi ke user yang approve
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
