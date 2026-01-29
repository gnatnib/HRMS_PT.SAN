<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
        // Use existing working seeders
        $this->call([
            ContractsSeeder::class,    // Creates contracts first
            EmployeesSeeder::class,    // Creates employees (needs contracts)
            CenterSeeder::class,
            DepartmentSeeder::class,
            PositionSeeder::class,
            TimelineSeeder::class,
            AdminUserSeeder::class,    // Creates admin user linked to first employee
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
