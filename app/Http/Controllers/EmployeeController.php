<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use App\Models\Center;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $branch = $request->get('branch');
        $division = $request->get('division');
        $perPage = min((int) ($request->get('per_page', 20)), 100);
        if ($perPage < 1) $perPage = 20;

        $query = Employee::with([
            'position:id,name',
            'department:id,name',
            'center:id,name',
        ])
            ->select(
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'mobile_number',
                'email',
                'is_active',
                'employment_status',
                'profile_photo_path',
                'position_id',
                'department_id',
                'center_id',
                'join_date',
                'basic_salary',
                'barcode'
            );

        $this->applyEmployeeSearch($query, $search);

        $this->applyStatusFilter($query, $status);

        // Branch filter (departments table stores locations/branches)
        if ($branch !== null && $branch !== '') {
            $query->where('department_id', $branch);
        }

        // Division filter (centers table stores divisions)
        if ($division !== null && $division !== '') {
            $query->where('center_id', $division);
        }

        $employees = $query->orderBy('first_name')->paginate($perPage);

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

        // Stats — computed based on current filters (except status filter)
        $statsQuery = Employee::query();
        $this->applyEmployeeSearch($statsQuery, $search);
        if ($branch !== null && $branch !== '') {
            $statsQuery->where('department_id', $branch);
        }
        if ($division !== null && $division !== '') {
            $statsQuery->where('center_id', $division);
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'active' => (clone $statsQuery)->where('employment_status', 'Aktif')->count(),
            'terminated' => (clone $statsQuery)->where('employment_status', 'Terminated')->count(),
            'permission' => (clone $statsQuery)->where('employment_status', 'Izin')->count(),
            'probation' => (clone $statsQuery)->where('employment_status', 'Masa Percobaan')->count(),
            'on_leave' => (clone $statsQuery)->where('employment_status', 'Cuti')->count(),
            'business_trip' => (clone $statsQuery)->where('employment_status', 'Dinas Luar')->count(),
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
                'division' => $division,
                'per_page' => $perPage,
            ],
        ]);
    }


    public function create()
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Employees/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'centers' => $centers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal Data
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'mobile_number' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'identity_type' => 'nullable|string|max:20',
            'identity_number' => 'nullable|string|max:50',
            'identity_expired_date' => 'nullable|date',
            'identity_permanent' => 'boolean',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'postal_code' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',

            // Employment Data
            'employee_code' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|max:50',
            'center_id' => 'nullable|exists:centers,id',
            'position_id' => 'nullable|exists:positions,id',
            'department_id' => 'nullable|exists:departments,id',
            'employment_status' => 'nullable|string|max:30',
            'employee_status' => 'nullable|string|max:30',
            'status_reason' => 'nullable|string|max:100',
            'status_notes' => 'nullable|string|max:1000',
            'contract_id' => 'nullable|exists:contracts,id',
            'join_date' => 'nullable|date|before_or_equal:today',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',

            // Family Info (JSON arrays)
            'family_data' => 'nullable|array',
            'family_data.*.full_name' => 'nullable|string|max:100',
            'family_data.*.relationship' => 'nullable|string|max:50',
            'family_data.*.birth_date' => 'nullable|date',
            'family_data.*.id_number' => 'nullable|string|max:50',
            'family_data.*.gender' => 'nullable|in:male,female',
            'family_data.*.job' => 'nullable|string|max:100',
            'emergency_contacts' => 'nullable|array',
            'emergency_contacts.*.name' => 'nullable|string|max:100',
            'emergency_contacts.*.relationship' => 'nullable|string|max:50',
            'emergency_contacts.*.phone' => 'nullable|string|max:20',

            // Education Info (JSON arrays)
            'education_history' => 'nullable|array',
            'education_history.*.grade' => 'nullable|string|max:20',
            'education_history.*.institution' => 'nullable|string|max:100',
            'education_history.*.major' => 'nullable|string|max:100',
            'education_history.*.start_year' => 'nullable|string|max:4',
            'education_history.*.end_year' => 'nullable|string|max:4',
            'education_history.*.gpa' => 'nullable|string|max:10',
            'work_experience' => 'nullable|array',
            'work_experience.*.company' => 'nullable|string|max:100',
            'work_experience.*.position' => 'nullable|string|max:100',
            'work_experience.*.from' => 'nullable|date',
            'work_experience.*.to' => 'nullable|date',

            // Payroll
            'basic_salary' => 'nullable|numeric|min:0',
            'ptkp_status' => 'nullable|string|max:10',
            'tax_configuration' => 'nullable|string|max:20',
            'prorate_type' => 'nullable|string|max:50',
            'count_holiday_as_working_day' => 'nullable|boolean',
            'salary_type' => 'nullable|string|max:20',
            'salary_configuration' => 'nullable|string|max:20',
            'taxable_date' => 'nullable|date',
            'overtime_status' => 'nullable|string|max:20',
            'employee_tax_status' => 'nullable|string|max:30',
            'jht_configuration' => 'nullable|string|max:20',
            'bpjs_kesehatan_config' => 'nullable|string|max:30',
            'jaminan_pensiun_config' => 'nullable|string|max:20',
            'bpjs_ketenagakerjaan' => 'nullable|string|max:50',
            'bpjs_kesehatan' => 'nullable|string|max:50',
            'bpjs_kesehatan_family' => 'nullable|string|max:5',
            'npwp' => 'nullable|string|max:30',
            'currency' => 'nullable|string|max:10',
            'bpjs_ketenagakerjaan_date' => 'nullable|date',
            'bpjs_kesehatan_date' => 'nullable|date',
            'jaminan_pensiun_date' => 'nullable|date',

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

        // Map new fields to existing database columns
        if (!empty($validated['identity_number'])) {
            $validated['national_number'] = $validated['identity_number'];
        }
        if (!empty($validated['birth_place']) || !empty($validated['birth_date'])) {
            $place = $validated['birth_place'] ?? '';
            $date = !empty($validated['birth_date']) ? date('d F Y', strtotime($validated['birth_date'])) : '';
            $validated['birth_and_place'] = trim("$place, $date", ', ');
        }

        // Map family_data to family_members column (JSON)
        if (!empty($validated['family_data'])) {
            $validated['family_members'] = $validated['family_data'];
        }
        // emergency_contacts stays as is (already matches column name)

        // Map education_history to education column (JSON)
        if (!empty($validated['education_history'])) {
            $validated['education'] = $validated['education_history'];
        }

        if (array_key_exists('identity_permanent', $validated)) {
            $validated['is_permanent_identity'] = (bool) $validated['identity_permanent'];
        }

        // Clean up non-database fields (only remove fields without DB columns)
        unset(
            $validated['identity_permanent'],
            $validated['family_data'],
            $validated['education_history'],
            $validated['work_experience'],
            $validated['profile_photo']
        );

        // Convert gender string to boolean (male=1, female=0) for database
        $validated['gender'] = $validated['gender'] === 'male' ? 1 : 0;

        // Handle employee_status -> is_active + employment_status mapping
        if (isset($validated['employee_status'])) {
            $mapped = $this->resolveEmployeeStatus($validated['employee_status']);
            $validated['is_active'] = $mapped['is_active'];
            $validated['employment_status'] = $mapped['employment_status'];
            if ($validated['employment_status'] === 'Aktif') {
                $validated['status_reason'] = null;
                $validated['status_notes'] = null;
            }
            unset($validated['employee_status']);
        } else {
            $validated['is_active'] = true;
            $validated['employment_status'] = 'Aktif';
        }
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
            'timelines' => fn($q) => $q->with(['center', 'department', 'position'])->latest()->limit(1),
            'fingerprints' => fn($q) => $q->orderByDesc('date')->limit(10),
            'leaves' => fn($q) => $q->withPivot('from_date', 'to_date', 'is_authorized', 'note')->limit(10),
        ]);

        // Get latest timeline for current assignment
        $employee->timeline = $employee->timelines->first();

        // Get dropdown data for Employment Data section
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Employees/Show', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'centers' => $centers,
        ]);
    }

    public function edit(Employee $employee)
    {
        // Redirect to show page with editing flag
        return redirect()->route('employees.show', ['employee' => $employee, 'editing' => 1]);
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
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'identity_type' => 'nullable|string|max:20',
            'identity_number' => 'nullable|string|max:30',
            'identity_expired_date' => 'nullable|date',
            'is_permanent_identity' => 'nullable|boolean',
            'postal_code' => 'nullable|string|max:10',
            'degree' => 'nullable|string|max:100',
            // Employment
            'employee_code' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|max:50',
            'contract_id' => 'nullable|exists:contracts,id',
            'position_id' => 'nullable|exists:positions,id',
            'center_id' => 'nullable|exists:centers,id',
            'department_id' => 'nullable|exists:departments,id',
            'employment_status' => 'nullable|string|max:30',
            'employee_status' => 'nullable|string|max:30',
            'status_reason' => 'nullable|string|max:100',
            'status_notes' => 'nullable|string|max:1000',
            'join_date' => 'nullable|date|before_or_equal:today',
            'is_active' => 'boolean',
            'max_leave_allowed' => 'nullable|integer|min:0|max:30',
            // Payroll
            'basic_salary' => 'nullable|numeric|min:0',
            'ptkp_status' => 'nullable|string|max:10',
            'tax_configuration' => 'nullable|string|max:20',
            'prorate_type' => 'nullable|string|max:50',
            'count_holiday_as_working_day' => 'nullable|boolean',
            'salary_type' => 'nullable|string|max:20',
            'salary_configuration' => 'nullable|string|max:20',
            'taxable_date' => 'nullable|date',
            'overtime_status' => 'nullable|string|max:20',
            'employee_tax_status' => 'nullable|string|max:30',
            'jht_configuration' => 'nullable|string|max:20',
            'bpjs_kesehatan_config' => 'nullable|string|max:30',
            'jaminan_pensiun_config' => 'nullable|string|max:20',
            'bpjs_ketenagakerjaan' => 'nullable|string|max:50',
            'bpjs_kesehatan' => 'nullable|string|max:50',
            'bpjs_kesehatan_family' => 'nullable|string|max:5',
            'npwp' => 'nullable|string|max:30',
            'currency' => 'nullable|string|max:10',
            'bpjs_ketenagakerjaan_date' => 'nullable|date',
            'bpjs_kesehatan_date' => 'nullable|date',
            'jaminan_pensiun_date' => 'nullable|date',
            // Bank
            'bank_name' => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_account_holder' => 'nullable|string|max:100',
            // Photo
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            // JSON arrays for related data
            'family_members' => 'nullable|array',
            'family_members.*.full_name' => 'nullable|string|max:100',
            'family_members.*.relationship' => 'nullable|string|max:50',
            'family_members.*.birth_date' => 'nullable|date',
            'family_members.*.id_number' => 'nullable|string|max:30',
            'family_members.*.gender' => 'nullable|string|max:10',
            'family_members.*.job' => 'nullable|string|max:100',
            'emergency_contacts' => 'nullable|array',
            'emergency_contacts.*.name' => 'nullable|string|max:100',
            'emergency_contacts.*.relationship' => 'nullable|string|max:50',
            'emergency_contacts.*.phone' => 'nullable|string|max:20',
            'education' => 'nullable|array',
            'education.*.grade' => 'nullable|string|max:20',
            'education.*.institution' => 'nullable|string|max:100',
            'education.*.major' => 'nullable|string|max:100',
            'education.*.start_year' => 'nullable|string|max:4',
            'education.*.end_year' => 'nullable|string|max:4',
            'education.*.gpa' => 'nullable|string|max:10',
            'training_courses' => 'nullable|array',
            'training_courses.*.name' => 'nullable|string|max:100',
            'training_courses.*.held_by' => 'nullable|string|max:100',
            'training_courses.*.start_date' => 'nullable|date',
            'training_courses.*.end_date' => 'nullable|date',
            'training_courses.*.duration' => 'nullable|string|max:10',
            'training_courses.*.fee' => 'nullable|numeric|min:0',
            'training_courses.*.certificate' => 'nullable|boolean',
            'work_experience' => 'nullable|array',
            'work_experience.*.company' => 'nullable|string|max:100',
            'work_experience.*.position' => 'nullable|string|max:100',
            'work_experience.*.from' => 'nullable|date',
            'work_experience.*.to' => 'nullable|date',
        ]);

        if ($request->hasFile('profile_photo')) {
            // Delete old photo
            if ($employee->profile_photo_path) {
                Storage::disk('public')->delete($employee->profile_photo_path);
            }
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('employees', 'public');
        }

        // Convert gender string to boolean for database
        if (isset($validated['gender'])) {
            $validated['gender'] = $validated['gender'] === 'male' ? 1 : 0;
        }

        // Handle employee_status -> is_active + employment_status mapping
        if (isset($validated['employee_status'])) {
            $mapped = $this->resolveEmployeeStatus($validated['employee_status']);
            $validated['is_active'] = $mapped['is_active'];
            $validated['employment_status'] = $mapped['employment_status'];
            if ($validated['employment_status'] === 'Aktif') {
                $validated['status_reason'] = null;
                $validated['status_notes'] = null;
            }
            unset($validated['employee_status']);
        }

        // Note: family_members, emergency_contacts, education are handled by model $casts as 'array'

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
        $query = Employee::with(['department', 'center', 'position']);

        $search = $request->get('search');
        $status = $request->get('status');
        $branch = $request->get('branch');
        $division = $request->get('division');

        $this->applyEmployeeSearch($query, $search);

        $this->applyStatusFilter($query, $status);

        if ($branch !== null && $branch !== '') {
            $query->where('department_id', $branch);
        }

        if ($division !== null && $division !== '') {
            $query->where('center_id', $division);
        }

        $employees = $query->get();

        $csvData = [];
        $csvData[] = ['Employee ID', 'Name', 'Phone', 'Email', 'Division', 'Branch', 'Job Position', 'Basic Salary', 'Status'];

        foreach ($employees as $emp) {
            $csvData[] = [
                $emp->employee_code ?? 'EMP-' . str_pad($emp->id, 4, '0', STR_PAD_LEFT),
                $emp->first_name . ' ' . $emp->last_name,
                $emp->mobile_number ?? '-',
                $emp->email ?? '-',
                $emp->center?->name ?? '-',
                $emp->department?->name ?? '-',
                $emp->position?->name ?? '-',
                $emp->basic_salary ?? 0,
                $emp->employment_status ?? 'Aktif',
            ];
        }

        $filename = 'employees_' . now()->format('Y-m-d') . '.csv';

        $callback = function () use ($csvData) {
            $file = fopen('php://output', 'w');
            // Write BOM for UTF-8 Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            foreach ($csvData as $row) {
                fputcsv($file, $row, ';'); // Semicolon delimiter for Excel auto-column formatting
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return redirect()->route('employees.index')->with('error', 'Tidak ada karyawan yang dipilih.');
        }

        $employees = Employee::whereIn('id', $ids)->get();
        foreach ($employees as $employee) {
            if ($employee->profile_photo_path) {
                Storage::disk('public')->delete($employee->profile_photo_path);
            }
            $employee->delete();
        }

        return redirect()->route('employees.index')->with('success', count($ids) . ' karyawan berhasil dihapus.');
    }

    public function bulkCreate()
    {
        $departments = Department::select('id', 'name')->get();
        $positions = Position::select('id', 'name')->get();
        $centers = Center::select('id', 'name')->get();

        return Inertia::render('Employees/BulkAdd', [
            'departments' => $departments,
            'positions' => $positions,
            'centers' => $centers,
        ]);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'employees' => 'required|array|min:1',
            'employees.*.first_name' => 'required|string|max:100',
            'employees.*.last_name' => 'nullable|string|max:100',
            'employees.*.email' => 'nullable|email|max:100',
            'employees.*.mobile_number' => 'nullable|string|max:20',
            'employees.*.gender' => 'nullable|in:male,female',
            'employees.*.department_id' => 'nullable|integer',
            'employees.*.center_id' => 'nullable|integer',
            'employees.*.position_id' => 'nullable|integer',
            'employees.*.contract_id' => 'nullable|integer',
            'employees.*.join_date' => 'nullable|date',
            'employees.*.basic_salary' => 'nullable|numeric|min:0',
            'employees.*.address' => 'nullable|string|max:500',
            'employees.*.birth_place' => 'nullable|string|max:100',
            'employees.*.birth_date' => 'nullable|date',
            'employees.*.identity_number' => 'nullable|string|max:50',
        ]);

        $rows = $request->input('employees');
        $successCount = 0;
        $errors = [];

        // Get valid IDs for FK validation
        $validDepartments = Department::pluck('id')->toArray();
        $validCenters = Center::pluck('id')->toArray();
        $validPositions = Position::pluck('id')->toArray();

        foreach ($rows as $index => $row) {
            try {
                // Skip rows without first_name
                if (empty($row['first_name']) || !trim($row['first_name'])) {
                    $errors[] = "Row " . ($index + 1) . ": first_name is required.";
                    continue;
                }

                $data = [
                    'first_name' => trim($row['first_name']),
                    'last_name' => isset($row['last_name']) ? trim($row['last_name']) : null,
                    'email' => isset($row['email']) && filter_var(trim($row['email']), FILTER_VALIDATE_EMAIL) ? trim($row['email']) : null,
                    'mobile_number' => isset($row['mobile_number']) ? trim($row['mobile_number']) : null,
                    'gender' => isset($row['gender']) && in_array(strtolower($row['gender']), ['male', 'female']) ? (strtolower($row['gender']) === 'male' ? 1 : 0) : null,
                    'address' => isset($row['address']) ? trim($row['address']) : null,
                    'birth_place' => isset($row['birth_place']) ? trim($row['birth_place']) : null,
                    'birth_date' => isset($row['birth_date']) && strtotime($row['birth_date']) ? date('Y-m-d', strtotime($row['birth_date'])) : null,
                    'national_number' => isset($row['identity_number']) ? trim($row['identity_number']) : null,
                    'is_active' => true,
                    'balance_leave_allowed' => 12,
                ];

                // Validate FK references
                if (!empty($row['department_id']) && in_array((int)$row['department_id'], $validDepartments)) {
                    $data['department_id'] = (int)$row['department_id'];
                }
                if (!empty($row['center_id']) && in_array((int)$row['center_id'], $validCenters)) {
                    $data['center_id'] = (int)$row['center_id'];
                }
                if (!empty($row['position_id']) && in_array((int)$row['position_id'], $validPositions)) {
                    $data['position_id'] = (int)$row['position_id'];
                }
                if (!empty($row['join_date']) && strtotime($row['join_date'])) {
                    $data['join_date'] = date('Y-m-d', strtotime($row['join_date']));
                }

                if (isset($row['basic_salary']) && is_numeric($row['basic_salary'])) {
                    $data['basic_salary'] = (float) $row['basic_salary'];
                }

                // Auto-generate employee code
                $lastId = Employee::max('id') ?? 0;
                $data['employee_code'] = 'EMP-' . str_pad($lastId + $successCount + 1, 4, '0', STR_PAD_LEFT);

                Employee::create($data);
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        $message = "{$successCount} karyawan berhasil diimpor.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " baris gagal.";
        }

        return response()->json([
            'success' => true,
            'imported' => $successCount,
            'failed' => count($errors),
            'errors' => $errors,
            'message' => $message,
        ]);
    }

    public function searchSuggestions(Request $request)
    {
        $search = trim((string) $request->get('q', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $employees = Employee::with(['position:id,name', 'department:id,name', 'center:id,name'])
            ->select('id', 'first_name', 'last_name', 'employee_code', 'employment_status', 'position_id', 'department_id', 'center_id')
            ->tap(fn($query) => $this->applyEmployeeSearch($query, $search))
            ->orderBy('first_name')
            ->limit(8)
            ->get()
            ->map(fn($employee) => [
                'id' => $employee->id,
                'name' => trim($employee->first_name . ' ' . ($employee->last_name ?? '')),
                'employee_code' => $employee->employee_code,
                'employment_status' => $employee->employment_status,
                'position' => $employee->position?->name,
                'division' => $employee->center?->name,
                'branch' => $employee->department?->name,
                'url' => route('employees.show', $employee),
            ]);

        return response()->json($employees);
    }

    private function applyEmployeeSearch($query, ?string $search): void
    {
        $search = trim((string) $search);

        if ($search === '') {
            return;
        }

        $query->where(function ($q) use ($search) {
            // Full search term against each column and concatenated name
            $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%")
                ->orWhere('mobile_number', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhereRaw("LOWER(TRIM(CONCAT(COALESCE(first_name,''), ' ', COALESCE(last_name,'')))) LIKE ?", ['%' . strtolower($search) . '%']);
        });
    }

    private function applyStatusFilter($query, ?string $status): void
    {
        if ($status === null || $status === '') {
            return;
        }

        $statusMap = [
            'active' => 'Aktif',
            'terminated' => 'Terminated',
            'permission' => 'Izin',
            'probation' => 'Masa Percobaan',
            'on_leave' => 'Cuti',
            'business_trip' => 'Dinas Luar',
        ];

        if (isset($statusMap[$status])) {
            $query->where('employment_status', $statusMap[$status]);
        }
    }

    private function resolveEmployeeStatus(string $employeeStatus): array
    {
        $statusMap = [
            'Aktif' => ['is_active' => true, 'employment_status' => 'Aktif'],
            'Terminated' => ['is_active' => false, 'employment_status' => 'Terminated'],
            'Izin' => ['is_active' => true, 'employment_status' => 'Izin'],
            'Cuti' => ['is_active' => true, 'employment_status' => 'Cuti'],
            'Dinas Luar' => ['is_active' => true, 'employment_status' => 'Dinas Luar'],
            'Masa Percobaan' => ['is_active' => true, 'employment_status' => 'Masa Percobaan'],
        ];

        return $statusMap[$employeeStatus] ?? ['is_active' => true, 'employment_status' => 'Aktif'];
    }
}
