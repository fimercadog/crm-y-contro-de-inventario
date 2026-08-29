<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use App\Models\Product;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        // Without crm.view_all a user only sees what is assigned to them.
        $restrictToOwn = ! $user->can('crm.view_all');

        $mine = fn (Builder $q) => $restrictToOwn ? $q->where('assigned_user_id', $user->id) : $q;

        $customers = $mine(Customer::query()->where('company_id', $companyId));
        $openOpps = $mine(Opportunity::query()->where('company_id', $companyId)->where('status', 'abierta'));
        $wonThisMonth = $mine(
            Opportunity::query()
                ->where('company_id', $companyId)
                ->where('status', 'ganada')
                ->whereBetween('expected_close_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
        );
        $pendingActivities = $mine(Activity::query()->where('company_id', $companyId)->where('status', 'pendiente'));

        $products = Product::query()->where('company_id', $companyId)->get(['current_stock', 'minimum_stock', 'cost']);

        return response()->json([
            'customers' => [
                'total' => (clone $customers)->count(),
                'active' => (clone $customers)->where('status', 'activo')->count(),
                'prospects' => (clone $customers)->where('status', 'prospecto')->count(),
            ],
            'opportunities' => [
                'open' => (clone $openOpps)->count(),
                'open_amount' => number_format((float) (clone $openOpps)->sum('amount'), 2, '.', ''),
                'won_this_month' => (clone $wonThisMonth)->count(),
                'won_amount_this_month' => number_format((float) (clone $wonThisMonth)->sum('amount'), 2, '.', ''),
            ],
            'activities' => [
                'pending' => (clone $pendingActivities)->count(),
                'overdue' => (clone $pendingActivities)->where('scheduled_at', '<', now())->count(),
            ],
            'inventory' => [
                'products' => $products->count(),
                'low_stock' => $products->filter(fn ($p) => $p->current_stock > 0 && $p->current_stock <= $p->minimum_stock)->count(),
                'out_of_stock' => $products->where('current_stock', '<=', 0)->count(),
                'stock_value' => number_format((float) $products->sum(fn ($p) => $p->current_stock * $p->cost), 2, '.', ''),
            ],
            'recent_movements' => InventoryMovement::query()
                ->where('company_id', $companyId)
                ->with('product:id,name,sku')
                ->latest('occurred_at')
                ->limit(6)
                ->get(['id', 'product_id', 'type', 'quantity', 'new_stock', 'occurred_at'])
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'product' => $m->product?->name,
                    'type' => $m->type,
                    'quantity' => $m->quantity,
                    'new_stock' => $m->new_stock,
                    'occurred_at' => $m->occurred_at,
                ]),
            'pipeline_by_stage' => $this->pipelineByStage($companyId, $mine),
            'inventory_by_category' => $this->inventoryByCategory($companyId),
            'movements_by_day' => $this->movementsByDay($companyId),
        ]);
    }

    /** Open opportunities and their amount, per open pipeline stage, in order. */
    private function pipelineByStage(int $companyId, callable $mine): array
    {
        $counts = $mine(
            Opportunity::query()
                ->where('company_id', $companyId)
                ->where('status', 'abierta')
        )
            ->selectRaw('stage_id, COUNT(*) as count, SUM(amount) as amount')
            ->groupBy('stage_id')
            ->get()
            ->keyBy('stage_id');

        return PipelineStage::query()
            ->where('company_id', $companyId)
            ->where('is_won', false)
            ->where('is_lost', false)
            ->orderBy('order')
            ->get()
            ->map(fn ($stage) => [
                'stage' => $stage->name,
                'count' => (int) ($counts[$stage->id]->count ?? 0),
                'amount' => number_format((float) ($counts[$stage->id]->amount ?? 0), 2, '.', ''),
            ])
            ->all();
    }

    /** Current stock value grouped by category (top 8). */
    private function inventoryByCategory(int $companyId): array
    {
        return Product::query()
            ->where('products.company_id', $companyId)
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->groupBy('categories.name')
            ->selectRaw('COALESCE(categories.name, ?) as category', ['Sin categoría'])
            ->selectRaw('SUM(current_stock * cost) as value')
            ->orderByDesc('value')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'value' => number_format((float) $row->value, 2, '.', ''),
            ])
            ->all();
    }

    /** Movement count per day for the last 14 days, zero-filled. */
    private function movementsByDay(int $companyId): array
    {
        $rows = InventoryMovement::query()
            ->where('company_id', $companyId)
            ->where('occurred_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(occurred_at) as day, COUNT(*) as count')
            ->groupBy('day')
            ->pluck('count', 'day');

        return collect(range(13, 0))
            ->map(function ($daysAgo) use ($rows) {
                $day = Carbon::today()->subDays($daysAgo)->toDateString();

                return ['day' => $day, 'count' => (int) ($rows[$day] ?? 0)];
            })
            ->all();
    }
}
