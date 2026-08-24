<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOpportunityRequest;
use App\Http\Requests\UpdateOpportunityRequest;
use App\Http\Requests\UpdateOpportunityStageRequest;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OpportunityController extends Controller
{
    private const EXPORT_COLUMNS = [
        'title' => 'Título',
        'customer_name' => 'Cliente',
        'stage_name' => 'Etapa',
        'amount' => 'Monto',
        'probability' => 'Probabilidad',
        'status' => 'Estado',
        'assigned_user_name' => 'Responsable',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Opportunity::class);

        $opportunities = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return OpportunityResource::collection($opportunities);
    }

    public function store(StoreOpportunityRequest $request)
    {
        $opportunity = DB::transaction(function () use ($request) {
            $opportunity = Opportunity::create([
                ...$request->validated(),
                'company_id' => $request->user()->company_id,
            ]);

            $opportunity->stageHistory()->create([
                'from_stage_id' => null,
                'to_stage_id' => $opportunity->stage_id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            return $opportunity;
        });

        return new OpportunityResource($opportunity->load(['customer', 'stage', 'assignedUser']));
    }

    public function show(Opportunity $opportunity)
    {
        $this->authorize('view', $opportunity);

        return new OpportunityResource(
            $opportunity->load(['customer', 'stage', 'assignedUser', 'stageHistory.toStage', 'stageHistory.user'])
        );
    }

    public function update(UpdateOpportunityRequest $request, Opportunity $opportunity)
    {
        $opportunity->update($request->validated());

        return new OpportunityResource($opportunity->fresh(['customer', 'stage', 'assignedUser']));
    }

    public function updateStage(UpdateOpportunityStageRequest $request, Opportunity $opportunity)
    {
        $newStageId = (int) $request->validated('stage_id');

        if ($newStageId !== $opportunity->stage_id) {
            DB::transaction(function () use ($opportunity, $newStageId, $request) {
                $opportunity->stageHistory()->create([
                    'from_stage_id' => $opportunity->stage_id,
                    'to_stage_id' => $newStageId,
                    'user_id' => $request->user()->id,
                    'created_at' => now(),
                ]);

                $opportunity->update(['stage_id' => $newStageId]);
            });
        }

        return new OpportunityResource($opportunity->fresh(['customer', 'stage', 'assignedUser']));
    }

    public function destroy(Opportunity $opportunity)
    {
        $this->authorize('delete', $opportunity);

        $opportunity->delete();

        return response()->json(null, 204);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Opportunity::class);

        return TableExporter::csv('oportunidades', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Opportunity::class);

        return TableExporter::pdf('oportunidades', 'Oportunidades', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (Opportunity $opportunity) => [
            'title' => $opportunity->title,
            'customer_name' => $opportunity->customer?->name,
            'stage_name' => $opportunity->stage?->name,
            'amount' => number_format((float) $opportunity->amount, 2),
            'probability' => "{$opportunity->probability}%",
            'status' => $opportunity->status,
            'assigned_user_name' => $opportunity->assignedUser?->name,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();

        $query = Opportunity::query()
            ->where('company_id', $user->company_id)
            ->with(['customer', 'stage', 'assignedUser']);

        if ($user->hasRole('vendedor') && ! $user->hasAnyRole(['super-admin', 'administrador', 'comercial'])) {
            $query->where('assigned_user_id', $user->id);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($stageId = $request->integer('stage_id')) {
            $query->where('stage_id', $stageId);
        }

        if ($customerId = $request->integer('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        if ($assignedUserId = $request->integer('assigned_user_id')) {
            $query->where('assigned_user_id', $assignedUserId);
        }

        $sort = in_array($request->string('sort')->value(), [
            'title', 'amount', 'expected_close_date', 'created_at',
        ]) ? $request->string('sort')->value() : 'created_at';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
