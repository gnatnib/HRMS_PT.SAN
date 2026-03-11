<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'required|string|max:3000',
        ]);

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $roleName = ($user && method_exists($user, 'getRoleNames'))
            ? ($user->getRoleNames()->first() ?? 'user')
            : 'user';

        Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'created_by_user_id' => $user ? $user->id : null,
            'created_by_name' => $user?->name ?? 'System',
            'created_by_role' => $roleName,
            'is_active' => true,
        ]);

        return redirect()->route('dashboard')->with('success', 'Announcement added successfully.');
    }
}
