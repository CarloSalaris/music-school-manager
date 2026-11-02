<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * is_minorenne is derived from data_nascita (see Student::isMinorenne),
     * so storing it only allowed the two to drift apart.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('is_minorenne');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->boolean('is_minorenne')->default(false)->after('cap');
        });
    }
};
