<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model untuk jenis reimbursement (setting).
 * Digunakan untuk mengatur jenis-jenis reimbursement yang berlaku di perusahaan.
 */
class ReimbursementType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'limit_amount',
        'is_unlimited',
        'expired_type',
        'expired_at',
        'expired_months',
        'effective_date',
        'description',
        'requires_receipt',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'limit_amount' => 'decimal:2',
        'is_unlimited' => 'boolean',
        'expired_at' => 'date',
        'effective_date' => 'date',
        'requires_receipt' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Scope untuk filter aktif saja.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Accessor untuk formatted limit.
     */
    public function getFormattedLimitAttribute(): string
    {
        if ($this->is_unlimited) {
            return 'UNLIMITED';
        }
        return 'Rp ' . number_format((float) $this->limit_amount, 0, ',', '.');
    }

    /**
     * Accessor untuk formatted expired.
     */
    public function getFormattedExpiredAttribute(): string
    {
        if ($this->expired_type === 'months' && $this->expired_months) {
            return $this->expired_months . ' month(s)';
        }
        return $this->expired_at instanceof \Carbon\Carbon
            ? $this->expired_at->format('d F')
            : '-';
    }

    /**
     * Relasi ke reimbursements yang menggunakan tipe ini.
     */
    public function reimbursements()
    {
        return $this->hasMany(Reimbursement::class, 'reimbursement_type_id');
    }
}
