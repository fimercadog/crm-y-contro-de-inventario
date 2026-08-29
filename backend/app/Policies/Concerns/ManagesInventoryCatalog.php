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
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.manage');
    }

    public function view(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->can('inventory.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.manage');
    }

    public function update(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->can('inventory.manage');
    }

    public function delete(User $user, Model $model): bool
    {
        return $this->sameCompany($user, $model) && $user->can('inventory.manage');
    }

    private function sameCompany(User $user, Model $model): bool
    {
        return $user->company_id === $model->company_id;
    }
}
