<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public static function catalogs(): array
    {
        return [
            'categories' => ['categories', Category::class, ['name' => 'Ferretería', 'status' => 'activo']],
            'brands' => ['brands', Brand::class, ['name' => 'Bosch', 'status' => 'activo']],
            'units' => ['units', Unit::class, ['name' => 'Unidad', 'abbreviation' => 'UND', 'status' => 'activo']],
            'suppliers' => ['suppliers', Supplier::class, ['name' => 'Suministros SAS', 'status' => 'activo']],
        ];
    }

    private function makeUser(string $role, ?Company $company = null): User
    {
        $company ??= Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    #[DataProvider('catalogs')]
    public function test_inventario_can_manage_the_catalog(string $uri, string $model, array $payload): void
    {
        $inventario = $this->makeUser('inventario');

        $response = $this->actingAs($inventario)->postJson("/api/{$uri}", $payload);
        $response->assertCreated()->assertJsonPath('data.name', $payload['name']);

        $id = $response->json('data.id');

        $this->actingAs($inventario)
            ->putJson("/api/{$uri}/{$id}", [...$payload, 'status' => 'inactivo'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactivo');

        $this->actingAs($inventario)
            ->deleteJson("/api/{$uri}/{$id}")
            ->assertNoContent();

        $this->assertSoftDeleted((new $model)->getTable(), ['id' => $id]);

        // Still listed by default (flagged deleted), and restorable.
        $this->actingAs($inventario)
            ->getJson("/api/{$uri}")
            ->assertJsonPath('data.0.id', $id)
            ->assertJsonPath('data.0.deleted_at', fn ($v) => $v !== null);

        $this->actingAs($inventario)
            ->postJson("/api/{$uri}/{$id}/restore")
            ->assertOk()
            ->assertJsonPath('data.deleted_at', null);

        $this->assertNotSoftDeleted((new $model)->getTable(), ['id' => $id]);
    }

    #[DataProvider('catalogs')]
    public function test_comercial_cannot_manage_the_catalog(string $uri, string $model, array $payload): void
    {
        $comercial = $this->makeUser('comercial');

        $this->actingAs($comercial)
            ->postJson("/api/{$uri}", $payload)
            ->assertForbidden();

        $this->actingAs($comercial)
            ->getJson("/api/{$uri}")
            ->assertForbidden();
    }

    #[DataProvider('catalogs')]
    public function test_catalog_entries_are_isolated_per_company(string $uri, string $model, array $payload): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $model::factory()->count(2)->create(['company_id' => $companyA->id]);
        $model::factory()->count(3)->create(['company_id' => $companyB->id]);

        $userA = $this->makeUser('administrador', $companyA);

        $this->actingAs($userA)
            ->getJson("/api/{$uri}")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
