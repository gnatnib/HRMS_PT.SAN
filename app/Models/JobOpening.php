<?php

namespace App\Models;

use App\Traits\CreatedUpdatedDeletedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobOpening extends Model
{
    use CreatedUpdatedDeletedBy, HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'department',
        'description',
        'requirements',
        'urgency',
        'status',
        'vacancy_count',
        'location',
        'employment_type',
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function getApplicantsCountAttribute(): int
    {
        return $this->candidates()->count();
    }
}
