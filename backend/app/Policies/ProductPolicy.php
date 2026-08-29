<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    private const MANAGE_ROLES = ['super-admin', 'administrador', 'inventario'];

    private const READ_ONLY_ROLES = ['comercial'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([...self::MANAGE_ROLES, ...self::READ_ONLY_ROLES]);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->company_id === $product->company_id
            && $user->hasAnyRole([...self::MANAGE_ROLES, ...self::READ_ONLY_ROLES]);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->company_id === $product->company_id && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->company_id === $product->company_id && $user->hasAnyRole(self::MANAGE_ROLES);
    }
}
