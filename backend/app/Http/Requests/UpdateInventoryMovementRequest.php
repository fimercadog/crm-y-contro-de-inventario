<?php

namespace App\Http\Requests;

use App\Models\InventoryMovement;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', InventoryMovement::class);
    }

    /**
     * Product and type are fixed once recorded — only the operational detail
     * of an entrada/salida can be corrected.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'occurred_at' => ['nullable', 'date'],
        ];
    }
}
