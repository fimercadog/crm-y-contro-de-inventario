<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('crm.view');
    }

    public function view(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity) && $this->canSee($user, $activity);
    }

    public function create(User $user): bool
    {
        return $user->can('crm.view');
    }

    public function update(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity) && $this->canSee($user, $activity);
    }

    public function delete(User $user, Activity $activity): bool
    {
        return $this->sameCompany($user, $activity)
            && ($user->can('crm.view_all') || $activity->user_id === $user->id);
    }

    private function sameCompany(User $user, Activity $activity): bool
    {
        return $user->company_id === $activity->company_id;
    }

    private function canSee(User $user, Activity $activity): bool
    {
        return $user->can('crm.view_all') || $activity->user_id === $user->id;
    }
}
