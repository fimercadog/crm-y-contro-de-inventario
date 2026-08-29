<?php

namespace App\Http\Requests;

use App\Models\Opportunity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Opportunity::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'customer_id' => [
                'required',
                Rule::exists('customers', 'id')->where('company_id', $companyId),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'probability' => ['required', 'integer', 'min:0', 'max:100'],
            'stage_id' => [
                'required',
                Rule::exists('pipeline_stages', 'id')->where('company_id', $companyId),
            ],
            'expected_close_date' => ['nullable', 'date'],
            'assigned_user_id' => [
                'nullable',
                Rule::exists('users', 'id')->where('company_id', $companyId),
            ],
            'source' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::in(['abierta', 'ganada', 'perdida'])],
            'lost_reason' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => [
                'required',
                'distinct',
                Rule::exists('products', 'id')->where('company_id', $companyId),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            foreach ($this->input('items', []) as $index => $item) {
                $quantity = (int) ($item['quantity'] ?? 0);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $discount = (float) ($item['discount_amount'] ?? 0);

                if ($discount > $quantity * $unitPrice) {
                    $validator->errors()->add("items.{$index}.discount_amount", 'El descuento no puede superar el subtotal bruto.');
                }
            }
        });
    }
}
