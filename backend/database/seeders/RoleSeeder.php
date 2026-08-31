<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /** The full permission catalogue. Roles are built from these. */
    public const PERMISSIONS = [
        'crm.view' => 'Ver CRM (registros asignados)',
        'crm.view_all' => 'Ver todo el CRM de la empresa',
        'crm.manage' => 'Crear y eliminar clientes y registros del CRM',
        'inventory.view' => 'Ver productos y stock',
        'inventory.manage' => 'Gestionar productos, catálogos y movimientos',
        'reports.view' => 'Ver reportes',
        'users.manage' => 'Gestionar usuarios y roles',
        'audit.view' => 'Ver la auditoría',
        'settings.manage' => 'Editar la configuración de la empresa',
        'ai.use' => 'Usar el asistente IA',
    ];

    /** Base roles the product ships with — not renamable or deletable. */
    public const SYSTEM_ROLES = ['super-admin', 'administrador', 'comercial', 'inventario', 'vendedor'];

    private const ROLE_PERMISSIONS = [
        // super-admin holds every permission, but tenant isolation (same
        // company_id) still applies — see CustomerPolicy and CustomerTest.
        'super-admin' => 'all',
        'administrador' => 'all',
        'comercial' => ['crm.view', 'crm.view_all', 'crm.manage', 'inventory.view'],
        'inventario' => ['inventory.view', 'inventory.manage'],
        'vendedor' => ['crm.view'],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (array_keys(self::PERMISSIONS) as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::ROLE_PERMISSIONS as $name => $permissions) {
            $role = Role::findOrCreate($name, 'web');
            $role->syncPermissions($permissions === 'all' ? array_keys(self::PERMISSIONS) : $permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
