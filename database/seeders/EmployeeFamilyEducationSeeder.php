<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeFamilyEducationSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        // Sample data pools for generating realistic dummy data
        $familyNames = [
            'Ahmad',
            'Budi',
            'Dewi',
            'Eka',
            'Fajar',
            'Gita',
            'Hadi',
            'Indah',
            'Joko',
            'Kartika',
            'Lestari',
            'Maya',
            'Ningsih',
            'Omar',
            'Putri',
            'Ratna',
            'Sari',
            'Tono',
            'Utami',
            'Wahyu',
            'Yuni',
            'Zainal'
        ];

        $jobs = [
            'Guru',
            'Dokter',
            'Pengusaha',
            'PNS',
            'Ibu Rumah Tangga',
            'Pensiunan',
            'Wiraswasta',
            'Karyawan Swasta',
            'Petani',
            'Pedagang',
            'Mahasiswa',
            'Perawat',
            'Polisi',
            'TNI',
            'Dosen',
            'Arsitek',
            'Akuntan'
        ];

        $institutions = [
            'Universitas Indonesia',
            'Institut Teknologi Bandung',
            'Universitas Gadjah Mada',
            'Universitas Airlangga',
            'Institut Pertanian Bogor',
            'Universitas Padjadjaran',
            'Universitas Diponegoro',
            'Universitas Hasanuddin',
            'Universitas Brawijaya',
            'Universitas Sebelas Maret',
            'STMIK Jakarta',
            'Politeknik Negeri Jakarta',
            'SMK Negeri 1',
            'SMA Negeri 1',
            'SMP Negeri 1'
        ];

        $majors = [
            'Teknik Informatika',
            'Sistem Informasi',
            'Manajemen',
            'Akuntansi',
            'Teknik Elektro',
            'Psikologi',
            'Hukum',
            'Komunikasi',
            'Ekonomi',
            'Teknik Sipil',
            'Farmasi',
            'Kedokteran',
            'Sastra Inggris',
            'Desain Grafis'
        ];

        $trainingNames = [
            'Leadership Development Program',
            'Project Management Professional',
            'Digital Marketing Fundamentals',
            'Microsoft Excel Advanced',
            'Public Speaking & Communication',
            'Time Management Workshop',
            'Customer Service Excellence',
            'Data Analysis with Python',
            'Agile & Scrum Methodology',
            'Financial Planning Workshop',
            'Human Resource Management',
            'Effective Presentation Skills'
        ];

        $trainingProviders = [
            'PT Training Indonesia',
            'Prasetiya Mulya',
            'LSPR',
            'Binus Center',
            'LinkedIn Learning',
            'Google Digital Garage',
            'Coursera',
            'Dicoding',
            'Glints Academy',
            'RevoU',
            'Hacktiv8',
            'Purwadhika'
        ];

        $companies = [
            'PT Telkom Indonesia',
            'PT Bank Mandiri',
            'PT Astra International',
            'PT Unilever Indonesia',
            'PT HM Sampoerna',
            'PT Pertamina',
            'PT Bank BCA',
            'PT Indofood',
            'PT XL Axiata',
            'PT Kalbe Farma',
            'PT Tokopedia',
            'PT Gojek Indonesia',
            'PT Shopee Indonesia'
        ];

        $positions = [
            'Staff',
            'Senior Staff',
            'Junior Manager',
            'Manager',
            'Supervisor',
            'Team Lead',
            'Analyst',
            'Specialist',
            'Coordinator',
            'Assistant'
        ];

        foreach ($employees as $employee) {
            // Generate Family Members (2-4 per employee)
            $familyMembers = [];
            $numFamily = rand(2, 4);

            // Always add parents
            $familyMembers[] = [
                'full_name' => $familyNames[array_rand($familyNames)] . ' ' . substr($employee->last_name, 0, 1) . '.',
                'relationship' => 'Father',
                'birth_date' => date('Y-m-d', strtotime('-' . rand(50, 65) . ' years')),
                'id_number' => '31740' . rand(10000000000, 99999999999),
                'gender' => 'male',
                'job' => $jobs[array_rand($jobs)]
            ];

            $familyMembers[] = [
                'full_name' => $familyNames[array_rand($familyNames)] . ' ' . substr($employee->last_name, 0, 1) . '.',
                'relationship' => 'Mother',
                'birth_date' => date('Y-m-d', strtotime('-' . rand(48, 63) . ' years')),
                'id_number' => '31740' . rand(10000000000, 99999999999),
                'gender' => 'female',
                'job' => $jobs[array_rand($jobs)]
            ];

            // Maybe add spouse
            if (rand(0, 1) && in_array($employee->ptkp_status, ['K/0', 'K/1', 'K/2', 'K/3'])) {
                $spouseGender = $employee->gender == 1 ? 'female' : 'male';
                $familyMembers[] = [
                    'full_name' => $familyNames[array_rand($familyNames)] . ' ' . $employee->last_name,
                    'relationship' => 'Spouse',
                    'birth_date' => date('Y-m-d', strtotime('-' . rand(25, 40) . ' years')),
                    'id_number' => '31740' . rand(10000000000, 99999999999),
                    'gender' => $spouseGender,
                    'job' => $jobs[array_rand($jobs)]
                ];
            }

            // Maybe add child
            if (rand(0, 1) && in_array($employee->ptkp_status, ['K/1', 'K/2', 'K/3', 'TK/1', 'TK/2'])) {
                $familyMembers[] = [
                    'full_name' => $familyNames[array_rand($familyNames)] . ' ' . $employee->last_name,
                    'relationship' => 'Child',
                    'birth_date' => date('Y-m-d', strtotime('-' . rand(1, 15) . ' years')),
                    'id_number' => rand(0, 1) ? ('31740' . rand(10000000000, 99999999999)) : '',
                    'gender' => rand(0, 1) ? 'male' : 'female',
                    'job' => rand(0, 1) ? 'Mahasiswa' : 'Pelajar'
                ];
            }

            // Generate Emergency Contacts (1-2 per employee)
            $emergencyContacts = [];
            $emergencyContacts[] = [
                'name' => $familyMembers[0]['full_name'],
                'relationship' => $familyMembers[0]['relationship'],
                'phone' => '08' . rand(1000000000, 9999999999)
            ];

            if (rand(0, 1) && count($familyMembers) > 1) {
                $emergencyContacts[] = [
                    'name' => $familyMembers[1]['full_name'],
                    'relationship' => $familyMembers[1]['relationship'],
                    'phone' => '08' . rand(1000000000, 9999999999)
                ];
            }

            // Generate Education History (1-3 per employee)
            $education = [];
            $degrees = ['SMA/SMK', 'D3', 'S1/D4', 'S2'];
            $numEducation = rand(1, 3);
            $startYear = rand(2000, 2010);

            foreach (array_slice($degrees, 0, $numEducation) as $index => $grade) {
                $endYear = $startYear + ($grade === 'SMA/SMK' ? 3 : ($grade === 'D3' ? 3 : 4));
                $education[] = [
                    'grade' => $grade,
                    'institution' => $institutions[array_rand($institutions)],
                    'major' => $grade === 'SMA/SMK' ? 'IPA' : $majors[array_rand($majors)],
                    'start_year' => (string) $startYear,
                    'end_year' => (string) $endYear,
                    'gpa' => number_format(rand(275, 400) / 100, 2)
                ];
                $startYear = $endYear + 1;
            }

            // Generate Training & Courses (1-3 per employee)
            $trainingCourses = [];
            $numTraining = rand(1, 3);

            for ($i = 0; $i < $numTraining; $i++) {
                $startDate = date('Y-m-d', strtotime('-' . rand(30, 365 * 3) . ' days'));
                $duration = rand(1, 5);
                $endDate = date('Y-m-d', strtotime($startDate . ' + ' . $duration . ' days'));

                $trainingCourses[] = [
                    'name' => $trainingNames[array_rand($trainingNames)],
                    'held_by' => $trainingProviders[array_rand($trainingProviders)],
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'duration' => $duration . ' days',
                    'fee' => rand(5, 50) * 100000,
                    'certificate' => rand(0, 1) ? true : false
                ];
            }

            // Generate Work Experience (0-3 per employee based on join date)
            $workExperience = [];
            $joinYear = date('Y', strtotime($employee->join_date));
            $numExperience = rand(0, min(3, $joinYear - 2015)); // Limit based on realistic work history

            if ($numExperience > 0) {
                $currentYear = $joinYear;
                for ($i = 0; $i < $numExperience; $i++) {
                    $yearsAtJob = rand(1, 3);
                    $fromYear = $currentYear - $yearsAtJob - rand(0, 1);

                    $workExperience[] = [
                        'company' => $companies[array_rand($companies)],
                        'position' => $positions[array_rand($positions)],
                        'from' => $fromYear . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-01',
                        'to' => ($fromYear + $yearsAtJob) . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-28'
                    ];

                    $currentYear = $fromYear;
                }
            }

            // Update employee with all the data
            $employee->update([
                'family_members' => $familyMembers,
                'emergency_contacts' => $emergencyContacts,
                'education' => $education,
                'training_courses' => $trainingCourses,
                'work_experience' => $workExperience,
            ]);
        }

        $this->command->info('✅ Family, Emergency Contacts, Education, Training & Work Experience seeded for ' . $employees->count() . ' employees');
    }
}
