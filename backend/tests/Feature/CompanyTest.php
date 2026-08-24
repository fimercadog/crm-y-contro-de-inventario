<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_view_their_own_company(): void
    {
        $company = Company::factory()->create(['name' => 'Acme Corp']);
        $user = User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($user)
            ->getJson('/api/company')
            ->assertOk()
            ->assertJsonPath('data.name', 'Acme Corp');
    }

    public function test_an_admin_can_update_their_company(): void
    {
        $company = Company::factory()->create(['name' => 'Old Name']);
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');

        $this->actingAs($admin)
            ->putJson('/api/company', [
                'name' => 'New Name',
                'currency' => 'EUR',
                'allow_negative_stock' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.currency', 'EUR')
            ->assertJsonPath('data.allow_negative_stock', true);

        $this->assertSame('New Name', $company->fresh()->name);
    }

    public function test_a_non_admin_cannot_update_the_company(): void
    {
        $company = Company::factory()->create();
        $vendedor = User::factory()->create(['company_id' => $company->id]);
        $vendedor->assignRole('vendedor');

        $this->actingAs($vendedor)
            ->putJson('/api/company', [
                'name' => 'Hacked Name',
                'currency' => 'USD',
                'allow_negative_stock' => false,
            ])
            ->assertForbidden();
    }

    public function test_a_user_cannot_see_another_companys_data_leak_through_this_endpoint(): void
    {
        $companyA = Company::factory()->create(['name' => 'Company A']);
        $companyB = Company::factory()->create(['name' => 'Company B']);
        $userA = User::factory()->create(['company_id' => $companyA->id]);

        // There is no route parameter to tamper with; /api/company always
        // resolves from the authenticated user, so it can only ever return
        // their own company.
        $this->actingAs($userA)
            ->getJson('/api/company')
            ->assertJsonPath('data.name', 'Company A')
            ->assertJsonMissing(['name' => 'Company B']);
    }
}
