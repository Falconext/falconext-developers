# Falconext Developers Portal

Portal oficial para desarrolladores de **Falconext** — `developers.falconext.com`.
Aplicación independiente del ERP: documentación premium, API Reference generada desde
OpenAPI, Sandbox interactivo, SDKs, webhooks e integraciones.

## Stack

- **Next.js 15** (App Router, RSC) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (tokens de marca en `globals.css`)
- **MDX** para guías y contenido · **Shiki** para resaltado de código
- **Framer Motion** (riel de ciclo de vida) · **cmdk** (búsqueda ⌘K) · **next-themes** (dark mode)

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de producción
pnpm typecheck  # verificación de tipos
```

Requiere Node ≥ 20.

## Arquitectura

```
src/
  app/
    (docs)/            # layout de 3 columnas (sidebar · contenido · TOC)
      docs/            # todas las rutas de documentación
    page.tsx           # home marketing
    layout.tsx         # root: fuentes, tema, navbar, búsqueda
  components/
    api/               # API Reference + Sandbox (motor OpenAPI)
    brand/             # logo y el riel-firma del ciclo de vida
    content/           # componentes MDX, steps, accordion
    home/              # secciones de la landing
    integrations/      # grid de integraciones
    layout/            # navbar, sidebar, footer, TOC, breadcrumbs
    search/            # command palette ⌘K
    ui/                # primitivos (Button, Badge, CodeBlock, Callout…)
    webhooks/          # tarjetas de eventos
  config/              # navigation, site, sdk, integrations, webhooks, changelog
  lib/
    openapi/           # loader, parser, samples, datos del playground
    highlight.ts       # Shiki (temas duales light/dark)
public/
  openapi/falconext.json          # ← spec fuente (reemplaza por el real)
  downloads/*.postman_collection.json
```

## Automatización desde OpenAPI

La **API Reference** (`/docs/api-reference`) y el **Sandbox** (`/docs/sandbox`) se generan
por completo desde `public/openapi/falconext.json`. No hay endpoints escritos a mano.

Para conectar la API real, apunta el loader al spec del backend en
`src/lib/openapi/loader.ts` (cambia `SPEC_PATH` por un `fetch` al endpoint del spec, o
reemplaza el archivo). Todo —referencia, ejemplos de código, búsqueda y playground— se
actualiza solo.

## Personalización

- **Marca / colores**: tokens en `src/app/globals.css` (`@theme` y variables `:root`/`.dark`).
- **Navegación**: `src/config/navigation.ts` (fuente única del sidebar, breadcrumbs, prev/next y búsqueda).
- **Contenido**: guías y páginas en `src/app/(docs)/docs/**` (MDX o TSX).

## Escalabilidad

La estructura por `config/` + `(docs)` permite documentar productos adicionales (ERP, POS,
Facturación, Marketplace) añadiendo grupos de navegación y specs OpenAPI, sin tocar los
componentes base.
