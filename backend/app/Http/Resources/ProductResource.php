<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brand_id' => $this->brand_id,
            'brand_name' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'unit_id' => $this->unit_id,
            'unit_name' => $this->whenLoaded('unit', fn () => $this->unit?->name),
            'unit_abbreviation' => $this->whenLoaded('unit', fn () => $this->unit?->abbreviation),
            'cost' => (float) $this->cost,
            'sale_price' => (float) $this->sale_price,
            'minimum_stock' => $this->minimum_stock,
            'maximum_stock' => $this->maximum_stock,
            'current_stock' => $this->current_stock,
            'stock_status' => $this->stockStatus(),
            'status' => $this->status,
            'image' => $this->image,
            'supplier_ids' => $this->whenLoaded('suppliers', fn () => $this->suppliers->pluck('id')),
            'suppliers' => $this->whenLoaded('suppliers', fn () => $this->suppliers->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
            ])),
            'created_at' => $this->created_at,
            'deleted_at' => $this->deleted_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
