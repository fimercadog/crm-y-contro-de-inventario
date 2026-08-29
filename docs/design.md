# Reglas de diseño

Sistema visual de **CRM + Inventario**. Las fuentes de verdad son
[frontend/src/app/globals.css](../frontend/src/app/globals.css),
[frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx) y los componentes
en `frontend/src/components/`. Este documento las resume; si algo diverge, gana
el código.

Es un panel de administración privado (no hay sitio público). Todo detrás de
`AuthGuard`, con sidebar colapsable + header + contenido.

## Base técnica

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4.
- shadcn/ui preset **base-nova** sobre **Base UI** (`@base-ui/react`) — la
  composición polimórfica usa la prop `render`, no `asChild` (no es Radix).
- Tablas con `@tanstack/react-table` v9 (features explícitas, hook `useTable`).
- Íconos: **lucide-react**, monocromo, `size-4` por defecto.

## Color

Estilo Material-flavoured (elevación, botones pill, Roboto) con una paleta
**verde esmeralda + azul marino** (según "Guía visual SaaS para CRM e
inventario"). Tokens en `:root` / `.dark` (globals.css), expuestos a Tailwind
vía `@theme inline`. Hay toggle Claro/Oscuro/Sistema en el menú de usuario.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--primary` | `#15803d` | `#2fd07a` | CTA, enlaces, barras de gráfico, nav activo |
| `--primary-hover` | `#166534` | `#27b86c` | hover del botón primario |
| `--navy` | `#0b2545` | `#0b1f38` | secciones oscuras: banda CTA, footer, panel de login |
| `--navy-foreground` | `#e9f0f7` | `#e9f0f7` | texto sobre `--navy` |
| `--foreground` | `#0f1e2b` | `#e6edf3` | texto base |
| `--muted-foreground` | `#57697a` | `#9fb0bd` | texto secundario, descripciones |
| `--background` | `#f5f7f8` | `#0c1a26` | fondo del panel |
| `--card` / `--popover` | `#ffffff` | `#12212e` | tarjetas, menús, diálogos |
| `--secondary` | `#e9f4ee` | `#1b2c3a` | superficie de controles secundarios, chips |
| `--muted` | `#eef1f4` | `#182935` | filas skeleton, zonas suaves |
| `--accent` | `#e9f4ee` | `#1f3341` | hover/activo |
| `--border` / `--input` | `#e2e7eb` / `#d6dde3` | `#24384a` / `#2b4256` | bordes, campos |
| `--success` | `#15803d` | `#2fd07a` | activo, ganada, completada, entrada, stock normal |
| `--warning` | `#b45309` | `#fbbf24` | prospecto, pendiente, prioridad media, stock bajo |
| `--destructive` | `#dc2626` | `#f2555a` | error, perdida, salida, crítico/agotado, eliminado |
| `--chart-1..5` | esmeralda / navy / ámbar / cielo / rosa | versiones claras | series de gráfico |

**Marketing / heros:** `--marketing-shadow` (sombra grande tintada navy) para
el hover de tarjetas del sitio web. `<HeroBackdrop>` (`components/marketing/`)
arma el fondo ambiental — aurora, halo cónico giratorio, grid en fuga y barrido
de luz — con `variant="light" | "navy"`; lo usan el hero de `/` y el panel del
login. Utilidades: `animate-marketing-{float,drift,pulse-glow,grid,gradient-text,
aurora,orbit,sheen}`. `<Reveal>` hace la entrada (subida + desenfoque + fade,
0.7s). **Todo** se congela bajo `prefers-reduced-motion`; `Reveal` degrada a un
fundido de opacidad (sin transform), seguro para sensibilidad vestibular.

**Elevación:** `--elevation-1` y `--elevation-2` (sombras suaves tipo Material),
expuestas como `shadow-elevation-1` / `shadow-elevation-2`.

## Tipografía

- **Roboto** para todo (`--font-sans`, pesos 400/500/700), `antialiased`
  global. Roboto Mono cargada como `--font-geist-mono`.
- Nunca peso `light`.

| Rol | Clases |
| --- | --- |
| Título de página | `text-lg font-semibold` (dentro de `<h2>`) |
| Subtítulo de página | `text-sm text-muted-foreground` |
| Título de tarjeta | `text-base font-medium` (`CardTitle`) |
| Cuerpo / tabla | `text-sm` |
| Micro / metadata | `text-xs text-muted-foreground` |
| Números destacados (dashboard) | `text-2xl font-semibold` |

## Layout

- App shell: `AppSidebar` (colapsable, `--sidebar`) + `SiteHeader` (breadcrumb
  derivado de `config/nav.ts`) + contenido con `p-4 md:p-6`.
- Cada página: `<div className="flex flex-col gap-4">`, encabezado
  (`<h2>` + subtítulo) con el botón de acción a la derecha, luego el contenido.
- Grids del dashboard: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` para stat
  cards; `lg:grid-cols-2` para las tarjetas de gráfico.
- Ancho: el contenido llena el `SidebarInset`; el asistente IA usa
  `max-w-3xl` centrado.

## Radios

`--radius: 0.75rem`. Escala vía `@theme inline` (`--radius-sm` … `--radius-4xl`).

| Clase | Uso |
| --- | --- |
| `rounded-full` | **todos los botones** (pill), badges, avatares, barras de progreso |
| `rounded-lg` | inputs, textareas, items de menú |
| `rounded-xl` | tarjetas (`Card`) |
| `rounded-sm` | topes de barras del sparkline |

## Sombras

- `shadow-elevation-1` — tarjetas (`Card`), en vez de borde.
- `shadow-elevation-2` — menús flotantes / popovers si necesitan más énfasis.
- Sin sombras de color en botones (los botones filled de Material son planos).

## Botones (`components/ui/button.tsx`)

- Forma **pill** (`rounded-full`) en todos los tamaños.
- **default:** `bg-primary text-primary-foreground`, hover `bg-primary-hover`.
- **outline:** `border-border bg-background`, hover `bg-muted`.
- **secondary:** `bg-secondary` (verde muy pálido), texto `secondary-foreground`.
- **ghost:** solo hover `bg-muted`; se usa para el botón de acciones de fila
  (`size="icon"`, `MoreHorizontal`).
- **destructive:** tinte, no relleno — `bg-destructive/10 text-destructive`.
- Altura por defecto `h-8`; ícono lucide `size-4`, `gap-1.5`.

## Badges (`components/ui/badge.tsx`) — color por significado

Los badges son **chips tintados** (`bg-*/10 text-*`), nunca pills sólidos.
El color comunica estado:

| variant | color | Se usa para |
| --- | --- | --- |
| `success` | verde | activo, ganada, completada, entrada, stock normal |
| `warning` | ámbar | prospecto, pendiente, prioridad media, stock bajo |
| `destructive` | rojo | perdida, salida, stock crítico/agotado, **Eliminado**, Anulado |
| `default` | verde | oportunidad abierta, evento de auditoría "actualizado" |
| `secondary` | verde pálido | conteos neutros (etapa, nº de contactos), badge "Asistente" |
| `outline` | borde | inactivo, prioridad baja, etiquetas neutras (rol, ajuste) |

## Tablas y CRUD

- `DataTable` (server-driven: paginación / orden / filtro se resuelven en el
  backend). `DataTableToolbar` = búsqueda + `DataTableFacetedFilter`(s) +
  `actions` (normalmente `DataTableExport` con CSV / PDF).
- Catálogos (categorías, marcas, unidades, proveedores) se montan sobre
  `CatalogPage` genérico: cada página aporta solo `dataColumns`; el componente
  agrega la columna de estado y la de acciones.
- Acciones de fila: `RowActions` (`components/data-table/row-actions.tsx`) —
  **Editar / Eliminar** cuando el registro está vigente, **Restaurar** cuando
  está eliminado.

## Soft delete (regla del proyecto)

**Eliminar nunca borra la fila de la BD** — hace soft delete (`deleted_at`).
Aplica a clientes, contactos, oportunidades, actividades, productos, los cuatro
catálogos y los movimientos de inventario. Los usuarios se **desactivan** por
`status`, nunca se borran.

En la UI:

- La lista **sigue mostrando** los registros eliminados, con un badge rojo
  **"Eliminado"** (movimientos: **"Anulado"**).
- Filtro **"Ver"** con opciones *Vigentes* / *Eliminados* para acotar.
- La acción **Restaurar** los devuelve (`POST /{recurso}/{id}/restore`).
- El diálogo de confirmación lo explica ("seguirá en la lista… podrás
  restaurarlo").

**Movimientos de inventario** es un registro consolidado de **solo lectura**
(sin crear / editar / anular desde ahí). Entradas y Salidas sí se corrigen o
anulan: el efecto en stock se revierte en una transacción y el movimiento
queda como "Anulado" con su fecha y usuario. Los ajustes no se tocan.

## Modales

- `Dialog` de Base UI (`components/ui/dialog.tsx`) es el único patrón de modal.
- **Todo crear/editar se hace en modal** (`*FormDialog` por módulo), incluida
  la ficha de cliente. Formularios con `react-hook-form` + `zod`; los `Select`
  de IDs usan `IdSelect` (Base UI necesita el mapa `items` para resolver la
  etiqueta).
- Botonera del modal: `Cancelar` (outline) + `Guardar` (primary, con
  `Loader2` mientras envía).

## Gráficos

- Solo en el dashboard. **Sin librería** — `components/dashboard/charts.tsx`:
  `BarList` (barras horizontales) y `Sparkbars` (mini barras de 14 días).
- Una sola serie por gráfico → un solo color (`bg-primary` sobre pista
  `bg-secondary`). Valores etiquetados directamente; hover con `title`.

## Auditoría

Cada cambio en un modelo `Auditable` queda registrado (usuario, evento, diff
`{from,to}`, IP). Eventos: creado (verde), actualizado (verde), eliminado
(rojo), restaurado (ámbar). Pantalla en `Administración > Auditoría`,
solo super-admin / administrador.

## Accesibilidad y tema

- Focus visible: anillo `ring-ring/50` en controles interactivos.
- `html lang="es"`, `suppressHydrationWarning` para el toggle de tema.
- Paleta definida en `:root` y redefinida en `.dark` (nunca un color solo
  dentro de `.dark`). `body` con `bg-background text-foreground` explícito.

## Idioma

- UI en **español (es-CO)**. Fechas con `Intl.DateTimeFormat("es-CO")`,
  moneda `USD`. Buena parte de los strings del código va sin tildes (decisión
  previa del repo); la documentación nueva sí las usa.
