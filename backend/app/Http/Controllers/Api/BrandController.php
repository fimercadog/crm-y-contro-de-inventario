<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\SoftDeleteListing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Support\TableExporter;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    use SoftDeleteListing;

    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'description' => 'Descripción',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Brand::class);

        $brands = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return BrandResource::collection($brands);
    }

    public function store(StoreBrandRequest $request)
    {
        $brand = Brand::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
        ]);

        return new BrandResource($brand);
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $brand->update($request->validated());

        return new BrandResource($brand->fresh());
    }

    public function destroy(Brand $brand)
    {
        $this->authorize('delete', $brand);

        $brand->delete();

        return response()->json(null, 204);
    }

    public function restore(Request $request, int $brand)
    {
        $model = Brand::onlyTrashed()
            ->where('company_id', $request->user()->company_id)
            ->findOrFail($brand);

        $this->authorize('delete', $model);
        $model->restore();

        return new BrandResource($model);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Brand::class);

        return TableExporter::csv('marcas', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Brand::class);

        return TableExporter::pdf('marcas', 'Marcas', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    private function filteredQuery(Request $request)
    {
        $query = $this->applyTrashed(
            Brand::withTrashed()->where('company_id', $request->user()->company_id),
            $request,
        );

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return $query->orderBy('name');
    }
}
