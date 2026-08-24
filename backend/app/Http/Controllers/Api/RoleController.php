<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Roles are a fixed set defined by the product (section 26 of the
     * spec), not user-creatable — this is a read-only overview plus a
     * per-role member count, not a permission editor.
     */
    private const DESCRIPTIONS = [
        'super-admin' => 'Acceso total a la plataforma, sin restricciones.',
        'administrador' => 'Administración completa de la empresa: CRM, inventario, usuarios y configuración.',
        'comercial' => 'Clientes, contactos, oportunidades y actividades. Lectura de productos.',
        'inventario' => 'Productos, proveedores, entradas, salidas, stock y movimientos.',
        'vendedor' => 'Acceso limitado a sus propios clientes y oportunidades asignadas.',
    ];

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $companyId = $request->user()->company_id;

        $roles = Role::orderBy('name')->get()->map(fn (Role $role) => [
            'name' => $role->name,
            'description' => self::DESCRIPTIONS[$role->name] ?? null,
            'users_count' => User::where('company_id', $companyId)
                ->whereHas('roles', fn ($q) => $q->where('name', $role->name))
                ->count(),
        ]);

        return response()->json(['data' => $roles]);
    }
}
