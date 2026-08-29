<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id && $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id && $user->can('users.manage');
    }

    /**
     * "Delete" only ever means deactivate (see UserManagementController) —
     * never remove the row, since activities/opportunities/audit trails
     * reference users by id. A user can't deactivate themselves.
     */
    public function delete(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id
            && $user->can('users.manage')
            && $user->id !== $target->id;
    }
}
