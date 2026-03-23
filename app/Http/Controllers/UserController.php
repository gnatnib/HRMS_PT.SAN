<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all()->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->getRoleNames()->first() ?? 'admin',
            'is_active' => $user->is_active ?? true,
            'employee_id' => $user->employee_id,
            'employee_name' => $user->employee ? trim($user->employee->first_name . ' ' . ($user->employee->last_name ?? '')) : null,
            'last_login' => $user->last_login?->diffForHumans() ?? null,
            'last_activity' => $user->last_activity?->diffForHumans() ?? null,
        ]);

        // Get employees for linking dropdown (only those not linked yet)
        $linkedEmployeeIds = User::whereNotNull('employee_id')->pluck('employee_id')->toArray();
        $availableEmployees = Employee::whereNotIn('id', $linkedEmployeeIds)
            ->select('id', 'first_name', 'last_name', 'employee_code')
            ->orderBy('first_name')
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'name' => trim($e->first_name . ' ' . ($e->last_name ?? '')) . ' (' . $e->employee_code . ')',
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::all()->pluck('name'),
            'availableEmployees' => $availableEmployees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'nullable|string|max:255|unique:users,username',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role' => 'required|string|in:direktur_utama,superadmin,admin',
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'password' => Hash::make($validated['password']),
            'employee_id' => $validated['employee_id'] ?? null,
            'profile_photo_path' => 'profile-photos/.default-photo.jpg',
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        ActivityLog::log('created', 'user', "Menambahkan user: {$user->name} ({$validated['role']})", $user);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'password' => ['nullable', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role' => 'required|string|in:direktur_utama,superadmin,admin',
            'employee_id' => 'nullable|exists:employees,id',
            'is_active' => 'nullable|boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'employee_id' => $validated['employee_id'] ?? null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        ActivityLog::log('updated', 'user', "Update user: {$user->name}", $user);

        return redirect()->route('users.index')->with('success', 'User berhasil diupdate.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        ActivityLog::log('deleted', 'user', "Menghapus user: {$user->name}", $user);

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function bulkCreateFromEmployees(Request $request)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
            'role' => 'required|string|in:direktur_utama,superadmin,admin',
            'default_password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()],
        ]);

        $linkedEmployeeIds = User::whereNotNull('employee_id')->pluck('employee_id')->toArray();
        $successCount = 0;
        $errors = [];

        foreach ($validated['employee_ids'] as $empId) {
            if (in_array($empId, $linkedEmployeeIds)) {
                $errors[] = "Employee ID {$empId} sudah memiliki akun user.";
                continue;
            }

            $employee = Employee::find($empId);
            if (!$employee) continue;

            $email = $employee->email;
            if (!$email) {
                $email = strtolower(str_replace(' ', '.', $employee->first_name)) . '.' . $employee->id . '@company.local';
            }

            // Check if email exists
            if (User::where('email', $email)->exists()) {
                $email = 'emp' . $employee->id . '.' . $email;
            }

            $user = User::create([
                'name' => trim($employee->first_name . ' ' . ($employee->last_name ?? '')),
                'email' => $email,
                'employee_id' => $employee->id,
                'password' => Hash::make($validated['default_password']),
                'profile_photo_path' => 'profile-photos/.default-photo.jpg',
                'is_active' => true,
            ]);

            $user->assignRole($validated['role']);
            $successCount++;
        }

        ActivityLog::log('created', 'user', "Bulk create user dari employees: {$successCount} berhasil");

        $message = "{$successCount} user berhasil dibuat.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " gagal.";
        }

        return redirect()->route('users.index')->with('success', $message);
    }
}
