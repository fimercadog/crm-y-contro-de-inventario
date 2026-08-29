<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('category'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')
                    ->where('company_id', $this->user()->company_id)
                    ->whereNull('deleted_at')
                    ->ignore($this->route('category')),
            ],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }
}
