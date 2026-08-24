<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProductController extends Controller
{
    private const EXPORT_COLUMNS = [
        'sku' => 'SKU',
        'name' => 'Nombre',
        'category_name' => 'Categoría',
        'brand_name' => 'Marca',
        'cost' => 'Costo',
        'sale_price' => 'Precio de venta',
        'current_stock' => 'Stock',
        'stock_status' => 'Estado de stock',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        $products = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create([
            ...collect($request->validated())->except('supplier_ids')->all(),
            'company_id' => $request->user()->company_id,
        ]);

        $product->suppliers()->sync($request->validated('supplier_ids') ?? []);

        // refresh(), not fresh(): current_stock is set by the database's
        // column default, not by this insert, so the model needs a
        // re-query to pick it up — but fresh() returns a new instance
        // whose wasRecentlyCreated is false, which would silently turn the
        // 201 Created response into a 200.
        $product->refresh();
        $product->load(['category', 'brand', 'unit', 'suppliers']);

        return new ProductResource($product);
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);

        return new ProductResource($product->load(['category', 'brand', 'unit', 'suppliers']));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update(collect($request->validated())->except('supplier_ids')->all());
        $product->suppliers()->sync($request->validated('supplier_ids') ?? []);

        return new ProductResource($product->fresh(['category', 'brand', 'unit', 'suppliers']));
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->json(null, 204);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        return TableExporter::csv('productos', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        return TableExporter::pdf('productos', 'Productos', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (Product $product) => [
            'sku' => $product->sku,
            'name' => $product->name,
            'category_name' => $product->category?->name,
            'brand_name' => $product->brand?->name,
            'cost' => number_format((float) $product->cost, 2),
            'sale_price' => number_format((float) $product->sale_price, 2),
            'current_stock' => $product->current_stock,
            'stock_status' => $product->stockStatus(),
            'status' => $product->status,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = Product::query()
            ->where('company_id', $request->user()->company_id)
            ->with(['category', 'brand', 'unit']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->integer('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($request->string('low_stock')->value() === '1') {
            $query->whereColumn('current_stock', '<=', 'minimum_stock');
        }

        if ($request->string('out_of_stock')->value() === '1') {
            $query->where('current_stock', '<=', 0);
        }

        $sort = in_array($request->string('sort')->value(), [
            'name', 'sku', 'current_stock', 'sale_price', 'created_at',
        ]) ? $request->string('sort')->value() : 'name';
        $direction = $request->string('direction')->value() === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction);
    }
}
