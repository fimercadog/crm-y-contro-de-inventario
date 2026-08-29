<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opportunity extends Model
{
    use Auditable, HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'customer_id',
        'title',
        'description',
        'amount',
        'probability',
        'stage_id',
        'expected_close_date',
        'assigned_user_id',
        'source',
        'status',
        'lost_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expected_close_date' => 'date',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function stageHistory(): HasMany
    {
        return $this->hasMany(OpportunityStageHistory::class)->latest('created_at');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OpportunityItem::class);
    }
}
