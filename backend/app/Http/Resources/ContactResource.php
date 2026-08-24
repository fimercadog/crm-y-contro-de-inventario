<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'job_title' => $this->job_title,
            'email' => $this->email,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'is_primary' => $this->is_primary,
            'notes' => $this->notes,
            'status' => $this->status,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'created_at' => $this->created_at,
        ];
    }
}
