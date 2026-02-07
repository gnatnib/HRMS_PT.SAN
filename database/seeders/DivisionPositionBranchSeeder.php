<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Center;
use App\Models\Position;
use App\Models\Department;
use App\Models\Contract;

class DivisionPositionBranchSeeder extends Seeder
{
    public function run(): void
    {
        // Divisions (Centers) - Company departments/divisions
        $divisions = [
            'Information Technology',
            'Human Resources',
            'Finance & Accounting',
            'Marketing',
            'Sales',
            'Operations',
            'Legal & Compliance',
            'Research & Development',
            'Customer Service',
            'Procurement',
        ];

        foreach ($divisions as $division) {
            Center::firstOrCreate(
                ['name' => $division],
                [
                    'start_work_hour' => '08:00:00',
                    'end_work_hour' => '17:00:00',
                    'weekends' => ['Saturday', 'Sunday'],
                ]
            );
        }

        // Job Positions - Generic (will be combined with Division for display)
        $positions = [
            'Director',
            'Manager',
            'Senior Staff',
            'Staff',
            'Intern',
        ];

        foreach ($positions as $position) {
            Position::firstOrCreate(
                ['name' => $position],
                [
                    'vacancies_count' => 0,
                    'created_by' => 'system',
                    'updated_by' => 'system',
                ]
            );
        }

        // Branches (Departments) - Office locations
        $branches = [
            'Head Office Jakarta Pusat',
            'Bintaro',
            'Tangerang',
            'Bekasi',
            'Depok',
            'Bogor',
            'Bandung',
            'Surabaya',
            'Semarang',
            'Yogyakarta',
            'Medan',
            'Makassar',
        ];

        foreach ($branches as $branch) {
            Department::firstOrCreate(['name' => $branch]);
        }

        // Job Levels (Contracts) - Career levels
        $jobLevels = [
            'Intern',
            'Junior',
            'Mid-Level',
            'Senior',
            'Lead',
            'Manager',
            'Senior Manager',
            'Director',
            'Vice President',
            'C-Level',
        ];

        foreach ($jobLevels as $level) {
            Contract::firstOrCreate(
                ['name' => $level],
                ['work_rate' => 100]
            );
        }
    }
}