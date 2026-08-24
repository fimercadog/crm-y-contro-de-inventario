<?php

namespace App\Policies;

use App\Models\Opportunity;
use App\Models\User;

class OpportunityPolicy
{
    private const FULL_ACCESS_ROLES = ['super-admin', 'administrador', 'comercial'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([...self::FULL_ACCESS_ROLES, 'vendedor']);
    }

    public function view(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $this->canSee($user, $opportunity);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([...self::FULL_ACCESS_ROLES, 'vendedor']);
    }

    public function update(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $this->canSee($user, $opportunity);
    }

    public function delete(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $user->hasAnyRole(self::FULL_ACCESS_ROLES);
    }

    private function sameCompany(User $user, Opportunity $opportunity): bool
    {
        return $user->company_id === $opportunity->company_id;
    }

    private function canSee(User $user, Opportunity $opportunity): bool
    {
        if ($user->hasAnyRole(self::FULL_ACCESS_ROLES)) {
            return true;
        }

        return $user->hasRole('vendedor') && $opportunity->assigned_user_id === $user->id;
    }
}
