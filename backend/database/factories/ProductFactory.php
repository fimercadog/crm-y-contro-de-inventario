<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cost = fake()->randomFloat(2, 2, 300);

        return [
            'company_id' => Company::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'barcode' => fake()->optional()->ean13(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'cost' => $cost,
            'sale_price' => round($cost * fake()->randomFloat(2, 1.2, 1.8), 2),
            'minimum_stock' => fake()->numberBetween(5, 20),
            'maximum_stock' => fake()->numberBetween(50, 200),
            'current_stock' => fake()->numberBetween(0, 100),
            'status' => 'activo',
        ];
    }
}
