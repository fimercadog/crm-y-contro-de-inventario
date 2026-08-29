<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create(['company_id' => Company::factory()->create()->id]);
        $user->assignRole('administrador');

        return $user;
    }

    public function test_index_lists_roles_with_permissions_and_the_catalogue(): void
    {
        $this->actingAs($this->admin())
            ->getJson('/api/admin/roles')
            ->assertOk()
            ->assertJsonPath('data.0.is_system', true)
            ->assertJsonStructure([
                'data' => [['name', 'description', 'is_system', 'permissions', 'users_count']],
                'available_permissions' => [['name', 'label']],
            ]);
    }

    public function test_a_custom_role_can_be_created_and_grants_its_permissions(): void
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');

        $this->actingAs($admin)
            ->postJson('/api/admin/roles', [
                'name' => 'Gerente regional',
                'description' => 'Ve todo el CRM, sin inventario.',
                'permissions' => ['crm.view', 'crm.view_all', 'reports.view'],
            ])
            ->assertCreated();

        $manager = User::factory()->create(['company_id' => $company->id]);
        $manager->assignRole('Gerente regional');

        $this->assertTrue($manager->can('reports.view'));
        $this->assertFalse($manager->can('inventory.manage'));

        // The permission actually gates the endpoint.
        $this->actingAs($manager)->getJson('/api/reports/inventory-valuation')->assertOk();
    }

    public function test_system_roles_cannot_be_renamed_or_deleted(): void
    {
        $admin = $this->admin();
        $vendedor = Role::where('name', 'vendedor')->firstOrFail();

        $this->actingAs($admin)
            ->putJson("/api/admin/roles/{$vendedor->id}", [
                'name' => 'otro-nombre',
                'permissions' => ['crm.view', 'reports.view'],
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'vendedor'); // name untouched

        $this->assertTrue(Role::where('name', 'vendedor')->firstOrFail()->hasPermissionTo('reports.view'));

        $this->actingAs($admin)
            ->deleteJson("/api/admin/roles/{$vendedor->id}")
            ->assertStatus(422);
    }

    public function test_a_role_with_users_cannot_be_deleted(): void
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');

        $role = Role::create(['name' => 'Temporal']);
        $member = User::factory()->create(['company_id' => $company->id]);
        $member->assignRole('Temporal');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/roles/{$role->id}")
            ->assertStatus(422);

        $member->removeRole('Temporal');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/roles/{$role->id}")
            ->assertNoContent();
    }

    public function test_a_comercial_cannot_manage_roles(): void
    {
        $user = User::factory()->create(['company_id' => Company::factory()->create()->id]);
        $user->assignRole('comercial');

        $this->actingAs($user)->getJson('/api/admin/roles')->assertForbidden();
        $this->actingAs($user)->postJson('/api/admin/roles', ['name' => 'X'])->assertForbidden();
    }
}
