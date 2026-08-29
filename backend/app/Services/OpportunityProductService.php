<?php

namespace App\Services;

use App\Models\Opportunity;
use App\Models\Product;

class OpportunityProductService
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function syncItems(Opportunity $opportunity, array $items): void
    {
        $opportunity->items()->delete();

        $total = 0.0;

        foreach ($items as $item) {
            $product = Product::query()
                ->where('company_id', $opportunity->company_id)
                ->findOrFail($item['product_id']);

            $quantity = (int) $item['quantity'];
            $unitPrice = array_key_exists('unit_price', $item) && $item['unit_price'] !== null
                ? (float) $item['unit_price']
                : (float) $product->sale_price;
            $discountAmount = array_key_exists('discount_amount', $item) && $item['discount_amount'] !== null
                ? (float) $item['discount_amount']
                : 0.0;
            $subtotal = max(0, round(($quantity * $unitPrice) - $discountAmount, 2));
            $total += $subtotal;

            $opportunity->items()->create([
                'company_id' => $opportunity->company_id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount_amount' => $discountAmount,
                'subtotal' => $subtotal,
            ]);
        }

        $opportunity->forceFill(['amount' => round($total, 2)])->save();
    }
}
