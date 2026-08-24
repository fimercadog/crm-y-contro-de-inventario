<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_a_comercial_can_list_and_create_customers(): void
    {
        $comercial = $this->makeUser('comercial');

        $this->actingAs($comercial)
            ->postJson('/api/customers', [
                'type' => 'empresa',
                'name' => 'Ferretería El Tornillo',
                'status' => 'prospecto',
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Ferretería El Tornillo');

        $this->actingAs($comercial)
            ->getJson('/api/customers')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_customers_are_isolated_per_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        Customer::factory()->count(3)->create(['company_id' => $companyA->id]);
        Customer::factory()->count(2)->create(['company_id' => $companyB->id]);

        $userA = $this->makeUser('comercial', $companyA);

        $this->actingAs($userA)
            ->getJson('/api/customers')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_a_vendedor_only_sees_their_assigned_customers(): void
    {
        $company = Company::factory()->create();
        $vendedor = $this->makeUser('vendedor', $company);
        $otherVendedor = $this->makeUser('vendedor', $company);

        Customer::factory()->count(2)->create([
            'company_id' => $company->id,
            'assigned_user_id' => $vendedor->id,
        ]);
        Customer::factory()->count(4)->create([
            'company_id' => $company->id,
            'assigned_user_id' => $otherVendedor->id,
        ]);

        $this->actingAs($vendedor)
            ->getJson('/api/customers')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_vendedor_cannot_view_a_customer_not_assigned_to_them(): void
    {
        $company = Company::factory()->create();
        $vendedor = $this->makeUser('vendedor', $company);
        $customer = Customer::factory()->create([
            'company_id' => $company->id,
            'assigned_user_id' => null,
        ]);

        $this->actingAs($vendedor)
            ->getJson("/api/customers/{$customer->id}")
            ->assertForbidden();
    }

    public function test_a_user_cannot_view_a_customer_from_another_company(): void
    {
        $customerB = Customer::factory()->create();
        $userA = $this->makeUser('super-admin');

        $this->actingAs($userA)
            ->getJson("/api/customers/{$customerB->id}")
            ->assertForbidden();
    }

    public function test_an_inventario_user_cannot_access_customers(): void
    {
        $inventario = $this->makeUser('inventario');

        $this->actingAs($inventario)
            ->getJson('/api/customers')
            ->assertForbidden();
    }

    public function test_a_vendedor_cannot_delete_a_customer(): void
    {
        $company = Company::factory()->create();
        $vendedor = $this->makeUser('vendedor', $company);
        $customer = Customer::factory()->create([
            'company_id' => $company->id,
            'assigned_user_id' => $vendedor->id,
        ]);

        $this->actingAs($vendedor)
            ->deleteJson("/api/customers/{$customer->id}")
            ->assertForbidden();
    }

    public function test_deleting_a_customer_soft_deletes_it(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $customer = Customer::factory()->create(['company_id' => $company->id]);

        $this->actingAs($admin)
            ->deleteJson("/api/customers/{$customer->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }

    public function test_customers_can_be_searched_and_filtered_by_status(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        Customer::factory()->create(['company_id' => $company->id, 'name' => 'Comercial Rios', 'status' => 'activo']);
        Customer::factory()->create(['company_id' => $company->id, 'name' => 'Otro Cliente', 'status' => 'inactivo']);

        $this->actingAs($admin)
            ->getJson('/api/customers?search=Rios')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Comercial Rios');

        $this->actingAs($admin)
            ->getJson('/api/customers?status=inactivo')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Otro Cliente');
    }
}
