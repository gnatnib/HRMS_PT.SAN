<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');

        // Simplified query that avoids non-existent columns
        $query = Employee::with(['contract:id,name'])
            ->select('id', 'first_name', 'last_name', 'mobile_number', 'is_active', 'profile_photo_path', 'contract_id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== '') {
            $query->where('is_active', $status === 'active');
        }

        $employees = $query->orderBy('first_name')->paginate(20);

        // Get departments if they exist
        $departments = [];
        try {
            $departments = Department::select('id', 'name')->get();
        } catch (\Exception $e) {
            // Table might not exist or have issues
        }

        // Get positions if they exist
        $positions = [];
        try {
            $positions = Position::select('id', 'name')->get();
        } catch (\Exception $e) {
            // Table might not exist or have issues
        }

        $stats = [
            'total' => Employee::count(),
            'active' => Employee::where('is_active', true)->count(),
            'inactive' => Employee::where('is_active', false)->count(),
        ];

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'positions' => $positions,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $contracts = Contract::select('id', 'name')->get();

        return Inertia::render('Employees/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'contracts' => $contracts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'mobile_number' => 'nullable|string|max:20',
            'national_number' => 'nullable|string|max:30',
            'gender' => 'required|in:male,female',
            'address' => 'nullable|string|max:500',
            'birth_and_place' => 'nullable|string|max:200',
            'degree' => 'nullable|string|max:100',
            'contract_id' => 'nullable|exists:contracts,id',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('employees', 'public');
        }

        $validated['is_active'] = true;
        $validated['balance_leave_allowed'] = $validated['max_leave_allowed'] ?? 12;

        $employee = Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil ditambahkan!');
    }

    public function show(Employee $employee)
    {
        $employee->load([
            'contract.department',
            'contract.position',
            'fingerprints' => fn($q) => $q->orderByDesc('date')->limit(10),
            'leaves' => fn($q) => $q->orderByDesc('pivot_created_at')->limit(10),
        ]);

        return Inertia::render('Employees/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $contracts = Contract::select('id', 'name')->get();

        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'contracts' => $contracts,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'mobile_number' => 'nullable|string|max:20',
            'national_number' => 'nullable|string|max:30',
            'gender' => 'required|in:male,female',
            'address' => 'nullable|string|max:500',
            'birth_and_place' => 'nullable|string|max:200',
            'degree' => 'nullable|string|max:100',
            'contract_id' => 'nullable|exists:contracts,id',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',
            'is_active' => 'boolean',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            // Delete old photo
            if ($employee->profile_photo_path) {
                Storage::disk('public')->delete($employee->profile_photo_path);
            }
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('employees', 'public');
        }

        $employee->update($validated);

        return redirect()->route('employees.index')->with('success', 'Data karyawan berhasil diupdate!');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->profile_photo_path) {
            Storage::disk('public')->delete($employee->profile_photo_path);
        }

        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil dihapus!');
    }

    public function export(Request $request)
    {
        // Export to CSV
        $employees = Employee::with(['contract.department', 'contract.position'])->get();

        $csvData = [];
        $csvData[] = ['ID', 'Nama', 'No. HP', 'Department', 'Jabatan', 'Status'];

        foreach ($employees as $emp) {
            $csvData[] = [
                $emp->id,
                $emp->first_name . ' ' . $emp->last_name,
                $emp->mobile_number,
                $emp->contract?->department?->name ?? '-',
                $emp->contract?->position?->name ?? '-',
                $emp->is_active ? 'Aktif' : 'Tidak Aktif',
            ];
        }

        $filename = 'employees_' . now()->format('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w');
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
