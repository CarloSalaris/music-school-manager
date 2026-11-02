<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    public const ADULT_AGE = 18;

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
        'genitore_nome',
        'genitore_cognome',
        'genitore_telefono',
        'genitore_email',
        'attivo',
        'note',
    ];

    protected $casts = [
        'data_nascita' => 'date:Y-m-d',
        'attivo' => 'boolean',
    ];

    protected $appends = ['is_minorenne'];

    /** Derived from data_nascita; null when the birth date is unknown. */
    protected function isMinorenne(): Attribute
    {
        return Attribute::get(
            fn () => $this->data_nascita === null
                ? null
                : $this->data_nascita->age < self::ADULT_AGE,
        );
    }

    /**
     * Students under (true) or at/over (false) the adult age today.
     * Students without a birth date match neither.
     */
    #[Scope]
    protected function minorenne(Builder $query, bool $minor = true): void
    {
        $cutoff = today()->subYears(self::ADULT_AGE);

        $minor
            ? $query->whereDate('data_nascita', '>', $cutoff)
            : $query->whereDate('data_nascita', '<=', $cutoff);
    }
}
