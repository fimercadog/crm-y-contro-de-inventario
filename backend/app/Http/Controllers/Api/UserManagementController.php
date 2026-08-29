<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserManagementRequest;
use App\Http\Requests\UpdateUserManagementRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'email' => 'Correo',
        'role' => 'Rol',
        'status' => 'Estado',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = $this->filteredQuery($request)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return TableExporter::csv('usuarios', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return TableExporter::pdf('usuarios', 'Usuarios', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->orderBy('name')->get()->map(fn (User $u) => [
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->roles->pluck('name')->implode(', '),
            'status' => $u->status,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = User::query()
            ->where('company_id', $request->user()->company_id)
            ->with('roles');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($role = $request->string('role')->value()) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        return $query;
    }

    public function store(StoreUserManagementRequest $request)
    {
        $user = User::create([
            'company_id' => $request->user()->company_id,
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'status' => $request->validated('status'),
        ]);

        $user->syncRoles([$request->validated('role')]);

        return new UserResource($user->load('roles'));
    }

    public function update(UpdateUserManagementRequest $request, User $user)
    {
        $user->update([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'status' => $request->validated('status'),
            ...$request->validated('password') ? ['password' => Hash::make($request->validated('password'))] : [],
        ]);

        $user->syncRoles([$request->validated('role')]);

        return new UserResource($user->fresh('roles'));
    }

    /**
     * Deactivates the user rather than deleting the row: activities,
     * opportunities, and audit history reference users by id, and a real
     * delete would either break those or require cascading destructive
     * changes the spec explicitly warns against.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->update(['status' => 'inactive']);

        return new UserResource($user->fresh('roles'));
    }
}
