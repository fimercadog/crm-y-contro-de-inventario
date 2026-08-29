<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use App\Services\Ai\AiProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_ask_requires_authentication(): void
    {
        $this->postJson('/api/ai/ask', ['message' => 'hola'])->assertUnauthorized();
    }

    public function test_stub_provider_answers_with_company_scoped_context(): void
    {
        $company = Company::factory()->create(['name' => 'Ferretería Central']);
        Customer::factory()->count(3)->create(['company_id' => $company->id]);
        Customer::factory()->count(9)->create(); // another company, must not leak

        $user = User::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/ask', ['message' => '¿Cuántos clientes tengo?'])
            ->assertOk()
            ->assertJsonPath('provider', 'stub');

        $answer = $response->json('answer');
        $this->assertStringContainsString('Ferretería Central', $answer);
        $this->assertStringContainsString('Clientes: 3', $answer);
    }

    public function test_message_is_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/ai/ask', [])
            ->assertJsonValidationErrors('message');
    }

    public function test_provider_failure_surfaces_as_503(): void
    {
        $this->app->bind(AiProvider::class, fn () => new class implements AiProvider
        {
            public function complete(string $system, string $prompt): string
            {
                throw new \App\Services\Ai\AiUnavailableException('proveedor caído');
            }

            public function name(): string
            {
                return 'openai';
            }
        });

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/ai/ask', ['message' => 'hola'])
            ->assertStatus(503)
            ->assertJsonPath('message', 'proveedor caído');
    }

    public function test_openai_provider_calls_the_api_and_returns_the_reply(): void
    {
        config()->set('services.ai.provider', 'openai');
        config()->set('services.ai.openai.key', 'test-key');

        Http::fake([
            'api.openai.com/*' => Http::response([
                'choices' => [['message' => ['content' => 'Tienes 3 clientes.']]],
            ]),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/ai/ask', ['message' => '¿clientes?'])
            ->assertOk()
            ->assertJsonPath('answer', 'Tienes 3 clientes.')
            ->assertJsonPath('provider', 'openai');
    }
}
