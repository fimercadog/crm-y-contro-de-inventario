<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'type' => 'entrada',
            'quantity' => fake()->numberBetween(1, 20),
            'previous_stock' => 0,
            'new_stock' => fake()->numberBetween(1, 20),
            'unit_cost' => fake()->randomFloat(2, 2, 200),
            'reference' => fake()->optional()->bothify('MOV-####'),
            'notes' => fake()->optional()->sentence(),
            'occurred_at' => now(),
        ];
    }
}
