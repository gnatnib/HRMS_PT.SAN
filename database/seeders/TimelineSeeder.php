<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Timeline;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TimelineSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::query()
            ->select('id', 'center_id', 'department_id', 'position_id', 'join_date', 'employment_status')
            ->whereNotNull('center_id')
            ->whereNotNull('department_id')
            ->whereNotNull('position_id')
            ->get();

        foreach ($employees as $employee) {
            $startDate = $employee->join_date ?: Carbon::now()->subMonths(6)->toDateString();

            Timeline::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'end_date' => null,
                ],
                [
                    'center_id' => $employee->center_id,
                    'department_id' => $employee->department_id,
                    'position_id' => $employee->position_id,
                    'start_date' => $startDate,
                    'notes' => 'Posisi aktif karyawan untuk kebutuhan presentasi HRMS.',
                    'created_by' => 'System',
                    'updated_by' => 'System',
                ]
            );
        }

        $this->command->info('✅ Timeline aktif diperbarui untuk ' . $employees->count() . ' karyawan');
    }
}
