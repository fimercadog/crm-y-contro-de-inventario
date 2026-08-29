<?php

namespace App\Policies;

use App\Models\InventoryMovement;
use App\Models\User;

class InventoryMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.manage');
    }

    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $user->company_id === $inventoryMovement->company_id && $user->can('inventory.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.manage');
    }
}
