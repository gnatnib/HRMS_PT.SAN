# Project Structure

## Directory Division

### Root Level Structure
```
C:\laragon\www\HRMS_PT.SAN/
├── app/                     # Core application code
├── bootstrap/              # Application bootstrap files
├── config/                 # Configuration files
├── database/               # Database migrations, seeders, factories
├── docker/                 # Docker configurations
├── public/                 # Web accessible files
├── resources/              # Frontend assets and views
├── routes/                 # Route definitions
├── storage/                # Application storage (logs, uploads)
├── tests/                  # Test files
├── .planning/              # GSD planning documents
└── vendor/                 # Composer dependencies
```

### Application Code Structure (`app/`)

#### Controllers Layer
```
app/Http/Controllers/
├── Controller.php              # Base controller
├── AttendanceController.php    # Attendance management
├── EmployeeController.php      # Employee CRUD operations
├── PayrollController.php       # Payroll processing
├── LeaveController.php         # Leave management
├── AssetController.php         # Asset tracking
├── OvertimeController.php      # Overtime requests
├── LoanController.php          # Loan management
├── ReimbursementController.php # Expense reimbursements
├── DocumentController.php      # Document management
├── RecruitmentController.php  # Recruitment processes
├── ShiftController.php         # Shift scheduling
├── MiscError.php              # Error handling
└── language/
    └── LanguageController.php  # Localization management
```

#### Models Layer
```
app/Models/
├── User.php                    # Authentication user
├── Employee.php                # Core employee data
├── Department.php              # Organizational departments
├── Position.php                # Job positions
├── Center.php                  # Work locations
├── Contract.php                # Employment contracts
├── PayrollPeriod.php           # Payroll cycles
├── EmployeeSalary.php          # Salary records
├── SalaryComponent.php         # Pay structure components
├── Leave.php                   # Leave requests
├── EmployeeLeave.php           # Employee leave balances
├── OvertimeRequest.php         # Overtime requests
├── Fingerprint.php             # Attendance fingerprint data
├── Shift.php                   # Work shifts
├── Asset.php                   # Company assets
├── Category.php                # Asset categories
├── ExpenseCategory.php         # Expense categories
├── Loan.php                    # Employee loans
├── LoanPayment.php             # Loan repayments
├── Reimbursement.php           # Expense reimbursements
├── Setting.php                 # System settings
├── Message.php                 # Internal messages
├── BulkMessage.php             # Bulk messages
├── Transition.php              # Status transitions
├── Timeline.php                # Activity timeline
├── Holiday.php                 # Holiday calendar
├── Discount.php                 # Payroll deductions
├── Changelog.php                # Change logs
└── SubCategory.php             # Additional categorization
```

#### Service Layer Components
```
app/
├── Actions/Fortify/            # Authentication actions
│   ├── CreateNewUser.php
│   ├── ResetUserPassword.php
│   ├── UpdateUserPassword.php
│   └── UpdateUserProfileInformation.php
├── Console/Commands/           # Artisan commands
│   ├── LeavesCalculator.php
│   └── SendUnsentBulkMessages.php
├── Jobs/                       # Background jobs
│   ├── calculateDiscountsAsDays.php
│   ├── calculateDiscountsAsTime.php
│   ├── sendPendingBulkMessages.php
│   ├── sendPendingMessages.php
│   ├── sendPendingMessagesByWhatsapp.php
│   └── syncAppWithGithub.php
├── Listeners/                  # Event listeners
│   ├── LogFailedJob.php
│   └── UpdateLastLogin.php
├── Notifications/              # Notification classes
│   └── DefaultNotification.php
├── Providers/                  # Service providers
│   ├── AppServiceProvider.php
│   ├── AuthServiceProvider.php
│   ├── BroadcastServiceProvider.php
│   ├── EventServiceProvider.php
│   ├── FortifyServiceProvider.php
│   ├── MenuServiceProvider.php
│   ├── QueryLogServiceProvider.php
│   └── RouteServiceProvider.php
├── Traits/                     # Reusable traits
│   ├── CreatedUpdatedDeletedBy.php
│   └── MessageProvider.php
├── Validators/                 # Custom validators
│   └── customSignatureValidator.php
└── Helpers/                    # Helper functions
    └── Helpers.php
```

### Frontend Structure (`resources/`)

#### JavaScript/React Components
```
resources/js/
├── app.js                     # Application entry point
├── bootstrap.js               # Frontend initialization
├── Components/                # Reusable React components
├── Layouts/                   # Page layout components
├── Pages/                     # Inertia page components
└── app.js                     # Main JavaScript bundle
```

#### Views and Templates
```
resources/views/
├── app.blade.php             # Main application layout
├── auth/                     # Authentication views
├── components/               # Blade components
├── layouts/                 # Blade layouts
└── welcome.blade.php        # Landing page
```

#### CSS and Styling
```
resources/
├── css/
│   └── app.css              # Application styles
└── sass/                    # SCSS source files (if used)
```

### Database Structure (`database/`)

#### Migrations
```
database/migrations/         # Database schema migrations
```

#### Seeders
```
database/seeders/
├── DatabaseSeeder.php       # Main seeder
├── AdminUserSeeder.php       # Admin user creation
├── CenterSeeder.php         # Work locations
├── DepartmentSeeder.php     # Division structure
├── EmployeeUserSeeder.php   # Employee accounts
├── EmployeesSeeder.php      # Sample employees
├── PositionSeeder.php       # Job positions
├── ContractsSeeder.php      # Employment contracts
└── TimelineSeeder.php       # Activity timeline
```

#### SQL Files
```
database/SQL/
└── Merge with old database.sql  # Legacy data migration
```

### Configuration (`config/`)

#### Application Configuration
```
config/
├── app.php                   # Core application config
├── auth.php                  # Authentication settings
├── backup.php                # Backup configuration
├── broadcasting.php          # WebSocket/real-time
├── cache.php                 # Cache configuration
├── cors.php                  # Cross-origin resource sharing
├── custom.php                # Custom application settings
├── database.php              # Database connections
├── debugbar.php              # Debug toolbar config
├── excel.php                 # Excel import/export
├── filesystems.php           # File storage configuration
├── fortify.php               # Authentication scaffolding
├── hashing.php               # Password hashing
├── livewire.php              # Livewire components
├── log-viewer.php            # Log viewing interface
├── logging.php               # Logging configuration
├── mail.php                  # Email configuration
├── permission.php            # Permission system
├── queue.php                 # Queue system
├── sanctum.php               # API authentication
├── services.php              # External services
├── session.php               # Session management
├── variables.php             # Custom variables
└── view.php                  # View rendering
```

### Routing Structure (`routes/`)

#### Route Definitions
```
routes/
├── api.php                   # API routes
├── channels.php              # WebSocket channels
├── console.php              # Artisan commands
├── web.php                  # Web application routes
└── web.php.backup           # Backup of web routes
```

### Testing Structure (`tests/`)

#### Test Division
```
tests/
├── CreatesApplication.php    # Test application creator
├── TestCase.php              # Base test case
├── Feature/                  # Feature tests
│   ├── AuthenticationTest.php
│   ├── BrowserSessionsTest.php
│   ├── CreateApiTokenTest.php
│   ├── DeleteAccountTest.php
│   ├── DeleteApiTokenTest.php
│   ├── EmailVerificationTest.php
│   ├── ExampleTest.php
│   ├── PasswordConfirmationTest.php
│   ├── PasswordResetTest.php
│   ├── ProfileInformationTest.php
│   ├── TwoFactorAuthenticationSettingsTest.php
│   └── UpdatePasswordTest.php
└── Unit/
    └── ExampleTest.php
```

### Docker Configuration
```
docker/
├── 8.0/                     # PHP 8.0 Docker files
├── 8.1/                     # PHP 8.1 Docker files
├── 8.2/                     # PHP 8.2 Docker files
└── docker-compose.yml       # Docker composition
```

### Public Assets (`public/`)

#### Web Accessible Files
```
public/
├── index.php                # Application entry point
├── web.config               # IIS configuration
└── vendor/                  # Published vendor assets
    └── log-viewer/          # Log viewer assets
```

### Storage (`storage/`)

#### Application Storage
```
storage/
├── app/                     # Application files
├── debugbar/                # Debug toolbar data
├──框架/                     # Logs directory
│   ├── browser.log
│   ├── laravel-2026-01-27.log
│   └── laravel.log
└── logs/                    # Additional logs
    └── .gitignore
```

### Build Configuration Files

#### Frontend Build
```
├── package.json             # Node.js dependencies
├── package-lock.json        # NPM lock file
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

#### PHP Build
```
├── composer.json            # PHP dependencies
├── composer.lock           # Composer lock file
└── artisan                  # Laravel command-line tool
```

### Development and Deployment

#### Git Configuration
```
.git/
├── .gitattributes
├── .gitignore
└── .github/
    ├── copilot-instructions.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/           # GitHub Actions (if any)
```

#### Documentation
```
├── README.md                # Project documentation
├── CONTRIBUTING.md          # Contribution guidelines
├── CODE_OF_CONDUCT.md       # Community guidelines
├── SECURITY.md              # Security policy
└── pull_request_template.md # PR template
```

### Planning and Development Tools
```
├── .planning/               # GSD planning documents
├── boost.json              # Laravel Boost configuration
└── Website (HRMS) - *.bat  # Development batch files
```

This structure follows Laravel conventions with additional division for the HRMS-specific functionality, making it easy to navigate and maintain the application codebase.