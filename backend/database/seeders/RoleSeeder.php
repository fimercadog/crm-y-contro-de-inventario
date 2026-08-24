<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Base roles for the platform. Each module seeds its own permissions
     * and attaches them to the relevant roles as it ships (see section 26
     * of the product spec for the intended scope of each role).
     */
    public function run(): void
    {
        foreach (['super-admin', 'administrador', 'comercial', 'inventario', 'vendedor'] as $role) {
            Role::findOrCreate($role);
        }
    }
}
