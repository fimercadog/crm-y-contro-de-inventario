# Estado de desarrollo

Última actualización: 2026-08-29.

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
✅ Dashboard con datos reales: `GET /api/dashboard` devuelve KPIs con alcance por empresa (clientes activos/prospectos, pipeline abierto y monto, ganado del mes, actividades pendientes/vencidas, productos, stock bajo/agotado, valor en stock) y los últimos 6 movimientos. Un `vendedor` puro solo ve lo asignado a él (misma regla que las listas). Frontend: tarjetas-enlace + feed de movimientos. 3 tests nuevos.

## Fase 2 — Auth, usuarios, roles y permisos

✅ Backend: `Company` + `User` (con `company_id`, `status`), Sanctum token auth (`/api/login`, `/api/logout`, `/api/me`), 5 roles base sembrados (super-admin, administrador, comercial, inventario, vendedor) vía Spatie Permission. Tests de auth (login válido/ inválido, usuario inactivo, logout revoca token, /me requiere auth).
✅ Frontend: slice de Redux (`auth`), página `/login` (shadcn Form + zod), `AuthGuard` que protege el grupo `(app)` y redirige a `/login`, menú de usuario real en el sidebar (avatar, nombre, tema, cerrar sesión). Verificado en navegador real (login → dashboard → menú de usuario → logout → bloqueo de rutas protegidas).
🟡 Permisos granulares por módulo: los roles existen pero aún no tienen permisos asignados — cada módulo los define y asigna cuando se construye (CRM, Inventario, etc.).
✅ Pantallas de gestión de usuarios/roles: construidas fuera de fase, a pedido, tras reportarse que el link del sidebar daba 404 (ver nota al final de este documento). `Administración > Usuarios` (CRUD completo: crear con rol y contraseña, editar rol/estado/contraseña, "eliminar" en realidad desactiva — nunca borra la fila, porque actividades/oportunidades referencian usuarios por id) y `Administración > Roles` (vista de solo lectura de los 5 roles fijos con conteo de usuarios; no es un editor de permisos, los roles no son creables por el usuario en este alcance). Policy `UserPolicy`: solo super-admin/administrador gestionan usuarios, y nadie puede desactivarse a sí mismo. 7 tests nuevos, 53 en total. Verificado en navegador real: CRUD, filtros, desactivar, y que el propio usuario no puede auto-desactivarse.

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

✅ Backend: `Opportunity` (con `OpportunityStageHistory` inmutable — cada creación y cada cambio de etapa queda registrado), `Activity`. Policies (comercial/administrador/super-admin acceso completo; vendedor limitado a lo propio; inventario sin acceso a ninguno de los dos). `PATCH /api/opportunities/{id}/stage` mueve de etapa y registra el historial en una transacción. `GET /api/pipeline` agrupa oportunidades abiertas por etapa para el Kanban. Exportación CSV/PDF de oportunidades reutilizando `TableExporter`. Seeders: 15 oportunidades + 25 actividades coherentes. 13 tests nuevos (Opportunity, Activity, Pipeline), 34 en total, todos verdes.
✅ Frontend: `/crm/oportunidades` (lista con filtros/exportación), `/crm/pipeline` (Kanban con `@dnd-kit`, drag-and-drop entre etapas persistido en backend), `/crm/actividades` (lista con filtros por estado/prioridad).
🟡 Verificación en navegador: se probó de punta a punta (listas, crear/editar, filtros, exportación CSV, y el flujo completo de arrastrar-soltar en el pipeline incluyendo persistencia tras recargar — sin errores de consola). Quedaron dos hallazgos de esa sesión:

- **Corregido**: los `Select` de IDs (cliente, etapa, responsable) mostraban el valor crudo en vez del nombre — Base UI (a diferencia de Radix) no resuelve la etiqueta automáticamente desde el `SelectItem` seleccionado. Se creó `components/forms/id-select.tsx`, que pasa el mapa `items` que Base UI sí usa para resolver la etiqueta, y se migraron todos los `Select` de la app (no solo los de esta fase) a este componente.
- **Sin confirmar todavía**: el botón "Nueva oportunidad"/"Nueva actividad" pareció necesitar más de un clic para abrir el diálogo en una corrida de pruebas automatizadas. No se reprodujo de forma concluyente ni se descartó como artefacto de temporización del navegador automatizado (clic disparado antes de que termine la hidratación). Revisar con una interacción manual real antes de dar por cerrado.

## Fase 6 — Catálogos de inventario

✅ Backend: `Category`, `Brand`, `Unit`, `Supplier` — migraciones, modelos, factories, policies (única regla compartida vía `ManagesInventoryCatalog`: solo super-admin/administrador/inventario administran catálogos; comercial/vendedor no tienen acceso directo, ya que solo necesitan leer productos, no gestionar catálogos). Controladores con búsqueda/filtro por estado/paginación/exportación CSV-PDF. Seeder con datos reales (6 categorías, 5 marcas, 7 unidades con las del spec — Unidad/Caja/Kg/Gramo/Litro/Metro/Paquete —, 6 proveedores). 12 tests nuevos con data providers (uno por catálogo × 3 escenarios), 46 en total, todos verdes.
✅ Frontend: `/inventario/categorias`, `/marcas`, `/unidades`, `/proveedores`, construidos sobre un `CatalogPage` genérico compartido (paginación/búsqueda/filtro/exportación/eliminar quedan en un solo lugar) con un diálogo de formulario propio por catálogo. Verificado en navegador real: las 4 páginas cargan, el picker de columnas (que había crasheado antes en otra pantalla) no crashea aquí, crear/editar/eliminar funciona con toasts correctos, filtro por estado funciona.

**Bugs reales encontrados y corregidos en esta fase:**

- El picker de "Columnas" mostraba el nombre crudo del campo (`contact_name`, `description`) en vez de la etiqueta en español. Ahora usa el `header` de la columna cuando es un string, con un *fallback* que humaniza el id.
- Los toasts y botones de los catálogos usaban terminaciones masculinas fijas ("Categoría creado", "Nuevo unidad") sin importar el género gramatical del sustantivo. `CatalogPage` ahora recibe un prop `gender` explícito por catálogo.
- Nota (no confirmada como bug real): en varias corridas de QA automatizado, algunos botones parecieron necesitar un segundo clic para responder. Ocurrió siempre mientras se editaban archivos activamente (Fast Refresh de Next.js recompilando en caliente), nunca en una build de producción — probablemente un artefacto del hot-reload del servidor de desarrollo, no un bug de la aplicación. Si vuelve a aparecer fuera de una sesión de edición activa, investigar en serio.

## Fase 7 — Productos

✅ Backend: `Product` (soft deletes, multiempresa, SKU único por empresa, `current_stock` deliberadamente fuera de `$fillable` y de ambos form requests — nace en 0 por default de columna y de ahí en adelante solo lo toca `InventoryService` en la Fase 8), relación `Product ↔ Supplier` con pivot, `stockStatus()` calculado (normal/bajo/crítico/agotado). Policy: inventario/administrador/super-admin gestionan; comercial solo lectura (`viewAny`/`view`); vendedor sin acceso. Controlador con búsqueda/filtros (categoría, marca, estado, `low_stock`, `out_of_stock`)/orden/paginación/exportación CSV-PDF. Seeder con 32 productos reales del rubro de ferretería (nombres reales, no Foo/Bar), con stock variado a propósito (algunos en 0, crítico, bajo y normal) para poder probar Stock/alertas en fases futuras. 8 tests nuevos, 61 en total, todos verdes.
✅ Frontend: `/inventario/productos` (DataTable con búsqueda, filtro de estado, botón "Stock bajo", exportar CSV/PDF, crear/editar/eliminar) con diálogo de formulario que carga categorías/marcas/unidades/proveedores, incluye checkboxes de proveedores, y muestra "Stock actual" como campo deshabilitado con nota explicando que solo cambia por entradas/salidas/ajustes — nunca editable desde este formulario.

**Bugs reales encontrados y corregidos en esta fase (todos verificados en navegador real):**

- `Product::create()` no reflejaba el valor por *default* de la columna `current_stock` (0) en el modelo devuelto — Eloquent no vuelve a leer los defaults de base de datos tras un insert. Se cambió `->load(...)` por `->refresh()` + `->load(...)` en el controlador.
- Ese mismo cambio casi introduce un bug nuevo: usar `->fresh(...)` en vez de `->refresh()` habría hecho perder la bandera `wasRecentlyCreated`, de la cual depende Laravel para devolver 201 en vez de 200 al crear un recurso. `refresh()` sí la preserva porque muta la misma instancia.
- El picker de "Columnas" seguía mostrando texto sin traducir (`Sale Price`, `Current Stock`) en columnas que usan un header con función (encabezado ordenable), porque el fix de la Fase 6 solo cubría headers de tipo string. Se generalizó para leer el prop `title` del elemento renderizado por esas funciones antes de recurrir al *fallback* que humaniza el id.
- El checkbox de proveedores estaba anidado dentro de un `<label>` nativo envolviendo un componente `Checkbox` de Base UI (que internamente es un `<button>`), lo cual es HTML inválido y hacía que un clic normal cerrara todo el diálogo. Se separó en un patrón `id`/`htmlFor` como hermanos, que es el que shadcn espera.
- Los checkboxes de proveedores nunca aparecían marcados al editar, porque el listado (`index`) no carga la relación `suppliers` (por rendimiento, ya que se pagina) y el diálogo reutilizaba esa fila en vez de pedir el detalle completo. Ahora el diálogo llama a `GET /api/products/{id}` al abrir en modo edición.
- Dejar "Stock máximo" vacío enviaba silenciosamente `0` en vez de "sin tope", porque `z.coerce.number()` de Zod convierte `""` a `0` *durante la validación*, antes de que el `onSubmit` pudiera distinguir "vacío" de "cero". Con `stock_mínimo > 0` esto disparaba un 422 del backend (`gte:minimum_stock`) que parecía "no pasa nada" si no se veía el toast de error. Se cambió el campo a string crudo con validación cruzada explícita (`superRefine`) contra el mínimo, con mensaje de error en el campo antes de tocar el backend.

## Fase 8 — InventoryService + movimientos

✅ Backend: `InventoryMovement` con historial auditable por empresa/producto/usuario, migración, modelo, factory, policy, resource, request y controlador (`GET/POST /api/inventory-movements`). `InventoryService` es ahora el punto único para modificar `Product.current_stock`: registra entradas, salidas y ajustes en una transacción, bloquea stock negativo salvo que la empresa tenga `allow_negative_stock`, valida tenant usuario/producto y conserva `previous_stock`/`new_stock`. El seeder de productos ya no escribe stock directo: crea el stock inicial de demo mediante ajustes `STOCK-INICIAL`, dejando movimientos reales.
✅ Tests: 7 tests nuevos cubren entradas, salidas con/sin stock negativo permitido, ajustes como conteo físico, endpoint de creación, aislamiento multiempresa y permisos. Suite completa: 68 tests verdes. También verificado `php artisan migrate:fresh --seed`.
🟡 Frontend: todavía no hay pantalla dedicada de movimientos. Se deja para Fase 9 junto con entradas/salidas/ajustes operativos, para no duplicar experiencia antes de definir esos flujos.

## Fase 9 — Entradas + salidas + ajustes

✅ Backend: exportación CSV/PDF de movimientos (`/api/inventory-movements/export/{csv,pdf}`) reutilizando `TableExporter` y respetando los filtros activos. El registro de movimientos ya existía desde la Fase 8 (`POST /api/inventory-movements` → `InventoryService`).
✅ Frontend: `/inventario/movimientos` (DataTable con búsqueda, filtro por tipo, exportar CSV/PDF, diálogo "Registrar movimiento" con selector de tipo entrada/salida/ajuste, picker de producto que muestra el stock actual, y nota explícita de que en "ajuste" la cantidad es el conteo físico final). `/inventario/entradas` y `/inventario/salidas` renderizan la misma vista con el tipo fijado (una sola implementación, `MovimientosView`). `/inventario/stock` es una vista de solo lectura del stock por producto (stock actual + estado, mínimo/máximo, valor en stock, filtros "Stock bajo"/"Agotado"). Todas enlazadas ya estaban en el nav.
✅ Tests: 1 test nuevo (exportación CSV respeta el filtro de tipo). Suite: 72 verdes.
🟡 Numeración de documentos: los movimientos usan un campo `reference` libre (factura/orden/remisión). No hay numeración correlativa automática por tipo todavía — se añade si un caso de uso real lo pide (la Fase 3 lo había diferido hasta aquí; se mantiene diferido por YAGNI).

## Fase 10 — Integración CRM + productos

✅ Backend: oportunidades integradas con productos mediante `OpportunityItem` (empresa, oportunidad, producto, cantidad, precio unitario, descuento y subtotal). `OpportunityProductService` sincroniza las líneas y recalcula `Opportunity.amount` automáticamente cuando se envían productos, manteniendo compatibilidad con oportunidades de monto manual cuando no hay líneas. `GET /api/opportunities/{id}` devuelve `items.product`; `POST/PUT /api/opportunities` aceptan `items` validados por tenant, producto único por oportunidad y descuento no mayor al subtotal bruto. Seeders actualizados: primero catálogos/productos, luego oportunidades con líneas cotizadas reales.
✅ Frontend: el diálogo de `/crm/oportunidades` ahora carga productos activos, permite agregar/quitar productos cotizados, rellena el precio desde `sale_price`, muestra stock actual, subtotal por línea y total cotizado; si hay productos, el monto queda calculado; si no, conserva el monto manual. Al editar, pide el detalle completo para cargar las líneas.
✅ Tests/QA: 3 tests backend nuevos cubren creación con productos y monto calculado, actualización/recalculo y bloqueo de productos de otra empresa. Suite completa: 71 tests verdes. Verificado `php artisan migrate:fresh --seed`, `npm run build` y `npm run lint` (sin errores; queda solo la advertencia existente de `window.location.href` en `frontend/src/lib/api.ts`).

## Fase 11 — Reportes y exportaciones

✅ Backend: `ReportController` con 4 reportes agregados, todos con alcance por empresa y solo para super-admin/administrador (`abort_unless` por rol, sin policy dedicada porque no hay recurso). Cada endpoint responde JSON por defecto y CSV/PDF con `?format=csv|pdf` reutilizando `TableExporter` (un solo camino de exportación, sin rutas `/export` extra): `inventory-valuation` (valor de stock por categoría), `movements-summary` (movimientos y unidades por tipo en rango de fechas), `opportunities-by-stage` (oportunidades abiertas y monto por etapa), `sales-by-product` (cantidad y total por producto en oportunidades ganadas, por rango de `expected_close_date`). Agregados con query builder (`SUM`/`COUNT`/`GROUP BY`) portables a MySQL. 4 tests nuevos, 76 en total.
✅ Frontend: `/reportes` con selector de rango de fechas (`<input type="date">` nativo) y 4 tarjetas de reporte; cada una carga su tabla y tiene botones CSV/PDF. Las tarjetas sin período ignoran el rango.

## Fase 12 — Auditoría

✅ Backend: trait `Concerns\Auditable` (boot hooks `created`/`updated`/`deleted`) que escribe en `audit_logs` (empresa, usuario actor vía `Auth::id()`, evento, tipo/id polimórfico, diff campo-a-campo `{from,to}`, IP). Campos sensibles (`password`, `remember_token`, timestamps) nunca se guardan; un `updated` sin cambios efectivos no escribe fila. Aplicado a `Customer`, `Contact`, `Product`, `Opportunity`, `User`, `Company`. Los seeders corren con `WithoutModelEvents`, así que no generan ruido de auditoría. `GET /api/audit-logs` solo super-admin/administrador, con alcance por empresa, filtros por evento/entidad/usuario y búsqueda por nombre de usuario o IP; paginado. 3 tests nuevos, 79 en total.
✅ Frontend: `/admin/auditoria` (DataTable de solo lectura con filtros por evento y entidad, búsqueda por usuario/IP, resumen de campos cambiados, IP y fecha localizada). Link ya presente en el nav de Administración. `npm run build` y `npm run lint` verdes (solo la advertencia preexistente de `window.location.href`).

## Fase 13 — Arquitectura IA

✅ Backend: asistente de preguntas en lenguaje natural con proveedor intercambiable. `Services\Ai\AiProvider` (interfaz) + 3 implementaciones: `StubProvider` (offline, por defecto — devuelve el snapshot + la pregunta, sin API key), `OpenAiProvider` y `AnthropicProvider` (vía `Http`, timeout 30s, `AiUnavailableException` → 503). El binding se elige con `config('services.ai.provider')` en `AppServiceProvider::register()`. `Services\Ai\BusinessContext` arma un resumen compacto (conteos, productos con stock bajo, últimos 10 movimientos) **siempre filtrado por `company_id`** — el modelo nunca ve otro tenant y no hay tool-calling. `Assistant` concatena `history` + `message`. `POST /api/ai/ask` solo para super-admin/administrador (misma puerta que los reportes agregados: el snapshot es de toda la empresa, no filtrado por visibilidad de fila), valida `message` (≤2000) e `history` (≤20 turnos). 6 tests nuevos (stub scoped a empresa, auth requerida, 403 para roles no admin, validación, fallo → 503, `Http::fake` de OpenAI), 85 en total. Doc: [ai-architecture.md](ai-architecture.md).
✅ Frontend: `/ia` (chat de una sola vista: historial, sugerencias iniciales, textarea con Enter-para-enviar, badge del rol, manejo de 503 con toast y restauración del mensaje). Link "IA" ya presente en el nav de Análisis. `npm run build` y `npm run lint` verdes.

## Fase 14 — QA completo

✅ Suite backend: 85 tests / 232 aserciones, todos verdes. `php artisan migrate:fresh --seed` sin errores.
✅ Frontend: `npm run build` (24 rutas, `/ia` y `/admin/auditoria` incluidas) y `npm run lint` verdes — solo la advertencia preexistente de `window.location.href` en `lib/api.ts`.
✅ E2E (nuevo): Playwright en `frontend/e2e/` con `webServer` que arranca/reutiliza backend (:8000) y frontend (:3000). 5 tests sobre los flujos críticos: login demo + persistencia tras recarga, logout + protección de rutas, credenciales inválidas, alta de cliente visible en la tabla, y respuesta del asistente IA (stub). `npm run test:e2e`. Los 5 pasan.
✅ Hallazgo corregido en esta fase: `POST /api/ai/ask` estaba abierto a cualquier usuario autenticado, exponiendo agregados de toda la empresa a roles con visibilidad por fila (vendedor/inventario). Ahora exige super-admin/administrador, igual que los reportes.
Reporte completo: [qa-report.md](qa-report.md).

Con esto se cierra el alcance original (Fases 0–14). Numeración de documentos y fuentes/estados configurables siguen diferidos por YAGNI (ver Fases 3 y 9).

## Cierre — pulido post-QA (2026-08-29)

Ajustes tras la revisión visual:

- **Dashboard real** (arriba, Fase 1): dejó de ser placeholder.
- **Seeders de demo**: `ProductSeeder` ahora genera entradas y salidas reales (no solo el ajuste de stock inicial), así que las pantallas Entradas/Salidas y el reporte de movimientos tienen contenido. `AuditLogSeeder` nuevo escribe ~15 eventos de ejemplo (los demás seeders corren `WithoutModelEvents` a propósito). `OpportunitySeeder`: las oportunidades abiertas ya no caen en etapas cerradas (Ganada/Perdida), lo que hacía que el reporte "Oportunidades abiertas por etapa" mostrara filas incorrectas.
- **Rate limiting**: `throttle:6,1` en `POST /api/login`, `throttle:20,1` en `POST /api/ai/ask`.
- **Lint**: la advertencia de `window.location.href` en `lib/api.ts` quedó silenciada con comentario justificado (recarga completa intencional al perder sesión). `npm run lint` ahora sin advertencias.
- Suite: 88 tests backend, 6 E2E (Edge). `migrate:fresh --seed` verificado.

Todos los módulos crean y editan mediante modales (diálogos), incluida la ficha de cliente — ya era así desde sus fases respectivas.

## Cierre — soft delete en todo el proyecto (2026-08-29)

Regla del proyecto: **eliminar nunca borra la fila, hace soft delete**. Clientes y productos ya lo tenían; ahora también `contacts`, `activities`, `opportunities`, `categories`, `brands`, `units`, `suppliers` (trait `SoftDeletes` + columna `deleted_at`). Los `unique(company_id, name)` de los catálogos ignoran las filas eliminadas, así que se puede volver a usar un nombre liberado. El trait `Auditable` registra ahora `deleted` y `restored` (una sola fila por soft delete — el `updated` que también dispara queda sin cambios porque `deleted_at` está excluido).

**Contactos** (`/crm/contactos`) recibió el tratamiento completo:

- Botón "Nuevo contacto" con selector de cliente en el mismo modal (antes solo se creaba desde la ficha del cliente).
- Al eliminar: soft delete, el toast nombra al contacto, y el diálogo explica que se puede restaurar.
- Filtro "Ver → Eliminados" muestra los contactos borrados con badge "Eliminado" y acción "Restaurar" (`POST /api/contacts/{id}/restore`).

Rate limit de `/api/login` subido a `throttle:30,1` (6/min bloqueaba la suite E2E; 30 fallos/min sigue frenando fuerza bruta).

## Cierre — más iteraciones de UX (2026-08-29)

- **Dashboard con gráficos** (monocromos, sin librería): pipeline por etapa, valor de inventario por categoría (barras), y movimientos de los últimos 14 días (mini-barras). `/api/dashboard` devuelve los agregados.
- **RBAC por permisos**: la autorización dejó de ser por nombre de rol. 10 permisos (`crm.view/view_all/manage`, `inventory.view/manage`, `reports.view`, `users.manage`, `audit.view`, `settings.manage`, `ai.use`) sembrados y asignados a los 5 roles base con el mismo comportamiento efectivo. Policies y controladores usan `can()`. Pantalla **Roles**: crear / editar permisos / eliminar por modal; los roles base no se renombran ni borran. El form de usuario carga roles dinámicamente.
- **Exportar CSV/PDF** añadido a contactos, actividades, usuarios y auditoría (hook `useTableExport`); stock reutiliza el de productos.
- **Contactos**: el filtro "Ver" se mantiene pero por defecto la tabla muestra todo (activos, inactivos y eliminados).
- **Entradas/Salidas editables y anulables**: `InventoryService::updateMovement` / `revertMovement` corrigen el stock en transacción; el movimiento nunca se borra (soft delete + `Auditable`), queda como "Anulado" con fecha y usuario. Los ajustes (incluido STOCK-INICIAL) no se pueden tocar. **Movimientos** es ahora solo lectura (sin registrar/editar/anular) — el registro consolidado.

Suite: 99 tests backend, 7 E2E (Edge).

## Sitio web comercial (2026-08-29)

Landing pública en `/` (grupo `(marketing)` con layout propio), con el stack existente — sin WordPress/Divi ni dependencias nuevas. El `/` que redirigía a `/dashboard` se eliminó. Estructura tipo SaaS landing (hero + captura real del dashboard, problema, plataforma unificada, CRM, inventario, reportes, IA, seguridad, tour de producto con capturas reales, beneficios ligados a funciones reales, CTA con WhatsApp/correo, footer). Solo se comercializan funciones verificadas contra el código; contingencia/offline, reportes programados, numeración de documentos y testimonios/logos ficticios quedan fuera. Capturas reales de la app en `frontend/public/product/`, SEO (metadata/OpenGraph/sitemap/robots/OG dinámica), `not-found` con marca, 10 tests Playwright (desktop + móvil). Suite E2E total: 17. Detalle y decisiones: [website.md](website.md).

## Notas técnicas

- PHP local es 8.2.12 (el pedido original sugería 8.3+). Laravel 12 solo requiere `^8.2`, así que no bloquea nada; se puede subir el entorno a 8.3 más adelante sin cambios de código.
- `@tanstack/react-table` instaló v9 (arquitectura de features explícitas vía `tableFeatures()`, hook `useTable`). El DataTable reutilizable ya está escrito contra esa API.
- shadcn/ui instaló su preset "base-nova", que usa primitivas de Base UI (`@base-ui/react`) en vez de Radix. La composición polimórfica usa la prop `render` en vez de `asChild`.
