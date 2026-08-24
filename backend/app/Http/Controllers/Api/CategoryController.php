<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\TableExporter;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'description' => 'Descripción',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        $categories = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
        ]);

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(null, 204);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return TableExporter::csv('categorias', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return TableExporter::pdf('categorias', 'Categorías', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    private function filteredQuery(Request $request)
    {
        $query = Category::query()->where('company_id', $request->user()->company_id);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return $query->orderBy('name');
    }
}
