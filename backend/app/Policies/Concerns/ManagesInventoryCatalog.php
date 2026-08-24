<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared rule set for the inventory catalog tables (Category, Brand, Unit,
 * Supplier): only inventory-facing roles manage them (section 26 of the
 * product spec). Comercial/vendedor read products, not these catalogs
 * directly.
 */
trait ManagesInventoryCatalog
{
    private const MANAGE_ROLES = ['super-admin', 'administrador', 'inventario'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function view(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function update(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function delete(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    private function sameCompany(User $user, Model $model): bool
    {
        return $user->company_id === $model->company_id;
    }
}
