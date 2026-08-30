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

Paleta **Divi "SaaS Product"** (Elegant Themes): superficies **blancas**, tinta
**casi negra**, acento **verde**. Una sola paleta para el sitio web y el panel.
Tokens en `:root` / `.dark` (globals.css), expuestos a Tailwind vía
`@theme inline`. Hay toggle Claro/Oscuro/Sistema en el menú de usuario; el
**sitio de marketing y el login se quedan siempre en claro** (`.marketing-theme`
re-declara la paleta clara para ganarle a `.dark`).

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--primary` | `#15803d` | `#4ade80` | CTA, enlaces, barras de gráfico, nav activo |
| `--primary-hover` | `#166534` | `#22c55e` | hover del botón primario |
| `--ink` / `--navy` | `#0f1012` | `#000000` | tarjetas/secciones oscuras (widget cards, banda CTA, panel de login) |
| `--ink-foreground` / `--navy-foreground` | `#f4f4f5` | `#f4f4f5` | texto sobre `--ink` |
| `--foreground` | `#0f1012` | `#f4f4f5` | texto base |
| `--muted-foreground` | `#6b7280` | `#a1a1aa` | texto secundario |
| `--background` | `#ffffff` | `#0d0d0f` | fondo |
| `--card` / `--popover` | `#ffffff` | `#161618` | tarjetas, menús, diálogos |
| `--secondary` | `#f1f5f0` | `#1f1f22` | chips, superficies secundarias |
| `--muted` | `#f4f4f5` | `#1c1c1f` | filas skeleton, zonas suaves |
| `--accent` | `#ecfdf3` | `#14311f` | hover/activo |
| `--border` / `--input` | `#e6e7ea` / `#d9dade` | `#2a2a2e` / `#323236` | bordes hairline, campos |
| `--success` | `#15803d` | `#4ade80` | activo, ganada, completada, entrada, stock normal |
| `--warning` | `#b45309` | `#fbbf24` | prospecto, pendiente, stock bajo |
| `--destructive` | `#dc2626` | `#f2555a` | error, perdida, salida, crítico/agotado, eliminado |
| `--chart-1..5` | verde / ink / ámbar / azul / rosa | versiones claras | series de gráfico |
| `--blob` / `--blob-warm` | degradado verde→lima / ámbar→coral | — | formas orgánicas del sitio web |

**Tipografía**: los títulos de página (`<h2>`) van en `text-xl font-bold
tracking-tight`; los heros del sitio web en `font-black`.

**Marketing / heros:** `--marketing-shadow` (sombra grande tintada navy) para
el hover de tarjetas del sitio web. `<HeroBackdrop>` (`components/marketing/`)
arma el fondo ambiental — aurora, halo cónico giratorio, grid en fuga y barrido
de luz — con `variant="light" | "navy"`; lo usan el hero de `/` y el panel del
login. Utilidades: `animate-marketing-{float,drift,pulse-glow,grid,gradient-text,
aurora,orbit,sheen}`. `<Reveal>` hace la entrada (subida + desenfoque + fade,
0.7s). **Todo** se congela bajo `prefers-reduced-motion`; `Reveal` degrada a un
fundido de opacidad (sin transform), seguro para sensibilidad vestibular.

**Elevación:** escala Material Design 3 `--elevation-1..5` (sombra doble
umbra + penumbra, tintada navy), expuesta como `shadow-elevation-1..5`. Las
tarjetas descansan en nivel 1 y suben a nivel 3 en hover (no hacen `translate`).

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

- `shadow-elevation-1` — tarjetas (`Card`) y botones filled en reposo.
- `shadow-elevation-2` — botón filled en hover; menús / popovers.
- `shadow-elevation-3` — tarjeta en hover.
- `shadow-elevation-4/5` — reservadas (diálogos, FAB elevado).

## Sitio web — Material

El sitio de marketing lleva un pase Material Design 3: escala de elevación,
tarjetas que suben de nivel en hover, y **ripple** táctil en botones (`CtaLink`)
y tarjetas clicables (`RippleLink`) — `useRipple` en
`components/marketing/ripple.tsx`, keyframe `mat-ripple` en `globals.css`,
desactivado bajo `prefers-reduced-motion`.

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
