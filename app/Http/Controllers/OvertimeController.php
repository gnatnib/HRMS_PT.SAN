<?php

namespace App\Http\Controllers;

use App\Models\OvertimeRequest;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class OvertimeController extends Controller
{
    public function index()
    {
        $requests = OvertimeRequest::with(['employee:id,first_name,last_name', 'employee.contract:id,department_id', 'employee.contract.department:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'employee' => $req->employee->first_name . ' ' . $req->employee->last_name,
                    'department' => $req->employee->contract?->department?->name ?? '-',
                    'date' => $req->date->format('Y-m-d'),
                    'hours' => $req->hours,
                    'multiplier' => $req->multiplier,
                    'amount' => $req->amount,
                    'reason' => $req->reason,
                    'status' => $req->status,
                ];
            });

        $stats = [
            'total' => OvertimeRequest::whereMonth('created_at', now()->month)->count(),
            'pending' => OvertimeRequest::where('status', 'pending')->count(),
            'approved' => OvertimeRequest::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'total_hours' => OvertimeRequest::where('status', 'approved')->whereMonth('created_at', now()->month)->sum('hours'),
        ];

        return Inertia::render('Overtime/Index', [
            'requests' => $requests,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:500',
            'is_holiday' => 'boolean',
        ]);

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $end->diffInMinutes($start) / 60;

        // Calculate multiplier based on Depnaker rules
        $isHoliday = $validated['is_holiday'] ?? false;
        $multiplierData = OvertimeRequest::calculateMultiplier($hours, $isHoliday);

        // Use average multiplier for display (simplified)
        $avgMultiplier = $isHoliday ? 2.0 : ($hours > 1 ? 2.0 : 1.5);

        // Get employee hourly rate (simplified: Rp 50,000/hour)
        $hourlyRate = 50000;
        $amount = $hours * $avgMultiplier * $hourlyRate;

        OvertimeRequest::create([
            'employee_id' => $validated['employee_id'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'hours' => $hours,
            'multiplier' => $avgMultiplier,
            'amount' => $amount,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Pengajuan lembur berhasil!');
    }

    public function approve(OvertimeRequest $overtimeRequest)
    {
        $overtimeRequest->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Lembur disetujui!');
    }

    public function reject(Request $request, OvertimeRequest $overtimeRequest)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $overtimeRequest->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Lembur ditolak.');
    }

    public function destroy(OvertimeRequest $overtimeRequest)
    {
        $overtimeRequest->delete();
        return redirect()->back()->with('success', 'Pengajuan lembur dihapus.');
    }
}
