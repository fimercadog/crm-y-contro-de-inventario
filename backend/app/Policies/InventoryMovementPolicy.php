<?php

namespace App\Policies;

use App\Models\InventoryMovement;
use App\Models\User;

class InventoryMovementPolicy
{
    private const ROLES = ['super-admin', 'administrador', 'inventario'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(self::ROLES);
    }

    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $user->company_id === $inventoryMovement->company_id
            && $user->hasAnyRole(self::ROLES);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::ROLES);
    }
}
