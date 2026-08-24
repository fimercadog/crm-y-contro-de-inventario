<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    private const PRODUCTS = [
        ['Taladro percutor 1/2"', 'Herramientas Eléctricas', 'UND', 145.00],
        ['Rotomartillo SDS-Plus', 'Herramientas Eléctricas', 'UND', 210.00],
        ['Amoladora angular 4 1/2"', 'Herramientas Eléctricas', 'UND', 89.00],
        ['Sierra circular 7 1/4"', 'Herramientas Eléctricas', 'UND', 132.00],
        ['Caladora eléctrica', 'Herramientas Eléctricas', 'UND', 76.00],
        ['Pulidora orbital', 'Herramientas Eléctricas', 'UND', 98.00],
        ['Martillo de uña 16 oz', 'Herramientas Manuales', 'UND', 14.50],
        ['Juego de destornilladores (6 pzs)', 'Herramientas Manuales', 'PAQ', 22.00],
        ['Llave ajustable 10"', 'Herramientas Manuales', 'UND', 12.00],
        ['Alicate universal 8"', 'Herramientas Manuales', 'UND', 9.50],
        ['Cinta métrica 5m', 'Herramientas Manuales', 'UND', 6.00],
        ['Nivel de burbuja 60cm', 'Herramientas Manuales', 'UND', 15.00],
        ['Sierra manual para metal', 'Herramientas Manuales', 'UND', 11.00],
        ['Tornillo autorroscante 1"', 'Fijaciones y Tornillería', 'CJA', 4.20],
        ['Tuerca hexagonal 1/4"', 'Fijaciones y Tornillería', 'CJA', 3.10],
        ['Clavo de acero 2"', 'Fijaciones y Tornillería', 'KG', 2.80],
        ['Anclaje de expansión 3/8"', 'Fijaciones y Tornillería', 'CJA', 6.50],
        ['Arandela plana 1/4"', 'Fijaciones y Tornillería', 'CJA', 2.20],
        ['Pintura látex interior blanco', 'Pinturas y Acabados', 'LT', 18.00],
        ['Pintura esmalte sintético negro', 'Pinturas y Acabados', 'LT', 21.50],
        ['Brocha de cerdas 3"', 'Pinturas y Acabados', 'UND', 4.80],
        ['Rodillo de espuma 9"', 'Pinturas y Acabados', 'UND', 5.20],
        ['Sellador acrílico transparente', 'Pinturas y Acabados', 'UND', 7.90],
        ['Tubo PVC 1/2" x 3m', 'Plomería', 'UND', 5.60],
        ['Codo PVC 90° 1/2"', 'Plomería', 'UND', 0.90],
        ['Llave de paso 1/2"', 'Plomería', 'UND', 8.40],
        ['Cinta teflón 1/2"', 'Plomería', 'UND', 1.10],
        ['Cable eléctrico THHN #12', 'Material Eléctrico', 'MT', 0.85],
        ['Interruptor sencillo', 'Material Eléctrico', 'UND', 3.40],
        ['Tomacorriente doble', 'Material Eléctrico', 'UND', 4.10],
        ['Breaker termomagnético 20A', 'Material Eléctrico', 'UND', 9.90],
        ['Cinta aislante eléctrica', 'Material Eléctrico', 'UND', 1.50],
    ];

    public function run(): void
    {
        $company = Company::firstOrFail();
        $categories = Category::where('company_id', $company->id)->get()->keyBy('name');
        $units = Unit::where('company_id', $company->id)->get()->keyBy('abbreviation');
        $brandIds = Brand::where('company_id', $company->id)->pluck('id');
        $supplierIds = Supplier::where('company_id', $company->id)->pluck('id');

        foreach (self::PRODUCTS as $index => [$name, $categoryName, $unitAbbr, $cost]) {
            $minimumStock = fake()->numberBetween(5, 15);
            $currentStock = match (true) {
                $index % 11 === 0 => 0, // agotado
                $index % 7 === 0 => (int) floor($minimumStock / 3), // crítico
                $index % 4 === 0 => $minimumStock, // bajo
                default => fake()->numberBetween($minimumStock + 5, $minimumStock + 80),
            };

            $product = Product::create([
                'company_id' => $company->id,
                'sku' => sprintf('SKU-%04d', $index + 1),
                'name' => $name,
                'category_id' => $categories[$categoryName]->id,
                'brand_id' => fake()->boolean(70) ? $brandIds->random() : null,
                'unit_id' => $units[$unitAbbr]->id,
                'cost' => $cost,
                'sale_price' => round($cost * fake()->randomFloat(2, 1.25, 1.7), 2),
                'minimum_stock' => $minimumStock,
                'maximum_stock' => $minimumStock * 10,
                'current_stock' => $currentStock,
                'status' => 'activo',
            ]);

            $product->suppliers()->attach($supplierIds->random(min(2, $supplierIds->count())));
        }
    }
}
