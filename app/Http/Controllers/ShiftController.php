<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::withCount('employees')
            ->orderBy('start_time')
            ->get();

        $employees = Employee::where('is_active', true)
            ->select('id', 'first_name', 'last_name')
            ->get();

        return Inertia::render('Shifts/Index', [
            'shifts' => $shifts,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:shifts,code',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_duration' => 'required|integer|min:0|max:120',
            'late_tolerance' => 'required|integer|min:0|max:60',
        ]);

        $validated['is_active'] = true;

        $shift = Shift::create($validated);

        return redirect()->back()->with('success', 'Shift berhasil ditambahkan!');
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:shifts,code,' . $shift->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_duration' => 'required|integer|min:0|max:120',
            'late_tolerance' => 'required|integer|min:0|max:60',
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Shift berhasil diupdate!');
    }

    public function destroy(Shift $shift)
    {
        $shift->employees()->detach();
        $shift->delete();

        return redirect()->back()->with('success', 'Shift berhasil dihapus!');
    }

    public function assignEmployee(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
        ]);

        $shift->employees()->attach($validated['employee_id'], [
            'date' => $validated['date'],
        ]);

        return redirect()->back()->with('success', 'Karyawan berhasil di-assign ke shift!');
    }

    public function removeEmployee(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $shift->employees()->detach($validated['employee_id']);

        return redirect()->back()->with('success', 'Karyawan berhasil dihapus dari shift!');
    }
}
