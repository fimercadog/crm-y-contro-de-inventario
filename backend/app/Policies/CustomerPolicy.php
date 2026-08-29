<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('crm.view');
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $this->canSee($user, $customer);
    }

    public function create(User $user): bool
    {
        return $user->can('crm.manage');
    }

    public function update(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $this->canSee($user, $customer);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->sameCompany($user, $customer) && $user->can('crm.view_all');
    }

    private function sameCompany(User $user, Customer $customer): bool
    {
        return $user->company_id === $customer->company_id;
    }

    /**
     * crm.view_all sees every customer in the company; otherwise a user with
     * crm.view is limited to the customers assigned to them.
     */
    private function canSee(User $user, Customer $customer): bool
    {
        if ($user->can('crm.view_all')) {
            return true;
        }

        return $user->can('crm.view') && $customer->assigned_user_id === $user->id;
    }
}
