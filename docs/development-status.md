# Estado de desarrollo

Última actualización: 2026-08-24.

Leyenda: ✅ completo · 🟡 parcial · ⬜ pendiente · 🔴 bloqueado

## Fase 0 — Auditoría del repositorio

✅ Completo. Repositorio vacío al iniciar (solo README).

## Fase 1 — Base técnica

✅ Laravel 12 (PHP 8.2.12) + SQLite instalado y migrado.
✅ Next.js 16 + TypeScript + TailwindCSS + shadcn/ui instalado.
✅ Sanctum y Spatie Permission instalados (tablas migradas, sin uso todavía).
✅ Layout base: sidebar colapsable, header, breadcrumbs, theme toggle (claro/oscuro/sistema).
✅ DataTable reutilizable con TanStack Table v9 (paginación/orden/filtro manuales, pensados para backend).
✅ Cliente axios con interceptor de token y redirect a /login en 401.
⬜ Dashboard con datos reales (placeholder por ahora; se completa cuando existan datos de CRM/Inventario).

## Fase 2 — Auth, usuarios, roles y permisos

✅ Backend: `Company` + `User` (con `company_id`, `status`), Sanctum token auth (`/api/login`, `/api/logout`, `/api/me`), 5 roles base sembrados (super-admin, administrador, comercial, inventario, vendedor) vía Spatie Permission. Tests de auth (login válido/ inválido, usuario inactivo, logout revoca token, /me requiere auth).
✅ Frontend: slice de Redux (`auth`), página `/login` (shadcn Form + zod), `AuthGuard` que protege el grupo `(app)` y redirige a `/login`, menú de usuario real en el sidebar (avatar, nombre, tema, cerrar sesión). Verificado en navegador real (login → dashboard → menú de usuario → logout → bloqueo de rutas protegidas).
🟡 Permisos granulares por módulo: los roles existen pero aún no tienen permisos asignados — cada módulo los define y asigna cuando se construye (CRM, Inventario, etc.).
⬜ Pantallas de gestión de usuarios/roles (eso es el módulo de Administración, no esta fase de base de auth).

## Fase 3 — Empresa y configuración

✅ Backend: `CompanyController` (`GET/PUT /api/company`, siempre resuelto desde el usuario autenticado — sin parámetro de ruta, así que no hay vector IDOR posible), `CompanyPolicy` (ver: mismo tenant; editar: solo super-admin/administrador), `PipelineStage` (modelo + migración + `Company::seedDefaultPipelineStages()` con las 7 etapas de la sección 9, listas para que Fase 5 las consuma). Tests de autorización y aislamiento multiempresa.
✅ Frontend: página `/admin/configuracion` con formulario de empresa (nombre, NIT, correo, teléfono, dirección, moneda, permitir stock negativo — deshabilitado para roles sin permiso) y tarjeta de apariencia (Claro/Oscuro/Sistema). Verificado en navegador real (editar, guardar, recargar, confirmar persistencia).
🟡 Fuentes de clientes / estados configurables: por ahora son enums fijos definidos en el backend (ver sección 6/10 del spec), no listas editables por el usuario — se evalúa si conviene hacerlos configurables cuando exista un caso de uso real que lo pida.
⬜ Numeración de documentos (entradas/salidas): se construye en la Fase 9 cuando esos módulos existan, no antes.

**Bugs reales encontrados y corregidos en esta fase:**
- El `Controller` base de Laravel 12 no incluye `AuthorizesRequests` por defecto — `$this->authorize()` fallaba con 500 en cualquier controlador. Se agregó el trait una sola vez en `app/Http/Controllers/Controller.php`.
- El menú de usuario del sidebar (Fase 2) crasheaba con Base UI (`MenuGroupContext is missing`) porque `DropdownMenuLabel` no estaba envuelto en `DropdownMenuGroup`. Corregido y verificado en navegador.

## Fase 4 — CRM: clientes + contactos

✅ Backend: `Customer` (soft deletes, multiempresa, `assigned_user_id`) y `Contact` completos — migraciones, modelos, factories, policies (comercial/administrador/super-admin ven todo; vendedor solo sus clientes asignados; inventario sin acceso), form requests, resources, controladores con búsqueda/filtros/orden/paginación desde backend, exportación CSV y PDF (respetando los filtros activos, vía `App\Support\TableExporter`, reutilizable por los próximos módulos). Endpoint mínimo `GET /api/users` para poblar el picker de "responsable" (la gestión completa de usuarios sigue pendiente para Administración). Seeders: 20 clientes + contactos coherentes, más usuarios demo con roles comercial/vendedor/inventario. 17 tests nuevos (Customer + Contact), 24 en total, todos verdes.
✅ Frontend: `/crm/clientes` (DataTable con búsqueda, filtros por estado/tipo, exportar CSV/PDF, crear/editar/eliminar), `/crm/clientes/[id]` (ficha con datos generales, notas, y gestión de contactos inline), `/crm/contactos` (listado plano de todos los contactos con filtro por estado). Verificado de punta a punta en navegador real (CRUD completo de clientes y contactos, filtros, exportación, paginación) — 0 errores de consola.

**Bugs reales encontrados y corregidos en esta fase:**
- `StoreContactRequest::authorize()` llamaba `Customer::findOrFail($this->route('customer'))`, pero Laravel ya había resuelto ese parámetro de ruta a una instancia de `Customer` (route-model binding), así que `findOrFail` recibía un objeto en vez de un id y siempre devolvía 404. Corregido para usar el modelo ya vinculado directamente.
- El `DataTableFacetedFilter` original asumía columnas de TanStack Table (client-side), pero todos los filtros de esta app son server-side. Se generalizó para recibir `value`/`onChange` en vez de fingir un objeto `Column` con `as any`.

## Fase 5 — Oportunidades + pipeline + actividades

⬜ Pendiente.

## Fase 6 — Catálogos de inventario

⬜ Pendiente.

## Fase 7 — Productos

⬜ Pendiente.

## Fase 8 — InventoryService + movimientos

⬜ Pendiente.

## Fase 9 — Entradas + salidas + ajustes

⬜ Pendiente.

## Fase 10 — Integración CRM + productos

⬜ Pendiente.

## Fase 11 — Reportes y exportaciones

⬜ Pendiente.

## Fase 12 — Auditoría

⬜ Pendiente.

## Fase 13 — Arquitectura IA

⬜ Pendiente.

## Fase 14 — QA completo

⬜ Pendiente.

## Notas técnicas

- PHP local es 8.2.12 (el pedido original sugería 8.3+). Laravel 12 solo requiere `^8.2`, así que no bloquea nada; se puede subir el entorno a 8.3 más adelante sin cambios de código.
- `@tanstack/react-table` instaló v9 (arquitectura de features explícitas vía `tableFeatures()`, hook `useTable`). El DataTable reutilizable ya está escrito contra esa API.
- shadcn/ui instaló su preset "base-nova", que usa primitivas de Base UI (`@base-ui/react`) en vez de Radix. La composición polimórfica usa la prop `render` en vez de `asChild`.
