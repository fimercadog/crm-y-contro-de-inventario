<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\OpportunityItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OpportunityItem>
 */
class OpportunityItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 10, 500);
        $discount = fake()->randomFloat(2, 0, $unitPrice);

        return [
            'company_id' => Company::factory(),
            'opportunity_id' => Opportunity::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount_amount' => $discount,
            'subtotal' => round(($quantity * $unitPrice) - $discount, 2),
        ];
    }
}
