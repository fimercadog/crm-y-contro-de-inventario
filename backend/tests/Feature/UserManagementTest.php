<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_an_administrador_can_create_a_user_with_a_role(): void
    {
        $admin = $this->makeUser('administrador');

        $response = $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'Nuevo Vendedor',
            'email' => 'nuevo.vendedor@example.com',
            'password' => 'password123',
            'role' => 'vendedor',
            'status' => 'active',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Nuevo Vendedor')
            ->assertJsonPath('data.role', 'vendedor');

        $this->assertDatabaseHas('users', [
            'email' => 'nuevo.vendedor@example.com',
            'company_id' => $admin->company_id,
        ]);
    }

    public function test_a_vendedor_cannot_manage_users(): void
    {
        $vendedor = $this->makeUser('vendedor');

        $this->actingAs($vendedor)
            ->getJson('/api/admin/users')
            ->assertForbidden();

        $this->actingAs($vendedor)
            ->postJson('/api/admin/users', [
                'name' => 'X', 'email' => 'x@example.com', 'password' => 'password123',
                'role' => 'comercial', 'status' => 'active',
            ])
            ->assertForbidden();
    }

    public function test_updating_a_users_role_changes_it(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $target = $this->makeUser('vendedor', $company);

        $this->actingAs($admin)
            ->putJson("/api/admin/users/{$target->id}", [
                'name' => $target->name,
                'email' => $target->email,
                'role' => 'comercial',
                'status' => 'active',
            ])
            ->assertOk()
            ->assertJsonPath('data.role', 'comercial');

        $this->assertTrue($target->fresh()->hasRole('comercial'));
        $this->assertFalse($target->fresh()->hasRole('vendedor'));
    }

    public function test_deleting_a_user_deactivates_instead_of_removing_the_row(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $target = $this->makeUser('vendedor', $company);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_a_user_cannot_deactivate_themselves(): void
    {
        $admin = $this->makeUser('administrador');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$admin->id}")
            ->assertForbidden();
    }

    public function test_users_are_isolated_per_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $admin = $this->makeUser('administrador', $companyA);
        User::factory()->count(2)->create(['company_id' => $companyA->id]);
        User::factory()->count(3)->create(['company_id' => $companyB->id]);

        $this->actingAs($admin)
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonCount(3, 'data'); // admin + 2 in company A
    }

    public function test_roles_overview_lists_the_five_fixed_roles_with_counts(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $this->makeUser('vendedor', $company);
        $this->makeUser('vendedor', $company);

        $response = $this->actingAs($admin)->getJson('/api/admin/roles')->assertOk();
        $roles = collect($response->json('data'));

        $this->assertCount(5, $roles);
        $this->assertSame(2, $roles->firstWhere('name', 'vendedor')['users_count']);
    }
}
