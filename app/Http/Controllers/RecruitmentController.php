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

    public function onboarding()
    {
        $newHires = [
            [
                'id' => 1,
                'name' => 'Robert Wilson',
                'position' => 'DevOps Engineer',
                'department' => 'IT',
                'startDate' => '2024-01-22',
                'progress' => 60,
                'checklist' => [
                    ['item' => 'Create email account', 'done' => true],
                    ['item' => 'Setup workstation', 'done' => true],
                    ['item' => 'ID Card photo', 'done' => true],
                    ['item' => 'BPJS registration', 'done' => false],
                    ['item' => 'Welcome kit', 'done' => false],
                    ['item' => 'Team introduction', 'done' => false],
                ],
            ],
        ];

        $offboardings = [
            [
                'id' => 1,
                'name' => 'Michael Chen',
                'position' => 'Data Analyst',
                'department' => 'IT',
                'lastDate' => '2024-02-15',
                'progress' => 40,
                'checklist' => [
                    ['item' => 'Knowledge transfer', 'done' => true],
                    ['item' => 'Return laptop', 'done' => false],
                    ['item' => 'Return ID card', 'done' => false],
                    ['item' => 'Exit interview', 'done' => false],
                    ['item' => 'Final payslip', 'done' => false],
                ],
            ],
        ];

        return Inertia::render('Recruitment/Onboarding', [
            'newHires' => $newHires,
            'offboardings' => $offboardings,
        ]);
    }

    public function updateChecklist(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer',
            'item_index' => 'required|integer',
            'done' => 'required|boolean',
            'type' => 'required|in:onboarding,offboarding',
        ]);

        // In production, update database
        return redirect()->back()->with('success', 'Checklist diupdate!');
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
