<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Opportunity;
use App\Models\OpportunityItem;
use App\Models\Product;
use App\Support\TableExporter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

/**
 * Management reports. All aggregates are scoped to the authenticated user's
 * company. Every report renders as JSON by default and as CSV/PDF when
 * ?format=csv|pdf is passed, reusing the shared TableExporter.
 */
class ReportController extends Controller
{
    private const ROLES = ['super-admin', 'administrador'];

    private function authorizeReports(Request $request): void
    {
        abort_unless($request->user()->hasAnyRole(self::ROLES), Response::HTTP_FORBIDDEN);
    }

    public function inventoryValuation(Request $request)
    {
        $this->authorizeReports($request);

        $rows = Product::query()
            ->where('products.company_id', $request->user()->company_id)
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->groupBy('categories.name')
            ->selectRaw('COALESCE(categories.name, ?) as category', ['Sin categoría'])
            ->selectRaw('COUNT(*) as products')
            ->selectRaw('SUM(current_stock) as units')
            ->selectRaw('SUM(current_stock * cost) as value')
            ->orderBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'products' => (int) $row->products,
                'units' => (int) $row->units,
                'value' => number_format((float) $row->value, 2, '.', ''),
            ]);

        return $this->render($request, 'inventario-valorizado', 'Inventario valorizado por categoría', [
            'category' => 'Categoría',
            'products' => 'Productos',
            'units' => 'Unidades en stock',
            'value' => 'Valor en stock',
        ], $rows);
    }

    public function movementsSummary(Request $request)
    {
        $this->authorizeReports($request);

        [$from, $to] = $this->dateRange($request);

        $rows = InventoryMovement::query()
            ->where('company_id', $request->user()->company_id)
            ->whereBetween('occurred_at', [$from, $to])
            ->groupBy('type')
            ->selectRaw('type')
            ->selectRaw('COUNT(*) as movements')
            ->selectRaw('SUM(quantity) as units')
            ->orderBy('type')
            ->get()
            ->map(fn ($row) => [
                'type' => ucfirst($row->type),
                'movements' => (int) $row->movements,
                'units' => (int) $row->units,
            ]);

        return $this->render($request, 'movimientos-resumen', 'Resumen de movimientos', [
            'type' => 'Tipo',
            'movements' => 'Movimientos',
            'units' => 'Unidades',
        ], $rows, ['from' => $from->toDateString(), 'to' => $to->toDateString()]);
    }

    public function opportunitiesByStage(Request $request)
    {
        $this->authorizeReports($request);

        $rows = Opportunity::query()
            ->where('opportunities.company_id', $request->user()->company_id)
            ->where('status', 'abierta')
            ->join('pipeline_stages', 'pipeline_stages.id', '=', 'opportunities.stage_id')
            ->groupBy('pipeline_stages.name', 'pipeline_stages.order')
            ->selectRaw('pipeline_stages.name as stage')
            ->selectRaw('COUNT(*) as opportunities')
            ->selectRaw('SUM(amount) as amount')
            ->orderBy('pipeline_stages.order')
            ->get()
            ->map(fn ($row) => [
                'stage' => $row->stage,
                'opportunities' => (int) $row->opportunities,
                'amount' => number_format((float) $row->amount, 2, '.', ''),
            ]);

        return $this->render($request, 'oportunidades-por-etapa', 'Oportunidades abiertas por etapa', [
            'stage' => 'Etapa',
            'opportunities' => 'Oportunidades',
            'amount' => 'Monto',
        ], $rows);
    }

    public function salesByProduct(Request $request)
    {
        $this->authorizeReports($request);

        [$from, $to] = $this->dateRange($request);

        $rows = OpportunityItem::query()
            ->where('opportunity_items.company_id', $request->user()->company_id)
            ->join('opportunities', 'opportunities.id', '=', 'opportunity_items.opportunity_id')
            ->join('products', 'products.id', '=', 'opportunity_items.product_id')
            ->where('opportunities.status', 'ganada')
            ->whereBetween('opportunities.expected_close_date', [$from->toDateString(), $to->toDateString()])
            ->groupBy('products.sku', 'products.name')
            ->selectRaw('products.sku as sku')
            ->selectRaw('products.name as product')
            ->selectRaw('SUM(opportunity_items.quantity) as quantity')
            ->selectRaw('SUM(opportunity_items.subtotal) as total')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'sku' => $row->sku,
                'product' => $row->product,
                'quantity' => (int) $row->quantity,
                'total' => number_format((float) $row->total, 2, '.', ''),
            ]);

        return $this->render($request, 'ventas-por-producto', 'Ventas por producto (oportunidades ganadas)', [
            'sku' => 'SKU',
            'product' => 'Producto',
            'quantity' => 'Cantidad',
            'total' => 'Total',
        ], $rows, ['from' => $from->toDateString(), 'to' => $to->toDateString()]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function dateRange(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $from = isset($validated['from'])
            ? Carbon::parse($validated['from'])->startOfDay()
            : now()->startOfMonth();
        $to = isset($validated['to'])
            ? Carbon::parse($validated['to'])->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }

    /**
     * @param array<string, string> $columns
     */
    private function render(Request $request, string $filename, string $title, array $columns, Collection $rows, array $meta = [])
    {
        return match ($request->string('format')->value()) {
            'csv' => TableExporter::csv($filename, $columns, $rows),
            'pdf' => TableExporter::pdf($filename, $title, $columns, $rows),
            default => response()->json([
                'title' => $title,
                'columns' => $columns,
                'rows' => $rows,
                'meta' => $meta,
            ]),
        };
    }
}
