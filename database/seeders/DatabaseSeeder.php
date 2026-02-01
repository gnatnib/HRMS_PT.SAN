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
            DivisionPositionBranchSeeder::class, // Creates divisions (centers), positions, branches (departments), job levels (contracts)
            ContractsSeeder::class,    // Creates contracts first (may be redundant, but kept for backward compatibility)
            EmployeesSeeder::class,    // Creates sample employees (needs contracts)
            TimelineSeeder::class,     // Creates timeline entries
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
