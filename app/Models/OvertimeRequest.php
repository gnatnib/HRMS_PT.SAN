<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'start_time',
        'end_time',
        'hours',
        'multiplier',
        'amount',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'hours' => 'decimal:2',
        'multiplier' => 'decimal:2',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Calculate overtime based on Depnaker rules
    public static function calculateMultiplier(float $hours, bool $isHoliday = false): array
    {
        $multipliers = [];
        $remainingHours = $hours;

        if ($isHoliday) {
            // Holiday: first 8 hours = 2x, next hours = 3x and 4x
            $first8 = min($remainingHours, 8);
            if ($first8 > 0) {
                $multipliers[] = ['hours' => $first8, 'multiplier' => 2.0];
                $remainingHours -= $first8;
            }
            if ($remainingHours > 0) {
                $next1 = min($remainingHours, 1);
                $multipliers[] = ['hours' => $next1, 'multiplier' => 3.0];
                $remainingHours -= $next1;
            }
            if ($remainingHours > 0) {
                $multipliers[] = ['hours' => $remainingHours, 'multiplier' => 4.0];
            }
        } else {
            // Work day: first hour = 1.5x, next hours = 2x
            $first1 = min($remainingHours, 1);
            if ($first1 > 0) {
                $multipliers[] = ['hours' => $first1, 'multiplier' => 1.5];
                $remainingHours -= $first1;
            }
            if ($remainingHours > 0) {
                $multipliers[] = ['hours' => $remainingHours, 'multiplier' => 2.0];
            }
        }

        return $multipliers;
    }
}
