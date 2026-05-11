<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    protected $fillable = [
        'nome',
        'cognome',
        'email',
        'telefono',
        'data_nascita',
        'codice_fiscale',
        'indirizzo',
        'citta',
        'cap',
        'is_minorenne',
        'genitore_nome',
        'genitore_cognome',
        'genitore_telefono',
        'genitore_email',
        'attivo',
        'note',
    ];

    protected $casts = [
        'data_nascita' => 'date',
        'is_minorenne' => 'boolean',
        'attivo' => 'boolean',
    ];
}
