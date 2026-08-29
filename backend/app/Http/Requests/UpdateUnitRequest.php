<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('unit'));
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
                Rule::unique('units')
                    ->where('company_id', $this->user()->company_id)
                    ->whereNull('deleted_at')
                    ->ignore($this->route('unit')),
            ],
            'abbreviation' => ['required', 'string', 'max:10'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }
}
