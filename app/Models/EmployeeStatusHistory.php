<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'from_status',
        'to_status',
        'reason',
        'notes',
        'changed_by',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
