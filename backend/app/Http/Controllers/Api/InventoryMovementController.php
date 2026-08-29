<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryMovementRequest;
use App\Http\Requests\UpdateInventoryMovementRequest;
use App\Http\Resources\InventoryMovementResource;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use App\Support\TableExporter;
use DomainException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class InventoryMovementController extends Controller
{
    private const EXPORT_COLUMNS = [
        'occurred_at' => 'Fecha',
        'product_sku' => 'SKU',
        'product_name' => 'Producto',
        'type' => 'Tipo',
        'quantity' => 'Cantidad',
        'previous_stock' => 'Stock anterior',
        'new_stock' => 'Stock nuevo',
        'unit_cost' => 'Costo unitario',
        'reference' => 'Referencia',
        'user_name' => 'Usuario',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', InventoryMovement::class);

        $movements = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return InventoryMovementResource::collection($movements);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', InventoryMovement::class);

        return TableExporter::csv('movimientos', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', InventoryMovement::class);

        return TableExporter::pdf('movimientos', 'Movimientos de inventario', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (InventoryMovement $movement) => [
            'occurred_at' => $movement->occurred_at?->format('Y-m-d H:i'),
            'product_sku' => $movement->product?->sku,
            'product_name' => $movement->product?->name,
            'type' => $movement->type,
            'quantity' => $movement->quantity,
            'previous_stock' => $movement->previous_stock,
            'new_stock' => $movement->new_stock,
            'unit_cost' => $movement->unit_cost === null ? '' : number_format((float) $movement->unit_cost, 2),
            'reference' => $movement->reference,
            'user_name' => $movement->user?->name,
        ]);
    }

    public function store(StoreInventoryMovementRequest $request, InventoryService $inventory)
    {
        $product = Product::query()
            ->where('company_id', $request->user()->company_id)
            ->findOrFail($request->integer('product_id'));

        try {
            $movement = $inventory->move(
                product: $product,
                user: $request->user(),
                type: $request->string('type')->value(),
                quantity: $request->integer('quantity'),
                unitCost: $request->filled('unit_cost') ? (float) $request->input('unit_cost') : null,
                reference: $request->string('reference')->value() ?: null,
                notes: $request->string('notes')->value() ?: null,
                occurredAt: $request->filled('occurred_at') ? Carbon::parse($request->input('occurred_at')) : null,
            );
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return new InventoryMovementResource($movement);
    }

    public function update(UpdateInventoryMovementRequest $request, InventoryMovement $inventoryMovement, InventoryService $inventory)
    {
        try {
            $movement = $inventory->updateMovement(
                movement: $inventoryMovement,
                user: $request->user(),
                quantity: $request->integer('quantity'),
                unitCost: $request->filled('unit_cost') ? (float) $request->input('unit_cost') : null,
                reference: $request->string('reference')->value() ?: null,
                notes: $request->string('notes')->value() ?: null,
                occurredAt: $request->filled('occurred_at') ? Carbon::parse($request->input('occurred_at')) : null,
            );
        } catch (DomainException|\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return new InventoryMovementResource($movement);
    }

    public function destroy(Request $request, InventoryMovement $inventoryMovement, InventoryService $inventory)
    {
        $this->authorize('create', InventoryMovement::class);

        try {
            $inventory->revertMovement($inventoryMovement, $request->user());
        } catch (DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(null, 204);
    }

    private function filteredQuery(Request $request): Builder
    {
        // Voided (soft-deleted) movements stay visible in the ledger, flagged.
        $query = InventoryMovement::withTrashed()
            ->where('company_id', $request->user()->company_id)
            ->with(['product', 'user']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        if ($type = $request->string('type')->value()) {
            $query->where('type', $type);
        }

        if ($productId = $request->integer('product_id')) {
            $query->where('product_id', $productId);
        }

        $sort = in_array($request->string('sort')->value(), [
            'occurred_at', 'created_at', 'type', 'quantity',
        ]) ? $request->string('sort')->value() : 'occurred_at';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
