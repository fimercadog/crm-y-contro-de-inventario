<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InventoryService
{
    /**
     * Register a stock movement and update the product atomically.
     *
     * For "entrada" and "salida", quantity is the amount moved.
     * For "ajuste", quantity is the final physical stock count.
     */
    public function move(
        Product $product,
        User $user,
        string $type,
        int $quantity,
        ?float $unitCost = null,
        ?string $reference = null,
        ?string $notes = null,
        ?Carbon $occurredAt = null,
    ): InventoryMovement {
        if (! in_array($type, ['entrada', 'salida', 'ajuste'], true)) {
            throw new InvalidArgumentException('Tipo de movimiento inválido.');
        }

        if ($quantity < 0 || ($type !== 'ajuste' && $quantity === 0)) {
            throw new InvalidArgumentException('La cantidad del movimiento no es válida.');
        }

        if ($user->company_id !== $product->company_id) {
            throw new DomainException('El producto no pertenece a la empresa del usuario.');
        }

        return DB::transaction(function () use ($product, $user, $type, $quantity, $unitCost, $reference, $notes, $occurredAt) {
            $lockedProduct = Product::query()
                ->whereKey($product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $previousStock = $lockedProduct->current_stock;
            $newStock = match ($type) {
                'entrada' => $previousStock + $quantity,
                'salida' => $previousStock - $quantity,
                'ajuste' => $quantity,
            };

            if ($newStock < 0 && ! $lockedProduct->company->allow_negative_stock) {
                throw new DomainException('Stock insuficiente para registrar la salida.');
            }

            $lockedProduct->forceFill(['current_stock' => $newStock])->save();

            return InventoryMovement::create([
                'company_id' => $lockedProduct->company_id,
                'product_id' => $lockedProduct->id,
                'user_id' => $user->id,
                'type' => $type,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'unit_cost' => $unitCost,
                'reference' => $reference,
                'notes' => $notes,
                'occurred_at' => $occurredAt ?? now(),
            ])->load(['product', 'user']);
        });
    }
}
