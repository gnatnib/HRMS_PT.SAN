<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $dirut = Role::firstOrCreate(['name' => 'direktur_utama', 'guard_name' => 'web']);
        $superadmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // 1. Direktur Utama account
        $dirutUser = User::firstOrCreate(
            ['email' => 'dirut@sanhrms.com'],
            [
                'name' => 'Direktur Utama',
                'username' => 'dirut',
                'email' => 'dirut@sanhrms.com',
                'password' => bcrypt('password'),
                'profile_photo_path' => 'profile-photos/.default-photo.jpg',
            ]
        );
        $dirutUser->syncRoles([$dirut]);

        // 2. Superadmin account
        $superadminUser = User::firstOrCreate(
            ['email' => 'superadmin@sanhrms.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'superadmin@sanhrms.com',
                'password' => bcrypt('password'),
                'profile_photo_path' => 'profile-photos/.default-photo.jpg',
            ]
        );
        $superadminUser->syncRoles([$superadmin]);

        // 3. Admin (HR) account
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@sanhrms.com'],
            [
                'name' => 'Admin HR',
                'username' => 'admin',
                'email' => 'admin@sanhrms.com',
                'password' => bcrypt('password'),
                'profile_photo_path' => 'profile-photos/.default-photo.jpg',
            ]
        );
        $adminUser->syncRoles([$admin]);
    }
}
