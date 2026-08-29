<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryMovementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product?->name),
            'product_sku' => $this->whenLoaded('product', fn () => $this->product?->sku),
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'type' => $this->type,
            'quantity' => $this->quantity,
            'previous_stock' => $this->previous_stock,
            'new_stock' => $this->new_stock,
            'unit_cost' => $this->unit_cost === null ? null : (float) $this->unit_cost,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'occurred_at' => $this->occurred_at,
            'created_at' => $this->created_at,
        ];
    }
}
