<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role, Company $company): User
    {
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_dashboard_returns_company_scoped_totals(): void
    {
        $company = Company::factory()->create();
        $other = Company::factory()->create();

        Customer::factory()->count(4)->create(['company_id' => $company->id, 'status' => 'activo']);
        Customer::factory()->count(10)->create(['company_id' => $other->id]);

        $this->actingAs($this->user('administrador', $company))
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('customers.total', 4)
            ->assertJsonPath('customers.active', 4)
            ->assertJsonStructure([
                'customers' => ['total', 'active', 'prospects'],
                'opportunities' => ['open', 'open_amount', 'won_this_month'],
                'activities' => ['pending', 'overdue'],
                'inventory' => ['products', 'low_stock', 'out_of_stock', 'stock_value'],
                'recent_movements',
            ]);
    }

    public function test_a_vendedor_only_sees_their_assigned_records(): void
    {
        $company = Company::factory()->create();
        $vendedor = $this->user('vendedor', $company);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id, 'is_won' => false, 'is_lost' => false]);

        Opportunity::factory()->create([
            'company_id' => $company->id, 'stage_id' => $stage->id,
            'status' => 'abierta', 'assigned_user_id' => $vendedor->id,
        ]);
        Opportunity::factory()->count(3)->create([
            'company_id' => $company->id, 'stage_id' => $stage->id,
            'status' => 'abierta', 'assigned_user_id' => null,
        ]);

        $this->actingAs($vendedor)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('opportunities.open', 1);
    }
}
