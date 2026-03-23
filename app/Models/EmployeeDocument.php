<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'type',
        'file_path',
        'file_name',
        'file_size',
        'expiry_date',
        'notes',
        'uploaded_by',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public const TYPES = [
        'KTP',
        'KK',
        'NPWP',
        'BPJS Kesehatan',
        'BPJS Ketenagakerjaan',
        'Ijazah',
        'Transkrip Nilai',
        'Sertifikat',
        'Kontrak Kerja',
        'Surat Lamaran',
        'CV',
        'Lainnya',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
