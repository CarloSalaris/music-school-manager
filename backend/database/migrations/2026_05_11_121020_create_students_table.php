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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cognome');
            $table->string('email')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->date('data_nascita')->nullable();
            $table->string('codice_fiscale', 16)->nullable();
            $table->string('indirizzo')->nullable();
            $table->string('citta')->nullable();
            $table->string('cap', 10)->nullable();
            $table->boolean('is_minorenne')->default(false);
            $table->string('genitore_nome')->nullable();
            $table->string('genitore_cognome')->nullable();
            $table->string('genitore_telefono', 20)->nullable();
            $table->string('genitore_email')->nullable();
            $table->boolean('attivo')->default(true);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
