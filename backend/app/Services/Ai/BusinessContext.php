<?php

namespace App\Services\Ai;

use App\Models\Activity;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Opportunity;
use App\Models\Product;
use App\Models\User;

/**
 * Builds a compact, read-only snapshot of one company's data to feed the
 * assistant as its system prompt. Everything here is scoped to the user's
 * company_id — the assistant never sees another tenant's numbers.
 */
class BusinessContext
{
    public function for(User $user): string
    {
        $companyId = $user->company_id;

        $products = Product::where('company_id', $companyId)->get(['name', 'sku', 'current_stock', 'minimum_stock']);
        $lowStock = $products->filter(fn ($p) => in_array($p->stockStatus(), ['bajo', 'crítico', 'agotado'], true));

        $openOpps = Opportunity::where('company_id', $companyId)->where('status', 'abierta');
        $pendingActivities = Activity::where('company_id', $companyId)->whereNull('completed_at');

        $recentMovements = InventoryMovement::where('company_id', $companyId)
            ->latest('occurred_at')
            ->limit(10)
            ->get(['type', 'quantity', 'new_stock', 'occurred_at', 'product_id'])
            ->map(fn ($m) => "- {$m->occurred_at?->toDateString()}: {$m->type} x{$m->quantity} (producto #{$m->product_id}, stock {$m->new_stock})")
            ->implode("\n");

        $lowStockList = $lowStock
            ->map(fn ($p) => "- {$p->name} ({$p->sku}): {$p->current_stock} en stock, mínimo {$p->minimum_stock}")
            ->implode("\n");

        return <<<TXT
        Eres el asistente del sistema CRM + Inventario de la empresa "{$user->company?->name}".
        Respondes en español, con datos concretos y breves. Solo conoces lo que aparece abajo;
        si te preguntan algo fuera de este contexto, dilo con claridad.

        RESUMEN (a hoy):
        - Clientes: {$this->count(Customer::where('company_id', $companyId))}
        - Productos: {$products->count()} ({$lowStock->count()} con stock bajo/crítico/agotado)
        - Oportunidades abiertas: {$this->count($openOpps)} por un monto de {$this->sum($openOpps, 'amount')}
        - Actividades pendientes: {$this->count($pendingActivities)}

        PRODUCTOS CON STOCK BAJO:
        {$lowStockList}

        ÚLTIMOS MOVIMIENTOS DE INVENTARIO:
        {$recentMovements}
        TXT;
    }

    private function count($query): int
    {
        return (clone $query)->count();
    }

    private function sum($query, string $column): string
    {
        return number_format((float) (clone $query)->sum($column), 2, '.', ',');
    }
}
