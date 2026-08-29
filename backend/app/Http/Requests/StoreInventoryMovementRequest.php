<?php

namespace App\Http\Requests;

use App\Models\InventoryMovement;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', InventoryMovement::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'product_id' => ['required', Rule::exists('products', 'id')->where('company_id', $companyId)],
            'type' => ['required', Rule::in(['entrada', 'salida', 'ajuste'])],
            'quantity' => ['required', 'integer', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'occurred_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('type') !== 'ajuste' && (int) $this->input('quantity') < 1) {
                $validator->errors()->add('quantity', 'La cantidad debe ser mayor a cero.');
            }
        });
    }
}
