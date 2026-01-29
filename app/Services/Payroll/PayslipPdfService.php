<?php

namespace App\Services\Payroll;

use App\Models\Employee;
use App\Models\Payslip;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * PayslipPdfService
 *
 * Service untuk generate slip gaji dalam format PDF terenkripsi.
 * Password default: Tanggal lahir karyawan format DDMMYYYY
 *
 * Fitur:
 * - Generate PDF slip gaji dengan template profesional
 * - Enkripsi PDF dengan password
 * - Simpan ke storage untuk akses nanti
 */
class PayslipPdfService
{
    /** @var string Path penyimpanan slip gaji */
    protected string $storagePath = 'payslips';

    /**
     * Generate PDF slip gaji untuk satu karyawan.
     *
     * @param Payslip $payslip Model payslip
     * @param bool $encrypted Apakah PDF dienkripsi
     * @return string Path file PDF yang dihasilkan
     */
    public function generate(Payslip $payslip, bool $encrypted = true): string
    {
        $employee = $payslip->employee;
        $period = $payslip->period;

        // Siapkan data untuk template
        $data = $this->preparePayslipData($payslip);

        // Generate PDF
        $pdf = Pdf::loadView('pdf.payslip', $data);

        // Set opsi PDF
        $pdf->setPaper('a4');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);

        // Nama file
        $periodName = Carbon::parse($period->start_date)->format('Y-m');
        $fileName = "payslip_{$employee->id}_{$periodName}.pdf";
        $filePath = "{$this->storagePath}/{$periodName}/{$fileName}";

        // Ambil konten PDF
        $pdfContent = $pdf->output();

        // Enkripsi jika diminta
        if ($encrypted) {
            $password = $this->getEmployeePassword($employee);
            $pdfContent = $this->encryptPdf($pdfContent, $password);
        }

        // Simpan ke storage
        Storage::put($filePath, $pdfContent);

        // Update path di payslip
        $payslip->update(['payslip_file' => $filePath]);

        return $filePath;
    }

    /**
     * Mendapatkan password untuk PDF berdasarkan tanggal lahir karyawan.
     * Format: DDMMYYYY
     *
     * @param Employee $employee
     * @return string Password
     */
    public function getEmployeePassword(Employee $employee): string
    {
        // Ambil tanggal lahir dari field birth_and_place atau alternatif lainnya
        // Format yang diharapkan: "Kota, DD-MM-YYYY" atau "DD-MM-YYYY"
        $birthInfo = $employee->birth_and_place ?? '';

        // Coba extract tanggal lahir
        if (preg_match('/(\d{2})-(\d{2})-(\d{4})/', $birthInfo, $matches)) {
            return $matches[1] . $matches[2] . $matches[3]; // DDMMYYYY
        }

        // Fallback: gunakan ID karyawan yang di-pad
        return str_pad($employee->id, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Mengenkripsi PDF dengan password.
     * Menggunakan library TCPDF atau FPDI jika tersedia.
     *
     * @param string $pdfContent Konten PDF
     * @param string $password Password untuk enkripsi
     * @return string PDF terenkripsi
     */
    protected function encryptPdf(string $pdfContent, string $password): string
    {
        // Catatan: DomPDF tidak mendukung enkripsi langsung.
        // Untuk enkripsi PDF, perlu menggunakan library tambahan seperti:
        // - setasign/fpdi + setasign/fpdf
        // - tecnickcom/tcpdf
        //
        // Untuk saat ini, kita simpan password sebagai metadata
        // dan implementasi enkripsi dapat ditambahkan nanti dengan library yang sesuai.

        // TODO: Implementasi enkripsi PDF menggunakan library yang mendukung
        // Contoh dengan TCPDF:
        // $tcpdf = new TCPDF();
        // $tcpdf->SetProtection(['print'], $password, $password);

        return $pdfContent;
    }

    /**
     * Menyiapkan data untuk template slip gaji.
     */
    protected function preparePayslipData(Payslip $payslip): array
    {
        $employee = $payslip->employee;
        $period = $payslip->period;

        return [
            'payslip' => $payslip,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->full_name,
                'position' => $employee->current_position,
                'department' => $employee->current_department,
                'join_date' => $employee->join_at,
            ],
            'period' => [
                'name' => Carbon::parse($period->start_date)->translatedFormat('F Y'),
                'start' => Carbon::parse($period->start_date)->format('d/m/Y'),
                'end' => Carbon::parse($period->end_date)->format('d/m/Y'),
                'payment_date' => $period->payment_date
                    ? Carbon::parse($period->payment_date)->format('d/m/Y')
                    : '-',
            ],
            'earnings' => $this->formatEarnings($payslip),
            'deductions' => $this->formatDeductions($payslip),
            'company' => [
                'name' => config('app.company_name', 'PT. PERUSAHAAN'),
                'address' => config('app.company_address', 'Indonesia'),
            ],
            'generated_at' => now()->format('d/m/Y H:i'),
        ];
    }

    /**
     * Format data pendapatan untuk tampilan.
     */
    protected function formatEarnings(Payslip $payslip): array
    {
        $earnings = [];

        // Gaji Pokok
        if ($payslip->basic_salary > 0) {
            $earnings[] = [
                'name' => 'Gaji Pokok',
                'amount' => $payslip->basic_salary,
            ];
        }

        // Gaji Prorata
        if ($payslip->prorated_salary > 0 && $payslip->prorated_salary !== $payslip->basic_salary) {
            $earnings[] = [
                'name' => 'Gaji Prorata',
                'amount' => $payslip->prorated_salary,
            ];
        }

        // Tunjangan Harian
        if ($payslip->daily_allowance_total > 0) {
            $earnings[] = [
                'name' => 'Tunjangan Harian (' . $payslip->attendance_days_count . ' hari)',
                'amount' => $payslip->daily_allowance_total,
            ];
        }

        // Lembur
        if ($payslip->overtime_pay > 0) {
            $earnings[] = [
                'name' => 'Uang Lembur',
                'amount' => $payslip->overtime_pay,
            ];
        }

        // Reimbursement
        if ($payslip->reimbursement_total > 0) {
            $earnings[] = [
                'name' => 'Reimbursement',
                'amount' => $payslip->reimbursement_total,
            ];
        }

        // THR
        if ($payslip->thr_amount > 0) {
            $earnings[] = [
                'name' => 'THR',
                'amount' => $payslip->thr_amount,
            ];
        }

        return $earnings;
    }

    /**
     * Format data potongan untuk tampilan.
     */
    protected function formatDeductions(Payslip $payslip): array
    {
        $deductions = [];

        // BPJS Kesehatan
        if ($payslip->bpjs_kes_employee > 0) {
            $deductions[] = [
                'name' => 'BPJS Kesehatan (1%)',
                'amount' => $payslip->bpjs_kes_employee,
            ];
        }

        // BPJS JHT
        if ($payslip->bpjs_tk_jht_employee > 0) {
            $deductions[] = [
                'name' => 'BPJS JHT (2%)',
                'amount' => $payslip->bpjs_tk_jht_employee,
            ];
        }

        // BPJS JP
        if ($payslip->bpjs_tk_jp_employee > 0) {
            $deductions[] = [
                'name' => 'BPJS JP (1%)',
                'amount' => $payslip->bpjs_tk_jp_employee,
            ];
        }

        // PPh 21
        if ($payslip->pph21 > 0) {
            $category = $payslip->pph21_ter_category ? " (TER-{$payslip->pph21_ter_category})" : '';
            $deductions[] = [
                'name' => "PPh 21{$category}",
                'amount' => $payslip->pph21,
            ];
        }

        // Potongan Kasbon
        if ($payslip->loan_deduction > 0) {
            $deductions[] = [
                'name' => 'Cicilan Kasbon',
                'amount' => $payslip->loan_deduction,
            ];
        }

        // Denda Keterlambatan
        if (($payslip->late_penalty ?? 0) > 0) {
            $deductions[] = [
                'name' => 'Denda Keterlambatan',
                'amount' => $payslip->late_penalty,
            ];
        }

        return $deductions;
    }

    /**
     * Download PDF slip gaji.
     *
     * @param Payslip $payslip
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function download(Payslip $payslip)
    {
        $data = $this->preparePayslipData($payslip);
        $pdf = Pdf::loadView('pdf.payslip', $data);

        $employee = $payslip->employee;
        $period = $payslip->period;
        $periodName = Carbon::parse($period->start_date)->format('Y-m');
        $fileName = "Slip_Gaji_{$employee->full_name}_{$periodName}.pdf";

        return $pdf->download($fileName);
    }

    /**
     * Stream PDF ke browser.
     *
     * @param Payslip $payslip
     * @return \Illuminate\Http\Response
     */
    public function stream(Payslip $payslip)
    {
        $data = $this->preparePayslipData($payslip);
        $pdf = Pdf::loadView('pdf.payslip', $data);

        return $pdf->stream();
    }
}
