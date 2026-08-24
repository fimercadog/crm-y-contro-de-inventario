<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_comercial_can_add_a_contact_to_a_customer(): void
    {
        $company = Company::factory()->create();
        $comercial = User::factory()->create(['company_id' => $company->id]);
        $comercial->assignRole('comercial');
        $customer = Customer::factory()->create(['company_id' => $company->id, 'type' => 'empresa']);

        $this->actingAs($comercial)
            ->postJson("/api/customers/{$customer->id}/contacts", [
                'first_name' => 'Ana',
                'last_name' => 'Pérez',
                'status' => 'activo',
                'is_primary' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.full_name', 'Ana Pérez');

        $this->assertDatabaseHas('contacts', [
            'customer_id' => $customer->id,
            'first_name' => 'Ana',
        ]);
    }

    public function test_a_vendedor_cannot_add_a_contact_to_a_customer_not_assigned_to_them(): void
    {
        $company = Company::factory()->create();
        $vendedor = User::factory()->create(['company_id' => $company->id]);
        $vendedor->assignRole('vendedor');
        $customer = Customer::factory()->create([
            'company_id' => $company->id,
            'assigned_user_id' => null,
        ]);

        $this->actingAs($vendedor)
            ->postJson("/api/customers/{$customer->id}/contacts", [
                'first_name' => 'Ana',
                'last_name' => 'Pérez',
                'status' => 'activo',
            ])
            ->assertForbidden();
    }

    public function test_contacts_index_only_returns_the_users_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $customerA = Customer::factory()->create(['company_id' => $companyA->id]);
        $customerB = Customer::factory()->create(['company_id' => $companyB->id]);
        $customerA->contacts()->create([
            'first_name' => 'A', 'last_name' => 'One', 'status' => 'activo',
        ]);
        $customerB->contacts()->create([
            'first_name' => 'B', 'last_name' => 'Two', 'status' => 'activo',
        ]);

        $userA = User::factory()->create(['company_id' => $companyA->id]);
        $userA->assignRole('comercial');

        $this->actingAs($userA)
            ->getJson('/api/contacts')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.first_name', 'A');
    }

    public function test_deleting_a_contact(): void
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');
        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $contact = $customer->contacts()->create([
            'first_name' => 'A', 'last_name' => 'One', 'status' => 'activo',
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/contacts/{$contact->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }
}
