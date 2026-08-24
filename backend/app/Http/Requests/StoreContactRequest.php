<?php

namespace App\Http\Requests;

use App\Models\Contact;
use App\Models\Customer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Customer $customer */
        $customer = $this->route('customer');

        return $this->user()->can('create', [Contact::class, $customer]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'job_title' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'is_primary' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }
}
