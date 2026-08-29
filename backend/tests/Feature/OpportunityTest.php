<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_a_comercial_can_create_an_opportunity_and_it_logs_stage_history(): void
    {
        $company = Company::factory()->create();
        $comercial = $this->makeUser('comercial', $company);
        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($comercial)->postJson('/api/opportunities', [
            'customer_id' => $customer->id,
            'title' => 'Venta de equipos',
            'amount' => 1000,
            'probability' => 50,
            'stage_id' => $stage->id,
            'status' => 'abierta',
        ]);

        $response->assertCreated()->assertJsonPath('data.title', 'Venta de equipos');

        $opportunity = Opportunity::first();
        $this->assertDatabaseHas('opportunity_stage_histories', [
            'opportunity_id' => $opportunity->id,
            'from_stage_id' => null,
            'to_stage_id' => $stage->id,
        ]);
    }

    public function test_moving_an_opportunity_to_a_new_stage_logs_history(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $stageA = PipelineStage::factory()->create(['company_id' => $company->id, 'order' => 1]);
        $stageB = PipelineStage::factory()->create(['company_id' => $company->id, 'order' => 2]);
        $opportunity = Opportunity::factory()->create([
            'company_id' => $company->id,
            'stage_id' => $stageA->id,
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/opportunities/{$opportunity->id}/stage", ['stage_id' => $stageB->id])
            ->assertOk()
            ->assertJsonPath('data.stage_id', $stageB->id);

        $this->assertDatabaseHas('opportunity_stage_histories', [
            'opportunity_id' => $opportunity->id,
            'from_stage_id' => $stageA->id,
            'to_stage_id' => $stageB->id,
        ]);
    }

    public function test_a_vendedor_only_sees_their_assigned_opportunities(): void
    {
        $company = Company::factory()->create();
        $vendedor = $this->makeUser('vendedor', $company);
        $other = $this->makeUser('vendedor', $company);

        Opportunity::factory()->count(2)->create([
            'company_id' => $company->id,
            'assigned_user_id' => $vendedor->id,
        ]);
        Opportunity::factory()->count(3)->create([
            'company_id' => $company->id,
            'assigned_user_id' => $other->id,
        ]);

        $this->actingAs($vendedor)
            ->getJson('/api/opportunities')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_opportunities_are_isolated_per_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        Opportunity::factory()->count(2)->create(['company_id' => $companyA->id]);
        Opportunity::factory()->count(4)->create(['company_id' => $companyB->id]);

        $userA = $this->makeUser('comercial', $companyA);

        $this->actingAs($userA)
            ->getJson('/api/opportunities')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_an_inventario_user_cannot_access_opportunities(): void
    {
        $inventario = $this->makeUser('inventario');

        $this->actingAs($inventario)
            ->getJson('/api/opportunities')
            ->assertForbidden();
    }

    public function test_opportunity_can_be_created_with_product_items_and_calculated_amount(): void
    {
        $company = Company::factory()->create();
        $comercial = $this->makeUser('comercial', $company);
        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id]);
        $drill = Product::factory()->create(['company_id' => $company->id, 'sale_price' => 100]);
        $paint = Product::factory()->create(['company_id' => $company->id, 'sale_price' => 25]);

        $response = $this->actingAs($comercial)->postJson('/api/opportunities', [
            'customer_id' => $customer->id,
            'title' => 'Cotización con productos',
            'amount' => 1,
            'probability' => 50,
            'stage_id' => $stage->id,
            'status' => 'abierta',
            'items' => [
                [
                    'product_id' => $drill->id,
                    'quantity' => 2,
                    'unit_price' => 100,
                    'discount_amount' => 10,
                ],
                [
                    'product_id' => $paint->id,
                    'quantity' => 3,
                    'unit_price' => 25,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.amount', 265)
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('opportunity_items', [
            'product_id' => $drill->id,
            'quantity' => 2,
            'subtotal' => 190,
        ]);
    }

    public function test_opportunity_items_can_be_updated_and_recalculate_amount(): void
    {
        $company = Company::factory()->create();
        $admin = $this->makeUser('administrador', $company);
        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id]);
        $product = Product::factory()->create(['company_id' => $company->id]);
        $opportunity = Opportunity::factory()->create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'stage_id' => $stage->id,
            'amount' => 500,
        ]);

        $this->actingAs($admin)->putJson("/api/opportunities/{$opportunity->id}", [
            'customer_id' => $customer->id,
            'title' => $opportunity->title,
            'amount' => 500,
            'probability' => 60,
            'stage_id' => $stage->id,
            'status' => 'abierta',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 4,
                    'unit_price' => 40,
                    'discount_amount' => 15,
                ],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.amount', 145)
            ->assertJsonCount(1, 'data.items');

        $this->assertSame('145.00', $opportunity->fresh()->amount);
    }

    public function test_opportunity_items_cannot_reference_products_from_another_company(): void
    {
        $company = Company::factory()->create();
        $otherCompany = Company::factory()->create();
        $comercial = $this->makeUser('comercial', $company);
        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id]);
        $foreignProduct = Product::factory()->create(['company_id' => $otherCompany->id]);

        $this->actingAs($comercial)->postJson('/api/opportunities', [
            'customer_id' => $customer->id,
            'title' => 'Producto ajeno',
            'amount' => 100,
            'probability' => 50,
            'stage_id' => $stage->id,
            'status' => 'abierta',
            'items' => [
                [
                    'product_id' => $foreignProduct->id,
                    'quantity' => 1,
                    'unit_price' => 100,
                ],
            ],
        ])->assertUnprocessable();
    }
}
