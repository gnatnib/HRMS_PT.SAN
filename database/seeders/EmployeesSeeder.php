<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Contract;
use App\Models\Position;
use App\Models\Department;
use App\Models\Center;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class EmployeesSeeder extends Seeder
{
    public function run(): void
    {
        // Get Job Level (Contract) IDs - varied levels
        $internLevel = Contract::where('name', 'Intern')->first()?->id ?? 1;
        $juniorLevel = Contract::where('name', 'Junior')->first()?->id ?? 1;
        $midLevel = Contract::where('name', 'Mid-Level')->first()?->id ?? 1;
        $seniorLevel = Contract::where('name', 'Senior')->first()?->id ?? 1;
        $leadLevel = Contract::where('name', 'Lead')->first()?->id ?? 1;
        $managerLevel = Contract::where('name', 'Manager')->first()?->id ?? 1;
        $seniorManagerLevel = Contract::where('name', 'Senior Manager')->first()?->id ?? 1;
        $directorLevel = Contract::where('name', 'Director')->first()?->id ?? 1;
        $cLevel = Contract::where('name', 'C-Level')->first()?->id ?? 1;

        // Get Position IDs (generic positions)
        $director = Position::where('name', 'Director')->first()?->id ?? 1;
        $manager = Position::where('name', 'Manager')->first()?->id ?? 1;
        $seniorStaff = Position::where('name', 'Senior Staff')->first()?->id ?? 1;
        $staff = Position::where('name', 'Staff')->first()?->id ?? 1;
        $intern = Position::where('name', 'Intern')->first()?->id ?? 1;

        // Get Division (Center) IDs
        $itCenter = Center::where('name', 'Information Technology')->first()?->id ?? 1;
        $hrCenter = Center::where('name', 'Human Resources')->first()?->id ?? 1;
        $financeCenter = Center::where('name', 'LIKE', 'Finance%')->first()?->id ?? 1;
        $marketingCenter = Center::where('name', 'Marketing')->first()?->id ?? 1;
        $salesCenter = Center::where('name', 'Sales')->first()?->id ?? 1;
        $operationsCenter = Center::where('name', 'Operations')->first()?->id ?? 1;
        $customerServiceCenter = Center::where('name', 'Customer Service')->first()?->id ?? 1;

        // Get Branch (Department) IDs
        $bintaro = Department::where('name', 'Bintaro')->first()?->id ?? 1;
        $headOffice = Department::where('name', 'LIKE', 'Head Office%')->first()?->id ?? 1;
        $tangerang = Department::where('name', 'Tangerang')->first()?->id ?? 1;
        $bekasi = Department::where('name', 'Bekasi')->first()?->id ?? 1;
        $surabaya = Department::where('name', 'Surabaya')->first()?->id ?? 1;
        $bandung = Department::where('name', 'Bandung')->first()?->id ?? 1;

        // Create default profile picture
        $defaultPhotoPath = 'profile-photos/default-avatar.svg';
        if (!Storage::disk('public')->exists($defaultPhotoPath)) {
            Storage::disk('public')->put($defaultPhotoPath, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>');
        }

        $employees = [
            [
                'employee_code' => '000-001',
                'barcode' => 'AII1',
                'first_name' => 'Darmayansyah',
                'last_name' => 'Direktur',
                'father_name' => 'Surya',
                'mother_name' => 'Kartini',
                'gender' => 1,
                'birth_and_place' => 'Jakarta, 15 Maret 1975',
                'birth_place' => 'Jakarta',
                'birth_date' => '1975-03-15',
                'national_number' => '3175012503750001',
                'identity_type' => 'KTP',
                'identity_number' => '3175012503750001',
                'mobile_number' => '08123456001',
                'email' => 'darmayansyah@company.com',
                'address' => 'Jl. Sudirman No. 123, Jakarta Selatan',
                'postal_code' => '12190',
                'degree' => 'S2 Management',
                'contract_id' => $cLevel,           // C-Level
                'position_id' => $director,         // Director
                'department_id' => $headOffice,
                'center_id' => $itCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2010-01-15',
                'is_active' => true,
                'basic_salary' => 75000000,
                'ptkp_status' => 'K/2',
                'tax_configuration' => 'Gross Up',
                'salary_type' => 'Monthly',
                'bank_name' => 'BCA',
                'bank_account_number' => '1234567890',
                'bank_account_holder' => 'Darmayansyah',
                'max_leave_allowed' => 15,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-002',
                'barcode' => 'AII2',
                'first_name' => 'Putri',
                'last_name' => 'Indriani',
                'father_name' => 'Agus',
                'mother_name' => 'Dewi',
                'gender' => 0,
                'birth_and_place' => 'Bandung, 22 Juli 1985',
                'birth_place' => 'Bandung',
                'birth_date' => '1985-07-22',
                'national_number' => '3273012207850002',
                'identity_type' => 'KTP',
                'identity_number' => '3273012207850002',
                'mobile_number' => '08123456002',
                'email' => 'putri.indriani@company.com',
                'address' => 'Jl. Dago No. 45, Bandung',
                'postal_code' => '40135',
                'degree' => 'S2 Akuntansi',
                'contract_id' => $directorLevel,    // Director Level
                'position_id' => $manager,          // Manager
                'department_id' => $headOffice,
                'center_id' => $financeCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2015-03-01',
                'is_active' => true,
                'basic_salary' => 35000000,
                'ptkp_status' => 'K/1',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '2345678901',
                'bank_account_holder' => 'Putri Indriani',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-003',
                'barcode' => 'AII3',
                'first_name' => 'Sheila',
                'last_name' => 'Hartono',
                'father_name' => 'Budi',
                'mother_name' => 'Sari',
                'gender' => 0,
                'birth_and_place' => 'Surabaya, 10 November 1988',
                'birth_place' => 'Surabaya',
                'birth_date' => '1988-11-10',
                'national_number' => '3578011011880003',
                'identity_type' => 'KTP',
                'identity_number' => '3578011011880003',
                'mobile_number' => '08123456003',
                'email' => 'sheila.hartono@company.com',
                'address' => 'Jl. Pemuda No. 78, Surabaya',
                'postal_code' => '60271',
                'degree' => 'S1 Psikologi',
                'contract_id' => $seniorManagerLevel,  // Senior Manager
                'position_id' => $manager,             // Manager
                'department_id' => $tangerang,
                'center_id' => $hrCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2016-07-02',
                'is_active' => true,
                'basic_salary' => 28000000,
                'ptkp_status' => 'K/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BNI',
                'bank_account_number' => '3456789012',
                'bank_account_holder' => 'Sheila Hartono',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-004',
                'barcode' => 'AII4',
                'first_name' => 'Wenny',
                'last_name' => 'Asti Pratiwi',
                'father_name' => 'Hendra',
                'mother_name' => 'Maya',
                'gender' => 0,
                'birth_and_place' => 'Semarang, 05 April 1990',
                'birth_place' => 'Semarang',
                'birth_date' => '1990-04-05',
                'national_number' => '3374010504900004',
                'identity_type' => 'KTP',
                'identity_number' => '3374010504900004',
                'mobile_number' => '08123456004',
                'email' => 'wenny.asti@company.com',
                'address' => 'Jl. Gajah Mada No. 99, Semarang',
                'postal_code' => '50134',
                'degree' => 'S1 Marketing',
                'contract_id' => $seniorLevel,      // Senior
                'position_id' => $seniorStaff,      // Senior Staff
                'department_id' => $bintaro,
                'center_id' => $marketingCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2018-01-10',
                'is_active' => true,
                'basic_salary' => 18000000,
                'ptkp_status' => 'TK/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BCA',
                'bank_account_number' => '4567890123',
                'bank_account_holder' => 'Wenny Asti Pratiwi',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-005',
                'barcode' => 'AII5',
                'first_name' => 'Morita',
                'last_name' => 'Michi',
                'father_name' => 'Takeshi',
                'mother_name' => 'Yuki',
                'gender' => 1,
                'birth_and_place' => 'Jakarta, 18 September 1987',
                'birth_place' => 'Jakarta',
                'birth_date' => '1987-09-18',
                'national_number' => '3175011809870005',
                'identity_type' => 'KTP',
                'identity_number' => '3175011809870005',
                'mobile_number' => '08123456005',
                'email' => 'morita.michi@company.com',
                'address' => 'Jl. Kuningan No. 12, Jakarta',
                'postal_code' => '12950',
                'degree' => 'S1 Teknik Informatika',
                'contract_id' => $leadLevel,        // Lead
                'position_id' => $seniorStaff,      // Senior Staff
                'department_id' => $headOffice,
                'center_id' => $itCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2017-05-15',
                'is_active' => true,
                'basic_salary' => 22000000,
                'ptkp_status' => 'K/1',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '5678901234',
                'bank_account_holder' => 'Morita Michi',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-006',
                'barcode' => 'AII6',
                'first_name' => 'Mohammad',
                'last_name' => 'Reza',
                'father_name' => 'Abdul',
                'mother_name' => 'Nisa',
                'gender' => 1,
                'birth_and_place' => 'Yogyakarta, 28 Februari 1993',
                'birth_place' => 'Yogyakarta',
                'birth_date' => '1993-02-28',
                'national_number' => '3404012802930006',
                'identity_type' => 'KTP',
                'identity_number' => '3404012802930006',
                'mobile_number' => '08123456006',
                'email' => 'mohammad.reza@company.com',
                'address' => 'Jl. Malioboro No. 56, Yogyakarta',
                'postal_code' => '55271',
                'degree' => 'S1 Teknik Informatika',
                'contract_id' => $midLevel,         // Mid-Level
                'position_id' => $staff,            // Staff
                'department_id' => $bintaro,
                'center_id' => $itCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2019-08-01',
                'is_active' => true,
                'basic_salary' => 12000000,
                'ptkp_status' => 'TK/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BRI',
                'bank_account_number' => '6789012345',
                'bank_account_holder' => 'Mohammad Reza',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-007',
                'barcode' => 'AII7',
                'first_name' => 'Firda',
                'last_name' => 'Amelia',
                'father_name' => 'Rizal',
                'mother_name' => 'Rina',
                'gender' => 0,
                'birth_and_place' => 'Medan, 14 Juni 1996',
                'birth_place' => 'Medan',
                'birth_date' => '1996-06-14',
                'national_number' => '1271011406960007',
                'identity_type' => 'KTP',
                'identity_number' => '1271011406960007',
                'mobile_number' => '08123456007',
                'email' => 'firda.amelia@company.com',
                'address' => 'Jl. Asia No. 23, Medan',
                'postal_code' => '20212',
                'degree' => 'S1 Akuntansi',
                'contract_id' => $juniorLevel,      // Junior
                'position_id' => $staff,            // Staff
                'department_id' => $bekasi,
                'center_id' => $financeCenter,
                'employment_status' => 'Contract',
                'join_date' => '2022-02-15',
                'is_active' => true,
                'basic_salary' => 8000000,
                'ptkp_status' => 'TK/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BCA',
                'bank_account_number' => '7890123456',
                'bank_account_holder' => 'Firda Amelia',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-008',
                'barcode' => 'AII8',
                'first_name' => 'Andi',
                'last_name' => 'Saputra',
                'father_name' => 'Joko',
                'mother_name' => 'Sri',
                'gender' => 1,
                'birth_and_place' => 'Makassar, 20 Januari 1995',
                'birth_place' => 'Makassar',
                'birth_date' => '1995-01-20',
                'national_number' => '7371012001950008',
                'identity_type' => 'KTP',
                'identity_number' => '7371012001950008',
                'mobile_number' => '08123456008',
                'email' => 'andi.saputra@company.com',
                'address' => 'Jl. Pettarani No. 45, Makassar',
                'postal_code' => '90222',
                'degree' => 'S1 Manajemen',
                'contract_id' => $midLevel,         // Mid-Level
                'position_id' => $staff,            // Staff
                'department_id' => $surabaya,
                'center_id' => $salesCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2020-06-01',
                'is_active' => true,
                'basic_salary' => 10000000,
                'ptkp_status' => 'K/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '8901234567',
                'bank_account_holder' => 'Andi Saputra',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-009',
                'barcode' => 'AII9',
                'first_name' => 'Siti',
                'last_name' => 'Nurhaliza',
                'father_name' => 'Ahmad',
                'mother_name' => 'Fatimah',
                'gender' => 0,
                'birth_and_place' => 'Bogor, 12 Desember 1991',
                'birth_place' => 'Bogor',
                'birth_date' => '1991-12-12',
                'national_number' => '3201011212910009',
                'identity_type' => 'KTP',
                'identity_number' => '3201011212910009',
                'mobile_number' => '08123456009',
                'email' => 'siti.nurhaliza@company.com',
                'address' => 'Jl. Pajajaran No. 88, Bogor',
                'postal_code' => '16143',
                'degree' => 'S1 Komunikasi',
                'contract_id' => $managerLevel,     // Manager Level
                'position_id' => $manager,          // Manager
                'department_id' => $bandung,
                'center_id' => $customerServiceCenter,
                'employment_status' => 'Permanent',
                'join_date' => '2017-09-01',
                'is_active' => true,
                'basic_salary' => 25000000,
                'ptkp_status' => 'K/2',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BNI',
                'bank_account_number' => '9012345678',
                'bank_account_holder' => 'Siti Nurhaliza',
                'max_leave_allowed' => 12,
                'profile_photo_path' => $defaultPhotoPath,
            ],
            [
                'employee_code' => '000-010',
                'barcode' => 'AII10',
                'first_name' => 'Bintang',
                'last_name' => 'Pratama',
                'father_name' => 'Dedi',
                'mother_name' => 'Lina',
                'gender' => 1,
                'birth_and_place' => 'Depok, 08 Agustus 2000',
                'birth_place' => 'Depok',
                'birth_date' => '2000-08-08',
                'national_number' => '3276010808000010',
                'identity_type' => 'KTP',
                'identity_number' => '3276010808000010',
                'mobile_number' => '08123456010',
                'email' => 'bintang.pratama@company.com',
                'address' => 'Jl. Margonda No. 100, Depok',
                'postal_code' => '16424',
                'degree' => 'S1 Teknik Informatika',
                'contract_id' => $internLevel,      // Intern
                'position_id' => $intern,           // Intern
                'department_id' => $bintaro,
                'center_id' => $itCenter,
                'employment_status' => 'Intern',
                'join_date' => '2024-01-15',
                'is_active' => true,
                'basic_salary' => 4500000,
                'ptkp_status' => 'TK/0',
                'tax_configuration' => 'Gross',
                'salary_type' => 'Monthly',
                'bank_name' => 'BCA',
                'bank_account_number' => '0123456789',
                'bank_account_holder' => 'Bintang Pratama',
                'max_leave_allowed' => 6,
                'profile_photo_path' => $defaultPhotoPath,
            ],
        ];

        foreach ($employees as $emp) {
            Employee::firstOrCreate(
                ['national_number' => $emp['national_number']],
                $emp
            );
        }

        $this->command->info('✅ Employees seeded: ' . Employee::count() . ' records');
    }
}

