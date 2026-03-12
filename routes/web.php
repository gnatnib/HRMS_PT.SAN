<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Routes - redirect to login
Route::get('/', fn() => redirect('/login'))->name('welcome');
Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');

// Protected Routes (requires auth)
Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');

    // ========================================
    // EMPLOYEES — HR Administration
    // ========================================
    Route::resource('employees', EmployeeController::class);
    Route::get('/employees-search-suggestions', [EmployeeController::class, 'searchSuggestions'])->name('employees.searchSuggestions');
    Route::get('/employees-export', [EmployeeController::class, 'export'])->name('employees.export');
    Route::post('/employees-bulk-delete', [EmployeeController::class, 'bulkDestroy'])->name('employees.bulkDestroy');
    Route::get('/employees-bulk-add', [EmployeeController::class, 'bulkCreate'])->name('employees.bulkCreate');
    Route::post('/employees-bulk-store', [EmployeeController::class, 'bulkStore'])->name('employees.bulkStore');

    // ========================================
    // RECRUITMENT — Talent Acquisition
    // ========================================
    Route::prefix('recruitment')->name('recruitment.')->group(function () {
        Route::get('/', [RecruitmentController::class, 'index'])->name('index');
        Route::post('/candidates', [RecruitmentController::class, 'store'])->name('store');
        Route::post('/move', [RecruitmentController::class, 'moveStage'])->name('move');
        Route::post('/delete', [RecruitmentController::class, 'deleteCandidate'])->name('delete');
        Route::get('/export', [RecruitmentController::class, 'exportCandidates'])->name('export');
    });

    // ========================================
    // USER MANAGEMENT — Direktur Utama & Superadmin only
    // ========================================
    Route::middleware(['role:direktur_utama|superadmin'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

// Fortify Auth Routes (handled by Fortify)
