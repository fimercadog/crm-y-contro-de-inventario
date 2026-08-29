# Reglas de diseño

Sistema visual de FidelOS HRMS. Las fuentes de verdad son
[frontend/src/app/globals.css](../frontend/src/app/globals.css),
[frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx) y los componentes
en `frontend/src/components/`. Este documento las resume; si algo diverge, gana
el código.

## Color

Tokens definidos en `:root` (globals.css) y expuestos a Tailwind vía
`@theme inline`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--primary` | `#2563ff` | CTA, enlaces, íconos de acento, logo mark |
| `--navy` | `#071632` | Títulos, bloques oscuros, footer, CTA, columna "solución" |
| `--foreground` | `#0b1633` | Texto base |
| `--muted-foreground` | `#5f6f89` | Texto secundario, descripciones |
| `--background` | `#f6f8fc` | Fondo del panel privado |
| `--card` | `#ffffff` | Tarjetas |
| `--muted` | `#eef3fb` | Secciones alternas, chips |
| `--accent` | `#eaf1ff` | Hover suave, nav activo, badges de evento |
| `--border` | `#d9e2ef` | Bordes, grid de puntos del hero |
| `--success` | `#11a36a` | Confirmaciones, estado "en línea" |
| `--destructive` | `#b42318` | Errores, lista "antes" |
| `--warning` | `#f59e0b` | Reservado |
| `--marketing-shadow` | `0 24px 70px rgb(16 35 80 / 13%)` | Elevación de paneles destacados |

**Excepciones hardcoded:** WhatsApp `#25D366`, mid-stop del degradado de título
`#5b8cff`, degradado del hero `#ffffff → #eef4ff`.

**Dark mode:** solo en el panel privado (hay toggle). `--primary` vira a teal
`#2dd4bf` y los fondos a `#101418` / `#171d22`. **El sitio público es siempre
claro** — `MarketingLayout` fuerza `bg-white`.

## Tipografía

- **Geist Sans** para todo (`--font-geist-sans`), `antialiased` global. Geist
  Mono está cargada pero sin uso.
- Pesos: `medium`, `semibold`, `bold`. Nunca `light`.

| Rol | Clases |
| --- | --- |
| H1 hero | `text-5xl` → `sm:text-6xl`, `font-semibold`, `leading-[1.04]`, `tracking-tight` |
| H2 sección | `text-3xl` → `sm:text-4xl`, `font-semibold`, `tracking-tight`, color `navy` |
| Eyebrow | `text-sm font-semibold uppercase tracking-[0.18em]`, color `primary`, `mb-3` |
| Lead | `text-lg leading-8`, color `muted-foreground` |
| Body | `text-base leading-7` |
| Tarjeta / metadata | `text-sm leading-6` |
| Micro | `text-xs` / `text-[11px]` |

## Layout y espaciado

- Contenedor único: `mx-auto max-w-7xl`.
- Ancho de texto legible: `max-w-3xl` (títulos), `max-w-2xl` (leads).
- Padding horizontal de sección: `px-4 sm:px-6 lg:px-8`.
- Padding vertical: `py-20` base, `py-24` en secciones densas, hero
  `py-20 lg:py-28`.
- Gaps: `gap-3` (chips, stats), `gap-5` (tarjetas), `gap-12` (split del hero).
- Splits: hero `lg:grid-cols-[1fr_0.95fr]`; resto `lg:grid-cols-2` o
  `[0.8fr_1.2fr]`.
- **La separación entre secciones se hace por color** (alterna `white` ↔
  `bg-muted`), no con líneas divisorias.

## Radios

Escala redondeada y generosa. Esquinas vivas solo en divisores o imágenes
full-bleed.

| Clase | Uso |
| --- | --- |
| `rounded-full` | chips, badges, avatares, botón WhatsApp, anillo ping |
| `rounded-xl` | botones grandes (`h-12`), inputs |
| `rounded-2xl` | stat cards, logo mark |
| `rounded-3xl` | tarjetas de contenido (feature, problem/solution) |
| `rounded-4xl` | paneles grandes (dashboard/chat preview, CTA) |
| `rounded-md` | controles del panel privado (`h-10`), modales |

## Sombras

- `shadow-sm` — tarjetas sobre fondo claro.
- `shadow-(--marketing-shadow)` — paneles elevados o destacados.
- `shadow-lg shadow-primary/20` — botón primario del hero.
- `shadow-lg shadow-black/20` — botón WhatsApp.

## Botones

- **Primario:** `bg-primary text-white`, `font-semibold`, `rounded-xl` en
  marketing (`h-12`) / `rounded-md` en el panel (`h-10`). Hover: `scale-105` +
  `active:scale-95` en marketing; `opacity-90` en el panel.
- **Secundario / outline:** `border border-border bg-white text-navy`, mismo
  tamaño. Sobre fondo `navy`: `border-white/20`.
- **Ghost / icon:** solo en el panel privado.
- Siempre con ícono lucide `h-4 w-4` y `gap-2`.

## Iconografía

- **lucide-react** en todo el proyecto, stroke por defecto, monocromo.
- Tamaños: `h-3.5` (chips), `h-4 w-4` (inline / botón), `h-5 w-5` (listas,
  features), `h-6 w-6` (feature mark).
- Color `primary` o `success`. Nunca multicolor.

## Marca

- Wordmark **"FidelOS HRMS"** (`font-bold text-base`). En el panel privado:
  "FidelOS" + subtítulo "HRMS administrativo".
- **LogoMark:** cuadrado `bg-primary` redondeado con dos círculos blancos
  superpuestos (uno al 55 % de opacidad) — símbolo abstracto de "personas". El
  mark siempre en `primary`.

## Superficies de énfasis

- Bloque oscuro `bg-navy` + texto blanco: CTA, columna "Con FidelOS HRMS",
  footer.
- Hero: degradado vertical claro + tres blobs de glow (`primary/15`,
  `navy/10`, `success/25`) + grid de puntos enmascarado.

## Movimiento

Framer Motion para entradas y micro-interacciones; CSS para fondos infinitos.

- **Reveal on-scroll** (`components/marketing/reveal.tsx`): `opacity 0→1`,
  `y 24→0`, `0.55s ease-out`, `once`, `viewport margin -80px`. Prop `delay`
  para escalonar (~0.08–0.1 s por ítem).
- **Hero** (`components/marketing/hero.tsx`): el fondo hace `scale 1.15→1` en
  2 s **una sola vez** al cargar; el texto entra en cascada
  (`staggerChildren 0.15`, `delayChildren 0.1`).
- **Hover:** 200–300 ms. `scale-105` en CTA, `-translate-y-1.5` en tarjetas,
  `rotate` en íconos de feature, subrayado que crece en la nav.
- **Fondos infinitos** (globals.css): `float 6s`, `drift 10s`,
  `pulse-glow 4.5s`, `grid-pan 14s`, `gradient-text 5s`.
- `prefers-reduced-motion: reduce` apaga **todos** los fondos infinitos.
  Excepción deliberada: el anillo del botón de WhatsApp **siempre** palpita
  (es un llamado de atención pedido explícitamente).

## Modales

- Radix Dialog (`components/ui/dialog.tsx`) es el único patrón de modal.
- **Clic fuera del modal NO lo cierra.** Los modales suelen contener
  formularios; cerrarlos por accidente hace que el usuario pierda lo que
  estaba llenando. Se cierran solo con el botón **X**, el botón **Cancelar** o
  la tecla **Escape**. Implementado en `DialogContent` con
  `onInteractOutside={(e) => e.preventDefault()}` (un caller puede pasar su
  propio handler para reactivarlo).

## Accesibilidad

- `*:focus-visible` → `outline: 2px solid var(--primary)`, `outline-offset: 2px`
  (global).
- Todo enlace-ícono lleva `aria-label`.
- `scroll-behavior: smooth`, `html lang="es"`.

## Idioma

- UI en español (es-CO). Buena parte de los copys y strings del código va sin
  tildes (decisión previa del repo); la documentación nueva sí las usa.
