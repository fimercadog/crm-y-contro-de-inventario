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

        $comercial = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Laura Gómez',
            'email' => 'laura.gomez@distribuidoraandina.com',
        ]);
        $comercial->assignRole('comercial');

        $vendedor = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Julián Torres',
            'email' => 'julian.torres@distribuidoraandina.com',
        ]);
        $vendedor->assignRole('vendedor');

        $inventario = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Marcela Ríos',
            'email' => 'marcela.rios@distribuidoraandina.com',
        ]);
        $inventario->assignRole('inventario');
    }
}
