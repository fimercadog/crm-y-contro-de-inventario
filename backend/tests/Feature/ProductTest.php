<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    private function basePayload(Company $company): array
    {
        return [
            'sku' => 'SKU-TEST-1',
            'name' => 'Producto de prueba',
            'category_id' => Category::factory()->create(['company_id' => $company->id])->id,
            'unit_id' => Unit::factory()->create(['company_id' => $company->id])->id,
            'cost' => 10,
            'sale_price' => 15,
            'minimum_stock' => 5,
            'status' => 'activo',
        ];
    }

    public function test_inventario_can_create_a_product(): void
    {
        $company = Company::factory()->create();
        $inventario = $this->makeUser('inventario', $company);

        $response = $this->actingAs($inventario)
            ->postJson('/api/products', $this->basePayload($company));

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Producto de prueba')
            ->assertJsonPath('data.current_stock', 0);
    }

    public function test_current_stock_cannot_be_set_via_store_or_update(): void
    {
        $company = Company::factory()->create();
        $inventario = $this->makeUser('inventario', $company);

        $response = $this->actingAs($inventario)->postJson('/api/products', [
            ...$this->basePayload($company),
            'current_stock' => 9999,
        ]);
        $response->assertCreated()->assertJsonPath('data.current_stock', 0);

        $product = Product::first();

        $this->actingAs($inventario)->putJson("/api/products/{$product->id}", [
            ...$this->basePayload($company),
            'sku' => $product->sku,
            'current_stock' => 9999,
        ])->assertOk()->assertJsonPath('data.current_stock', 0);

        $this->assertSame(0, $product->fresh()->current_stock);
    }

    public function test_a_comercial_can_view_but_not_create_products(): void
    {
        $company = Company::factory()->create();
        $comercial = $this->makeUser('comercial', $company);
        Product::factory()->create(['company_id' => $company->id]);

        $this->actingAs($comercial)->getJson('/api/products')->assertOk();

        $this->actingAs($comercial)
            ->postJson('/api/products', $this->basePayload($company))
            ->assertForbidden();
    }

    public function test_a_vendedor_cannot_access_products(): void
    {
        $vendedor = $this->makeUser('vendedor');

        $this->actingAs($vendedor)->getJson('/api/products')->assertForbidden();
    }

    public function test_products_are_isolated_per_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        Product::factory()->count(2)->create(['company_id' => $companyA->id]);
        Product::factory()->count(4)->create(['company_id' => $companyB->id]);

        $userA = $this->makeUser('inventario', $companyA);

        $this->actingAs($userA)
            ->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_low_stock_filter_only_returns_products_at_or_below_minimum(): void
    {
        $company = Company::factory()->create();
        $inventario = $this->makeUser('inventario', $company);
        Product::factory()->create(['company_id' => $company->id, 'minimum_stock' => 10, 'current_stock' => 5]);
        Product::factory()->create(['company_id' => $company->id, 'minimum_stock' => 10, 'current_stock' => 50]);

        $this->actingAs($inventario)
            ->getJson('/api/products?low_stock=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_deleting_a_product_soft_deletes_it(): void
    {
        $company = Company::factory()->create();
        $inventario = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id]);

        $this->actingAs($inventario)
            ->deleteJson("/api/products/{$product->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_suppliers_can_be_synced_to_a_product(): void
    {
        $company = Company::factory()->create();
        $inventario = $this->makeUser('inventario', $company);
        $suppliers = Supplier::factory()->count(2)->create(['company_id' => $company->id]);

        $response = $this->actingAs($inventario)->postJson('/api/products', [
            ...$this->basePayload($company),
            'supplier_ids' => $suppliers->pluck('id')->all(),
        ]);

        $response->assertCreated();
        $product = Product::first();
        $this->assertCount(2, $product->suppliers);
    }
}
