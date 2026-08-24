<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_an_activity_owned_by_themselves(): void
    {
        $company = Company::factory()->create();
        $comercial = User::factory()->create(['company_id' => $company->id]);
        $comercial->assignRole('comercial');

        $response = $this->actingAs($comercial)->postJson('/api/activities', [
            'type' => 'llamada',
            'title' => 'Llamar para seguimiento',
            'status' => 'pendiente',
            'priority' => 'media',
        ]);

        $response->assertCreated()->assertJsonPath('data.user_id', $comercial->id);
    }

    public function test_a_vendedor_only_sees_their_own_activities(): void
    {
        $company = Company::factory()->create();
        $vendedor = User::factory()->create(['company_id' => $company->id]);
        $vendedor->assignRole('vendedor');
        $other = User::factory()->create(['company_id' => $company->id]);
        $other->assignRole('vendedor');

        Activity::factory()->count(2)->create(['company_id' => $company->id, 'user_id' => $vendedor->id]);
        Activity::factory()->count(3)->create(['company_id' => $company->id, 'user_id' => $other->id]);

        $this->actingAs($vendedor)
            ->getJson('/api/activities')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_vendedor_cannot_delete_someone_elses_activity(): void
    {
        $company = Company::factory()->create();
        $vendedor = User::factory()->create(['company_id' => $company->id]);
        $vendedor->assignRole('vendedor');
        $other = User::factory()->create(['company_id' => $company->id]);
        $other->assignRole('vendedor');
        $activity = Activity::factory()->create(['company_id' => $company->id, 'user_id' => $other->id]);

        $this->actingAs($vendedor)
            ->deleteJson("/api/activities/{$activity->id}")
            ->assertForbidden();
    }

    public function test_an_administrador_can_delete_any_activity(): void
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');
        $activity = Activity::factory()->create(['company_id' => $company->id]);

        $this->actingAs($admin)
            ->deleteJson("/api/activities/{$activity->id}")
            ->assertNoContent();
    }
}
