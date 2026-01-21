<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class DocumentController extends Controller
{
    public function index()
    {
        // Get documents from storage
        $documentsPath = storage_path('app/public/documents');
        $documents = [];

        // Demo documents
        $documents = [
            ['id' => 1, 'employee' => 'Ahmad Fauzi', 'type' => 'contract', 'name' => 'PKWTT - Ahmad Fauzi', 'date' => '2024-01-15', 'status' => 'active'],
            ['id' => 2, 'employee' => 'Siti Rahayu', 'type' => 'nda', 'name' => 'NDA Agreement', 'date' => '2024-01-10', 'status' => 'active'],
            ['id' => 3, 'employee' => 'Budi Santoso', 'type' => 'warning', 'name' => 'SP1 - Keterlambatan', 'date' => '2024-01-05', 'status' => 'active'],
        ];

        $templates = [
            ['id' => 'skk', 'name' => 'Surat Keterangan Kerja', 'icon' => '📋'],
            ['id' => 'pkwt', 'name' => 'Kontrak PKWT', 'icon' => '📝'],
            ['id' => 'pkwtt', 'name' => 'Kontrak PKWTT', 'icon' => '📝'],
            ['id' => 'sp1', 'name' => 'Surat Peringatan 1', 'icon' => '⚠️'],
            ['id' => 'sp2', 'name' => 'Surat Peringatan 2', 'icon' => '⚠️'],
            ['id' => 'sp3', 'name' => 'Surat Peringatan 3', 'icon' => '🚫'],
        ];

        $employees = Employee::where('is_active', true)
            ->select('id', 'first_name', 'last_name')
            ->get();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'templates' => $templates,
            'employees' => $employees,
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'template' => 'required|string|in:skk,pkwt,pkwtt,sp1,sp2,sp3',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::with(['contract.department', 'contract.position'])->findOrFail($validated['employee_id']);

        $data = [
            'employee_name' => $employee->first_name . ' ' . $employee->last_name,
            'employee_nik' => $employee->national_number ?? $employee->id,
            'position' => $employee->contract?->position?->name ?? '-',
            'department' => $employee->contract?->department?->name ?? '-',
            'company_name' => 'PT Sinar Asta Nusantara',
            'date' => now()->format('d F Y'),
            'date_indonesian' => now()->translatedFormat('d F Y'),
        ];

        $templateName = $validated['template'];
        $html = $this->getTemplateHtml($templateName, $data);

        // For now, return HTML (PDF generation needs DomPDF package)
        return response($html)
            ->header('Content-Type', 'text/html');
    }

    private function getTemplateHtml(string $template, array $data): string
    {
        $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 18px; font-weight: bold; text-decoration: underline; }
            .content { margin: 20px 0; }
            .signature { margin-top: 60px; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 60px; }
        </style></head><body>';

        switch ($template) {
            case 'skk':
                $html .= '<div class="header">
                    <h2>' . $data['company_name'] . '</h2>
                    <div class="title">SURAT KETERANGAN KERJA</div>
                    <p>No: SKK/' . now()->format('Ymd') . '/' . $data['employee_nik'] . '</p>
                </div>
                <div class="content">
                    <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
                    <table>
                        <tr><td width="150">Nama</td><td>: ' . $data['employee_name'] . '</td></tr>
                        <tr><td>NIK</td><td>: ' . $data['employee_nik'] . '</td></tr>
                        <tr><td>Jabatan</td><td>: ' . $data['position'] . '</td></tr>
                        <tr><td>Departemen</td><td>: ' . $data['department'] . '</td></tr>
                    </table>
                    <p>Adalah benar karyawan ' . $data['company_name'] . ' yang masih aktif bekerja sampai dengan surat ini dibuat.</p>
                    <p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                </div>
                <div class="signature">
                    <p>Jakarta, ' . $data['date'] . '</p>
                    <p>HRD Manager</p>
                    <div class="signature-line"></div>
                </div>';
                break;

            case 'sp1':
            case 'sp2':
            case 'sp3':
                $level = substr($template, 2);
                $html .= '<div class="header">
                    <h2>' . $data['company_name'] . '</h2>
                    <div class="title">SURAT PERINGATAN ' . $level . ' (SP' . $level . ')</div>
                    <p>No: SP' . $level . '/' . now()->format('Ymd') . '/' . $data['employee_nik'] . '</p>
                </div>
                <div class="content">
                    <p>Kepada Yth,<br><strong>' . $data['employee_name'] . '</strong><br>' . $data['position'] . '</p>
                    <p>Dengan ini kami sampaikan Surat Peringatan ' . $level . ' (SP' . $level . ') kepada Saudara/i atas pelanggaran:</p>
                    <p>[ISI PELANGGARAN]</p>
                    <p>Dengan adanya surat peringatan ini, diharapkan Saudara/i dapat memperbaiki kinerja dan perilaku.</p>
                </div>
                <div class="signature">
                    <p>Jakarta, ' . $data['date'] . '</p>
                    <p>HRD Manager</p>
                    <div class="signature-line"></div>
                </div>';
                break;

            default:
                $html .= '<p>Template tidak ditemukan.</p>';
        }

        $html .= '</body></html>';
        return $html;
    }

    public function upload(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|string|in:contract,nda,warning,certificate,other',
            'name' => 'required|string|max:200',
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('file')->store('documents/' . $validated['employee_id'], 'public');

        return redirect()->back()->with('success', 'Dokumen berhasil diupload!');
    }
}
