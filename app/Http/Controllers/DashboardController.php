<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Candidate;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\Position;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Employment Status
        $employmentStatus = $this->getEmploymentStatus();

        // Length of Service
        $lengthOfService = $this->getLengthOfService();

        // Job Level
        $jobLevel = $this->getJobLevel();

        // Gender Diversity
        $genderDiversity = $this->getGenderDiversity();

        // Announcements
        $announcements = $this->getAnnouncements();

        // Who's Off
        $whosOff = $this->getWhosOff();

        // Recent Employees (last 5 added)
        $recentEmployees = Employee::with('position:id,name')
            ->select('id', 'first_name', 'last_name', 'employee_code', 'is_active', 'employment_status', 'position_id', 'created_at')
            ->latest()
            ->take(5)
            ->get();

        // New hires this month
        $newHiresThisMonth = Employee::whereMonth('join_date', Carbon::now()->month)
            ->whereYear('join_date', Carbon::now()->year)
            ->count();

        // Activity Log (recent 10)
        $recentActivities = ActivityLog::latest()
            ->take(10)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user_name' => $log->user_name,
                'action' => $log->action,
                'module' => $log->module,
                'description' => $log->description,
                'time' => $log->created_at->diffForHumans(),
                'date' => $log->created_at->translatedFormat('d M Y H:i'),
            ]);

        // Contract Expiry Alert (within 30 days)
        $contractAlerts = $this->getContractExpiryAlerts();

        // Probation Ending Soon (within 30 days)
        $probationAlerts = $this->getProbationAlerts();

        // Recruitment Pipeline Summary
        $recruitmentSummary = $this->getRecruitmentSummary();

        // Birthday This Month
        $birthdaysThisMonth = $this->getBirthdaysThisMonth();

        return Inertia::render('Dashboard', [
            'greeting' => $this->getGreeting(),
            'currentDate' => Carbon::now()->translatedFormat('l, j F'),
            'stats' => [
                'employmentStatus' => $employmentStatus,
                'lengthOfService' => $lengthOfService,
                'jobLevel' => $jobLevel,
                'genderDiversity' => $genderDiversity,
            ],
            'announcements' => $announcements,
            'recentEmployees' => $recentEmployees,
            'newHiresThisMonth' => $newHiresThisMonth,
            'whosOff' => $whosOff,
            'recentActivities' => $recentActivities,
            'contractAlerts' => $contractAlerts,
            'probationAlerts' => $probationAlerts,
            'recruitmentSummary' => $recruitmentSummary,
            'birthdaysThisMonth' => $birthdaysThisMonth,
        ]);
    }

    private function getGreeting(): string
    {
        $hour = Carbon::now()->hour;
        if ($hour < 12) {
            return 'Selamat pagi';
        } elseif ($hour < 17) {
            return 'Selamat siang';
        } else {
            return 'Selamat sore';
        }
    }

    private function getEmploymentStatus(): array
    {
        $total = Employee::count();

        $activeCount = Employee::where('is_active', true)->where('employment_status', 'Aktif')->count();
        $terminatedCount = Employee::where('employment_status', 'Terminated')->count();
        $permissionCount = Employee::where('employment_status', 'Izin')->count();
        $leaveCount = Employee::where('employment_status', 'Cuti')->count();
        $businessTripCount = Employee::where('employment_status', 'Dinas Luar')->count();
        $probationCount = Employee::where('employment_status', 'Masa Percobaan')->count();

        $data = [
            [
                'name' => 'Aktif',
                'count' => $activeCount,
                'percentage' => $total > 0 ? round(($activeCount / $total) * 100, 1) : 0,
                'color' => '#22C55E',
            ],
            [
                'name' => 'Terminated',
                'count' => $terminatedCount,
                'percentage' => $total > 0 ? round(($terminatedCount / $total) * 100, 1) : 0,
                'color' => '#EF4444',
            ],
            [
                'name' => 'Izin',
                'count' => $permissionCount,
                'percentage' => $total > 0 ? round(($permissionCount / $total) * 100, 1) : 0,
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Cuti',
                'count' => $leaveCount,
                'percentage' => $total > 0 ? round(($leaveCount / $total) * 100, 1) : 0,
                'color' => '#EAB308',
            ],
            [
                'name' => 'Dinas Luar',
                'count' => $businessTripCount,
                'percentage' => $total > 0 ? round(($businessTripCount / $total) * 100, 1) : 0,
                'color' => '#14B8A6',
            ],
            [
                'name' => 'Masa Percobaan',
                'count' => $probationCount,
                'percentage' => $total > 0 ? round(($probationCount / $total) * 100, 1) : 0,
                'color' => '#3B82F6',
            ],
        ];

        return [
            'total' => $total,
            'data' => $data,
        ];
    }

    private function getLengthOfService(): array
    {
        $employeeCount = Employee::count();

        if ($employeeCount === 0) {
            return [
                ['name' => '< 1 yr', 'value' => 0],
                ['name' => '1-3 yr', 'value' => 0],
                ['name' => '> 3 yr', 'value' => 0],
            ];
        }

        // Calculate based on join_date
        $now = Carbon::now();
        $lessThanOne = Employee::whereNotNull('join_date')
            ->where('join_date', '>', $now->copy()->subYear())
            ->count();
        $oneToThree = Employee::whereNotNull('join_date')
            ->where('join_date', '<=', $now->copy()->subYear())
            ->where('join_date', '>', $now->copy()->subYears(3))
            ->count();
        $moreThanThree = Employee::whereNotNull('join_date')
            ->where('join_date', '<=', $now->copy()->subYears(3))
            ->count();

        return [
            ['name' => '< 1 yr', 'value' => $lessThanOne],
            ['name' => '1-3 yr', 'value' => $oneToThree],
            ['name' => '> 3 yr', 'value' => $moreThanThree],
        ];
    }

    private function getJobLevel(): array
    {
        $positions = Position::all();

        if ($positions->count() > 0) {
            $total = Employee::count();
            $data = [];

            foreach ($positions as $position) {
                $count = Employee::whereHas('timelines', function ($q) use ($position) {
                    $q->where('position_id', $position->id)->whereNull('end_date');
                })->count();

                if ($count > 0) {
                    $data[] = [
                        'name' => $position->name,
                        'count' => $count,
                        'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
                    ];
                }
            }

            if (!empty($data)) {
                return [
                    'total' => $total,
                    'data' => $data,
                ];
            }
        }

        return [
            'total' => 0,
            'data' => [],
        ];
    }

    private function getGenderDiversity(): array
    {
        $male = Employee::where('gender', 1)->count();
        $female = Employee::where('gender', 0)->count();
        $total = $male + $female;

        return [
            'total' => $total,
            'data' => [
                ['name' => 'Male', 'count' => $male, 'percentage' => $total > 0 ? round(($male / $total) * 100, 1) : 0],
                ['name' => 'Female', 'count' => $female, 'percentage' => $total > 0 ? round(($female / $total) * 100, 1) : 0],
            ],
        ];
    }

    private function getAnnouncements(): array
    {
        try {
            return Announcement::with('creator:id,name')
                ->where('is_active', true)
                ->latest()
                ->take(5)
                ->get(['id', 'title', 'content', 'created_at', 'created_by_user_id', 'created_by_name', 'created_by_role'])
                ->map(fn($item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'date' => $item->created_at->translatedFormat('d M Y'),
                    'time' => $item->created_at->translatedFormat('H:i'),
                    'published_at' => $item->created_at->translatedFormat('d F Y, H:i'),
                    'created_by_name' => $item->created_by_name ?: ($item->creator?->name ?? 'System'),
                    'created_by_role' => $item->created_by_role ? str_replace('_', ' ', ucfirst($item->created_by_role)) : 'User',
                ])
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getWhosOff(): array
    {
        $offEmployees = Employee::whereIn('employment_status', ['Izin', 'Cuti', 'Dinas Luar'])
            ->select('id', 'first_name', 'last_name', 'employment_status', 'status_reason')
            ->take(5)
            ->get();

        if ($offEmployees->count() > 0) {
            return $offEmployees->map(fn($emp) => [
                'name' => $emp->first_name . ' ' . ($emp->last_name ?? ''),
                'type' => $emp->employment_status,
                'reason' => $emp->status_reason,
            ])->toArray();
        }

        return [];
    }

    private function getContractExpiryAlerts(): array
    {
        try {
            // Employees with contracts that have work_rate (used as contract duration indicator)
            // Get employees whose join_date + contract work_rate is within 30 days
            $employees = Employee::whereNotNull('contract_id')
                ->whereNotNull('join_date')
                ->with(['contract:id,name,work_rate', 'position:id,name'])
                ->select('id', 'first_name', 'last_name', 'employee_code', 'contract_id', 'join_date', 'position_id')
                ->get()
                ->filter(function ($emp) {
                    if (!$emp->contract || !$emp->contract->work_rate) return false;
                    $endDate = Carbon::parse($emp->join_date)->addMonths((int)$emp->contract->work_rate);
                    $daysLeft = Carbon::now()->diffInDays($endDate, false);
                    return $daysLeft >= 0 && $daysLeft <= 30;
                })
                ->take(5)
                ->map(fn($emp) => [
                    'id' => $emp->id,
                    'name' => trim($emp->first_name . ' ' . ($emp->last_name ?? '')),
                    'employee_code' => $emp->employee_code,
                    'position' => $emp->position?->name,
                    'contract' => $emp->contract?->name,
                    'days_left' => Carbon::now()->diffInDays(Carbon::parse($emp->join_date)->addMonths((int)$emp->contract->work_rate), false),
                ])
                ->values()
                ->toArray();

            return $employees;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getProbationAlerts(): array
    {
        // Employees in "Masa Percobaan" status
        $employees = Employee::where('employment_status', 'Masa Percobaan')
            ->whereNotNull('join_date')
            ->with('position:id,name')
            ->select('id', 'first_name', 'last_name', 'employee_code', 'join_date', 'position_id')
            ->get()
            ->map(function ($emp) {
                // Assume 3-month probation from join_date
                $probationEnd = Carbon::parse($emp->join_date)->addMonths(3);
                $daysLeft = Carbon::now()->diffInDays($probationEnd, false);
                return [
                    'id' => $emp->id,
                    'name' => trim($emp->first_name . ' ' . ($emp->last_name ?? '')),
                    'employee_code' => $emp->employee_code,
                    'position' => $emp->position?->name,
                    'join_date' => Carbon::parse($emp->join_date)->translatedFormat('d M Y'),
                    'probation_end' => $probationEnd->translatedFormat('d M Y'),
                    'days_left' => max(0, $daysLeft),
                ];
            })
            ->sortBy('days_left')
            ->take(5)
            ->values()
            ->toArray();

        return $employees;
    }

    private function getRecruitmentSummary(): array
    {
        try {
            $stages = ['applied', 'screening', 'interview', 'offering', 'hired', 'rejected'];
            $summary = [];
            foreach ($stages as $stage) {
                $summary[$stage] = Candidate::where('stage', $stage)->count();
            }
            $summary['total'] = array_sum($summary);
            return $summary;
        } catch (\Exception $e) {
            return ['total' => 0, 'applied' => 0, 'screening' => 0, 'interview' => 0, 'offering' => 0, 'hired' => 0, 'rejected' => 0];
        }
    }

    private function getBirthdaysThisMonth(): array
    {
        try {
            $currentMonth = Carbon::now()->month;
            return Employee::whereMonth('birth_date', $currentMonth)
                ->where('is_active', true)
                ->with('position:id,name')
                ->select('id', 'first_name', 'last_name', 'birth_date', 'position_id', 'profile_photo_path')
                ->get()
                ->map(fn($emp) => [
                    'id' => $emp->id,
                    'name' => trim($emp->first_name . ' ' . ($emp->last_name ?? '')),
                    'birth_date' => Carbon::parse($emp->birth_date)->translatedFormat('d F'),
                    'position' => $emp->position?->name,
                    'is_today' => Carbon::parse($emp->birth_date)->isBirthday(),
                ])
                ->sortBy(fn($emp) => Carbon::parse($emp['birth_date'])->day)
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
}
