<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\JobOpening;
use Illuminate\Database\Seeder;

class RecruitmentSeeder extends Seeder
{
    public function run(): void
    {
        // Job Openings
        $jobs = [
            JobOpening::create([
                'title' => 'Staff Accounting',
                'department' => 'Finance',
                'description' => 'Bertanggung jawab untuk pencatatan transaksi keuangan, rekonsiliasi bank, dan penyusunan laporan keuangan bulanan.',
                'requirements' => "- S1 Akuntansi\n- Pengalaman min. 1 tahun\n- Menguasai Excel & software akuntansi\n- Teliti dan detail oriented",
                'urgency' => 'high',
                'status' => 'open',
                'vacancy_count' => 2,
                'location' => 'Jakarta',
                'employment_type' => 'Full-time',
            ]),
            JobOpening::create([
                'title' => 'Frontend Developer',
                'department' => 'IT',
                'description' => 'Mengembangkan dan memelihara aplikasi web perusahaan menggunakan React dan modern frontend stack.',
                'requirements' => "- S1 Teknik Informatika/sejenis\n- Pengalaman min. 2 tahun React.js\n- Familiar dengan Tailwind CSS\n- Memahami REST API",
                'urgency' => 'medium',
                'status' => 'open',
                'vacancy_count' => 1,
                'location' => 'Jakarta',
                'employment_type' => 'Full-time',
            ]),
            JobOpening::create([
                'title' => 'HR Admin',
                'department' => 'HR',
                'description' => 'Mengelola administrasi karyawan, absensi, cuti, dan dokumen kepegawaian.',
                'requirements' => "- S1 Manajemen/Psikologi\n- Pengalaman min. 1 tahun di bidang HR\n- Menguasai MS Office",
                'urgency' => 'low',
                'status' => 'open',
                'vacancy_count' => 1,
                'location' => 'Bandung',
                'employment_type' => 'Full-time',
            ]),
        ];

        // Candidates
        $candidates = [
            // Applied
            ['name' => 'Andi Saputra', 'email' => 'andi.s@email.com', 'phone' => '081234567890', 'position' => 'Staff Accounting', 'source' => 'JobStreet', 'stage' => 'applied', 'applied_date' => '2026-03-10', 'job_opening_id' => $jobs[0]->id],
            ['name' => 'Siti Rahayu', 'email' => 'siti.r@email.com', 'phone' => '081234567891', 'position' => 'Staff Accounting', 'source' => 'LinkedIn', 'stage' => 'applied', 'applied_date' => '2026-03-15', 'job_opening_id' => $jobs[0]->id],
            ['name' => 'Dian Permata', 'email' => 'dian.p@email.com', 'phone' => '081234567892', 'position' => 'Frontend Developer', 'source' => 'Glints', 'stage' => 'applied', 'applied_date' => '2026-03-18', 'job_opening_id' => $jobs[1]->id],

            // Screening
            ['name' => 'Budi Hartono', 'email' => 'budi.h@email.com', 'phone' => '081234567893', 'position' => 'Staff Accounting', 'source' => 'Referral', 'stage' => 'screening', 'applied_date' => '2026-03-05', 'job_opening_id' => $jobs[0]->id],
            ['name' => 'Rina Wulandari', 'email' => 'rina.w@email.com', 'phone' => '081234567894', 'position' => 'Frontend Developer', 'source' => 'LinkedIn', 'stage' => 'screening', 'applied_date' => '2026-03-08', 'job_opening_id' => $jobs[1]->id],

            // Interview
            ['name' => 'Fajar Nugroho', 'email' => 'fajar.n@email.com', 'phone' => '081234567895', 'position' => 'Staff Accounting', 'source' => 'JobStreet', 'stage' => 'interview', 'applied_date' => '2026-02-28', 'job_opening_id' => $jobs[0]->id],
            ['name' => 'Maya Sari', 'email' => 'maya.s@email.com', 'phone' => '081234567896', 'position' => 'HR Admin', 'source' => 'Indeed', 'stage' => 'interview', 'applied_date' => '2026-03-01', 'job_opening_id' => $jobs[2]->id],

            // Offering
            ['name' => 'Rizki Pratama', 'email' => 'rizki.p@email.com', 'phone' => '081234567897', 'position' => 'Frontend Developer', 'source' => 'Referral', 'stage' => 'offering', 'applied_date' => '2026-02-20', 'job_opening_id' => $jobs[1]->id],

            // Hired
            ['name' => 'Dewi Lestari', 'email' => 'dewi.l@email.com', 'phone' => '081234567898', 'position' => 'Staff Accounting', 'source' => 'LinkedIn', 'stage' => 'hired', 'applied_date' => '2026-02-10', 'job_opening_id' => $jobs[0]->id],

            // Rejected
            ['name' => 'Agus Setiawan', 'email' => 'agus.s@email.com', 'phone' => '081234567899', 'position' => 'HR Admin', 'source' => 'Walk-in', 'stage' => 'rejected', 'applied_date' => '2026-02-25', 'rejection_reason' => 'Tidak memenuhi kualifikasi pengalaman minimum', 'job_opening_id' => $jobs[2]->id],
            ['name' => 'Lina Marlina', 'email' => 'lina.m@email.com', 'phone' => '081234567800', 'position' => 'Frontend Developer', 'source' => 'Glints', 'stage' => 'rejected', 'applied_date' => '2026-03-02', 'rejection_reason' => 'Tidak hadir saat interview', 'job_opening_id' => $jobs[1]->id],
        ];

        foreach ($candidates as $data) {
            Candidate::create($data);
        }
    }
}
