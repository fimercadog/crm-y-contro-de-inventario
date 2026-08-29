<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role, Company $company): User
    {
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole($role);

        return $user;
    }

    public function test_model_changes_are_recorded_with_the_acting_user(): void
    {
        $company = Company::factory()->create();
        $actor = $this->user('administrador', $company);

        $this->actingAs($actor);
        $customer = Customer::factory()->create(['company_id' => $company->id, 'name' => 'ACME']);

        $created = AuditLog::where('auditable_type', Customer::class)
            ->where('auditable_id', $customer->id)
            ->where('event', 'created')
            ->first();

        $this->assertNotNull($created);
        $this->assertSame($actor->id, $created->user_id);
        $this->assertSame($company->id, $created->company_id);

        $customer->update(['name' => 'ACME S.A.']);

        $updated = AuditLog::where('auditable_id', $customer->id)->where('event', 'updated')->first();
        $this->assertSame('ACME', $updated->changes['name']['from']);
        $this->assertSame('ACME S.A.', $updated->changes['name']['to']);
    }

    public function test_no_audit_row_is_written_when_nothing_effectively_changes(): void
    {
        $company = Company::factory()->create();
        $product = Product::factory()->create(['company_id' => $company->id, 'name' => 'Taladro']);

        AuditLog::query()->delete();
        $product->update(['name' => 'Taladro']); // same value

        $this->assertSame(0, AuditLog::where('event', 'updated')->count());
    }

    public function test_audit_log_endpoint_is_admin_only_and_company_scoped(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();

        AuditLog::create([
            'company_id' => $companyA->id, 'user_id' => null, 'event' => 'created',
            'auditable_type' => Customer::class, 'auditable_id' => 1, 'changes' => null,
        ]);
        AuditLog::create([
            'company_id' => $companyB->id, 'user_id' => null, 'event' => 'created',
            'auditable_type' => Customer::class, 'auditable_id' => 2, 'changes' => null,
        ]);

        $this->actingAs($this->user('inventario', $companyA))
            ->getJson('/api/audit-logs')
            ->assertForbidden();

        $this->actingAs($this->user('administrador', $companyA))
            ->getJson('/api/audit-logs?entity=Customer')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.auditable_id', 1);
    }
}
