<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\SoftDeleteListing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ActivityController extends Controller
{
    use SoftDeleteListing;

    private const EXPORT_COLUMNS = [
        'title' => 'Título',
        'type' => 'Tipo',
        'customer_name' => 'Cliente',
        'scheduled_at' => 'Programada',
        'status' => 'Estado',
        'priority' => 'Prioridad',
        'user_name' => 'Responsable',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Activity::class);

        $activities = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return ActivityResource::collection($activities);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Activity::class);

        return TableExporter::csv('actividades', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Activity::class);

        return TableExporter::pdf('actividades', 'Actividades', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (Activity $a) => [
            'title' => $a->title,
            'type' => $a->type,
            'customer_name' => $a->customer?->name,
            'scheduled_at' => $a->scheduled_at?->toDateTimeString(),
            'status' => $a->status,
            'priority' => $a->priority,
            'user_name' => $a->user?->name,
        ]);
    }

    public function store(StoreActivityRequest $request)
    {
        $activity = Activity::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
        ]);

        return new ActivityResource($activity->load(['customer', 'opportunity', 'user']));
    }

    public function show(Activity $activity)
    {
        $this->authorize('view', $activity);

        return new ActivityResource($activity->load(['customer', 'opportunity', 'user']));
    }

    public function update(UpdateActivityRequest $request, Activity $activity)
    {
        $activity->update($request->validated());

        return new ActivityResource($activity->fresh(['customer', 'opportunity', 'user']));
    }

    public function destroy(Activity $activity)
    {
        $this->authorize('delete', $activity);

        $activity->delete();

        return response()->json(null, 204);
    }

    public function restore(Request $request, int $activity)
    {
        $model = Activity::onlyTrashed()
            ->where('company_id', $request->user()->company_id)
            ->findOrFail($activity);

        $this->authorize('delete', $model);
        $model->restore();

        return new ActivityResource($model);
    }

    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();

        $query = $this->applyTrashed(Activity::withTrashed(), $request)
            ->where('company_id', $user->company_id)
            ->with(['customer', 'opportunity', 'user']);

        if (! $user->can('crm.view_all')) {
            $query->where('user_id', $user->id);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($type = $request->string('type')->value()) {
            $query->where('type', $type);
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($priority = $request->string('priority')->value()) {
            $query->where('priority', $priority);
        }

        if ($customerId = $request->integer('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        if ($opportunityId = $request->integer('opportunity_id')) {
            $query->where('opportunity_id', $opportunityId);
        }

        $sort = in_array($request->string('sort')->value(), [
            'title', 'scheduled_at', 'created_at',
        ]) ? $request->string('sort')->value() : 'created_at';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
