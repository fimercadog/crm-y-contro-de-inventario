<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryMovementTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_inventory_service_registers_entries_and_updates_stock(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 5]);

        $movement = app(InventoryService::class)->move($product, $user, 'entrada', 7, 12.50, 'OC-1');

        $this->assertSame(12, $product->fresh()->current_stock);
        $this->assertSame('entrada', $movement->type);
        $this->assertSame(5, $movement->previous_stock);
        $this->assertSame(12, $movement->new_stock);
        $this->assertSame('OC-1', $movement->reference);
    }

    public function test_inventory_service_blocks_negative_stock_when_company_disallows_it(): void
    {
        $company = Company::factory()->create(['allow_negative_stock' => false]);
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 2]);

        $this->expectExceptionMessage('Stock insuficiente para registrar la salida.');

        app(InventoryService::class)->move($product, $user, 'salida', 3);
    }

    public function test_inventory_service_allows_negative_stock_when_company_allows_it(): void
    {
        $company = Company::factory()->create(['allow_negative_stock' => true]);
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 2]);

        app(InventoryService::class)->move($product, $user, 'salida', 3);

        $this->assertSame(-1, $product->fresh()->current_stock);
    }

    public function test_adjustment_sets_stock_to_physical_count(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 15]);

        $movement = app(InventoryService::class)->move($product, $user, 'ajuste', 8);

        $this->assertSame(8, $product->fresh()->current_stock);
        $this->assertSame(8, $movement->quantity);
        $this->assertSame(15, $movement->previous_stock);
        $this->assertSame(8, $movement->new_stock);
    }

    public function test_inventory_movements_endpoint_creates_a_movement(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 4]);

        $this->actingAs($user)
            ->postJson('/api/inventory-movements', [
                'product_id' => $product->id,
                'type' => 'entrada',
                'quantity' => 6,
                'unit_cost' => 10.25,
                'reference' => 'OC-99',
            ])
            ->assertCreated()
            ->assertJsonPath('data.product_name', $product->name)
            ->assertJsonPath('data.previous_stock', 4)
            ->assertJsonPath('data.new_stock', 10);

        $this->assertSame(10, $product->fresh()->current_stock);
    }

    public function test_inventory_movements_are_isolated_per_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $userA = $this->makeUser('inventario', $companyA);

        InventoryMovement::factory()->count(2)->create(['company_id' => $companyA->id]);
        InventoryMovement::factory()->count(3)->create(['company_id' => $companyB->id]);

        $this->actingAs($userA)
            ->getJson('/api/inventory-movements')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_inventory_movements_can_be_exported_to_csv_respecting_filters(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id]);

        InventoryMovement::factory()->create(['company_id' => $company->id, 'product_id' => $product->id, 'type' => 'entrada']);
        InventoryMovement::factory()->create(['company_id' => $company->id, 'product_id' => $product->id, 'type' => 'salida']);

        $response = $this->actingAs($user)->get('/api/inventory-movements/export/csv?type=entrada');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
        $lines = array_values(array_filter(explode("\n", trim($response->streamedContent()))));
        $this->assertCount(2, $lines); // header + 1 filtered row
        $this->assertStringContainsString('entrada', $lines[1]);
    }

    public function test_comercial_and_vendedor_cannot_create_inventory_movements(): void
    {
        $company = Company::factory()->create();
        $product = Product::factory()->create(['company_id' => $company->id]);

        foreach (['comercial', 'vendedor'] as $role) {
            $user = $this->makeUser($role, $company);

            $this->actingAs($user)
                ->postJson('/api/inventory-movements', [
                    'product_id' => $product->id,
                    'type' => 'entrada',
                    'quantity' => 1,
                ])
                ->assertForbidden();
        }
    }

    public function test_an_entrada_can_be_corrected_and_stock_follows(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 5]);

        $movement = app(InventoryService::class)->move($product, $user, 'entrada', 10, null, 'OC-1');
        $this->assertSame(15, $product->fresh()->current_stock);

        $this->actingAs($user)
            ->putJson("/api/inventory-movements/{$movement->id}", ['quantity' => 4, 'reference' => 'OC-1b'])
            ->assertOk()
            ->assertJsonPath('data.quantity', 4)
            ->assertJsonPath('data.new_stock', 9);

        $this->assertSame(9, $product->fresh()->current_stock); // 5 + 4
    }

    public function test_voiding_a_salida_reverses_the_stock_and_soft_deletes_it(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 20]);

        $movement = app(InventoryService::class)->move($product, $user, 'salida', 8);
        $this->assertSame(12, $product->fresh()->current_stock);

        $this->actingAs($user)
            ->deleteJson("/api/inventory-movements/{$movement->id}")
            ->assertNoContent();

        $this->assertSame(20, $product->fresh()->current_stock);
        $this->assertSoftDeleted('inventory_movements', ['id' => $movement->id]);

        // Still visible in the ledger, flagged as voided.
        $this->actingAs($user)
            ->getJson('/api/inventory-movements')
            ->assertJsonPath('data.0.voided', true);
    }

    public function test_an_adjustment_cannot_be_edited_or_voided(): void
    {
        $company = Company::factory()->create();
        $user = $this->makeUser('inventario', $company);
        $product = Product::factory()->create(['company_id' => $company->id, 'current_stock' => 3]);

        $movement = app(InventoryService::class)->move($product, $user, 'ajuste', 10);

        $this->actingAs($user)
            ->deleteJson("/api/inventory-movements/{$movement->id}")
            ->assertStatus(422);
        $this->actingAs($user)
            ->putJson("/api/inventory-movements/{$movement->id}", ['quantity' => 5])
            ->assertStatus(422);
    }
}
