<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

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
