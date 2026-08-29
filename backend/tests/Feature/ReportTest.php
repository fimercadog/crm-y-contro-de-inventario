<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Company;
use App\Models\Opportunity;
use App\Models\OpportunityItem;
use App\Models\PipelineStage;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private function admin(Company $company): User
    {
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('administrador');

        return $user;
    }

    public function test_inventory_valuation_groups_stock_value_by_category(): void
    {
        $company = Company::factory()->create();
        $category = Category::factory()->create(['company_id' => $company->id, 'name' => 'Herramientas']);
        Product::factory()->create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'current_stock' => 10,
            'cost' => 5,
        ]);
        Product::factory()->create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'current_stock' => 4,
            'cost' => 2.5,
        ]);

        $this->actingAs($this->admin($company))
            ->getJson('/api/reports/inventory-valuation')
            ->assertOk()
            ->assertJsonPath('rows.0.category', 'Herramientas')
            ->assertJsonPath('rows.0.products', 2)
            ->assertJsonPath('rows.0.units', 14)
            ->assertJsonPath('rows.0.value', '60.00');
    }

    public function test_sales_by_product_only_counts_won_opportunities_in_range(): void
    {
        $company = Company::factory()->create();
        $product = Product::factory()->create(['company_id' => $company->id]);
        $stage = PipelineStage::factory()->create(['company_id' => $company->id]);

        $won = Opportunity::factory()->create([
            'company_id' => $company->id,
            'stage_id' => $stage->id,
            'status' => 'ganada',
            'expected_close_date' => '2026-08-15',
        ]);
        OpportunityItem::factory()->create([
            'company_id' => $company->id,
            'opportunity_id' => $won->id,
            'product_id' => $product->id,
            'quantity' => 3,
            'subtotal' => 300,
        ]);

        $open = Opportunity::factory()->create([
            'company_id' => $company->id,
            'stage_id' => $stage->id,
            'status' => 'abierta',
            'expected_close_date' => '2026-08-15',
        ]);
        OpportunityItem::factory()->create([
            'company_id' => $company->id,
            'opportunity_id' => $open->id,
            'product_id' => $product->id,
            'quantity' => 9,
            'subtotal' => 900,
        ]);

        $this->actingAs($this->admin($company))
            ->getJson('/api/reports/sales-by-product?from=2026-08-01&to=2026-08-31')
            ->assertOk()
            ->assertJsonCount(1, 'rows')
            ->assertJsonPath('rows.0.quantity', 3)
            ->assertJsonPath('rows.0.total', '300.00');
    }

    public function test_reports_are_forbidden_for_non_admin_roles(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('inventario');

        $this->actingAs($user)
            ->getJson('/api/reports/inventory-valuation')
            ->assertForbidden();
    }

    public function test_report_can_be_exported_as_csv(): void
    {
        $company = Company::factory()->create();
        Product::factory()->create(['company_id' => $company->id, 'current_stock' => 2, 'cost' => 3]);

        $response = $this->actingAs($this->admin($company))
            ->get('/api/reports/inventory-valuation?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
    }
}
