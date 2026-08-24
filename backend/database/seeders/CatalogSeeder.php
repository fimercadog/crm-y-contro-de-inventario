<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\Supplier;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrFail();

        foreach ([
            'Herramientas Eléctricas',
            'Herramientas Manuales',
            'Fijaciones y Tornillería',
            'Pinturas y Acabados',
            'Plomería',
            'Material Eléctrico',
        ] as $name) {
            Category::create([
                'company_id' => $company->id,
                'name' => $name,
                'status' => 'activo',
            ]);
        }

        foreach (['Bosch', 'DeWalt', 'Stanley', 'Truper', 'Makita'] as $name) {
            Brand::create([
                'company_id' => $company->id,
                'name' => $name,
                'status' => 'activo',
            ]);
        }

        foreach ([
            ['Unidad', 'UND'],
            ['Caja', 'CJA'],
            ['Kilogramo', 'KG'],
            ['Gramo', 'G'],
            ['Litro', 'LT'],
            ['Metro', 'MT'],
            ['Paquete', 'PAQ'],
        ] as [$name, $abbreviation]) {
            Unit::create([
                'company_id' => $company->id,
                'name' => $name,
                'abbreviation' => $abbreviation,
                'status' => 'activo',
            ]);
        }

        Supplier::factory()->count(6)->create(['company_id' => $company->id]);
    }
}
