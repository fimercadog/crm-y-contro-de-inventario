<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_log_in_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'demo@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'demo@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email', 'roles', 'permissions']]);

        $token = $response->json('token');
        $this->getJson('/api/me', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'demo@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'demo@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_inactive_users_cannot_log_in(): void
    {
        User::factory()->create([
            'email' => 'demo@example.com',
            'password' => Hash::make('secret123'),
            'status' => 'inactive',
        ]);

        $this->postJson('/api/login', [
            'email' => 'demo@example.com',
            'password' => 'secret123',
        ])->assertUnprocessable();
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
        ]);
        $accessToken = $user->createToken('api');

        $this->postJson('/api/logout', [], ['Authorization' => "Bearer {$accessToken->plainTextToken}"])
            ->assertNoContent();

        // Asserted against the database rather than a follow-up authenticated
        // request: Sanctum's RequestGuard caches the resolved user for the
        // lifetime of the test's shared container, so a second call here
        // would still authenticate even though the token row is gone.
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $accessToken->accessToken->id,
        ]);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }
}
