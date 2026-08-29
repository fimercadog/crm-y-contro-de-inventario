<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'entity' => class_basename($this->auditable_type),
            'auditable_type' => $this->auditable_type,
            'auditable_id' => $this->auditable_id,
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'changes' => $this->changes,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at,
        ];
    }

    public static function entityLabel(string $type): string
    {
        return Str::of(class_basename($type))->snake(' ')->title()->value();
    }
}
