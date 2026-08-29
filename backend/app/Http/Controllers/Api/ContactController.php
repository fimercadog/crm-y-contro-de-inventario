<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Models\Customer;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ContactController extends Controller
{
    private const EXPORT_COLUMNS = [
        'full_name' => 'Nombre',
        'customer_name' => 'Cliente',
        'job_title' => 'Cargo',
        'email' => 'Correo',
        'phone' => 'Teléfono',
        'status' => 'Estado',
    ];

    /**
     * All contacts across the company's customers (backs the standalone
     * /crm/contactos screen). Creating/editing a contact still happens
     * scoped to its customer.
     */
    public function index(Request $request)
    {
        $contacts = $this->filteredQuery($request)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return ContactResource::collection($contacts);
    }

    public function exportCsv(Request $request)
    {
        return TableExporter::csv('contactos', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        return TableExporter::pdf('contactos', 'Contactos', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->orderBy('first_name')->get()->map(fn (Contact $c) => [
            'full_name' => trim("{$c->first_name} {$c->last_name}"),
            'customer_name' => $c->customer?->name,
            'job_title' => $c->job_title,
            'email' => $c->email,
            'phone' => $c->phone,
            'status' => $c->trashed() ? 'eliminado' : $c->status,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();

        // Default: show everything — active, inactive and deleted (deleted rows
        // are flagged and can be restored). The "Ver" filter narrows this.
        $query = Contact::withTrashed()
            ->whereHas('customer', fn ($q) => $q->where('company_id', $user->company_id))
            ->with('customer');

        match ($request->string('trashed')->value()) {
            'only' => $query->onlyTrashed(),
            'none' => $query->whereNull('deleted_at'),
            default => null,
        };

        if (! $user->can('crm.view_all')) {
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

        return $query;
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

        $contact->delete(); // soft delete — the row stays in the DB

        return response()->json(null, 204);
    }

    public function restore(int $contact)
    {
        $contact = Contact::onlyTrashed()->findOrFail($contact);

        $this->authorize('delete', $contact);

        $contact->restore();

        return new ContactResource($contact->load('customer'));
    }
}
