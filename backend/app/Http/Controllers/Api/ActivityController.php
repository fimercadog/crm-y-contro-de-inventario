<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Activity::class);

        $activities = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return ActivityResource::collection($activities);
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

    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();

        $query = Activity::query()
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
