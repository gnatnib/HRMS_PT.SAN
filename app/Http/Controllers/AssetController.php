<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with('employee:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'type' => $asset->type,
                    'serial' => $asset->serial_number,
                    'assignee' => $asset->employee ? $asset->employee->first_name . ' ' . $asset->employee->last_name : null,
                    'department' => $asset->department ?? '-',
                    'status' => $asset->status,
                    'handover' => $asset->handover_date?->format('Y-m-d'),
                ];
            });

        $employees = Employee::where('is_active', true)
            ->select('id', 'first_name', 'last_name')
            ->get();

        $stats = [
            'total' => Asset::count(),
            'in_use' => Asset::where('status', 'in_use')->count(),
            'available' => Asset::where('status', 'available')->count(),
            'maintenance' => Asset::where('status', 'maintenance')->count(),
        ];

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'employees' => $employees,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'type' => 'required|string|max:50',
            'serial_number' => 'required|string|max:100|unique:assets,serial_number',
            'employee_id' => 'nullable|exists:employees,id',
            'department' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
        ]);

        $validated['status'] = $validated['employee_id'] ? 'in_use' : 'available';
        $validated['handover_date'] = $validated['employee_id'] ? now() : null;

        Asset::create($validated);

        return redirect()->back()->with('success', 'Aset berhasil ditambahkan!');
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'type' => 'required|string|max:50',
            'serial_number' => 'required|string|max:100|unique:assets,serial_number,' . $asset->id,
            'employee_id' => 'nullable|exists:employees,id',
            'department' => 'nullable|string|max:100',
            'status' => 'required|in:available,in_use,maintenance',
            'description' => 'nullable|string|max:500',
        ]);

        // Update handover date if assignee changed
        if ($validated['employee_id'] && $validated['employee_id'] != $asset->employee_id) {
            $validated['handover_date'] = now();
        }

        $asset->update($validated);

        return redirect()->back()->with('success', 'Aset berhasil diupdate!');
    }

    public function assign(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $asset->update([
            'employee_id' => $validated['employee_id'],
            'status' => 'in_use',
            'handover_date' => now(),
        ]);

        return redirect()->back()->with('success', 'Aset berhasil di-assign!');
    }

    public function unassign(Asset $asset)
    {
        $asset->update([
            'employee_id' => null,
            'status' => 'available',
            'handover_date' => null,
        ]);

        return redirect()->back()->with('success', 'Aset berhasil dikembalikan!');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->back()->with('success', 'Aset berhasil dihapus!');
    }
}
