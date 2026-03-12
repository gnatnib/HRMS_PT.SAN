<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class RecruitmentController extends Controller
{
    public function index()
    {
        // In production, this would be from database
        $candidates = Cache::get('recruitment_candidates', $this->getDefaultCandidates());

        $stats = [
            'applied' => count($candidates['applied'] ?? []),
            'screening' => count($candidates['screening'] ?? []),
            'interview' => count($candidates['interview'] ?? []),
            'offering' => count($candidates['offering'] ?? []),
            'hired' => count($candidates['hired'] ?? []),
        ];

        $positions = [
            ['id' => 1, 'title' => 'Software Engineer', 'department' => 'IT', 'applicants' => 8, 'urgency' => 'high'],
            ['id' => 2, 'title' => 'UI/UX Designer', 'department' => 'Product', 'applicants' => 5, 'urgency' => 'medium'],
            ['id' => 3, 'title' => 'Marketing Lead', 'department' => 'Marketing', 'applicants' => 3, 'urgency' => 'low'],
        ];

        return Inertia::render('Recruitment/Index', [
            'candidates' => $candidates,
            'stats' => $stats,
            'positions' => $positions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|max:100',
            'source' => 'required|string|max:50',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $candidates = Cache::get('recruitment_candidates', $this->getDefaultCandidates());

        $newCandidate = [
            'id' => time(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'position' => $validated['position'],
            'source' => $validated['source'],
            'date' => now()->format('Y-m-d'),
        ];

        $candidates['applied'][] = $newCandidate;
        Cache::put('recruitment_candidates', $candidates, now()->addDays(30));

        return redirect()->back()->with('success', 'Kandidat berhasil ditambahkan!');
    }

    public function moveStage(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer',
            'from_stage' => 'required|string|in:applied,screening,interview,offering,hired',
            'to_stage' => 'required|string|in:applied,screening,interview,offering,hired',
        ]);

        $candidates = Cache::get('recruitment_candidates', $this->getDefaultCandidates());

        // Find and remove from current stage
        $candidate = null;
        foreach ($candidates[$validated['from_stage']] as $key => $c) {
            if ($c['id'] == $validated['candidate_id']) {
                $candidate = $c;
                unset($candidates[$validated['from_stage']][$key]);
                break;
            }
        }

        if ($candidate) {
            // Add to new stage
            $candidates[$validated['to_stage']][] = $candidate;
            $candidates[$validated['from_stage']] = array_values($candidates[$validated['from_stage']]);
            Cache::put('recruitment_candidates', $candidates, now()->addDays(30));
        }

        return redirect()->back()->with('success', 'Kandidat dipindahkan ke ' . $validated['to_stage']);
    }

    public function deleteCandidate(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer',
            'stage' => 'required|string|in:applied,screening,interview,offering,hired',
        ]);

        $candidates = Cache::get('recruitment_candidates', $this->getDefaultCandidates());

        $found = false;
        foreach ($candidates[$validated['stage']] as $key => $c) {
            if ($c['id'] == $validated['candidate_id']) {
                unset($candidates[$validated['stage']][$key]);
                $found = true;
                break;
            }
        }

        if ($found) {
            $candidates[$validated['stage']] = array_values($candidates[$validated['stage']]);
            Cache::put('recruitment_candidates', $candidates, now()->addDays(30));
            return redirect()->back()->with('success', 'Kandidat berhasil dihapus!');
        }

        return redirect()->back()->with('error', 'Kandidat tidak ditemukan.');
    }

    public function exportCandidates()
    {
        $candidates = Cache::get('recruitment_candidates', $this->getDefaultCandidates());
        $stageLabels = [
            'applied' => 'Applied',
            'screening' => 'Screening',
            'interview' => 'Interview',
            'offering' => 'Offering',
            'hired' => 'Hired',
        ];

        // Build rows
        $rows = [];
        $rows[] = ['No', 'Nama Kandidat', 'Posisi', 'Sumber', 'Tanggal Masuk', 'Status / Tahapan'];

        $no = 1;
        foreach ($stageLabels as $stage => $label) {
            foreach ($candidates[$stage] ?? [] as $c) {
                $rows[] = [
                    $no++,
                    $c['name'] ?? '',
                    $c['position'] ?? '',
                    $c['source'] ?? '',
                    $c['date'] ?? '',
                    $label,
                ];
            }
        }

        // Generate CSV with BOM for Excel compatibility
        $filename = 'recruitment_candidates_' . now()->format('Y-m-d') . '.csv';

        $callback = function () use ($rows) {
            $file = fopen('php://output', 'w');
            // Write BOM for UTF-8 Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($file, $row, ';'); // Semicolon delimiter for better Excel compatibility
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function getDefaultCandidates(): array
    {
        return [
            'applied' => [
                ['id' => 1, 'name' => 'John Doe', 'position' => 'Software Engineer', 'source' => 'LinkedIn', 'date' => '2024-01-18'],
                ['id' => 2, 'name' => 'Jane Smith', 'position' => 'UI/UX Designer', 'source' => 'Jobstreet', 'date' => '2024-01-17'],
            ],
            'screening' => [
                ['id' => 3, 'name' => 'Michael Chen', 'position' => 'Data Analyst', 'source' => 'Referral', 'date' => '2024-01-15'],
            ],
            'interview' => [
                ['id' => 4, 'name' => 'Sarah Johnson', 'position' => 'HR Manager', 'source' => 'LinkedIn', 'date' => '2024-01-10'],
                ['id' => 5, 'name' => 'David Lee', 'position' => 'Software Engineer', 'source' => 'Website', 'date' => '2024-01-08'],
            ],
            'offering' => [
                ['id' => 6, 'name' => 'Emily Brown', 'position' => 'Marketing Lead', 'source' => 'Referral', 'date' => '2024-01-05'],
            ],
            'hired' => [
                ['id' => 7, 'name' => 'Robert Wilson', 'position' => 'DevOps Engineer', 'source' => 'LinkedIn', 'date' => '2023-12-20'],
            ],
        ];
    }
}
