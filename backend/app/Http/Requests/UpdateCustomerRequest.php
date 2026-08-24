<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('customer'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'type' => ['required', Rule::in(['persona', 'empresa'])],
            'name' => ['required', 'string', 'max:255'],
            'document_type' => ['nullable', 'string', 'max:50'],
            'document_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'website' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['activo', 'prospecto', 'inactivo'])],
            'notes' => ['nullable', 'string'],
            'assigned_user_id' => [
                'nullable',
                Rule::exists('users', 'id')->where('company_id', $companyId),
            ],
        ];
    }
}
