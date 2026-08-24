<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    private const FULL_ACCESS_ROLES = ['super-admin', 'administrador', 'comercial'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([...self::FULL_ACCESS_ROLES, 'vendedor']);
    }

    public function view(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity) && $this->canSee($user, $activity);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([...self::FULL_ACCESS_ROLES, 'vendedor']);
    }

    public function update(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity) && $this->canSee($user, $activity);
    }

    public function delete(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity)
            && ($user->hasAnyRole(self::FULL_ACCESS_ROLES) || $activity->user_id === $user->id);
    }

    private function sameCompany(User $user, Activity $activity): bool
    {
        return $user->company_id === $activity->company_id;
    }

    private function canSee(User $user, Activity $activity): bool
    {
        if ($user->hasAnyRole(self::FULL_ACCESS_ROLES)) {
            return true;
        }

        return $activity->user_id === $user->id;
    }
}
