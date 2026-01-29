<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index()
    {
        $announcements = Announcement::latest()->paginate(10);

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        Announcement::create($validated);

        return redirect()->back()->with('success', 'Pengumuman berhasil ditambahkan.');
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }

    /**
     * Toggle the active status of an announcement.
     */
    public function toggle(Announcement $announcement)
    {
        $announcement->update(['is_active' => !$announcement->is_active]);

        return redirect()->back()->with('success', 'Status pengumuman berhasil diubah.');
    }
}
