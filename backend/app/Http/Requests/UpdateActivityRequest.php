<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('activity'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'customer_id' => [
                'nullable',
                Rule::exists('customers', 'id')->where('company_id', $companyId),
            ],
            'opportunity_id' => [
                'nullable',
                Rule::exists('opportunities', 'id')->where('company_id', $companyId),
            ],
            'type' => ['required', Rule::in([
                'llamada', 'reunion', 'email', 'whatsapp', 'tarea', 'seguimiento', 'nota', 'otro',
            ])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['pendiente', 'completada', 'cancelada'])],
            'priority' => ['required', Rule::in(['baja', 'media', 'alta'])],
        ];
    }
}
