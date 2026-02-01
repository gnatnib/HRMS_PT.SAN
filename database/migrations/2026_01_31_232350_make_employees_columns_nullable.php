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
            // Make originally required columns nullable
            $table->string('last_name')->nullable()->change();
            $table->string('father_name')->nullable()->change();
            $table->string('mother_name')->nullable()->change();
            $table->string('birth_and_place')->nullable()->change();
            $table->string('national_number')->nullable()->change();
            $table->string('mobile_number')->nullable()->change();
            $table->string('degree')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->string('profile_photo_path')->nullable()->change();

            // Make contract_id nullable
            $table->foreignId('contract_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('last_name')->nullable(false)->change();
            $table->string('father_name')->nullable(false)->change();
            $table->string('mother_name')->nullable(false)->change();
            $table->string('birth_and_place')->nullable(false)->change();
            $table->string('national_number')->nullable(false)->change();
            $table->string('mobile_number')->nullable(false)->change();
            $table->string('degree')->nullable(false)->change();
            $table->string('address')->nullable(false)->change();
            $table->string('profile_photo_path')->nullable(false)->change();
            $table->foreignId('contract_id')->nullable(false)->change();
        });
    }
};
