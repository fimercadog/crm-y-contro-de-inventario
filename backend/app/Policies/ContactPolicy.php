<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\Customer;
use App\Models\User;

class ContactPolicy
{
    public function view(User $user, Contact $contact): bool
    {
        return $user->can('view', $contact->customer);
    }

    public function create(User $user, Customer $customer): bool
    {
        return $user->can('update', $customer);
    }

    public function update(User $user, Contact $contact): bool
    {
        return $user->can('update', $contact->customer);
    }

    public function delete(User $user, Contact $contact): bool
    {
        return $user->can('update', $contact->customer);
    }
}
