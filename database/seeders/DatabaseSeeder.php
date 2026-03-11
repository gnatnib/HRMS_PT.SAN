<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeds in order of dependency
        $this->call([
            DivisionPositionBranchSeeder::class,
            EmployeesSeeder::class,
            EmployeeFamilyEducationSeeder::class,
            TimelineSeeder::class,
            AdminUserSeeder::class,
            AnnouncementSeeder::class,
        ]);

        // Create role (if not exists)
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        // Assign role
        $admin = User::find(1);
        if ($admin) {
            $admin->assignRole($adminRole);
        }
    }
}
