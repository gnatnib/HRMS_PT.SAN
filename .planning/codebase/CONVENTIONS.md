# Code Conventions

## PHP Code Standards

### Code Style
- **Laravel Pint** - Automated code formatting
- **PSR-12** - PHP coding standards compliance
- **PSR-4** - Autoloading standards
- **CamelCase** - Method and variable names
- **PascalCase** - Class names and namespaces
- **UPPER_SNAKE_CASE** - Constants

### File Division
```
Single Responsibility Principle:
- One class per file
- Clear, descriptive class names
- Organized by functionality

Namespace Structure:
App\Http\Controllers\
App\Models\
App\Jobs\
App\Listeners\
App\Notifications\
App\Providers\
```

### Method Naming Conventions
```php
// Controllers - Action + Resource
public function index()           // List resources
public function show($id)         // Show single resource
public function create()          // Show create form
public function store(Request)    // Store new resource
public function edit($id)         // Show edit form
public function update(Request, $id) // Update resource
public function destroy($id)      // Delete resource

// Models - Relationships
public function department()     // belongsTo relationship
public function employees()       // hasMany relationship
public function permissions()     // belongsToMany relationship
```

### Variable Naming
```php
// Descriptive and meaningful
$employeeData
$payrollPeriod
$leaveBalance
$attendanceRecords

// Boolean variables
$hasPermission
$isAuthenticated
$isActiveEmployee
$requiresApproval

// Collections and arrays
$employees = Employee::all();
$activeContracts = Contract::active()->get();
$payrollCalculations = [];
```

## Database Conventions

### Table Naming
- **Plural snake_case** for table names (`employees`, `payroll_periods`)
- **snake_case** for column names (`first_name`, `created_at`)
- **Foreign keys**: `{table}_id` (`department_id`, `employee_id`)
- **Timestamps**: `created_at`, `updated_at` automatically managed
- **Soft deletes**: `deleted_at` for soft deletion

### Migration Patterns
```php
// Standard migration structure
Schema::create('employees', function (Blueprint $table) {
    $table->id();
    $table->string('first_name');
    $table->string('last_name');
    $table->foreignId('department_id')->constrained();
    $table->timestamps();
    $table->softDeletes();
});
```

### Model Conventions
```php
// Model properties
class Employee extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'first_name',
        'last_name',
        'department_id',
        'email',
    ];
    
    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
```

## Frontend Conventions

### JavaScript/React Standards
- **PascalCase** for React components
- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants
- **Descriptive component names**

```jsx
// Component naming
function EmployeeList() { ... }
function PayrollDashboard() { ... }
const AttendanceCalendar = () => { ... }

// Props naming
<EmployeeList 
  employees={employees} 
  isLoading={isLoading}
  onEmployeeSelect={handleEmployeeSelect}
/>
```

### CSS/Styling Conventions
- **Tailwind CSS** utility-first approach
- **Component-based styling** with consistent patterns
- **Responsive design** mobile-first approach
- **Semantic HTML5** structure

```jsx
// Consistent component patterns
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Employee Information
  </h2>
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>
```

## API Conventions

### RESTful API Design
```php
// Route patterns
GET    /api/employees           // List all employees
GET    /api/employees/{id}      // Get specific employee
POST   /api/employees           // Create new employee
PUT    /api/employees/{id}      // Update employee
DELETE /api/employees/{id}      // Delete employee

// Resource controllers
php artisan make:controller Api/EmployeeController --api
```

### Response Format
```php
// Success response
return response()->json([
    'success' => true,
    'data' => $employee,
    'message' => 'Employee created successfully'
]);

// Error response
return response()->json([
    'success' => false,
    'message' => 'Validation failed',
    'errors' => $validator->errors()
], 422);
```

## Testing Conventions

### Test Division
```php
// Feature test naming
class EmployeeManagementTest extends TestCase
{
    public function test_user_can_view_employee_list()
    public function test_user_can_create_employee()
    public function test_user_cannot_create_employee_without_permission()
    
    // Given, When, Then pattern
    public function test_employee_payroll_calculation()
    {
        // Given
        $employee = Employee::factory()->create();
        
        // When
        $payroll = $this->payrollService->calculate($employee);
        
        // Then
        $this->assertEquals($expectedAmount, $payroll->net_salary);
    }
}
```

## Documentation Standards

### Code Comments
```php
/**
 * Calculate employee overtime pay
 * 
 * @param Employee $employee The employee to calculate for
 * @param Carbon $startDate Start date for period
 * @param Carbon $endDate End date for period
 * @return float Total overtime amount
 */
public function calculateOvertime(Employee $employee, Carbon $startDate, Carbon $endDate): float
{
    // Implementation
}
```

### Git Commit Messages
```
feat(employees): add bulk import functionality
fix(payroll): correct tax calculation for overtime
docs(readme): update installation instructions
refactor(attendance): optimize fingerprint processing
test(leaves): add unit tests for leave balance calculation
```

## Security Conventions

### Input Validation
```php
// Form request validation
class StoreEmployeeRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'department_id' => 'required|exists:departments,id',
        ];
    }
}
```

### Authorization
```php
// Policy-based authorization
class EmployeePolicy
{
    public function view(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('view-employees') 
            || $employee->id === $user->employee?->id;
    }
}
```

## Performance Conventions

### Database Queries
```php
// Eager loading to prevent N+1 problems
$employees = Employee::with(['department', 'position'])->get();

// Query optimization
$activeEmployees = Employee::where('is_active', true)
    ->whereHas('department', fn($q) => $q->where('is_active', true))
    ->orderBy('last_name')
    ->paginate(25);
```

### Caching Patterns
```php
// Cache expensive operations
$payrollCalculations = Cache::remember(
    "payroll_{$employee->id}_{$period}",
    now()->addHours(6),
    fn() => $this->payrollService->calculate($employee, $period)
);
```

## Localization Conventions

### Language Files
```php
// Language keys
'employees' => [
    'title' => 'Employee Management',
    'create' => 'Create Employee',
    'edit' => 'Edit Employee',
    'delete' => 'Delete Employee',
],

// Usage in Blade
{{ __('employees.title') }}

// Usage in React
{{ __('employees.title') }}
```

## Error Handling Conventions

### Exception Handling
```php
// Custom exceptions
class PayrollCalculationException extends Exception {}

// Consistent error responses
try {
    $payroll = $this->payrollService->calculate($employee);
    return response()->json(['success' => true, 'data' => $payroll]);
} catch (PayrollCalculationException $e) {
    return response()->json([
        'success' => false, 
        'message' => 'Payroll calculation failed: ' . $e->getMessage()
    ], 500);
}
```

These conventions ensure consistency, maintainability, and collaboration across the development team.