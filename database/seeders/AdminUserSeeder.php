<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first employee (should be created by DummyDataSeeder)
        $employee = Employee::first();

        User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Administrator',
                'employee_id' => $employee?->id ?? null,
                'email' => 'admin@demo.com',
                'password' => bcrypt('admin'),
                'profile_photo_path' => 'profile-photos/.default-photo.jpg',
            ]
        );
    }
}
