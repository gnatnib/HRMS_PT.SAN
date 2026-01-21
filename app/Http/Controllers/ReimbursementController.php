<?php

namespace App\Http\Controllers;

use App\Models\Reimbursement;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ReimbursementController extends Controller
{
    public function index()
    {
        $requests = Reimbursement::with(['employee:id,first_name,last_name', 'category:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'employee' => $req->employee->first_name . ' ' . $req->employee->last_name,
                    'category' => $req->category->name ?? 'Other',
                    'title' => $req->title,
                    'amount' => $req->amount,
                    'date' => $req->date->format('Y-m-d'),
                    'status' => $req->status,
                    'receipts' => $req->receipt_path ? 1 : 0,
                ];
            });

        $categories = ExpenseCategory::all();

        $stats = [
            'pending' => Reimbursement::where('status', 'pending')->sum('amount'),
            'approved' => Reimbursement::where('status', 'approved')->whereMonth('created_at', now()->month)->sum('amount'),
            'count_pending' => Reimbursement::where('status', 'pending')->count(),
            'count_approved' => Reimbursement::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
        ];

        $categoryData = ExpenseCategory::withSum([
            'reimbursements' => function ($q) {
                $q->where('status', 'approved')->whereMonth('created_at', now()->month);
            }
        ], 'amount')->get()->map(function ($cat) {
            return [
                'name' => $cat->name,
                'value' => $cat->reimbursements_sum_amount ?? 0,
            ];
        });

        return Inertia::render('Reimbursement/Index', [
            'requests' => $requests,
            'categories' => $categories,
            'stats' => $stats,
            'categoryData' => $categoryData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        Reimbursement::create([
            'employee_id' => $validated['employee_id'],
            'expense_category_id' => $validated['expense_category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'receipt_path' => $receiptPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Pengajuan reimbursement berhasil!');
    }

    public function approve(Reimbursement $reimbursement)
    {
        $reimbursement->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Reimbursement disetujui!');
    }

    public function reject(Request $request, Reimbursement $reimbursement)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $reimbursement->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Reimbursement ditolak.');
    }

    public function destroy(Reimbursement $reimbursement)
    {
        if ($reimbursement->receipt_path) {
            Storage::disk('public')->delete($reimbursement->receipt_path);
        }
        $reimbursement->delete();

        return redirect()->back()->with('success', 'Reimbursement dihapus.');
    }
}
