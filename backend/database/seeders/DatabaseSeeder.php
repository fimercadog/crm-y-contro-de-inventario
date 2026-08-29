<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $company = Company::factory()->create([
            'name' => 'Distribuidora Andina S.A.S.',
            'email' => 'contacto@distribuidoraandina.com',
            'currency' => 'USD',
        ]);
        $company->seedDefaultPipelineStages();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Super Admin',
            'email' => 'superadmin@distribuidoraandina.com',
        ]);
        $admin->assignRole('super-admin');

        $this->call([
            UserSeeder::class,
            CustomerSeeder::class,
            CatalogSeeder::class,
            ProductSeeder::class,
            OpportunitySeeder::class,
            ActivitySeeder::class,
            AuditLogSeeder::class,
        ]);
    }
}
