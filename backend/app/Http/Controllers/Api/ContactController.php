<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Models\Customer;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * All contacts across the company's customers (backs the standalone
     * /crm/contactos screen). Creating/editing a contact still happens
     * scoped to its customer.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Contact::query()
            ->whereHas('customer', fn ($q) => $q->where('company_id', $user->company_id))
            ->with('customer');

        if ($user->hasRole('vendedor') && ! $user->hasAnyRole(['super-admin', 'administrador', 'comercial'])) {
            $query->whereHas('customer', fn ($q) => $q->where('assigned_user_id', $user->id));
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($customerId = $request->integer('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        $contacts = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return ContactResource::collection($contacts);
    }

    public function store(StoreContactRequest $request, Customer $customer)
    {
        $contact = $customer->contacts()->create($request->validated());

        return new ContactResource($contact);
    }

    public function update(UpdateContactRequest $request, Contact $contact)
    {
        $contact->update($request->validated());

        return new ContactResource($contact->fresh());
    }

    public function destroy(Contact $contact)
    {
        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json(null, 204);
    }
}
