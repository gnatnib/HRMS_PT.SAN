<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Candidate;
use App\Models\Employee;
use App\Models\InterviewNote;
use App\Models\JobOpening;
use App\Models\Department;
use App\Models\Position;
use App\Models\Center;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RecruitmentController extends Controller
{
    public function index()
    {
        $allCandidates = Candidate::orderBy('created_at', 'desc')->get();

        // Group by stage for Kanban
        $candidates = [];
        foreach (Candidate::STAGES as $stage) {
            $candidates[$stage] = $allCandidates->where('stage', $stage)->values()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'position' => $c->position,
                'source' => $c->source,
                'date' => $c->applied_date?->format('Y-m-d') ?? $c->created_at->format('Y-m-d'),
                'notes' => $c->notes,
                'resume_path' => $c->resume_path,
                'rejection_reason' => $c->rejection_reason,
                'converted_employee_id' => $c->converted_employee_id,
                'job_opening_id' => $c->job_opening_id,
            ])->toArray();
        }

        $stats = [];
        foreach (Candidate::STAGES as $stage) {
            $stats[$stage] = count($candidates[$stage]);
        }

        // Job openings from database
        $jobOpenings = JobOpening::where('status', 'open')
            ->withCount('candidates')
            ->get()
            ->map(fn($jo) => [
                'id' => $jo->id,
                'title' => $jo->title,
                'department' => $jo->department,
                'applicants' => $jo->candidates_count,
                'urgency' => $jo->urgency,
                'status' => $jo->status,
                'vacancy_count' => $jo->vacancy_count,
                'location' => $jo->location,
                'employment_type' => $jo->employment_type,
                'description' => $jo->description,
                'requirements' => $jo->requirements,
            ]);

        // Departments for conversion
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Recruitment/Index', [
            'candidates' => $candidates,
            'stats' => $stats,
            'positions' => $jobOpenings,
            'departments' => $departments,
            'positionsList' => $positions,
            'centers' => $centers,
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
            'notes' => 'nullable|string|max:2000',
            'job_opening_id' => 'nullable|exists:job_openings,id',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        $candidate = Candidate::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'],
            'source' => $validated['source'],
            'notes' => $validated['notes'] ?? null,
            'job_opening_id' => $validated['job_opening_id'] ?? null,
            'resume_path' => $resumePath,
            'stage' => 'applied',
            'applied_date' => now(),
        ]);

        ActivityLog::log('created', 'recruitment', "Menambahkan kandidat: {$candidate->name}", $candidate);

        return redirect()->back()->with('success', 'Kandidat berhasil ditambahkan!');
    }

    public function moveStage(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'from_stage' => 'required|string|in:applied,screening,interview,offering,hired,rejected',
            'to_stage' => 'required|string|in:applied,screening,interview,offering,hired,rejected',
        ]);

        $candidate = Candidate::findOrFail($validated['candidate_id']);
        $fromStage = $candidate->stage;
        $candidate->update(['stage' => $validated['to_stage']]);

        ActivityLog::log('status_changed', 'recruitment', "Memindahkan {$candidate->name} dari {$fromStage} ke {$validated['to_stage']}", $candidate, [
            'from' => $fromStage,
            'to' => $validated['to_stage'],
        ]);

        return redirect()->back()->with('success', 'Kandidat dipindahkan ke ' . $validated['to_stage']);
    }

    public function rejectCandidate(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $candidate = Candidate::findOrFail($validated['candidate_id']);
        $fromStage = $candidate->stage;
        $candidate->update([
            'stage' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        ActivityLog::log('status_changed', 'recruitment', "Menolak kandidat: {$candidate->name}", $candidate, [
            'from' => $fromStage,
            'to' => 'rejected',
            'reason' => $validated['rejection_reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Kandidat telah ditolak.');
    }

    public function deleteCandidate(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'stage' => 'required|string|in:applied,screening,interview,offering,hired,rejected',
        ]);

        $candidate = Candidate::findOrFail($validated['candidate_id']);

        if ($candidate->resume_path) {
            Storage::disk('public')->delete($candidate->resume_path);
        }

        ActivityLog::log('deleted', 'recruitment', "Menghapus kandidat: {$candidate->name}", $candidate);

        $candidate->delete();

        return redirect()->back()->with('success', 'Kandidat berhasil dihapus!');
    }

    public function convertToEmployee(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'position_id' => 'nullable|exists:positions,id',
            'department_id' => 'nullable|exists:departments,id',
            'center_id' => 'nullable|exists:centers,id',
            'join_date' => 'nullable|date',
            'basic_salary' => 'nullable|numeric|min:0',
        ]);

        $candidate = Candidate::findOrFail($validated['candidate_id']);

        if ($candidate->converted_employee_id) {
            return redirect()->back()->with('error', 'Kandidat sudah dikonversi ke employee.');
        }

        // Split name
        $nameParts = explode(' ', $candidate->name, 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? null;

        // Auto-generate employee code
        $lastId = Employee::max('id') ?? 0;
        $employeeCode = 'EMP-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);

        $employee = Employee::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $candidate->email,
            'mobile_number' => $candidate->phone,
            'employee_code' => $employeeCode,
            'position_id' => $validated['position_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'center_id' => $validated['center_id'] ?? null,
            'join_date' => $validated['join_date'] ?? now()->format('Y-m-d'),
            'basic_salary' => $validated['basic_salary'] ?? null,
            'is_active' => true,
            'employment_status' => 'Aktif',
            'balance_leave_allowed' => 12,
        ]);

        $candidate->update([
            'stage' => 'hired',
            'converted_employee_id' => $employee->id,
        ]);

        ActivityLog::log('created', 'recruitment', "Mengkonversi kandidat {$candidate->name} menjadi employee {$employeeCode}", $employee, [
            'candidate_id' => $candidate->id,
        ]);

        return redirect()->back()->with('success', "Kandidat berhasil dikonversi menjadi employee ({$employeeCode})!");
    }

    // Interview Notes
    public function storeInterviewNote(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'stage' => 'required|string|max:30',
            'interviewer' => 'nullable|string|max:100',
            'interview_date' => 'nullable|date',
            'notes' => 'nullable|string|max:5000',
            'rating' => 'nullable|integer|min:1|max:5',
            'result' => 'nullable|string|in:pass,fail,pending',
        ]);

        $validated['created_by'] = auth()->user()?->name ?? 'System';

        InterviewNote::create($validated);

        return redirect()->back()->with('success', 'Catatan interview berhasil disimpan.');
    }

    public function getInterviewNotes(int $candidateId)
    {
        $notes = InterviewNote::where('candidate_id', $candidateId)
            ->orderByDesc('interview_date')
            ->get();

        return response()->json($notes);
    }

    // Job Openings CRUD
    public function storeJobOpening(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'department' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
            'requirements' => 'nullable|string|max:5000',
            'urgency' => 'required|string|in:low,medium,high',
            'vacancy_count' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:100',
            'employment_type' => 'nullable|string|max:30',
        ]);

        $validated['status'] = 'open';

        $jobOpening = JobOpening::create($validated);

        ActivityLog::log('created', 'recruitment', "Membuat lowongan: {$jobOpening->title}", $jobOpening);

        return redirect()->back()->with('success', 'Lowongan berhasil ditambahkan!');
    }

    public function updateJobOpening(Request $request, JobOpening $jobOpening)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'department' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
            'requirements' => 'nullable|string|max:5000',
            'urgency' => 'required|string|in:low,medium,high',
            'status' => 'required|string|in:open,closed,on_hold',
            'vacancy_count' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:100',
            'employment_type' => 'nullable|string|max:30',
        ]);

        $jobOpening->update($validated);

        return redirect()->back()->with('success', 'Lowongan berhasil diupdate!');
    }

    public function deleteJobOpening(JobOpening $jobOpening)
    {
        ActivityLog::log('deleted', 'recruitment', "Menghapus lowongan: {$jobOpening->title}", $jobOpening);
        $jobOpening->delete();
        return redirect()->back()->with('success', 'Lowongan berhasil dihapus!');
    }

    public function exportCandidates()
    {
        $candidates = Candidate::orderBy('stage')->orderByDesc('created_at')->get();

        $stageLabels = [
            'applied' => 'Applied',
            'screening' => 'Screening',
            'interview' => 'Interview',
            'offering' => 'Offering',
            'hired' => 'Hired',
            'rejected' => 'Rejected',
        ];

        $rows = [];
        $rows[] = ['No', 'Nama Kandidat', 'Email', 'No. HP', 'Posisi', 'Sumber', 'Tanggal Masuk', 'Status / Tahapan', 'Catatan'];

        $no = 1;
        foreach ($candidates as $c) {
            $rows[] = [
                $no++,
                $c->name,
                $c->email ?? '',
                $c->phone ?? '',
                $c->position,
                $c->source,
                $c->applied_date?->format('Y-m-d') ?? '',
                $stageLabels[$c->stage] ?? $c->stage,
                $c->stage === 'rejected' ? ($c->rejection_reason ?? '') : ($c->notes ?? ''),
            ];
        }

        $filename = 'recruitment_candidates_' . now()->format('Y-m-d') . '.csv';

        $callback = function () use ($rows) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
