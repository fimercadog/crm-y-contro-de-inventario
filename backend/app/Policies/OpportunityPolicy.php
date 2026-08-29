<?php

namespace App\Policies;

use App\Models\Opportunity;
use App\Models\User;

class OpportunityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('crm.view');
    }

    public function view(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $this->canSee($user, $opportunity);
    }

    public function create(User $user): bool
    {
        return $user->can('crm.view');
    }

    public function update(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $this->canSee($user, $opportunity);
    }

    public function delete(User $user, Opportunity $opportunity): bool
    {
        return $this->sameCompany($user, $opportunity) && $user->can('crm.view_all');
    }

    private function sameCompany(User $user, Opportunity $opportunity): bool
    {
        return $user->company_id === $opportunity->company_id;
    }

    private function canSee(User $user, Opportunity $opportunity): bool
    {
        if ($user->can('crm.view_all')) {
            return true;
        }

        return $user->can('crm.view') && $opportunity->assigned_user_id === $user->id;
    }
}
