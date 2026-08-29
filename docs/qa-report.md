# Reporte de QA — Fase 14

Fecha: 2026-08-29. Alcance: revisión completa de los módulos construidos en las
Fases 0–13, suite automatizada y una capa nueva de tests E2E.

## Automatización

| Comprobación | Resultado |
|---|---|
| `php artisan test` | 85 pasan / 232 aserciones |
| `php artisan migrate:fresh --seed` | OK, sin errores |
| `npm run build` (frontend) | OK, 24 rutas |
| `npm run lint` (frontend) | OK — 1 advertencia preexistente (`window.location.href` en `lib/api.ts`, documentada desde Fase 10) |
| `npm run test:e2e` (Playwright) | 5 pasan |

## Cobertura E2E nueva

`frontend/e2e/` — arranca (o reutiliza) backend y frontend vía `webServer` de
Playwright. Requiere DB sembrada (`migrate:fresh --seed`).

- **auth.spec.ts**: login con usuario demo + persistencia de sesión tras recarga;
  logout + redirección de rutas protegidas a `/login`; credenciales inválidas.
- **clientes.spec.ts**: alta de cliente desde el diálogo y verificación en la tabla.
- **ia.spec.ts**: el asistente responde a una pregunta sugerida (proveedor stub).

## Hallazgos

### Corregido — `POST /api/ai/ask` sin gate de rol (Fase 13)

El endpoint del asistente devolvía agregados de toda la empresa (conteos de
clientes, stock, oportunidades) a cualquier usuario autenticado. Los roles
`vendedor` e `inventario` tienen visibilidad por fila en el resto de la app, así
que esto era una fuga. Se añadió `abort_unless(hasAnyRole(['super-admin',
'administrador']))`, la misma puerta que `ReportController`. Test nuevo cubre el
403.

## Revisión manual por módulo

Todos verificados en navegador real durante sus fases respectivas (ver
`development-status.md`). En esta pasada se reconfirmó vía build + E2E que:

- Nav completo: los 24 destinos resuelven (antes `/ia` daba 404).
- Auth / roles / multiempresa: aislamiento por `company_id` cubierto por tests en
  cada módulo (Customer, Opportunity, Product, InventoryMovement, AuditLog, Ai).
- Exportaciones CSV/PDF: un solo camino (`TableExporter`), reusado por 6 módulos.
- Auditoría: los eventos de modelo se registran; los seeders no generan ruido
  (`WithoutModelEvents`).

## Pendientes conocidos (por diseño, YAGNI)

- Numeración correlativa de documentos de inventario (Fase 3 → 9, diferida).
- Fuentes de clientes / estados como listas editables (hoy enums fijos).
- Advertencia de lint en `lib/api.ts`: el redirect a `/login` en el interceptor
  401 corre fuera de un componente; `window.location.href` es intencional ahí.
