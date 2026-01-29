<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Center;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Centers with all required fields
        $centers = [
            [
                'name' => 'Kantor Pusat Jakarta',
                'start_work_hour' => '08:00',
                'end_work_hour' => '17:00',
                'weekends' => ['Saturday', 'Sunday'],
            ],
            [
                'name' => 'Cabang Surabaya',
                'start_work_hour' => '08:00',
                'end_work_hour' => '17:00',
                'weekends' => ['Saturday', 'Sunday'],
            ],
        ];

        foreach ($centers as $center) {
            Center::firstOrCreate(['name' => $center['name']], $center);
        }

        // Create Departments
        $departments = ['Human Resources', 'Finance', 'IT', 'Marketing', 'Operations', 'Sales'];
        foreach ($departments as $name) {
            Department::firstOrCreate(['name' => $name]);
        }

        // Create Positions with vacancies_count
        $positions = ['CEO', 'Manager', 'Supervisor', 'Senior Staff', 'Staff', 'Junior Staff'];
        foreach ($positions as $name) {
            Position::firstOrCreate(['name' => $name], ['name' => $name, 'vacancies_count' => 10]);
        }

        // Create Contracts with work_rate
        $contracts = [
            ['name' => 'Permanent', 'work_rate' => 100],
            ['name' => 'Contract', 'work_rate' => 100],
            ['name' => 'Probation', 'work_rate' => 100],
            ['name' => 'Intern', 'work_rate' => 50],
        ];

        foreach ($contracts as $contract) {
            Contract::firstOrCreate(['name' => $contract['name']], $contract);
        }

        // Get Contract IDs
        $permanentId = Contract::where('name', 'Permanent')->first()->id;
        $contractId = Contract::where('name', 'Contract')->first()->id;
        $probationId = Contract::where('name', 'Probation')->first()->id;
        $internId = Contract::where('name', 'Intern')->first()->id;

        // Create Employees
        $employees = [
            ['first_name' => 'Budi', 'last_name' => 'Santoso', 'mobile_number' => '08123456001', 'gender' => 'male', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Siti', 'last_name' => 'Rahayu', 'mobile_number' => '08123456002', 'gender' => 'female', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Dewi', 'last_name' => 'Lestari', 'mobile_number' => '08123456003', 'gender' => 'female', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Ahmad', 'last_name' => 'Hidayat', 'mobile_number' => '08123456004', 'gender' => 'male', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Rizki', 'last_name' => 'Pratama', 'mobile_number' => '08123456005', 'gender' => 'male', 'contract_id' => $contractId, 'is_active' => true],
            ['first_name' => 'Nina', 'last_name' => 'Kusuma', 'mobile_number' => '08123456006', 'gender' => 'female', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Eko', 'last_name' => 'Wijaya', 'mobile_number' => '08123456007', 'gender' => 'male', 'contract_id' => $contractId, 'is_active' => true],
            ['first_name' => 'Maya', 'last_name' => 'Sari', 'mobile_number' => '08123456008', 'gender' => 'female', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Dimas', 'last_name' => 'Putra', 'mobile_number' => '08123456009', 'gender' => 'male', 'contract_id' => $probationId, 'is_active' => true],
            ['first_name' => 'Agus', 'last_name' => 'Setiawan', 'mobile_number' => '08123456010', 'gender' => 'male', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Rina', 'last_name' => 'Wulandari', 'mobile_number' => '08123456011', 'gender' => 'female', 'contract_id' => $contractId, 'is_active' => true],
            ['first_name' => 'Yusuf', 'last_name' => 'Rahman', 'mobile_number' => '08123456012', 'gender' => 'male', 'contract_id' => $permanentId, 'is_active' => true],
            ['first_name' => 'Fitri', 'last_name' => 'Handayani', 'mobile_number' => '08123456013', 'gender' => 'female', 'contract_id' => $probationId, 'is_active' => true],
            ['first_name' => 'Aulia', 'last_name' => 'Putri', 'mobile_number' => '08123456015', 'gender' => 'female', 'contract_id' => $internId, 'is_active' => true],
            ['first_name' => 'Fajar', 'last_name' => 'Nugroho', 'mobile_number' => '08123456016', 'gender' => 'male', 'contract_id' => $contractId, 'is_active' => true],
        ];

        foreach ($employees as $emp) {
            Employee::firstOrCreate(['mobile_number' => $emp['mobile_number']], $emp);
        }

        $this->command->info('✅ Dummy data seeded!');
        $this->command->info('Centers: ' . Center::count());
        $this->command->info('Departments: ' . Department::count());
        $this->command->info('Positions: ' . Position::count());
        $this->command->info('Contracts: ' . Contract::count());
        $this->command->info('Employees: ' . Employee::count());
    }
}
