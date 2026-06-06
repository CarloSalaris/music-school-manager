<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // TODO: implement authorization with policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'cognome' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'data_nascita' => 'nullable|date',
            'codice_fiscale' => 'nullable|string|max:16',
            'indirizzo' => 'nullable|string|max:255',
            'citta' => 'nullable|string|max:255',
            'cap' => 'nullable|string|max:10',
            'is_minorenne' => 'boolean',
            'genitore_nome' => 'nullable|string|max:255',
            'genitore_cognome' => 'nullable|string|max:255',
            'genitore_telefono' => 'nullable|string|max:20',
            'genitore_email' => 'nullable|email|max:255',
            'attivo' => 'boolean',
            'note' => 'nullable|string',
        ];
    }
}
