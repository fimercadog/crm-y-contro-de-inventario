<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'sku',
        'barcode',
        'name',
        'description',
        'category_id',
        'brand_id',
        'unit_id',
        'cost',
        'sale_price',
        'minimum_stock',
        'maximum_stock',
        'status',
        'image',
    ];

    /**
     * `current_stock` is deliberately absent: it is set once at creation
     * (defaults to 0 in the migration) and afterwards only ever changed by
     * InventoryService, never through mass assignment from a request.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class);
    }

    public function stockStatus(): string
    {
        if ($this->current_stock <= 0) {
            return 'agotado';
        }

        if ($this->current_stock <= $this->minimum_stock / 2) {
            return 'critico';
        }

        if ($this->current_stock <= $this->minimum_stock) {
            return 'bajo';
        }

        return 'normal';
    }
}
