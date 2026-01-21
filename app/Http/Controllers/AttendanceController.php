<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingerprint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function clockIn()
    {
        $employee = null;
        if (auth()->user() && auth()->user()->employee) {
            $employee = auth()->user()->employee;
        }

        $todayAttendance = null;
        if ($employee) {
            $todayAttendance = Fingerprint::where('employee_id', $employee->id)
                ->whereDate('date', today())
                ->first();
        }

        return Inertia::render('Attendance/ClockIn', [
            'employee' => $employee,
            'todayAttendance' => $todayAttendance,
        ]);
    }

    public function doClockIn(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'clock_in_method' => 'required|in:gps,manual,office',
            'clock_in_photo' => 'nullable|string', // Base64 encoded photo
        ]);

        // Check if already clocked in today
        $existing = Fingerprint::where('employee_id', $validated['employee_id'])
            ->whereDate('date', today())
            ->first();

        if ($existing && $existing->check_in) {
            return redirect()->back()->withErrors(['error' => 'Anda sudah clock in hari ini!']);
        }

        if ($existing) {
            $existing->update([
                'check_in' => now()->format('H:i:s'),
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'clock_in_method' => $validated['clock_in_method'],
                'clock_in_photo' => $validated['clock_in_photo'] ?? null,
            ]);
        } else {
            Fingerprint::create([
                'employee_id' => $validated['employee_id'],
                'date' => today(),
                'check_in' => now()->format('H:i:s'),
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'clock_in_method' => $validated['clock_in_method'],
                'clock_in_photo' => $validated['clock_in_photo'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', 'Clock In berhasil! ' . now()->format('H:i'));
    }

    public function doClockOut(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $attendance = Fingerprint::where('employee_id', $validated['employee_id'])
            ->whereDate('date', today())
            ->first();

        if (!$attendance || !$attendance->check_in) {
            return redirect()->back()->withErrors(['error' => 'Anda belum clock in hari ini!']);
        }

        if ($attendance->check_out) {
            return redirect()->back()->withErrors(['error' => 'Anda sudah clock out hari ini!']);
        }

        $attendance->update([
            'check_out' => now()->format('H:i:s'),
            'clock_out_latitude' => $validated['latitude'] ?? null,
            'clock_out_longitude' => $validated['longitude'] ?? null,
        ]);

        // Calculate working hours
        $checkIn = Carbon::parse($attendance->check_in);
        $checkOut = Carbon::parse($attendance->check_out);
        $workingHours = $checkOut->diffInMinutes($checkIn) / 60;

        return redirect()->back()->with('success', 'Clock Out berhasil! Total kerja: ' . number_format($workingHours, 1) . ' jam');
    }

    public function liveTracking()
    {
        $todayAttendances = Fingerprint::with(['employee:id,first_name,last_name', 'employee.contract:id,position_id', 'employee.contract.position:id,name'])
            ->whereDate('date', today())
            ->whereNotNull('check_in')
            ->whereNotNull('latitude')
            ->get()
            ->map(function ($att) {
                $isActive = !$att->check_out;
                return [
                    'id' => $att->employee_id,
                    'name' => $att->employee->first_name . ' ' . $att->employee->last_name,
                    'role' => $att->employee->contract?->position?->name ?? 'Staff',
                    'lat' => (float) $att->latitude,
                    'lng' => (float) $att->longitude,
                    'status' => $isActive ? 'active' : 'offline',
                    'lastUpdate' => Carbon::parse($isActive ? $att->check_in : $att->check_out)->diffForHumans(),
                ];
            });

        return Inertia::render('Attendance/LiveTracking', [
            'employees' => $todayAttendances,
        ]);
    }

    public function history(Request $request)
    {
        $employeeId = $request->get('employee_id');
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $query = Fingerprint::with('employee:id,first_name,last_name')
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $attendances = $query->orderByDesc('date')->get();

        return Inertia::render('Attendance/History', [
            'attendances' => $attendances,
            'filters' => [
                'employee_id' => $employeeId,
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }
}
