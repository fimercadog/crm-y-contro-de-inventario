<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OpportunityResource;
use App\Http\Resources\PipelineStageResource;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use Illuminate\Http\Request;

class PipelineStageController extends Controller
{
    /**
     * Stages with their open opportunities, for the Kanban board.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Opportunity::class);

        $user = $request->user();

        $opportunitiesQuery = Opportunity::query()
            ->where('company_id', $user->company_id)
            ->where('status', 'abierta')
            ->with(['customer', 'assignedUser']);

        if ($user->hasRole('vendedor') && ! $user->hasAnyRole(['super-admin', 'administrador', 'comercial'])) {
            $opportunitiesQuery->where('assigned_user_id', $user->id);
        }

        $opportunities = $opportunitiesQuery->get()->groupBy('stage_id');

        $stages = PipelineStage::where('company_id', $user->company_id)
            ->orderBy('order')
            ->get();

        return $stages->map(fn (PipelineStage $stage) => [
            ...(new PipelineStageResource($stage))->resolve(),
            'opportunities' => OpportunityResource::collection($opportunities->get($stage->id, collect())),
        ]);
    }
}
