<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\PipelineStage;
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
}
