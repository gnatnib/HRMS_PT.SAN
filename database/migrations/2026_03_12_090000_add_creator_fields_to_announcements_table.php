<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->foreignId('created_by_user_id')->nullable()->after('content')->constrained('users')->nullOnDelete();
            $table->string('created_by_name')->nullable()->after('created_by_user_id');
            $table->string('created_by_role')->nullable()->after('created_by_name');
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by_user_id');
            $table->dropColumn(['created_by_name', 'created_by_role']);
        });
    }
};
