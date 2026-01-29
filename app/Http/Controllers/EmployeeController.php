<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Position;
use App\Models\Center;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $branch = $request->get('branch');

        $query = Employee::with(['contract:id,name'])
            ->select(
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'mobile_number',
                'email',
                'is_active',
                'profile_photo_path',
                'contract_id',
                'join_date',
                'basic_salary'
            );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== '') {
            $query->where('is_active', $status === 'active');
        }

        $employees = $query->orderBy('first_name')->paginate(20);

        // Get centers/branches
        $centers = [];
        try {
            $centers = Center::select('id', 'name')->get();
        } catch (\Exception $e) {
        }

        $departments = [];
        try {
            $departments = Department::select('id', 'name')->get();
        } catch (\Exception $e) {
        }

        $positions = [];
        try {
            $positions = Position::select('id', 'name')->get();
        } catch (\Exception $e) {
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
            'centers' => $centers,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'branch' => $branch,
            ],
        ]);
    }

    public function create()
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $contracts = Contract::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Employees/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'contracts' => $contracts,
            'centers' => $centers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'father_name' => 'nullable|string|max:100',
            'mother_name' => 'nullable|string|max:100',
            'mobile_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'national_number' => 'nullable|string|max:30',
            'gender' => 'required|in:male,female',
            'address' => 'nullable|string|max:500',
            'birth_and_place' => 'nullable|string|max:200',
            'degree' => 'nullable|string|max:100',
            // Employment
            'employee_code' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|max:50',
            'contract_id' => 'nullable|exists:contracts,id',
            'join_date' => 'nullable|date',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',
            // Payroll
            'basic_salary' => 'nullable|numeric|min:0',
            'ptkp_status' => 'nullable|string|max:10',
            'tax_configuration' => 'nullable|string|max:20',
            'prorate_type' => 'nullable|string|max:50',
            'salary_type' => 'nullable|string|max:20',
            'salary_configuration' => 'nullable|string|max:20',
            'overtime_status' => 'nullable|string|max:20',
            'employee_tax_status' => 'nullable|string|max:30',
            'jht_configuration' => 'nullable|string|max:20',
            'bpjs_kesehatan_config' => 'nullable|string|max:30',
            'jaminan_pensiun_config' => 'nullable|string|max:20',
            // Bank
            'bank_name' => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_account_holder' => 'nullable|string|max:100',
            // Photo
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('employees', 'public');
        }

        $validated['is_active'] = true;
        $validated['balance_leave_allowed'] = $validated['max_leave_allowed'] ?? 12;

        // Auto-generate employee code if empty
        if (empty($validated['employee_code'])) {
            $lastId = Employee::max('id') ?? 0;
            $validated['employee_code'] = 'EMP-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
        }

        Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil ditambahkan!');
    }

    public function show(Employee $employee)
    {
        $employee->load([
            'contract',
            'timelines' => fn($q) => $q->with(['center', 'department', 'position'])->latest()->limit(1),
            'fingerprints' => fn($q) => $q->orderByDesc('date')->limit(10),
            'leaves' => fn($q) => $q->withPivot('from_date', 'to_date', 'is_authorized', 'note')->limit(10),
        ]);

        // Get latest timeline for current assignment
        $employee->timeline = $employee->timelines->first();

        return Inertia::render('Employees/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $contracts = Contract::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'contracts' => $contracts,
            'centers' => $centers,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            // Personal
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'father_name' => 'nullable|string|max:100',
            'mother_name' => 'nullable|string|max:100',
            'mobile_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'national_number' => 'nullable|string|max:30',
            'gender' => 'required|in:male,female',
            'address' => 'nullable|string|max:500',
            'birth_and_place' => 'nullable|string|max:200',
            'degree' => 'nullable|string|max:100',
            // Employment
            'employee_code' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|max:50',
            'contract_id' => 'nullable|exists:contracts,id',
            'join_date' => 'nullable|date',
            'is_active' => 'boolean',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',
            // Payroll
            'basic_salary' => 'nullable|numeric|min:0',
            'ptkp_status' => 'nullable|string|max:10',
            'tax_configuration' => 'nullable|string|max:20',
            'prorate_type' => 'nullable|string|max:50',
            'salary_type' => 'nullable|string|max:20',
            'salary_configuration' => 'nullable|string|max:20',
            'overtime_status' => 'nullable|string|max:20',
            'employee_tax_status' => 'nullable|string|max:30',
            'jht_configuration' => 'nullable|string|max:20',
            'bpjs_kesehatan_config' => 'nullable|string|max:30',
            'jaminan_pensiun_config' => 'nullable|string|max:20',
            // Bank
            'bank_name' => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_account_holder' => 'nullable|string|max:100',
            // Photo
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

        return redirect()->route('employees.show', $employee)->with('success', 'Data karyawan berhasil diupdate!');
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
        $employees = Employee::with(['contract'])->get();

        $csvData = [];
        $csvData[] = ['Employee ID', 'Name', 'Phone', 'Email', 'Contract', 'Basic Salary', 'Status'];

        foreach ($employees as $emp) {
            $csvData[] = [
                $emp->employee_code ?? 'EMP-' . str_pad($emp->id, 4, '0', STR_PAD_LEFT),
                $emp->first_name . ' ' . $emp->last_name,
                $emp->mobile_number ?? '-',
                $emp->email ?? '-',
                $emp->contract?->name ?? '-',
                $emp->basic_salary ?? 0,
                $emp->is_active ? 'Active' : 'Inactive',
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
