<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();
        $customerIds = Customer::where('company_id', $company->id)->pluck('id');
        $opportunities = Opportunity::where('company_id', $company->id)->get(['id', 'customer_id']);
        $userIds = User::where('company_id', $company->id)->pluck('id');

        for ($i = 0; $i < 25; $i++) {
            $linkToOpportunity = fake()->boolean(60) && $opportunities->isNotEmpty();
            $opportunity = $linkToOpportunity ? $opportunities->random() : null;

            Activity::factory()->create([
                'company_id' => $company->id,
                'user_id' => $userIds->random(),
                'customer_id' => $opportunity?->customer_id ?? $customerIds->random(),
                'opportunity_id' => $opportunity?->id,
            ]);
        }
    }
}
