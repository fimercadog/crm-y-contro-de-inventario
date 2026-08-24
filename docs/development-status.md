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

⬜ Pendiente.

## Fase 3 — Empresa y configuración

⬜ Pendiente.

## Fase 4 — CRM: clientes + contactos

⬜ Pendiente.

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
