<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use Auditable, HasFactory;

    protected $fillable = [
        'name',
        'tax_id',
        'email',
        'phone',
        'address',
        'logo_path',
        'currency',
        'allow_negative_stock',
    ];

    protected function casts(): array
    {
        return [
            'allow_negative_stock' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function pipelineStages(): HasMany
    {
        return $this->hasMany(PipelineStage::class)->orderBy('order');
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function opportunityItems(): HasMany
    {
        return $this->hasMany(OpportunityItem::class);
    }

    /**
     * The default CRM pipeline (section 9 of the product spec). Called once
     * when a company is created; stages are editable afterwards.
     */
    public function seedDefaultPipelineStages(): void
    {
        $stages = [
            'Prospecto',
            'Contactado',
            'Calificado',
            'Propuesta',
            'Negociación',
            'Ganada',
            'Perdida',
        ];

        foreach ($stages as $index => $name) {
            $this->pipelineStages()->create([
                'name' => $name,
                'order' => $index + 1,
                'is_won' => $name === 'Ganada',
                'is_lost' => $name === 'Perdida',
            ]);
        }
    }
}
