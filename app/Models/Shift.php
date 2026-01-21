<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'start_time',
        'end_time',
        'break_duration',
        'late_tolerance',
        'early_leave_tolerance',
        'is_active',
        'color',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'break_duration' => 'integer',
        'late_tolerance' => 'integer',
        'early_leave_tolerance' => 'integer',
        'is_active' => 'boolean',
    ];

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_shift')
            ->withPivot('date', 'notes')
            ->withTimestamps();
    }
}
