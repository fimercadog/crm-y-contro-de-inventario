<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    private const MANAGE_ROLES = ['super-admin', 'administrador'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function view(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGE_ROLES);
    }

    public function update(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id && $user->hasAnyRole(self::MANAGE_ROLES);
    }

    /**
     * "Delete" only ever means deactivate (see UserManagementController) —
     * never remove the row, since activities/opportunities/audit trails
     * reference users by id. A user can't deactivate themselves.
     */
    public function delete(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id
            && $user->hasAnyRole(self::MANAGE_ROLES)
            && $user->id !== $target->id;
    }
}
