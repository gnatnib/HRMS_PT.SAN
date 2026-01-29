<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model untuk kebijakan cash advance.
 * Digunakan untuk mengatur policy perjalanan dinas dan batas uang muka.
 */
class CashAdvancePolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'max_amount',
        'settlement_days',
        'description',
        'is_active',
    ];

    protected $casts = [
        'max_amount' => 'decimal:2',
        'settlement_days' => 'integer',
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
     * Relasi ke cash advances yang menggunakan policy ini.
     */
    public function cashAdvances()
    {
        return $this->hasMany(CashAdvance::class, 'policy_id');
    }
}
