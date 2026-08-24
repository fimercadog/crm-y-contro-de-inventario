<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\PipelineStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PipelineStage>
 */
class PipelineStageFactory extends Factory
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
            'name' => fake()->unique()->word(),
            'order' => fake()->unique()->numberBetween(1, 20),
            'is_won' => false,
            'is_lost' => false,
        ];
    }
}
