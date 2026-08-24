<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_pipeline_groups_open_opportunities_by_stage(): void
    {
        $company = Company::factory()->create();
        $company->seedDefaultPipelineStages();
        $admin = User::factory()->create(['company_id' => $company->id]);
        $admin->assignRole('administrador');

        $prospecto = PipelineStage::where('company_id', $company->id)->where('name', 'Prospecto')->firstOrFail();
        $calificado = PipelineStage::where('company_id', $company->id)->where('name', 'Calificado')->firstOrFail();

        Opportunity::factory()->count(2)->create(['company_id' => $company->id, 'stage_id' => $prospecto->id]);
        Opportunity::factory()->create(['company_id' => $company->id, 'stage_id' => $calificado->id]);
        Opportunity::factory()->create([
            'company_id' => $company->id,
            'stage_id' => $calificado->id,
            'status' => 'ganada',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/pipeline')->assertOk();
        $stages = collect($response->json());

        $this->assertCount(2, $stages->firstWhere('name', 'Prospecto')['opportunities']);
        $this->assertCount(1, $stages->firstWhere('name', 'Calificado')['opportunities']);
    }
}
