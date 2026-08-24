<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Opportunity>
 */
class OpportunityFactory extends Factory
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
            'customer_id' => Customer::factory(),
            'title' => fake()->catchPhrase(),
            'description' => fake()->optional()->paragraph(),
            'amount' => fake()->randomFloat(2, 500, 50000),
            'probability' => fake()->numberBetween(10, 90),
            'stage_id' => PipelineStage::factory(),
            'expected_close_date' => fake()->dateTimeBetween('now', '+3 months'),
            'source' => fake()->randomElement(['referido', 'web', 'llamada fría', 'evento']),
            'status' => 'abierta',
        ];
    }
}
