<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            'direktur_utama' => User::where('email', 'dirut@sanhrms.com')->first(),
            'superadmin' => User::where('email', 'superadmin@sanhrms.com')->first(),
            'admin' => User::where('email', 'admin@sanhrms.com')->first(),
        ];

        $items = [
            [
                'title' => 'Kickoff evaluasi Q1 2026',
                'content' => "Seluruh kepala divisi diminta menyiapkan ringkasan capaian tim untuk evaluasi Q1 2026. Presentasi internal dijadwalkan pada Jumat pukul 13.30 WIB di ruang meeting utama.",
                'author_key' => 'direktur_utama',
                'created_at' => Carbon::now()->subDays(5)->setTime(9, 15),
            ],
            [
                'title' => 'Pembaruan data payroll karyawan',
                'content' => "Tim HR diminta memastikan data BPJS, NPWP, dan rekening bank karyawan sudah terisi lengkap di sistem HRMS sebelum proses penutupan payroll bulan ini.",
                'author_key' => 'admin',
                'created_at' => Carbon::now()->subDays(3)->setTime(14, 10),
            ],
            [
                'title' => 'Sosialisasi fitur employee management',
                'content' => "Versi terbaru HRMS sudah mendukung pengelolaan data karyawan yang lebih rapi. Seluruh user dapat melihat pengumuman ini dan menggunakan dashboard untuk memantau update perusahaan.",
                'author_key' => 'superadmin',
                'created_at' => Carbon::now()->subDays(2)->setTime(10, 0),
            ],
            [
                'title' => 'Jadwal onboarding batch Maret',
                'content' => "Karyawan baru batch Maret akan mengikuti sesi onboarding pada Senin depan pukul 09.00 WIB. Mohon PIC masing-masing divisi menyiapkan kebutuhan workstation sebelum hari H.",
                'author_key' => 'admin',
                'created_at' => Carbon::now()->subDay()->setTime(16, 20),
            ],
            [
                'title' => 'Town hall bulanan perusahaan',
                'content' => "Town hall bulanan akan dilaksanakan secara hybrid pada akhir bulan. Agenda utama mencakup update bisnis, progres proyek internal, dan apresiasi karyawan dengan performa terbaik.",
                'author_key' => 'direktur_utama',
                'created_at' => Carbon::now()->setTime(8, 45),
            ],
        ];

        foreach ($items as $item) {
            $author = $authors[$item['author_key']] ?? null;
            $roleName = ($author && method_exists($author, 'getRoleNames'))
                ? ($author->getRoleNames()->first() ?? 'user')
                : 'user';

            Announcement::updateOrCreate(
                ['title' => $item['title']],
                [
                    'content' => $item['content'],
                    'created_by_user_id' => $author?->id,
                    'created_by_name' => $author?->name ?? 'System',
                    'created_by_role' => $roleName,
                    'is_active' => true,
                    'created_at' => $item['created_at'],
                    'updated_at' => $item['created_at'],
                ]
            );
        }

        $this->command->info('✅ Announcement seeded: ' . Announcement::count() . ' records');
    }
}
