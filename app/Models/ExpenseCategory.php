<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    /**
     * Relationship to reimbursements.
     */
    public function reimbursements(): HasMany
    {
        return $this->hasMany(Reimbursement::class, 'expense_category_id');
    }
}
