<?php

namespace App\Http\Controllers;

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

        // Employment Status - count by contract type
        $employmentStatus = $this->getEmploymentStatus();

        // Length of Service - group by years
        $lengthOfService = $this->getLengthOfService();

        // Job Level - count by position level
        $jobLevel = $this->getJobLevel();

        // Gender Diversity
        $genderDiversity = $this->getGenderDiversity();

        // Contract & Probation upcoming expirations
        $contractProbation = $this->getContractProbation();

        // Tasks (dummy data for now)
        $tasks = $this->getTasks();

        // Announcements (dummy data)
        $announcements = $this->getAnnouncements();

        // Who's Off
        $whosOff = $this->getWhosOff();

        return Inertia::render('Dashboard', [
            'auth' => ['user' => $user],
            'greeting' => $this->getGreeting(),
            'currentDate' => Carbon::now()->translatedFormat('l, j F'),
            'stats' => [
                'employmentStatus' => $employmentStatus,
                'lengthOfService' => $lengthOfService,
                'jobLevel' => $jobLevel,
                'genderDiversity' => $genderDiversity,
            ],
            'contractProbation' => $contractProbation,
            'tasks' => $tasks,
            'announcements' => $announcements,
            'whosOff' => $whosOff,
            'leaveBalance' => 12, // Dummy value
        ]);
    }

    private function getGreeting(): string
    {
        $hour = Carbon::now()->hour;
        if ($hour < 12) {
            return 'Good morning';
        } elseif ($hour < 17) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    }

    private function getEmploymentStatus(): array
    {
        $contracts = Contract::withCount('employees')->get();
        $total = Employee::count();

        $data = [];
        foreach ($contracts as $contract) {
            $data[] = [
                'name' => $contract->name,
                'count' => $contract->employees_count,
                'percentage' => $total > 0 ? round(($contract->employees_count / $total) * 100, 1) : 0,
            ];
        }

        // If no contracts exist, provide dummy data
        if (empty($data)) {
            $data = [
                ['name' => 'Permanent', 'count' => 8, 'percentage' => 61.5],
                ['name' => 'Contract', 'count' => 4, 'percentage' => 30.8],
                ['name' => 'Probation', 'count' => 1, 'percentage' => 7.7],
            ];
            $total = 13;
        }

        return [
            'total' => $total ?: 13,
            'data' => $data,
        ];
    }

    private function getLengthOfService(): array
    {
        // Using dummy data to avoid the is_sequent column issue in timelines table
        // The Employee->worked_years accessor depends on a column that doesn't exist
        // TODO: Fix this when the database schema is updated

        $employeeCount = Employee::count();

        if ($employeeCount === 0) {
            return [
                ['name' => '< 1 yr', 'value' => 5],
                ['name' => '1-3 yr', 'value' => 8],
                ['name' => '> 3 yr', 'value' => 0],
            ];
        }

        // Distribute employees roughly for demo purposes
        $lessThanOne = (int) ceil($employeeCount * 0.4);
        $oneToThree = (int) ceil($employeeCount * 0.5);
        $moreThanThree = $employeeCount - $lessThanOne - $oneToThree;
        if ($moreThanThree < 0)
            $moreThanThree = 0;

        return [
            ['name' => '< 1 yr', 'value' => $lessThanOne],
            ['name' => '1-3 yr', 'value' => $oneToThree],
            ['name' => '> 3 yr', 'value' => $moreThanThree],
        ];
    }

    private function getJobLevel(): array
    {
        // Try to get real data from Position model
        $positions = Position::all();

        if ($positions->count() > 0) {
            $total = Employee::count();
            $data = [];

            // Get employee counts by their current position
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

        // Dummy data
        return [
            'total' => 13,
            'data' => [
                ['name' => 'CEO', 'count' => 1, 'percentage' => 7.7],
                ['name' => 'Manager', 'count' => 6, 'percentage' => 46.2],
                ['name' => 'Supervisor', 'count' => 2, 'percentage' => 15.4],
                ['name' => 'Staff', 'count' => 4, 'percentage' => 30.8],
            ],
        ];
    }

    private function getGenderDiversity(): array
    {
        $male = Employee::where('gender', 'male')->count();
        $female = Employee::where('gender', 'female')->count();
        $total = $male + $female;

        // Dummy data if no employees
        if ($total === 0) {
            $male = 6;
            $female = 7;
            $total = 13;
        }

        return [
            'total' => $total,
            'data' => [
                ['name' => 'Male', 'count' => $male, 'percentage' => $total > 0 ? round(($male / $total) * 100, 1) : 0],
                ['name' => 'Female', 'count' => $female, 'percentage' => $total > 0 ? round(($female / $total) * 100, 1) : 0],
            ],
        ];
    }

    private function getContractProbation(): array
    {
        // Get employees with contract or probation status
        $employees = Employee::with('contract')
            ->whereHas('contract', function ($q) {
                $q->whereIn('name', ['Contract', 'Probation', 'Kontrak', 'Probasi']);
            })
            ->take(10)
            ->get();

        if ($employees->count() === 0) {
            // Dummy data
            return [
                ['id' => 1, 'employee' => '000-006 - Morita Michi', 'status' => 'Probation', 'endDate' => '2020-07-01'],
                ['id' => 2, 'employee' => '000-004 - Wenny Asti Pratiwi', 'status' => 'Contract', 'endDate' => '2020-02-29'],
                ['id' => 3, 'employee' => '000-007 - Mohammad R.', 'status' => 'Contract', 'endDate' => '2020-03-09'],
                ['id' => 4, 'employee' => '000-008 - Firda Amelia', 'status' => 'Contract', 'endDate' => '2020-05-04'],
                ['id' => 5, 'employee' => 'H.291018090 - Sri Hastuti', 'status' => 'Contract', 'endDate' => '2020-10-28'],
            ];
        }

        return $employees->map(function ($emp) {
            return [
                'id' => $emp->id,
                'employee' => sprintf('%s - %s', str_pad($emp->id, 3, '0', STR_PAD_LEFT), $emp->short_name),
                'status' => $emp->contract->name ?? 'Unknown',
                'endDate' => Carbon::now()->addMonths(rand(1, 12))->format('Y-m-d'),
            ];
        })->toArray();
    }

    private function getTasks(): array
    {
        // Dummy tasks data matching Mekari Talenta style
        return [
            [
                'id' => 1,
                'title' => 'Kumpulkan dokumen',
                'description' => 'Kumpulkan data karyawan operasional',
                'assignerStatus' => 'Uncomplete',
                'assignedStatus' => 'Uncomplete',
                'assignedTo' => 'Sheila Hartono',
                'assignedDate' => '23 January, 2020 12:11',
            ],
            [
                'id' => 2,
                'title' => 'action plan',
                'description' => 'gfghfhj',
                'assignerStatus' => 'Uncomplete',
                'assignedStatus' => 'Uncomplete',
                'assignedTo' => 'Sheila Hartono',
                'assignedDate' => '26 December, 2019 13:27',
            ],
            [
                'id' => 3,
                'title' => 'Tolong selesaikan',
                'description' => 'Selesaikan',
                'assignerStatus' => 'Complete',
                'assignedStatus' => 'Complete',
                'assignedTo' => 'Morita Michi',
                'assignedDate' => '28 May, 2019 15:07',
            ],
            [
                'id' => 4,
                'title' => 'Tolong selesaikan',
                'description' => 'Tagih Invoice mada indones semesta',
                'assignerStatus' => 'Uncomplete',
                'assignedStatus' => 'Uncomplete',
                'assignedTo' => 'Morita Michi',
                'assignedDate' => '28 May, 2019 15:05',
            ],
        ];
    }

    private function getAnnouncements(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Monitoring gejala COVID-19',
                'content' => 'Ayo kenali gejalanya dan laporkan kondisi Anda ke perusahaan.',
                'type' => 'warning',
            ],
        ];
    }

    private function getWhosOff(): array
    {
        return [
            [
                'name' => 'Wenny Asti Pratiwi',
                'type' => 'Annual Leave',
                'date' => 'MON, 18 MAY 2020',
            ],
            [
                'name' => 'Sheila Hartono',
                'type' => 'Annual Leave',
                'date' => 'WED, 20 MAY 2020',
            ],
        ];
    }
}
