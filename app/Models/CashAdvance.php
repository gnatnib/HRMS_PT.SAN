<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model untuk cash advance (uang muka perjalanan dinas).
 * Mencakup pengajuan, approval, dan settlement workflow.
 */
class CashAdvance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_id',
        'employee_id',
        'policy_id',
        'request_date',
        'date_of_use',
        'amount',
        'purpose',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'settlement_amount',
        'settlement_date',
        'settlement_notes',
        'settlement_receipts',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'date_of_use' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'settlement_amount' => 'decimal:2',
        'settlement_date' => 'date',
        'settlement_receipts' => 'array',
    ];

    /**
     * Boot model untuk generate request_id otomatis.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->request_id)) {
                $model->request_id = self::generateRequestId();
            }
            if (empty($model->request_date)) {
                $model->request_date = now();
            }
        });
    }

    /**
     * Generate request ID dengan format CA + tahun + bulan + sequence.
     */
    public static function generateRequestId(): string
    {
        $prefix = 'CA' . date('Ym');
        $lastRecord = self::where('request_id', 'like', $prefix . '%')
            ->orderBy('request_id', 'desc')
            ->first();

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord->request_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Relasi ke employee.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Relasi ke policy.
     */
    public function policy(): BelongsTo
    {
        return $this->belongsTo(CashAdvancePolicy::class, 'policy_id');
    }

    /**
     * Relasi ke user yang approve.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope untuk filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter by policy.
     */
    public function scopeByPolicy($query, int $policyId)
    {
        return $query->where('policy_id', $policyId);
    }

    /**
     * Check apakah perlu settlement.
     */
    public function needsSettlement(): bool
    {
        return $this->status === 'need_settlement';
    }

    /**
     * Check apakah sudah settled.
     */
    public function isSettled(): bool
    {
        return $this->status === 'settled';
    }

    /**
     * Hitung selisih settlement.
     */
    public function getSettlementDifferenceAttribute(): float
    {
        if (!$this->settlement_amount) {
            return 0;
        }
        return $this->amount - $this->settlement_amount;
    }
}
