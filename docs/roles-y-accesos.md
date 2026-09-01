# Roles y accesos (demo)

Empresa demo: **Distribuidora Andina S.A.S.** Todos los usuarios pertenecen a
la misma empresa (el sistema es multiempresa; en la demo hay una sola).

## Credenciales

Contraseña para **todos**: `password`
También aparecen como botones en la pantalla de login.

| Rol | Correo | Nombre |
|---|---|---|
| Super Admin | `superadmin@distribuidoraandina.com` | Super Admin |
| Administrador | `admin@distribuidoraandina.com` | Administrador |
| Comercial | `comercial@distribuidoraandina.com` | Laura Gómez |
| Inventario | `inventario@distribuidoraandina.com` | Marcela Ríos |
| Vendedor | `vendedor@distribuidoraandina.com` | Julián Torres |

## Qué ve y puede hacer cada rol

La autorización es **por permisos**, no por nombre de rol. El menú del panel
oculta lo que el rol no puede usar, y la API responde `403` si se intenta
entrar por URL directa. Los 5 roles base no se pueden renombrar ni borrar.

| Módulo | Super Admin | Administrador | Comercial | Inventario | Vendedor |
|---|:-:|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRM — Clientes / Contactos / Oportunidades / Pipeline / Actividades | ✅ | ✅ | ✅ (toda la empresa) | ❌ | ✅ (solo lo asignado a él) |
| Crear / eliminar registros de CRM | ✅ | ✅ | ✅ | ❌ | ❌ (solo lectura) |
| Inventario — Productos / Stock | ✅ | ✅ | ✅ (solo lectura) | ✅ | ❌ |
| Inventario — Categorías / Marcas / Unidades / Proveedores / Movimientos / Entradas / Salidas | ✅ | ✅ | ❌ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Asistente IA (complemento premium) | ✅ | ✅ | 🔒 bloqueado | 🔒 bloqueado | 🔒 bloqueado |
| Administración — Usuarios / Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Administración — Auditoría | ✅ | ✅ | ❌ | ❌ | ❌ |
| Administración — Configuración de la empresa | ✅ | ✅ | ❌ | ❌ | ❌ |

Notas:

- **Comercial** ve *todos* los clientes/oportunidades de la empresa
  (`crm.view_all`). **Vendedor** solo los que tiene asignados como responsable.
- **Vendedor** no puede crear ni eliminar clientes; solo consultar los suyos.
- **Inventario** no tiene ningún acceso al CRM.
- Nadie puede desactivarse a sí mismo desde *Usuarios*.
- Eliminar nunca borra la fila: es *soft delete* y se puede restaurar.

## Permisos por rol (referencia técnica)

`backend/database/seeders/RoleSeeder.php`

| Permiso | Super Admin | Admin | Comercial | Inventario | Vendedor |
|---|:-:|:-:|:-:|:-:|:-:|
| `crm.view` | ✅ | ✅ | ✅ | | ✅ |
| `crm.view_all` | ✅ | ✅ | ✅ | | |
| `crm.manage` | ✅ | ✅ | ✅ | | |
| `inventory.view` | ✅ | ✅ | ✅ | ✅ | |
| `inventory.manage` | ✅ | ✅ | | ✅ | |
| `reports.view` | ✅ | ✅ | | | |
| `users.manage` | ✅ | ✅ | | | |
| `audit.view` | ✅ | ✅ | | | |
| `settings.manage` | ✅ | ✅ | | | |
| `ai.use` | ✅ | ✅ | | | |

## Pruebas automáticas de visibilidad por rol

- `backend` — 48 tests de autorización/aislamiento (`RoleManagementTest`,
  `UserManagementTest`, y por módulo: `CustomerTest`, `ProductTest`,
  `InventoryMovementTest`, `CatalogTest`, `ReportTest`, `AuditLogTest`,
  `AiAssistantTest`).
- `frontend/e2e/roles.spec.ts` — recorrido de módulos como administrador, menú
  filtrado por rol (vendedor / inventario / comercial), IA bloqueada, la API
  devuelve `403` en un módulo prohibido y la pantalla degrada a un mensaje
  (no pantalla en blanco), y el menú móvil abre/cierra.
