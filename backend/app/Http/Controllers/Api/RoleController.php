<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $companyId = $request->user()->company_id;

        $roles = Role::with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'is_system' => in_array($role->name, RoleSeeder::SYSTEM_ROLES, true),
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => User::where('company_id', $companyId)
                    ->whereHas('roles', fn ($q) => $q->where('name', $role->name))
                    ->count(),
            ]);

        return response()->json([
            'data' => $roles,
            'available_permissions' => collect(RoleSeeder::PERMISSIONS)
                ->map(fn ($label, $name) => ['name' => $name, 'label' => $label])
                ->values(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $this->validateRole($request);

        $role = Role::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'guard_name' => 'web',
        ]);
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $this->show($role)], Response::HTTP_CREATED);
    }

    public function update(Request $request, Role $role)
    {
        $this->authorize('create', User::class);

        $isSystem = in_array($role->name, RoleSeeder::SYSTEM_ROLES, true);
        $data = $this->validateRole($request, $role, $isSystem);

        // System roles keep their name; only description and permissions change.
        $role->update([
            'name' => $isSystem ? $role->name : $data['name'],
            'description' => $data['description'] ?? null,
        ]);
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['data' => $this->show($role->fresh('permissions'))]);
    }

    public function destroy(Role $role)
    {
        $this->authorize('create', User::class);

        if (in_array($role->name, RoleSeeder::SYSTEM_ROLES, true)) {
            throw ValidationException::withMessages(['role' => 'Los roles base no se pueden eliminar.']);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'El rol tiene usuarios asignados.']);
        }

        $role->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    private function validateRole(Request $request, ?Role $role = null, bool $isSystem = false): array
    {
        return $request->validate([
            'name' => [
                $isSystem ? 'sometimes' : 'required',
                'string',
                'max:50',
                Rule::unique('roles', 'name')->ignore($role?->id),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['array'],
            'permissions.*' => [Rule::in(array_keys(RoleSeeder::PERMISSIONS))],
        ]);
    }

    private function show(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'description' => $role->description,
            'is_system' => in_array($role->name, RoleSeeder::SYSTEM_ROLES, true),
            'permissions' => $role->permissions->pluck('name'),
            'users_count' => 0,
        ];
    }
}
