<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['persona', 'empresa']);

        return [
            'company_id' => Company::factory(),
            'type' => $type,
            'name' => $type === 'empresa' ? fake()->unique()->company() : fake()->unique()->name(),
            'document_type' => $type === 'empresa' ? 'NIT' : 'CC',
            'document_number' => fake()->unique()->numerify('#########-#'),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'mobile' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'website' => $type === 'empresa' ? fake()->domainName() : null,
            'status' => fake()->randomElement(['activo', 'prospecto', 'inactivo']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
