<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model SalaryComponent
 *
 * Definisi komponen gaji (tunjangan, potongan).
 */
class SalaryComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'calculation_type',
        'default_amount',
        'percentage_base',
        'is_taxable',
        'is_bpjs_applicable',
        'is_daily_allowance',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'default_amount' => 'decimal:2',
        'percentage_base' => 'decimal:2',
        'is_taxable' => 'boolean',
        'is_bpjs_applicable' => 'boolean',
        'is_daily_allowance' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
