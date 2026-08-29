<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * The rest of the seeders run WithoutModelEvents on purpose, so the audit
 * table would otherwise be empty on a fresh install. This writes a handful
 * of plausible entries directly so the /admin/auditoria screen has content
 * to show in a demo.
 */
class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();
        $users = User::where('company_id', $company->id)->get();

        $customers = Customer::where('company_id', $company->id)->take(4)->get();
        $products = Product::where('company_id', $company->id)->take(4)->get();
        $opportunities = Opportunity::where('company_id', $company->id)->take(3)->get();

        $entries = [];

        foreach ($customers as $customer) {
            $entries[] = ['created', $customer, ['name' => $customer->name, 'status' => $customer->status]];
            $entries[] = ['updated', $customer, [
                'status' => ['from' => 'prospecto', 'to' => $customer->status],
            ]];
        }

        foreach ($products as $product) {
            $entries[] = ['updated', $product, [
                'sale_price' => ['from' => (string) round($product->sale_price * 0.9, 2), 'to' => (string) $product->sale_price],
            ]];
        }

        foreach ($opportunities as $opportunity) {
            $entries[] = ['created', $opportunity, ['name' => $opportunity->name, 'amount' => (string) $opportunity->amount]];
        }

        foreach ($entries as $index => [$event, $model, $changes]) {
            AuditLog::create([
                'company_id' => $company->id,
                'user_id' => $users->random()->id,
                'event' => $event,
                'auditable_type' => $model->getMorphClass(),
                'auditable_id' => $model->getKey(),
                'changes' => $changes,
                'ip_address' => '190.85.'.fake()->numberBetween(1, 254).'.'.fake()->numberBetween(1, 254),
                'created_at' => now()->subDays(fake()->numberBetween(0, 20))->subHours(fake()->numberBetween(0, 23)),
            ]);
        }
    }
}
