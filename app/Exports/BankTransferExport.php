<?php

namespace App\Exports;

use App\Models\Payslip;
use App\Models\PayrollPeriod;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * BankTransferExport
 *
 * Export CSV/Excel untuk transfer gaji karyawan via bank.
 * Format kompatibel dengan KlikBCA Bisnis (Bank Transfer Batch).
 *
 * Format KlikBCA:
 * - No Rekening Penerima (10 digit)
 * - Nama Penerima
 * - Jumlah (tanpa separator)
 * - Berita/Keterangan
 */
class BankTransferExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected PayrollPeriod $period;
    protected string $bankFormat;

    /** @var array Format bank yang didukung */
    protected array $supportedBanks = ['BCA', 'MANDIRI', 'BRI', 'BNI'];

    /**
     * Constructor.
     *
     * @param PayrollPeriod $period Periode payroll
     * @param string $bankFormat Format bank (BCA, MANDIRI, dll)
     */
    public function __construct(PayrollPeriod $period, string $bankFormat = 'BCA')
    {
        $this->period = $period;
        $this->bankFormat = strtoupper($bankFormat);
    }

    /**
     * Mendapatkan koleksi data untuk export.
     */
    public function collection()
    {
        return Payslip::with('employee')
            ->where('payroll_period_id', $this->period->id)
            ->where('net_salary', '>', 0)
            ->orderBy('employee_id')
            ->get();
    }

    /**
     * Mendefinisikan header kolom.
     */
    public function headings(): array
    {
        return match ($this->bankFormat) {
            'BCA' => $this->getBcaHeadings(),
            'MANDIRI' => $this->getMandiriHeadings(),
            default => $this->getGenericHeadings(),
        };
    }

    /**
     * Header untuk format KlikBCA.
     */
    protected function getBcaHeadings(): array
    {
        return [
            'No Rekening Penerima',
            'Nama Penerima',
            'Jumlah',
            'Berita',
            'Email',
        ];
    }

    /**
     * Header untuk format Mandiri.
     */
    protected function getMandiriHeadings(): array
    {
        return [
            'Nomor Rekening',
            'Nama Penerima',
            'Nominal',
            'Keterangan',
        ];
    }

    /**
     * Header generic.
     */
    protected function getGenericHeadings(): array
    {
        return [
            'NIK',
            'Nama Karyawan',
            'Bank',
            'No Rekening',
            'Nama Rekening',
            'Jumlah Transfer',
            'Keterangan',
        ];
    }

    /**
     * Mapping data untuk setiap baris.
     *
     * @param Payslip $payslip
     */
    public function map($payslip): array
    {
        return match ($this->bankFormat) {
            'BCA' => $this->mapBca($payslip),
            'MANDIRI' => $this->mapMandiri($payslip),
            default => $this->mapGeneric($payslip),
        };
    }

    /**
     * Mapping untuk format KlikBCA.
     */
    protected function mapBca(Payslip $payslip): array
    {
        $employee = $payslip->employee;
        $periodName = Carbon::parse($this->period->start_date)->format('M Y');

        return [
            // No Rekening (10 digit BCA, atau placeholder jika belum ada)
            $payslip->bank_account ?? $this->generatePlaceholderAccount($employee->id),
            // Nama Penerima (uppercase, max 35 karakter)
            strtoupper(substr($employee->full_name, 0, 35)),
            // Jumlah (integer, tanpa pemisah ribuan)
            (int) $payslip->net_salary,
            // Berita (max 40 karakter)
            'GAJI ' . strtoupper($periodName),
            // Email karyawan (opsional)
            $employee->user?->email ?? '',
        ];
    }

    /**
     * Mapping untuk format Mandiri.
     */
    protected function mapMandiri(Payslip $payslip): array
    {
        $employee = $payslip->employee;
        $periodName = Carbon::parse($this->period->start_date)->format('M Y');

        return [
            $payslip->bank_account ?? $this->generatePlaceholderAccount($employee->id),
            strtoupper($employee->full_name),
            (int) $payslip->net_salary,
            'GAJI ' . strtoupper($periodName),
        ];
    }

    /**
     * Mapping generic.
     */
    protected function mapGeneric(Payslip $payslip): array
    {
        $employee = $payslip->employee;
        $periodName = Carbon::parse($this->period->start_date)->format('M Y');

        return [
            $employee->id,
            $employee->full_name,
            $payslip->bank_name ?? 'BCA',
            $payslip->bank_account ?? '-',
            strtoupper($employee->full_name),
            (int) $payslip->net_salary,
            'GAJI ' . strtoupper($periodName),
        ];
    }

    /**
     * Generate placeholder account number untuk testing.
     */
    protected function generatePlaceholderAccount(int $employeeId): string
    {
        // Format: 123XXXYYY0 (10 digit)
        return str_pad($employeeId, 10, '0', STR_PAD_LEFT);
    }

    /**
     * Styling untuk Excel.
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            // Header row bold
            1 => ['font' => ['bold' => true]],
        ];
    }

    /**
     * Mendapatkan nama file untuk download.
     */
    public function getFileName(): string
    {
        $periodName = Carbon::parse($this->period->start_date)->format('Y-m');
        $bank = strtolower($this->bankFormat);

        return "transfer_{$bank}_{$periodName}.csv";
    }

    /**
     * Mendapatkan ringkasan transfer untuk validasi.
     */
    public function getSummary(): array
    {
        $payslips = $this->collection();

        return [
            'period' => Carbon::parse($this->period->start_date)->format('F Y'),
            'bank_format' => $this->bankFormat,
            'total_employees' => $payslips->count(),
            'total_amount' => $payslips->sum('net_salary'),
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }
}
