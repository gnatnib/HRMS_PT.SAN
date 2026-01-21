<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\EmployeeLeave;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LeaveController extends Controller
{
    public function index()
    {
        $leaves = EmployeeLeave::with(['employee:id,first_name,last_name', 'leave:id,name'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($leave) {
                $fromDate = Carbon::parse($leave->from_date);
                $toDate = Carbon::parse($leave->to_date);
                return [
                    'id' => $leave->id,
                    'employee' => $leave->employee->first_name . ' ' . $leave->employee->last_name,
                    'type' => $leave->leave->name ?? 'Cuti',
                    'type_key' => strtolower(str_replace(' ', '_', $leave->leave->name ?? 'annual')),
                    'from' => $fromDate->format('Y-m-d'),
                    'to' => $toDate->format('Y-m-d'),
                    'days' => $fromDate->diffInDays($toDate) + 1,
                    'reason' => $leave->note,
                    'status' => $leave->is_authorized ? 'approved' : ($leave->is_checked ? 'rejected' : 'pending'),
                ];
            });

        $leaveTypes = Leave::all();

        // Get current user's leave balance (if employee)
        $balance = [
            'annual' => ['total' => 12, 'used' => 5, 'remaining' => 7],
            'sick' => ['total' => 14, 'used' => 2, 'remaining' => 12],
            'unpaid' => ['total' => 0, 'used' => 0, 'remaining' => 0],
        ];

        return Inertia::render('Leave/Index', [
            'leaves' => $leaves,
            'leaveTypes' => $leaveTypes,
            'balance' => $balance,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_id' => 'required|exists:leaves,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'note' => 'nullable|string|max:500',
        ]);

        EmployeeLeave::create([
            'employee_id' => $validated['employee_id'],
            'leave_id' => $validated['leave_id'],
            'from_date' => $validated['from_date'],
            'to_date' => $validated['to_date'],
            'note' => $validated['note'],
            'is_authorized' => false,
            'is_checked' => false,
        ]);

        return redirect()->back()->with('success', 'Pengajuan cuti berhasil!');
    }

    public function approve(EmployeeLeave $leave)
    {
        $leave->update([
            'is_authorized' => true,
            'is_checked' => true,
        ]);

        // Deduct from employee balance
        $fromDate = Carbon::parse($leave->from_date);
        $toDate = Carbon::parse($leave->to_date);
        $days = $fromDate->diffInDays($toDate) + 1;

        $employee = Employee::find($leave->employee_id);
        if ($employee) {
            $employee->decrement('balance_leave_allowed', $days);
        }

        return redirect()->back()->with('success', 'Cuti disetujui!');
    }

    public function reject(Request $request, EmployeeLeave $leave)
    {
        $leave->update([
            'is_authorized' => false,
            'is_checked' => true,
        ]);

        return redirect()->back()->with('success', 'Cuti ditolak.');
    }

    public function destroy(EmployeeLeave $leave)
    {
        $leave->delete();
        return redirect()->back()->with('success', 'Pengajuan cuti dihapus.');
    }
}
