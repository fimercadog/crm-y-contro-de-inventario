<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
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
            'user_id' => User::factory(),
            'type' => fake()->randomElement([
                'llamada', 'reunion', 'email', 'whatsapp', 'tarea', 'seguimiento', 'nota', 'otro',
            ]),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'scheduled_at' => fake()->dateTimeBetween('-1 week', '+2 weeks'),
            'status' => fake()->randomElement(['pendiente', 'completada', 'cancelada']),
            'priority' => fake()->randomElement(['baja', 'media', 'alta']),
        ];
    }
}
