<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Opportunity;
use App\Models\Product;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        // A pure vendedor only sees what is assigned to them, same rule as the list endpoints.
        $restrictToOwn = $user->hasRole('vendedor')
            && ! $user->hasAnyRole(['super-admin', 'administrador', 'comercial']);

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
        ]);
    }
}
