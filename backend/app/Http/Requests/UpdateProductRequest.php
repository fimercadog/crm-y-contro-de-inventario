<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'sku' => [
                'required', 'string', 'max:100',
                Rule::unique('products')->where('company_id', $companyId)->ignore($this->route('product')),
            ],
            'barcode' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', Rule::exists('categories', 'id')->where('company_id', $companyId)],
            'brand_id' => ['nullable', Rule::exists('brands', 'id')->where('company_id', $companyId)],
            'unit_id' => ['required', Rule::exists('units', 'id')->where('company_id', $companyId)],
            'cost' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'maximum_stock' => ['nullable', 'integer', 'gte:minimum_stock'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
            'image' => ['nullable', 'string', 'max:255'],
            'supplier_ids' => ['nullable', 'array'],
            'supplier_ids.*' => [Rule::exists('suppliers', 'id')->where('company_id', $companyId)],
        ];
    }
}
