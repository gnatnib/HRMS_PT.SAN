<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Payslip
 *
 * Menyimpan data slip gaji karyawan per periode payroll.
 * Mencakup detail BPJS, PPh 21, dan komponen gaji lainnya.
 */
class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_period_id',
        'employee_id',
        'basic_salary',
        'total_earnings',
        'total_deductions',
        'overtime_pay',

        // BPJS Ketenagakerjaan - Detail
        'bpjs_tk_jht_company',
        'bpjs_tk_jht_employee',
        'bpjs_tk_jkk',
        'bpjs_tk_jkm',
        'bpjs_tk_jp_company',
        'bpjs_tk_jp_employee',

        // BPJS Kesehatan - Detail
        'bpjs_kes_company',
        'bpjs_kes_employee',

        // Legacy BPJS columns
        'bpjs_kesehatan',
        'bpjs_jht',
        'bpjs_jp',
        'bpjs_jkk',
        'bpjs_jkm',

        // PPh 21
        'pph21',
        'pph21_ter_category',
        'pph21_ptkp_code',

        // Data Kehadiran & Prorata
        'attendance_days_count',
        'prorated_salary',
        'daily_allowance_total',

        // Potongan Lainnya
        'loan_deduction',
        'late_penalty',

        // Tambahan
        'reimbursement_total',
        'thr_amount',

        // Final
        'net_salary',

        // Metadata
        'status',
        'bank_account',
        'bank_name',
        'payslip_file',
        'paid_at',
        'created_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'bpjs_tk_jht_company' => 'decimal:2',
        'bpjs_tk_jht_employee' => 'decimal:2',
        'bpjs_tk_jkk' => 'decimal:2',
        'bpjs_tk_jkm' => 'decimal:2',
        'bpjs_tk_jp_company' => 'decimal:2',
        'bpjs_tk_jp_employee' => 'decimal:2',
        'bpjs_kes_company' => 'decimal:2',
        'bpjs_kes_employee' => 'decimal:2',
        'pph21' => 'decimal:2',
        'prorated_salary' => 'decimal:2',
        'daily_allowance_total' => 'decimal:2',
        'loan_deduction' => 'decimal:2',
        'late_penalty' => 'decimal:2',
        'reimbursement_total' => 'decimal:2',
        'thr_amount' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'attendance_days_count' => 'integer',
        'paid_at' => 'datetime',
    ];

    // Relasi ke periode payroll
    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    // Relasi ke karyawan
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    // Relasi ke item detail slip gaji
    public function items(): HasMany
    {
        return $this->hasMany(PayslipItem::class);
    }

    // Relasi ke pembayaran pinjaman
    public function loanPayments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }
}
