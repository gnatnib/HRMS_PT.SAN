<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Personal fields
            $table->string('birth_place', 100)->nullable()->after('birth_and_place');
            $table->date('birth_date')->nullable()->after('birth_place');
            $table->string('identity_type', 20)->nullable()->after('national_number');
            $table->string('identity_number', 30)->nullable()->after('identity_type');
            $table->date('identity_expired_date')->nullable()->after('identity_number');
            $table->boolean('is_permanent_identity')->default(false)->after('identity_expired_date');
            $table->string('postal_code', 10)->nullable()->after('is_permanent_identity');

            // JSON arrays for related data
            $table->json('family_members')->nullable()->after('notes');
            $table->json('emergency_contacts')->nullable()->after('family_members');
            $table->json('education')->nullable()->after('emergency_contacts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'birth_place',
                'birth_date',
                'identity_type',
                'identity_number',
                'identity_expired_date',
                'is_permanent_identity',
                'postal_code',
                'family_members',
                'emergency_contacts',
                'education',
            ]);
        });
    }
};
