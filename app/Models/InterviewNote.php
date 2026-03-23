<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id',
        'stage',
        'interviewer',
        'interview_date',
        'notes',
        'rating',
        'result',
        'created_by',
    ];

    protected $casts = [
        'interview_date' => 'datetime',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
