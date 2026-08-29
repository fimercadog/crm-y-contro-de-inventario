<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\PipelineStage;
use App\Models\Product;
use App\Models\User;
use App\Services\OpportunityProductService;
use Illuminate\Database\Seeder;

class OpportunitySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();
        $customerIds = Customer::where('company_id', $company->id)->pluck('id');
        $products = Product::where('company_id', $company->id)->where('status', 'activo')->get();
        $stages = PipelineStage::where('company_id', $company->id)->orderBy('order')->get();
        $opportunityProducts = app(OpportunityProductService::class);
        $assignableUserIds = User::where('company_id', $company->id)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['comercial', 'vendedor']))
            ->pluck('id');
        $adminId = User::where('company_id', $company->id)
            ->whereHas('roles', fn ($q) => $q->where('name', 'super-admin'))
            ->value('id');

        for ($i = 0; $i < 15; $i++) {
            $stage = $stages->random();
            $isClosed = fake()->boolean(30);

            $opportunity = Opportunity::factory()->create([
                'company_id' => $company->id,
                'customer_id' => $customerIds->random(),
                'stage_id' => $stage->id,
                'assigned_user_id' => $assignableUserIds->isNotEmpty() ? $assignableUserIds->random() : null,
                'status' => $isClosed ? ($stage->is_won ? 'ganada' : 'perdida') : 'abierta',
                'lost_reason' => $isClosed && ! $stage->is_won ? fake()->randomElement([
                    'Precio', 'Eligió a la competencia', 'Sin presupuesto', 'Proyecto pausado',
                ]) : null,
            ]);

            $opportunity->stageHistory()->create([
                'from_stage_id' => null,
                'to_stage_id' => $stage->id,
                'user_id' => $adminId ?? $opportunity->assigned_user_id ?? 1,
                'created_at' => $opportunity->created_at,
            ]);

            if ($products->isNotEmpty()) {
                $opportunityProducts->syncItems(
                    $opportunity,
                    $products
                        ->random(fake()->numberBetween(1, 3))
                        ->map(fn (Product $product) => [
                            'product_id' => $product->id,
                            'quantity' => fake()->numberBetween(1, 5),
                            'unit_price' => (float) $product->sale_price,
                            'discount_amount' => fake()->boolean(20)
                                ? fake()->randomFloat(2, 1, max(1, (float) $product->sale_price * 0.15))
                                : 0,
                        ])
                        ->all()
                );
            }
        }
    }
}
