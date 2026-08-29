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

    /** Net effect a movement had on current stock (+ for entrada, - for salida). */
    private function stockEffect(InventoryMovement $movement): int
    {
        return match ($movement->type) {
            'entrada' => $movement->quantity,
            'salida' => -$movement->quantity,
            default => 0, // an "ajuste" set an absolute value; it can't be edited/voided here
        };
    }

    /**
     * Correct an entrada/salida: reverse its old stock effect, apply the new
     * quantity, and update the row in place. The audit trail keeps the change.
     */
    public function updateMovement(
        InventoryMovement $movement,
        User $user,
        int $quantity,
        ?float $unitCost,
        ?string $reference,
        ?string $notes,
        ?Carbon $occurredAt,
    ): InventoryMovement {
        $this->assertEditable($movement, $user);

        if ($quantity < 1) {
            throw new InvalidArgumentException('La cantidad debe ser mayor a cero.');
        }

        return DB::transaction(function () use ($movement, $quantity, $unitCost, $reference, $notes, $occurredAt) {
            $product = Product::query()->whereKey($movement->product_id)->lockForUpdate()->firstOrFail();

            $delta = match ($movement->type) {
                'entrada' => $quantity - $movement->quantity,
                'salida' => $movement->quantity - $quantity,
                default => 0,
            };
            $newStock = $product->current_stock + $delta;

            if ($newStock < 0 && ! $product->company->allow_negative_stock) {
                throw new DomainException('La corrección dejaría el stock en negativo.');
            }

            $product->forceFill(['current_stock' => $newStock])->save();

            $correctedNewStock = $movement->type === 'entrada'
                ? $movement->previous_stock + $quantity
                : $movement->previous_stock - $quantity;

            $movement->update([
                'quantity' => $quantity,
                'new_stock' => $correctedNewStock,
                'unit_cost' => $unitCost,
                'reference' => $reference,
                'notes' => $notes,
                'occurred_at' => $occurredAt ?? $movement->occurred_at,
            ]);

            return $movement->fresh(['product', 'user']);
        });
    }

    /** Void an entrada/salida: reverse its stock effect and soft-delete it. */
    public function revertMovement(InventoryMovement $movement, User $user): void
    {
        $this->assertEditable($movement, $user);

        DB::transaction(function () use ($movement) {
            $product = Product::query()->whereKey($movement->product_id)->lockForUpdate()->firstOrFail();
            $newStock = $product->current_stock - $this->stockEffect($movement);

            if ($newStock < 0 && ! $product->company->allow_negative_stock) {
                throw new DomainException('Anular este movimiento dejaría el stock en negativo.');
            }

            $product->forceFill(['current_stock' => $newStock])->save();
            $movement->delete();
        });
    }

    private function assertEditable(InventoryMovement $movement, User $user): void
    {
        if ($user->company_id !== $movement->company_id) {
            throw new DomainException('El movimiento no pertenece a la empresa del usuario.');
        }

        if (! in_array($movement->type, ['entrada', 'salida'], true)) {
            throw new DomainException('Solo se pueden editar o anular entradas y salidas.');
        }
    }
}
