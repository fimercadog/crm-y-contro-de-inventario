# Sitio web comercial

Landing pública de **CRM + Inventario**, construida con el stack existente
(Next.js 16 App Router, Base UI, Tailwind v4). No se instaló WordPress/Divi ni
se añadió ninguna librería nueva.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Landing pública (grupo `(marketing)`, layout con header/footer propios) |
| `/login` | App (sin cambios) |
| `/dashboard`, `/crm/**`, `/inventario/**`, `/admin/**`, … | App detrás de `AuthGuard` (sin cambios) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generados por convención de Next |

El antiguo `/` que redirigía a `/dashboard` se eliminó. Un visitante nuevo cae
en la landing; desde ahí va a `/login`.

## Estructura (basada en la guía visual del proyecto)

`docs/Guía visual SaaS para CRM e inventario.png` — layout tipo *SaaS Business
Landing Page* de Elegant Themes.

1. **Hero** — "CRM + Inventario en un solo lugar" + captura real del dashboard, CTA "Solicitar demostración" / "Ver cómo funciona".
2. **Problema** — 6 dolores reconocibles (Excel/WhatsApp disperso, clientes sin seguimiento, oportunidades olvidadas, stock a ciegas, movimientos sin rastro, información sin trazabilidad). Sin estadísticas inventadas.
3. **Una sola plataforma** — CRM · Inventario · Reportes · IA · Control de acceso · Auditoría.
4. **CRM** — captura de Pipeline + funciones verificadas.
5. **Control de inventario** — captura de Movimientos + funciones verificadas.
6. **Reportes** — captura de Reportes + los 4 reportes reales + exportación.
7. **Asistente IA** — captura del chat + capacidades reales (con la nota de que conecta con OpenAI/Anthropic).
8. **Seguridad y control** — 6 tarjetas característica → beneficio.
9. **Así se ve por dentro** — galería de 4 capturas reales (Clientes, Productos, Stock, Auditoría).
10. **Beneficios** — cada uno ligado a una función real.
11. **Demo / CTA final** — banda índigo con WhatsApp + correo + "Ya tengo cuenta".
12. **Footer**.

## Diseño

Sigue el **design system del proyecto** (`docs/design.md`, `globals.css`):
paleta índigo/slate, Roboto, botones pill, sombras de elevación, badges
semánticos. Theme-aware (claro/oscuro). **No** se usó el verde de la guía —
ver "Decisiones automáticas".

## Argumentos comerciales — solo funciones verificadas

Verificadas contra el código y la app en ejecución:

- CRM: clientes, contactos, oportunidades con **cotización de productos** y monto calculado, pipeline Kanban con drag-and-drop, actividades.
- Inventario: productos, catálogos (categorías/marcas/unidades/proveedores), registro de entradas/salidas/ajustes con `InventoryService` (transaccional, sin stock negativo), corrección/anulación de movimientos con huella de fecha y usuario, vista de stock con valorización.
- Reportes: inventario valorizado, resumen de movimientos, oportunidades por etapa, ventas por producto. Exportación **CSV/PDF** en toda la app.
- IA: asistente que responde sobre un resumen de los datos de la empresa; aislamiento multiempresa; proveedor OpenAI/Anthropic configurable (modo local de demo sin proveedor); solo administradores.
- Seguridad: usuarios, roles y **permisos por módulo** (roles a medida), auditoría con diff + IP, aislamiento por empresa, soft-delete con restaurar, token + rate-limit en login.

## Funciones NO promocionadas (incompletas o inexistentes)

| Función | Estado real |
| --- | --- |
| Módulo de contingencia / offline | **No existe.** Sin sección. |
| Reportes programados / envío por correo | No existe. Los reportes se consultan on-demand; la web lo aclara. |
| Numeración correlativa de documentos | No existe; los movimientos usan referencia libre. |
| "Seguimientos" como módulo aparte | Es un *tipo* de actividad, no un módulo. Se menciona dentro de Actividades. |
| Fuentes/estados de cliente configurables | Enums fijos. |
| Dashboard "en tiempo real" | Carga al abrir, no hace streaming. La web dice "indicadores", no "tiempo real". |
| Testimonios / logos de clientes / "cientos de empresas" / "14 días gratis" | Aparecen en la guía pero son ficticios; **omitidos**. |

## Componentes reutilizados

`Button` / `buttonVariants`, `Badge`, `Card`, `Sheet` (menú móvil), `cn`,
`buttonVariants`, iconos `lucide-react`, tokens de `globals.css`.

## Componentes nuevos (justificación)

| Componente | Por qué |
| --- | --- |
| `components/marketing/marketing-header.tsx` | Header público (nav ancla + menú móvil). El header de la app tiene sidebar/breadcrumbs; no aplica. |
| `components/marketing/marketing-footer.tsx` | No existía footer en la app. |
| `components/marketing/cta-link.tsx` | `<a>`/`<Link>` con estilo de botón. `Button render={<a>}` de Base UI emite warning (semántica de botón en un ancla). |
| `components/marketing/reveal.tsx` | Entrada CSS (fade/rise) sin librería; contenido siempre visible (SSR/no-JS safe). |
| `components/marketing/screenshot-frame.tsx` | Marco de navegador para las capturas del producto. |
| `app/not-found.tsx` | El 404 por defecto de Next es una línea en inglés sin marca. |
| `lib/site.ts` | Config de la landing (canales de contacto desde env). |

## Assets

- **Capturas reales** en `frontend/public/product/*.png` (11), tomadas de la
  app en ejecución con Playwright a 2×. No hay maquetas ni dashboards ficticios.
- OG image generada dinámicamente (`opengraph-image.tsx`, `next/og`).
- Sin fotos de stock. Decoración: gradientes/máscaras CSS.
- `docs/Guía visual SaaS para CRM e inventario.png`: referencia de estructura,
  no se usa como asset del sitio.

## SEO / performance

- `metadata` (title/description/keywords), `openGraph`, `twitter`, `canonical`,
  `metadataBase`, favicon existente.
- `sitemap.ts`, `robots.ts` (bloquea las rutas de la app).
- `<h1>` único, `<h2>` por sección, `alt` en todas las imágenes, landmarks
  `header`/`main`/`footer`, `html lang="es"`.
- `next/image` con `sizes` y lazy-load (solo el hero es `priority`).
- Sin JS de animación (framer-motion dejó de usarse en la landing).

## Contacto / WhatsApp

`site.ts` lee `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL`,
`NEXT_PUBLIC_SITE_URL` de env (documentadas en `.env.local.example`). Sin
número, el botón de WhatsApp se oculta. El CTA de demo abre `mailto:` — no hay
formulario con backend (no se pidió y un formulario que no envía a ningún lado
es peor que no tenerlo).

## Decisiones automáticas pendientes de validación del propietario

1. **Paleta**: la guía usa acento verde; el design system del proyecto es
   índigo. Se usó **índigo** para que la web combine con las capturas reales
   del producto. Si prefieres el verde de la guía, se añade un acento propio
   para marketing.
2. **`/` es la landing pública** (antes redirigía a `/dashboard`). Los usuarios
   logueados entran por `/login` → `/dashboard`.
3. **Sin testimonios ni logos de clientes** (los de la guía son ficticios).
4. **Sin sección de contingencia/offline** (no existe el módulo).
5. **CTA de demo = `mailto:` + WhatsApp**, sin formulario. Si quieres captura
   de leads en el CRM, hace falta un endpoint nuevo.
6. **Número de WhatsApp de ejemplo** en `.env.local` (`573001112233`) solo para
   QA — reemplázalo por el real.
7. `framer-motion` queda instalado pero sin uso (era la única dependencia
   candidata para animación; se resolvió con CSS).
