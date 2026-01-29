<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ReimbursementController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\CashAdvanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/', fn() => Inertia::render('Welcome'))->name('welcome');
Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');

// Protected Routes (requires auth)
Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ========================================
    // MODULE 1: ATTENDANCE & TIME MANAGEMENT
    // ========================================
    Route::prefix('attendance')->name('attendance.')->group(function () {
        Route::get('/clock', [AttendanceController::class, 'clockIn'])->name('clock');
        Route::post('/clock-in', [AttendanceController::class, 'doClockIn'])->name('clock-in');
        Route::post('/clock-out', [AttendanceController::class, 'doClockOut'])->name('clock-out');
        Route::get('/live-tracking', [AttendanceController::class, 'liveTracking'])->name('live-tracking');
        Route::get('/history', [AttendanceController::class, 'history'])->name('history');
    });

    // Shifts
    Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
    Route::post('/shifts/{shift}/assign', [ShiftController::class, 'assignEmployee'])->name('shifts.assign');
    Route::post('/shifts/{shift}/remove', [ShiftController::class, 'removeEmployee'])->name('shifts.remove');

    // Overtime
    Route::resource('overtime', OvertimeController::class)->except(['create', 'show', 'edit']);
    Route::post('/overtime/{overtimeRequest}/approve', [OvertimeController::class, 'approve'])->name('overtime.approve');
    Route::post('/overtime/{overtimeRequest}/reject', [OvertimeController::class, 'reject'])->name('overtime.reject');

    // Leave
    Route::resource('leave', LeaveController::class)->except(['create', 'show', 'edit']);
    Route::post('/leave/{leave}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
    Route::post('/leave/{leave}/reject', [LeaveController::class, 'reject'])->name('leave.reject');

    // ========================================
    // MODULE 2: PAYROLL & BENEFITS
    // ========================================
    Route::prefix('payroll')->name('payroll.')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('index');
        Route::post('/run', [PayrollController::class, 'run'])->name('run');
        Route::post('/{period}/finalize', [PayrollController::class, 'finalize'])->name('finalize');
        Route::get('/payslip/{employee?}', [PayrollController::class, 'payslip'])->name('payslip');
        Route::get('/{period}/export', [PayrollController::class, 'exportCsv'])->name('export');

        // New: Bank Transfer Export (KlikBCA format)
        Route::get('/{period}/bank-transfer', [PayrollController::class, 'exportBankTransfer'])->name('bank-transfer');

        // New: PDF Payslip download
        Route::get('/slip/{payslip}/download', [PayrollController::class, 'downloadSlip'])->name('slip.download');
        Route::get('/slip/{payslip}/preview', [PayrollController::class, 'previewSlip'])->name('slip.preview');

        // New: THR Management
        Route::get('/thr', [PayrollController::class, 'thrIndex'])->name('thr.index');
        Route::post('/thr/generate', [PayrollController::class, 'generateThr'])->name('thr.generate');
        Route::get('/thr/export', [PayrollController::class, 'exportThr'])->name('thr.export');
    });

    // Reimbursement
    Route::resource('reimbursement', ReimbursementController::class)->except(['create', 'show', 'edit']);
    Route::post('/reimbursement/{reimbursement}/approve', [ReimbursementController::class, 'approve'])->name('reimbursement.approve');
    Route::post('/reimbursement/{reimbursement}/reject', [ReimbursementController::class, 'reject'])->name('reimbursement.reject');

    // Loans
    Route::resource('loans', LoanController::class)->except(['create', 'show', 'edit']);
    Route::post('/loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve');
    Route::post('/loans/{loan}/reject', [LoanController::class, 'reject'])->name('loans.reject');
    Route::post('/loans/{loan}/payment', [LoanController::class, 'recordPayment'])->name('loans.payment');

    // ========================================
    // FINANCE MODULE (Submenu Finance)
    // ========================================
    Route::prefix('finance')->name('finance.')->group(function () {
        // Reimbursement Settings (Jenis Reimbursement)
        Route::get('/reimbursement', [ReimbursementController::class, 'settings'])->name('reimbursement.index');
        Route::post('/reimbursement/types', [ReimbursementController::class, 'storeType'])->name('reimbursement.store');
        Route::put('/reimbursement/types/{type}', [ReimbursementController::class, 'updateType'])->name('reimbursement.update');
        Route::delete('/reimbursement/types/{type}', [ReimbursementController::class, 'destroyType'])->name('reimbursement.destroy');
        Route::get('/reimbursement/export', [ReimbursementController::class, 'exportTypes'])->name('reimbursement.export');

        // Cash Advance
        Route::get('/cash-advance', [CashAdvanceController::class, 'index'])->name('cash-advance.index');
        Route::post('/cash-advance', [CashAdvanceController::class, 'store'])->name('cash-advance.store');
        Route::post('/cash-advance/{cashAdvance}/approve', [CashAdvanceController::class, 'approve'])->name('cash-advance.approve');
        Route::post('/cash-advance/{cashAdvance}/reject', [CashAdvanceController::class, 'reject'])->name('cash-advance.reject');
        Route::post('/cash-advance/{cashAdvance}/settle', [CashAdvanceController::class, 'settle'])->name('cash-advance.settle');
        Route::get('/cash-advance/export', [CashAdvanceController::class, 'export'])->name('cash-advance.export');
        Route::get('/cash-advance/settings', [CashAdvanceController::class, 'settings'])->name('cash-advance.settings');
        Route::post('/cash-advance/policies', [CashAdvanceController::class, 'storePolicy'])->name('cash-advance.policy.store');

        // Loan Detail
        Route::get('/loans/{loan}', [LoanController::class, 'show'])->name('loans.show');
        Route::get('/loans/{loan}/export-schedule', [LoanController::class, 'exportSchedule'])->name('loans.export-schedule');
    });

    // ========================================
    // MODULE 3: HR ADMINISTRATION
    // ========================================
    Route::resource('employees', EmployeeController::class);
    Route::get('/employees-export', [EmployeeController::class, 'export'])->name('employees.export');

    // Documents
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents/generate', [DocumentController::class, 'generate'])->name('documents.generate');
    Route::post('/documents/upload', [DocumentController::class, 'upload'])->name('documents.upload');

    // Assets
    Route::resource('assets', AssetController::class)->except(['create', 'show', 'edit']);
    Route::post('/assets/{asset}/assign', [AssetController::class, 'assign'])->name('assets.assign');
    Route::post('/assets/{asset}/unassign', [AssetController::class, 'unassign'])->name('assets.unassign');

    // Tasks (Kanban)
    Route::get('/tasks', fn() => Inertia::render('Tasks/Kanban'))->name('tasks.kanban');

    // ========================================
    // MODULE 4: TALENT ACQUISITION
    // ========================================
    Route::prefix('recruitment')->name('recruitment.')->group(function () {
        Route::get('/', [RecruitmentController::class, 'index'])->name('index');
        Route::post('/candidates', [RecruitmentController::class, 'store'])->name('store');
        Route::post('/move', [RecruitmentController::class, 'moveStage'])->name('move');
        Route::get('/onboarding', [RecruitmentController::class, 'onboarding'])->name('onboarding');
        Route::post('/checklist', [RecruitmentController::class, 'updateChecklist'])->name('checklist');
    });

    // ========================================
    // MODULE 5: ANALYTICS & PERFORMANCE
    // ========================================
    Route::get('/analytics', fn() => Inertia::render('Analytics/Index'))->name('analytics.index');
    Route::get('/performance', fn() => Inertia::render('Performance/Index'))->name('performance.index');
});

// Fortify Auth Routes (handled by Fortify)
