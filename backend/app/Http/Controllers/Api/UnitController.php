<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use App\Support\TableExporter;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'abbreviation' => 'Abreviatura',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Unit::class);

        $units = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return UnitResource::collection($units);
    }

    public function store(StoreUnitRequest $request)
    {
        $unit = Unit::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
        ]);

        return new UnitResource($unit);
    }

    public function update(UpdateUnitRequest $request, Unit $unit)
    {
        $unit->update($request->validated());

        return new UnitResource($unit->fresh());
    }

    public function destroy(Unit $unit)
    {
        $this->authorize('delete', $unit);

        $unit->delete();

        return response()->json(null, 204);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Unit::class);

        return TableExporter::csv('unidades', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Unit::class);

        return TableExporter::pdf('unidades', 'Unidades', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    private function filteredQuery(Request $request)
    {
        $query = Unit::query()->where('company_id', $request->user()->company_id);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return $query->orderBy('name');
    }
}
