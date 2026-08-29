<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\SoftDeleteListing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Support\TableExporter;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use SoftDeleteListing;

    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'document_number' => 'Documento',
        'contact_name' => 'Contacto',
        'email' => 'Correo',
        'phone' => 'Teléfono',
        'city' => 'Ciudad',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        $suppliers = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return SupplierResource::collection($suppliers);
    }

    public function store(StoreSupplierRequest $request)
    {
        $supplier = Supplier::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
        ]);

        return new SupplierResource($supplier);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());

        return new SupplierResource($supplier->fresh());
    }

    public function destroy(Supplier $supplier)
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        return response()->json(null, 204);
    }

    public function restore(Request $request, int $supplier)
    {
        $model = Supplier::onlyTrashed()
            ->where('company_id', $request->user()->company_id)
            ->findOrFail($supplier);

        $this->authorize('delete', $model);
        $model->restore();

        return new SupplierResource($model);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        return TableExporter::csv('proveedores', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        return TableExporter::pdf('proveedores', 'Proveedores', self::EXPORT_COLUMNS, $this->filteredQuery($request)->get());
    }

    private function filteredQuery(Request $request)
    {
        $query = $this->applyTrashed(
            Supplier::withTrashed()->where('company_id', $request->user()->company_id),
            $request,
        );

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return $query->orderBy('name');
    }
}
