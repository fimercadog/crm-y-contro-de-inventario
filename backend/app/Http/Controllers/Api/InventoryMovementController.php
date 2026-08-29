<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryMovementRequest;
use App\Http\Resources\InventoryMovementResource;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use DomainException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InventoryMovementController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', InventoryMovement::class);

        $movements = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return InventoryMovementResource::collection($movements);
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

    private function filteredQuery(Request $request): Builder
    {
        $query = InventoryMovement::query()
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
