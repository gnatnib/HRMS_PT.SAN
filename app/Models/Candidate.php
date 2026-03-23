<?php

namespace App\Models;

use App\Traits\CreatedUpdatedDeletedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Candidate extends Model
{
    use CreatedUpdatedDeletedBy, HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'position',
        'source',
        'stage',
        'applied_date',
        'notes',
        'resume_path',
        'rejection_reason',
        'job_opening_id',
        'converted_employee_id',
    ];

    protected $casts = [
        'applied_date' => 'date',
    ];

    public const STAGES = ['applied', 'screening', 'interview', 'offering', 'hired', 'rejected'];

    public function jobOpening(): BelongsTo
    {
        return $this->belongsTo(JobOpening::class);
    }

    public function convertedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'converted_employee_id');
    }

    public function interviewNotes(): HasMany
    {
        return $this->hasMany(InterviewNote::class);
    }
}
