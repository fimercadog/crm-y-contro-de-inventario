<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Administrador',
            'email' => 'admin@distribuidoraandina.com',
        ]);
        $admin->assignRole('administrador');

        $comercial = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Laura Gómez',
            'email' => 'comercial@distribuidoraandina.com',
        ]);
        $comercial->assignRole('comercial');

        $inventario = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Marcela Ríos',
            'email' => 'inventario@distribuidoraandina.com',
        ]);
        $inventario->assignRole('inventario');

        $vendedor = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Julián Torres',
            'email' => 'vendedor@distribuidoraandina.com',
        ]);
        $vendedor->assignRole('vendedor');
    }
}
