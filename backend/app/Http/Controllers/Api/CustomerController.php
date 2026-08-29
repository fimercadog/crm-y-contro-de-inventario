<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CustomerController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'type' => 'Tipo',
        'document_number' => 'Documento',
        'email' => 'Correo',
        'phone' => 'Teléfono',
        'city' => 'Ciudad',
        'status' => 'Estado',
        'assigned_user_name' => 'Responsable',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $customers = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create([
            ...$request->validated(),
            'company_id' => $request->user()->company_id,
        ]);

        return new CustomerResource($customer);
    }

    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        return new CustomerResource($customer->load(['contacts', 'assignedUser']));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return new CustomerResource($customer->fresh(['contacts', 'assignedUser']));
    }

    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return response()->json(null, 204);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        return TableExporter::csv('clientes', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        return TableExporter::pdf('clientes', 'Clientes', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (Customer $customer) => [
            'name' => $customer->name,
            'type' => $customer->type,
            'document_number' => $customer->document_number,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'city' => $customer->city,
            'status' => $customer->status,
            'assigned_user_name' => $customer->assignedUser?->name,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();

        $query = Customer::query()
            ->where('company_id', $user->company_id)
            ->withCount('contacts')
            ->with('assignedUser');

        if (! $user->can('crm.view_all')) {
            $query->where('assigned_user_id', $user->id);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($type = $request->string('type')->value()) {
            $query->where('type', $type);
        }

        if ($city = $request->string('city')->value()) {
            $query->where('city', $city);
        }

        if ($assignedUserId = $request->integer('assigned_user_id')) {
            $query->where('assigned_user_id', $assignedUserId);
        }

        if ($dateFrom = $request->date('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->date('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $sort = in_array($request->string('sort')->value(), [
            'name', 'status', 'city', 'created_at',
        ]) ? $request->string('sort')->value() : 'created_at';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
