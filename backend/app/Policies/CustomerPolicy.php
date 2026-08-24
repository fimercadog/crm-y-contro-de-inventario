<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    private const FULL_ACCESS_ROLES = ['super-admin', 'administrador', 'comercial'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([...self::FULL_ACCESS_ROLES, 'vendedor']);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $this->canSee($user, $customer);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::FULL_ACCESS_ROLES);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $this->canSee($user, $customer);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $user->hasAnyRole(self::FULL_ACCESS_ROLES);
    }

    private function sameCompany(User $user, Customer $customer): bool
    {
        return $user->company_id === $customer->company_id;
    }

    /**
     * Full-access roles see every customer in the company; a vendedor is
     * limited to the customers assigned to them (section 26 of the spec).
     */
    private function canSee(User $user, Customer $customer): bool
    {
        if ($user->hasAnyRole(self::FULL_ACCESS_ROLES)) {
            return true;
        }

        return $user->hasRole('vendedor') && $customer->assigned_user_id === $user->id;
    }
}
