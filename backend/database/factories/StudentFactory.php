<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        $isMinorenne = $this->faker->boolean(30);

        return [
            'nome' => $this->faker->firstName(),
            'cognome' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'telefono' => $this->faker->phoneNumber(),
            'data_nascita' => $this->faker->dateTimeBetween('-40 years', '-5 years')->format('Y-m-d'),
            'codice_fiscale' => strtoupper($this->faker->bothify('??????##?##?###?')),
            'citta' => $this->faker->city(),
            'cap' => $this->faker->postcode(),
            'is_minorenne' => $isMinorenne,
            'genitore_nome' => $isMinorenne ? $this->faker->firstName() : null,
            'genitore_cognome' => $isMinorenne ? $this->faker->lastName() : null,
            'genitore_telefono' => $isMinorenne ? $this->faker->phoneNumber() : null,
            'genitore_email' => $isMinorenne ? $this->faker->safeEmail() : null,
            'attivo' => $this->faker->boolean(85),
            'note' => $this->faker->optional()->sentence(),
        ];
    }
}
