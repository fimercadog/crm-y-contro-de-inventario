# Sitio web comercial

Sitio público **multipágina** de **CRM + Inventario**, construido con el stack
existente (Next.js 16 App Router, Base UI, Tailwind v4). No se instaló
WordPress/Divi ni se añadió ninguna librería nueva.

**Estilo visual**: réplica del layout pack **"SaaS Product" de Divi/Elegant
Themes** ("Track With Divi X") — fondo blanco, titulares negros peso 900,
verde medio como acento, **tarjetas oscuras tipo widget** (gauge/barras/stat/
avatar) flotando sobre **blobs de degradado verde→lima**, y capturas del
producto **inclinadas en perspectiva 3D**. La paleta va scopeada a
`.marketing-theme` (en `globals.css`) para que la app conserve su emerald.
Componentes: `page-hero`, `widget-card` (`WidgetCard` / `WidgetCluster`),
`gradient-blob`, `device-mockup`, `marketing-ui` (`FeatureCard`, `FeatureRow`,
`Section`, `DemoCta`).

## Rutas

Todas en el grupo `(marketing)` con layout propio (header/footer/FAB). Cada
página es real, estática, con su `<h1>`, su `metadata` (title + description +
`alternates.canonical` a su propia ruta) y su cierre con la banda CTA.

| Ruta | Contenido |
| --- | --- |
| `/` | Home — hero + "Una sola plataforma" + "Explora" (3 accesos) + galería del producto + CTA |
| `/producto` | El problema (6 dolores) + "Una sola plataforma" + galería del producto |
| `/funciones` | 3 `FeatureRow`: CRM (Pipeline), Control de inventario (Movimientos), Reportes |
| `/beneficios` | 6 tarjetas función → beneficio |
| `/asistente-ia` | **Complemento premium**: hero con badge, `FeatureRow` de uso, tabla de proveedores (local / OpenAI / Anthropic) |
| `/seguridad` | 6 tarjetas de control de acceso y trazabilidad |
| `/demo` | Canales de contacto (WhatsApp / correo / login) + "qué incluye la demo". Sin formulario. |
| `/login` | App (sin cambios) |
| `/dashboard`, `/crm/**`, `/inventario/**`, `/admin/**`, … | App detrás de `AuthGuard` (sin cambios) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generados por convención de Next; el sitemap lista todas las páginas de marketing |

El antiguo `/` que redirigía a `/dashboard` se eliminó. El menú del header hace
navegación real (`<Link>`) con estado activo (`usePathname` + `aria-current`).

### Componentes compartidos

- `components/marketing/marketing-ui.tsx` — `Section`, `SectionHeading`, `FeatureRow`, `PlataformaGrid`, `TourGrid`, `DemoCta`, `ContactChannels`, y las constantes `container` / `cardHover`.
- `components/marketing/page-hero.tsx` — `PageHero`: banda de hero con `HeroBackdrop`; con `screenshot` es el hero de dos columnas (home), sin él es el hero compacto de página interior.

## Diseño

Sigue el **design system del proyecto** (`docs/design.md`, `globals.css`):
paleta **verde esmeralda + azul marino** (según "Guía visual SaaS para CRM e
inventario"), Roboto, botones pill, sombras de elevación, badges semánticos.
Theme-aware (claro/oscuro).

**Movimiento**: `Reveal` (IntersectionObserver + transiciones CSS, seguro para
SSR) hace la entrada — subida + desenfoque + fade — en cascada en cada hero y
por bloque al hacer scroll. `PageTransition` re-monta el contenido de cada
página de la app en cada navegación. `HeroBackdrop` arma el fondo de cada hero
de marketing y del panel de login: aurora que respira, halo cónico giratorio,
grid en fuga y barrido de luz. Hover: elevación de tarjeta +
`--marketing-shadow`, escala de íconos, escala de botones CTA, subrayado activo
en la nav.

Bajo **`prefers-reduced-motion`** todos los bucles se congelan (queda el degradado
rico estático) y `Reveal` degrada a un fundido de opacidad. Para ver el efecto
completo hay que desactivar "reducir movimiento" en el SO (Windows: Configuración
→ Accesibilidad → Efectos visuales → Efectos de animación).

## Argumentos comerciales — solo funciones verificadas

Verificadas contra el código y la app en ejecución:

- CRM: clientes, contactos, oportunidades con **cotización de productos** y monto calculado, pipeline Kanban con drag-and-drop, actividades.
- Inventario: productos, catálogos (categorías/marcas/unidades/proveedores), registro de entradas/salidas/ajustes con `InventoryService` (transaccional, sin stock negativo), corrección/anulación de movimientos con huella de fecha y usuario, vista de stock con valorización.
- Reportes: inventario valorizado, resumen de movimientos, oportunidades por etapa, ventas por producto. Exportación **CSV/PDF** en toda la app.
- IA (**complemento premium**, se contrata aparte del plan base): asistente que responde sobre un resumen de los datos de la empresa; aislamiento multiempresa; proveedor OpenAI/Anthropic configurable (modo local de demo sin proveedor); solo administradores. Aviso visible en `/asistente-ia` (badge + nota), en la pill de `/` y `/producto`, en el sidebar de la app (badge "Premium") y en `/ia` (banner "Consultar precio").
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
| `components/marketing/marketing-header.tsx` | Header público (nav real con `<Link>` + estado activo + menú móvil). El header de la app tiene sidebar/breadcrumbs; no aplica. |
| `components/marketing/marketing-footer.tsx` | No existía footer en la app. |
| `components/marketing/marketing-ui.tsx` | Primitivas y bloques compartidos entre las 7 páginas (`Section`, `FeatureRow`, `PlataformaGrid`, `TourGrid`, `DemoCta`, …). |
| `components/marketing/page-hero.tsx` | Hero reutilizable (home de dos columnas / interior compacto). |
| `components/marketing/cta-link.tsx` | `<a>`/`<Link>` con estilo de botón. `Button render={<a>}` de Base UI emite warning (semántica de botón en un ancla). |
| `components/marketing/reveal.tsx` | Entrada con IntersectionObserver + transiciones CSS, sin librería; SSR-safe. |
| `components/marketing/hero-backdrop.tsx` | Fondo ambiental animado del hero (aurora / grid / halo / barrido). |
| `components/marketing/screenshot-frame.tsx` | Marco de navegador para las capturas del producto, con zoom en hover. |
| `components/layout/page-transition.tsx` | Entrada por ruta en las páginas de la app. |
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

1. **Paleta**: se aplicó **verde esmeralda + azul marino** de la guía visual a
   todo el design system (app + web), y se recapturaron las 11 capturas del
   producto con los colores nuevos.
2. **Sitio multipágina** (a pedido): `/` es la home resumen y cada ítem del menú
   es su propia página real. El antiguo `/` que redirigía a `/dashboard` se
   eliminó; los usuarios logueados entran por `/login` → `/dashboard`.
3. **Sin testimonios ni logos de clientes** (los de la guía son ficticios).
4. **Sin sección de contingencia/offline** (no existe el módulo).
5. **CTA de demo = `mailto:` + WhatsApp**, sin formulario. Si quieres captura
   de leads en el CRM, hace falta un endpoint nuevo.
6. **WhatsApp**: `573027029498` (por defecto en `site.ts`, sobreescribible con
   `NEXT_PUBLIC_WHATSAPP`).
7. `framer-motion` queda instalado pero sin uso (el scroll-reveal se resolvió
   con IntersectionObserver + CSS para evitar un desajuste de hidratación con
   `prefers-reduced-motion`). Se puede desinstalar.
