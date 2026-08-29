<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_newly_covered_tables_export_as_csv(): void
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');

        $customer = Customer::factory()->create(['company_id' => $company->id]);
        $customer->contacts()->create(['first_name' => 'Ana', 'last_name' => 'Ruiz', 'status' => 'activo']);
        Activity::factory()->create(['company_id' => $company->id, 'user_id' => $admin->id]);

        foreach (['contacts', 'activities', 'admin/users', 'audit-logs'] as $resource) {
            $this->actingAs($admin)
                ->get("/api/{$resource}/export/csv")
                ->assertOk()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        }
    }

    public function test_audit_export_is_forbidden_without_the_permission(): void
    {
        $user = User::factory()->create(['company_id' => Company::factory()->create()->id]);
        $user->assignRole('vendedor');

        $this->actingAs($user)->get('/api/audit-logs/export/csv')->assertForbidden();
    }
}
