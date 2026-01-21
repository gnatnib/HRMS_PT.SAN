<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Adds GPS tracking capabilities to the attendance (fingerprints) table
     * for Mekari Talenta-like location-based clock in/out.
     */
    public function up(): void
    {
        Schema::table('fingerprints', function (Blueprint $table) {
            // GPS Coordinates for clock in/out validation
            $table->decimal('latitude', 10, 8)->nullable()->after('check_out');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');

            // Photo for liveness validation
            $table->string('clock_in_photo')->nullable()->after('longitude');
            $table->string('clock_out_photo')->nullable()->after('clock_in_photo');

            // Method of clock in (for audit trail)
            $table->enum('clock_in_method', ['gps', 'fingerprint', 'face_recognition', 'manual'])
                ->default('gps')
                ->after('clock_out_photo');

            // Device info for mobile tracking
            $table->string('device_info')->nullable()->after('clock_in_method');

            // Shift reference
            $table->foreignId('shift_id')->nullable()->after('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fingerprints', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'clock_in_photo',
                'clock_out_photo',
                'clock_in_method',
                'device_info',
                'shift_id'
            ]);
        });
    }
};
