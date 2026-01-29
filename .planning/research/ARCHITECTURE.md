# Architecture Research

**Domain:** HRMS Indonesia (Human Resource Management System)
**Researched:** 2026-01-29
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Next.js PWA │  │ Mobile App  │  │ Admin Panel │        │
│  │ (Field Use) │  │ (Native)    │  │ (Desktop)   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │              │
├─────────┴─────────────────┴─────────────────┴──────────────┤
│                    API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Laravel 11+ API (Sanctum)               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │ Controllers  │  │ Middleware   │  │ Validators   │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  │         │                 │                 │        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │ Services    │  │ Repositories│  │ Transformers │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Payroll     │  │ Attendance  │  │ Employee    │        │
│  │ Processor   │  │ Manager     │  │ Management  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ BPJS        │  │ PPh 21      │  │ Compliance  │        │
│  │ Calculator  │  │ Calculator  │  │ Engine      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ MySQL DB │  │ Redis    │  │ File     │                   │
│  │ (Primary)│  │ (Queues) │  │ Storage  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js PWA | Mobile-first UI, GPS tracking, camera access, offline capabilities | React 18, TypeScript, Tailwind CSS, Service Workers |
| Laravel API | RESTful endpoints, authentication, business logic orchestration | Laravel 11+, Sanctum auth, API-only mode |
| Payroll Processor | Salary calculations, BPJS deductions, PPh 21 tax compliance | Queue-based processing (Redis), Service classes |
| Attendance Manager | GPS check-in/out, geo-fencing, shift scheduling | Background jobs, Location services |
| Compliance Engine | Indonesian labor law compliance, report generation | Dedicated service classes, Template system |
| MySQL Database | Transactional data storage, employee records, payroll history | InnoDB engine, Proper indexing |
| Redis Queue System | Asynchronous job processing, payroll calculations, notifications | Bull queues, Job prioritization |

## Recommended Project Structure

```
project-root/
├── frontend/                 # Next.js PWA Application
│   ├── src/
│   │   ├── app/             # App Router (Next.js 14+)
│   │   │   ├── (auth)/     # Authentication routes
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   ├── attendance/ # GPS attendance features
│   │   │   ├── payroll/    # Payroll viewing
│   │   │   └── profile/    # Employee profile
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── forms/      # Form components
│   │   │   └── layout/     # Layout components
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useAuth.ts  # Authentication hook
│   │   │   ├── useGPS.ts   # GPS location hook
│   │   │   └── useOffline.ts # Offline capabilities
│   │   ├── services/       # API integration
│   │   │   ├── api.ts      # Base API client
│   │   │   ├── auth.ts     # Authentication service
│   │   │   └── attendance.ts # Attendance API
│   │   ├── utils/          # Utility functions
│   │   │   ├── compliance.ts # Indonesian compliance helpers
│   │   │   └── formatters.ts # Data formatting
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets, PWA manifest
│   └── next.config.js      # Next.js configuration
├── backend/                 # Laravel API Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── EmployeeController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   └── PayrollController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── SanctumMiddleware.php
│   │   │   │   └── ComplianceMiddleware.php
│   │   │   └── Requests/
│   │   │       ├── AttendanceRequest.php
│   │   │       └── PayrollRequest.php
│   │   ├── Services/
│   │   │   ├── PayrollService.php
│   │   │   ├── AttendanceService.php
│   │   │   ├── BPJSService.php
│   │   │   └── PPh21Service.php
│   │   ├── Repositories/
│   │   │   ├── EmployeeRepository.php
│   │   │   ├── AttendanceRepository.php
│   │   │   └── PayrollRepository.php
│   │   ├── Jobs/
│   │   │   ├── ProcessPayrollJob.php
│   │   │   ├── GenerateBPJSReportJob.php
│   │   │   └── SendNotificationJob.php
│   │   └── Models/
│   │       ├── Employee.php
│   │       ├── Attendance.php
│   │       ├── Payroll.php
│   │       └── BPJSContribution.php
│   ├── database/
│   │   ├── migrations/     # Database schema
│   │   └── seeders/       # Initial data
│   ├── config/            # Laravel configuration
│   └── routes/
│       └── api.php        # API routes definition
├── shared/                 # Shared types and utilities
│   ├── types/             # TypeScript interfaces
│   └── constants/         # Shared constants
└── docs/                  # Documentation
    ├── api/               # API documentation
    └── deployment/        # Deployment guides
```

### Structure Rationale

- **frontend/app/**: Next.js 14+ App Router for improved performance and SEO
- **frontend/components/**: Atomic design pattern for reusable UI components
- **frontend/hooks/**: Custom hooks for complex state management and device APIs
- **backend/app/Services/**: Business logic separation following Service Layer pattern
- **backend/app/Jobs/**: Queue-based processing for payroll and compliance calculations
- **shared/**: Common types and constants to maintain consistency across frontend and backend

## Architectural Patterns

### Pattern 1: Service-Repository Pattern

**What:** Separation of business logic from data access using Service and Repository layers
**When to use:** Complex business operations, multiple data sources, testing requirements
**Trade-offs:** More boilerplate code initially, better testability and maintainability

**Example:**
```php
// Service Layer
class PayrollService
{
    public function __construct(
        private PayrollRepository $payrollRepo,
        private BPJSService $bpjsService,
        private PPh21Service $taxService
    ) {}

    public function processPayroll(int $employeeId, Carbon $period): Payroll
    {
        $employee = $this->payrollRepo->findEmployee($employeeId);
        $baseSalary = $employee->salary;
        
        $bpjsDeduction = $this->bpjsService->calculateDeduction($employee);
        $taxDeduction = $this->taxService->calculateTax($baseSalary, $period);
        
        return $this->payrollRepo->create([
            'employee_id' => $employeeId,
            'base_salary' => $baseSalary,
            'bpjs_deduction' => $bpjsDeduction,
            'tax_deduction' => $taxDeduction,
            'net_salary' => $baseSalary - $bpjsDeduction - $taxDeduction
        ]);
    }
}
```

### Pattern 2: Queue-Based Processing

**What:** Asynchronous job processing for heavy computations like payroll
**When to use:** Long-running tasks, scheduled operations, performance-critical responses
**Trade-offs:** Increased complexity, requires monitoring, better user experience

**Example:**
```php
// Job Class
class ProcessPayrollJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function __construct(private array $employeeIds, private Carbon $period) {}
    
    public function handle(PayrollService $payrollService): void
    {
        foreach ($this->employeeIds as $employeeId) {
            $payrollService->processPayroll($employeeId, $this->period);
        }
    }
}
```

### Pattern 3: PWA Offline-First Architecture

**What:** Progressive Web App with offline capabilities using Service Workers
**When to use:** Mobile field employees, unreliable connectivity, better user experience
**Trade-offs:** Complex state management, cache invalidation challenges

**Example:**
```typescript
// Service Worker for offline caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/attendance/')) {
    event.respondWith(
      caches.open('attendance-cache').then((cache) => {
        return cache.match(event.request) || fetch(event.request);
      })
    );
  }
});
```

## Data Flow

### Request Flow

```
[User Action (Mobile)]
    ↓
[Next.js PWA] → [API Client] → [Laravel API Gateway]
    ↓              ↓              ↓
[Local Cache] ← [Response] ← [Controller] → [Service] → [Repository]
    ↓              ↓              ↓              ↓            ↓
[UI Update] ← [Transform] ← [Validation] ← [Business Logic] ← [Database]
```

### State Management

```
[Redux Store] ←→ [API Service] ←→ [Laravel API]
     ↓                    ↓              ↓
[React Components] ←→ [Local Storage] ←→ [MySQL Database]
     ↓                    ↓              ↓
[Offline Queue] ←→ [Service Worker] ←→ [Redis Queue]
```

### Key Data Flows

1. **Attendance Flow:** GPS location capture → Validation → Storage → Queue processing → Payroll calculation
2. **Payroll Flow:** Scheduled trigger → Employee data fetch → BPJS/PPh 21 calculation → Report generation → Notification
3. **Compliance Flow:** Data aggregation → Report formatting → PDF generation → Storage → Email delivery

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 users | Single monolith, shared database, basic Redis queue |
| 50-200 users | Optimized database indexing, dedicated queue workers, file storage optimization |
| 200+ users | Database read replicas, microservices for payroll, CDN for static assets |

### Scaling Priorities

1. **First bottleneck:** Payroll processing queue (optimize with Redis clustering and job prioritization)
2. **Second bottleneck:** Database queries (implement proper indexing and read replicas for reporting)

## Anti-Patterns

### Anti-Pattern 1: Direct Database Access from Frontend

**What people do:** Making direct database calls from Next.js API routes
**Why it's wrong:** Bypasses business logic, creates security vulnerabilities, inconsistent data validation
**Do this instead:** Always route through Laravel API services and repositories

### Anti-Pattern 2: Synchronous Payroll Processing

**What people do:** Processing payroll calculations in HTTP requests
**Why it's wrong:** Causes timeouts, poor user experience, cannot handle failures gracefully
**Do this instead:** Use queue-based processing with job status tracking

### Anti-Pattern 3: Ignoring Indonesian Compliance

**What people do:** Building generic HRMS without Indonesia-specific requirements
**Why it's wrong:** Non-compliant with BPJS and tax regulations, legal risks
**Do this instead:** Implement dedicated BPJS and PPh 21 calculation services

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| BPJS Ketenagakerjaan API | REST API with retry logic | Use queue for bulk submissions |
| Indonesian Tax API (DJP) | Scheduled batch processing | Coretax integration for 2026 |
| GPS Services | Native device APIs | Handle permission gracefully |
| File Storage | Local S3-compatible storage | Backup compliance documents |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend ↔ Backend | REST API (JSON) | Use Sanctum for authentication |
| API ↔ Queue | Redis pub/sub | Job status tracking |
| Services ↔ Repositories | Dependency injection | Interface-based design |
| Payroll ↔ Compliance | Service calls | Transactional consistency |

## Mobile Architecture Considerations

### PWA Capabilities

- **GPS Tracking:** Native Geolocation API with background tracking
- **Camera Access:** Document capture for receipts and compliance
- **Offline Mode:** Service Worker caching for attendance records
- **Push Notifications:** Real-time payroll and schedule updates

### Performance Optimizations

- **Code Splitting:** Route-based chunks for faster initial load
- **Image Optimization:** Next.js Image component for responsive images
- **Caching Strategy:** Aggressive caching for static assets, API responses
- **Bundle Size:** Tree shaking for unused dependencies

### Device Compatibility

- **iOS Safari:** Full PWA support, background sync limitations
- **Android Chrome:** Complete PWA capabilities, background tracking
- **Low-end Devices:** Progressive enhancement, graceful degradation

## Database Schema for Compliance

### Core Tables Structure

```sql
-- Employee master data
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    nik VARCHAR(16) UNIQUE, -- Indonesian ID number
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    join_date DATE,
    salary DECIMAL(12,2),
    bpjs_tk_number VARCHAR(20), -- BPJS Ketenagakerjaan
    bpjs_kes_number VARCHAR(20), -- BPJS Kesehatan
    tax_id VARCHAR(20), -- NPWP
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Attendance records with GPS
CREATE TABLE attendances (
    id BIGINT PRIMARY KEY,
    employee_id BIGINT,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    check_in_lat DECIMAL(10,8),
    check_in_lng DECIMAL(11,8),
    check_out_lat DECIMAL(10,8),
    check_out_lng DECIMAL(11,8),
    location_address TEXT,
    shift_type ENUM('morning','afternoon','night'),
    status ENUM('present','late','absent','overtime'),
    created_at TIMESTAMP
);

-- Payroll with compliance breakdown
CREATE TABLE payrolls (
    id BIGINT PRIMARY KEY,
    employee_id BIGINT,
    period_start DATE,
    period_end DATE,
    base_salary DECIMAL(12,2),
    overtime_pay DECIMAL(12,2),
    bpjs_tk_deduction DECIMAL(12,2),
    bpjs_kes_deduction DECIMAL(12,2),
    pph_21_deduction DECIMAL(12,2),
    other_deductions DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    status ENUM('draft','calculated','approved','paid'),
    created_at TIMESTAMP
);

-- BPJS contribution tracking
CREATE TABLE bpjs_contributions (
    id BIGINT PRIMARY KEY,
    employee_id BIGINT,
    contribution_type ENUM('jht','jp','jkk','jkm','kesehatan'),
    amount DECIMAL(12,2),
    period_month DATE,
    payment_date DATE,
    status ENUM('pending','paid','verified'),
    created_at TIMESTAMP
);
```

## Sources

- [Next.js PWA Documentation](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps) - HIGH confidence
- [Laravel 11 Queue System](https://laravel.com/docs/11.x/queues) - HIGH confidence  
- [Indonesian BPJS Compliance Guidelines](https://kantorku.id/blog/update-aturan-payroll-dan-pajak-terbaru/) - MEDIUM confidence
- [PWA Best Practices MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices) - HIGH confidence
- [Mobile-First Attendance Management](https://mihcm.com/id/resources/blog/staying-mobile-mobile-first-attendance-management/) - MEDIUM confidence

---
*Architecture research for: HRMS Indonesia*
*Researched: 2026-01-29*