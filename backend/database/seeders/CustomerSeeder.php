<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Contact;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();
        $assignableUserIds = User::where('company_id', $company->id)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['comercial', 'vendedor']))
            ->pluck('id');

        Customer::factory()
            ->count(20)
            ->create(['company_id' => $company->id])
            ->each(function (Customer $customer) use ($assignableUserIds) {
                if ($assignableUserIds->isNotEmpty() && fake()->boolean(70)) {
                    $customer->update(['assigned_user_id' => $assignableUserIds->random()]);
                }

                if ($customer->type === 'empresa') {
                    Contact::factory()->for($customer)->create(['is_primary' => true]);

                    if (fake()->boolean(40)) {
                        Contact::factory()->for($customer)->create();
                    }
                }
            });
    }
}
