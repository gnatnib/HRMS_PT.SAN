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

        // Job Positions with Division context
        $positions = [
            // IT Positions
            'Director (Information Technology)',
            'Manager (Information Technology)',
            'Senior Staff (Information Technology)',
            'Staff (Information Technology)',
            'Intern (Information Technology)',

            // HR Positions
            'Director (Human Resources)',
            'Manager (Human Resources)',
            'Senior Staff (Human Resources)',
            'Staff (Human Resources)',
            'Intern (Human Resources)',

            // Finance Positions
            'Director (Finance & Accounting)',
            'Manager (Finance & Accounting)',
            'Senior Staff (Finance & Accounting)',
            'Staff (Finance & Accounting)',
            'Intern (Finance & Accounting)',

            // Marketing Positions
            'Director (Marketing)',
            'Manager (Marketing)',
            'Senior Staff (Marketing)',
            'Staff (Marketing)',
            'Intern (Marketing)',

            // Sales Positions
            'Director (Sales)',
            'Manager (Sales)',
            'Senior Staff (Sales)',
            'Staff (Sales)',
            'Intern (Sales)',

            // Operations Positions
            'Director (Operations)',
            'Manager (Operations)',
            'Senior Staff (Operations)',
            'Staff (Operations)',
            'Intern (Operations)',

            // Legal Positions
            'Director (Legal & Compliance)',
            'Manager (Legal & Compliance)',
            'Senior Staff (Legal & Compliance)',
            'Staff (Legal & Compliance)',
            'Intern (Legal & Compliance)',

            // R&D Positions
            'Director (Research & Development)',
            'Manager (Research & Development)',
            'Senior Staff (Research & Development)',
            'Staff (Research & Development)',
            'Intern (Research & Development)',

            // Customer Service Positions
            'Director (Customer Service)',
            'Manager (Customer Service)',
            'Senior Staff (Customer Service)',
            'Staff (Customer Service)',
            'Intern (Customer Service)',

            // Procurement Positions
            'Director (Procurement)',
            'Manager (Procurement)',
            'Senior Staff (Procurement)',
            'Staff (Procurement)',
            'Intern (Procurement)',
        ];

        foreach ($positions as $position) {
            Position::firstOrCreate(
                ['name' => $position],
                ['vacancies_count' => 0]
            );
        }

        // Branches (Departments) - Office locations
        $branches = [
            'PT. Sinergi Asta Nusantara - Head Office (Jakarta Pusat)',
            'PT. Sinergi Asta Nusantara - Bintaro',
            'PT. Sinergi Asta Nusantara - Tangerang',
            'PT. Sinergi Asta Nusantara - Bekasi',
            'PT. Sinergi Asta Nusantara - Depok',
            'PT. Sinergi Asta Nusantara - Bogor',
            'PT. Sinergi Asta Nusantara - Bandung',
            'PT. Sinergi Asta Nusantara - Surabaya',
            'PT. Sinergi Asta Nusantara - Semarang',
            'PT. Sinergi Asta Nusantara - Yogyakarta',
            'PT. Sinergi Asta Nusantara - Medan',
            'PT. Sinergi Asta Nusantara - Makassar',
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
