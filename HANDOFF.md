# Handoff — Falconext Developers Portal

> Prompt de continuidad para el siguiente agente. Léelo completo **antes** de tocar
> código. Contiene el contexto, las decisiones de arquitectura ya tomadas (no las
> deshagas sin justificar), el estado real del código y el roadmap con la tarea
> inmediata. Objetivo: continuar sin romper la fundación ni reintroducir deuda.

---

## 0. Tu rol y postura

Actúa como **Principal Software Architect + Developer Experience Engineer** con estándar
Stripe/Twilio/Vercel. Estás construyendo el **portal oficial de desarrolladores de
Falconext** (`developers.falconext.com`): documentación premium, no un Swagger pelado.
Debe durar 10 años y escalar a decenas de productos y cientos de endpoints **sin
rehacerse**. Calidad "best-in-class", sin atajos. Español en prosa/UI; inglés en el
contrato de API.

---

## 1. Contexto de negocio

Falconext tiene un ERP (**Falconext MyPE**) y está construyendo **Falconext Logística**.
Descubrimos que las empresas grandes (Bata, Coolbox…) no usan el ERP del proveedor: integran
**su propio ERP contra una API**. Por eso el portal es una **app independiente** que
documenta APIs para que TI/integradores/partners integren Falconext.

**Visión:** el portal documentará todo el ecosistema — Logística (hoy), luego ERP,
Ecommerce, CRM, Marketplace, Facturación Electrónica, APIs públicas y SDKs.

Dos repos relevantes (hermanos, en `/Users/tradercode/Documents/falconext/falconext/`):
- `falconext-developers/` — **este** portal (Next.js). Es donde trabajas por defecto.
- `falconext-mype/backend/` — ERP NestJS; contiene el **módulo real de logística** que
  alimentará la documentación (ver §5).

---

## 2. Decisiones de arquitectura BLOQUEADAS (no las revviertas sin una razón fuerte)

1. **Shell bespoke Next.js**, NO un framework de docs (nada de Fumadocs/Nextra/Mintlify).
   El diseño premium propio es el diferenciador. Pero **no reinventamos primitivos duros**
   (parser OpenAPI, etc.): para eso usamos librerías probadas.
2. **Producto × versión = ciudadanos de primera clase.** Todo sale de un *registry*
   (`src/config/products.ts`). Añadir un producto = una entrada + su spec, **cero
   componentes tocados**.
3. **URLs:** `/{producto}/{versión}/reference` y `/{producto}/{versión}/reference/[operation]`
   — **una página estática por endpoint** (deep-link, SEO, performance). Prohibido volver a
   la página monolítica de referencia.
4. **OpenAPI = fuente de verdad.** Se dereferencia/valida con
   `@apidevtools/swagger-parser` (NO resolver `$ref` a mano). El renderer consume la spec.
5. **Fachada en inglés sobre el dominio español.** El backend interno usa nombres en
   español (`PedidoLogistica`, `codigoTracking`); la API pública expone inglés (`Order`,
   `tracking_code`). Prosa/UI en español. (Confirmado: el propio backend ya usa inglés en su
   capa de integración: `externalOrderId`, `webhookStatus`.)
6. **i18n-ready** pero español primario; no forzar `/[lang]/` hasta que exista contenido EN.
7. **Marca Falconext:** violeta `#8A38F5 → #5A0EBB` + acento ámbar `#FFAB00` sobre tinta
   oscura. Dark + light completos. Fuentes: Space Grotesk (display) / Inter (cuerpo) /
   JetBrains Mono (código y eyebrows). Firma visual: el "delivery rail" animado
   (`src/components/brand/delivery-rail.tsx`).

---

## 3. Entorno y cómo ejecutar (IMPORTANTE — hay trampas)

- Node/pnpm: usa **Node 22** vía nvm. Antepón el PATH:
  `export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`
- El gestor es **pnpm 11.9.0** (endurecido con políticas de supply-chain). Trampas ya
  resueltas, respétalas:
  - **`minimumReleaseAge`**: rechaza paquetes publicados hace < ~1 día. Si `pnpm install`
    falla por esto, es un lockfile generado con otra pnpm; regenera con la pnpm real
    (`rm -rf node_modules pnpm-lock.yaml && pnpm install`).
  - **Build scripts**: `sharp` y `unrs-resolver` están declarados como ignorados a propósito
    en `package.json` (`pnpm.ignoredBuiltDependencies`). No los "arregles".
  - Si un `pnpm <script>` falla por el pre-check de deps, usa
    `pnpm --config.verify-deps-before-run=false <script>`.
- Comandos: `pnpm dev` (localhost:3000), `pnpm build`, `pnpm typecheck`.
- **Verificación obligatoria** tras cualquier cambio no trivial: `pnpm typecheck` **y**
  `pnpm build` en verde, y si es UI, screenshot con headless Chrome:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,1300 --screenshot=/tmp/shot.png "http://localhost:3000/<ruta>"`
  y léela. No declares "hecho" sin observar el resultado real.

---

## 4. Estado actual del portal (lo que YA existe y funciona)

Build verde: **40 páginas estáticas**. Stack: Next 15 (App Router/RSC) · React 19 · TS ·
Tailwind v4 · MDX · Shiki (resaltado dual light/dark server-side) · framer-motion · cmdk ·
next-themes.

### Fundación multi-producto/versión (Fase 1 — COMPLETADA)
- `src/config/products.ts` — **registry**. Productos: `logistica` (GA, 1 versión
  `2025-07-01`) + `erp`, `facturacion`, `ecommerce`, `crm`, `marketplace` (planned, sin
  versión). Helpers: `resolveProductVersion`, `latestVersion`, `documentedProducts`,
  `productHref`.
- `src/lib/openapi/loader.ts` — carga por `specPath`, dereferencia con swagger-parser,
  `getApiGroups`, `flattenOperations`, `findOperation`, `schemaToExample` (maneja
  `allOf/oneOf/anyOf`).
- Rutas nuevas (App Router):
  - `src/app/[product]/page.tsx` → redirige a la versión por defecto.
  - `src/app/[product]/[version]/layout.tsx` → sidebar con switchers producto/versión +
    lista de endpoints; breadcrumb `Ecosistema › <producto> › <versión>`.
  - `src/app/[product]/[version]/page.tsx` → overview del producto.
  - `src/app/[product]/[version]/reference/page.tsx` → índice de la referencia.
  - `src/app/[product]/[version]/reference/[operation]/page.tsx` → **página por endpoint**
    con `generateStaticParams` (deep-link/SEO). Ej: `/logistica/2025-07-01/reference/createorder`.
- `src/components/api/` — `operation.tsx` (renderiza una operación: schema, params,
  respuestas, panel cURL/Node/Python), `schema-table.tsx` (anidamiento real),
  `reference-sidebar.tsx`, `product-version-switcher.tsx`, `playground.tsx` (sandbox).
- `src/components/home/ecosystem.tsx` — sección "Ecosistema" en la home con cards de todos
  los productos del registry.
- Specs: `public/openapi/logistica/2025-07-01.json` (alineado al dominio real, fachada
  inglés). `public/openapi/falconext.json` es copia legacy.

### Contenido y shell (del MVP, siguen vivos)
- Home premium (`src/app/page.tsx`): Hero con delivery-rail, Ecosistema, Features, SDK
  preview, Integraciones, CTA, Footer.
- Layout raíz (`src/app/layout.tsx`): navbar, búsqueda ⌘K, theme provider, skip-link.
- **Rutas legacy `/docs/*`** (single-product, aún en uso): primeros-pasos, autenticacion,
  rate-limits, errores, versiones, ejemplos, sdk, webhooks, integraciones, postman,
  changelog, estado, faq, soporte, guias (+ 8 guías MDX). `/docs/api-reference` **redirige**
  al nuevo canónico. Todo esto se MIGRA en Fase 2 (ver §6).
- Componentes UI (`src/components/ui/`): Button, Badge/MethodBadge, Callout, Card/LinkCard,
  CodeBlock, CodeGroup, Tabs, Kbd, CopyButton, accordion, steps.
- Búsqueda: `src/components/search/*` + `src/lib/search-index.ts` — **superficial**
  (títulos + keywords, match por substring). A reemplazar en Fase 4.
- Config extra: `sdk.ts`, `webhooks.ts`, `integrations.ts`, `changelog.ts`, `navigation.ts`
  (nav legacy de `/docs`), `site.ts`.

### Deuda conocida / limitaciones actuales (documentadas, no sorpresas)
- Contenido de docs (guías, webhooks, errores, changelog, SDKs) sigue **hardcodeado** y
  **single-product** bajo `/docs/*`. Falta migrarlo al modelo `/{producto}/{versión}/`.
- Search no es full-text real.
- Sandbox hace `fetch` directo navegador→API (chocará con CORS; necesita host sandbox con
  CORS+test keys o proxy). Aún no es consciente de producto/versión (hoy hardcodea
  `logistica/latest`).
- La spec de logística es **plantilla fiel al dominio**, no generada por el backend.

---

## 5. El dominio REAL (falconext-mype/backend) — para la fachada de API

El módulo `backend/src/logistica/` ya existe y es rico. Controladores reales:
`pedido`, `despacho`, `tracking`, `conductor`, `vehiculo`, `almacen`, `cliente`, `zona`,
`integraciones`. Prefijo global `api`, puerto **4001**, ya hay `ValidationPipe` global.
Schema Prisma en `backend/prisma/schema.prisma`.

Entidad central: **`PedidoLogistica`** (el envío a un cliente final). Campos en español
camelCase: `codigoTracking`, `estado`, `nroOrdenExterna`, `clienteId`,
`direccionEntregaId`, `pesoTotalKg`, `cobroContraEntrega` (COD), `requiereFirma`,
`requiereFoto`, `creadoEn`… + capa de integración en inglés: `externalOrderId`,
`externalSystem`, `webhookStatus`, `lastSyncAt`.

Ciclo de vida real (enum `EstadoPedidoLogistica`):
`PENDIENTE → VALIDADO → ASIGNADO → LISTO_RECOGER → RECOGIDO → EN_TRANSITO → LLEGANDO →
EN_UBICACION → ENTREGADO` (+ `ENTREGA_PARCIAL, FALLIDO, DEVUELTO, REPROGRAMADO, CANCELADO`).
Origen (`OrigenPedidoLogistica`): `MANUAL, EXCEL, API, WEBHOOK, ECOMMERCE, FALCONEXT_ERP,
FALCONEXT`. Modelos de apoyo: `DespachoLogistica` (ruta), `PruebaEntregaLogistica`
(firma/DNI/fotos/COD), `IncidenciaPedidoLogistica`, `HistorialEstado*`.

**Mapeo fachada (ya aplicado en la spec del portal):** `PedidoLogistica → Order` (recurso
`/orders`), `codigoTracking → tracking_code`, `nroOrdenExterna → external_order_id`,
estados en snake_case inglés (`pending, assigned, picked_up, in_transit, delivered,
failed, returned…`), webhooks `order.*`.

---

## 6. Roadmap (lo que falta) — en orden

### Fase 2 — Consolidar el modelo multi-producto ✅ COMPLETADA
- Sistema de contenido `content/PRODUCTO/VERSION/*.mdx` con frontmatter
  (`title, description, group, order`), leído por `src/lib/content.ts` (gray-matter).
- Ruta catch-all `[product]/[version]/[...slug]/page.tsx` renderiza MDX con
  **next-mdx-remote/rsc** + `mdxComponents`. Sidebar unificado en el layout: conceptos
  (`ConceptNav`, de content) + referencia (`ReferenceSidebar`, de spec).
- Migrados a `content/logistica/2025-07-01/`: getting-started, authentication, rate-limits,
  errors, versions, webhooks, examples, changelog + 8 guías (`guides/*`).
- Rutas legacy `/docs/*` product-specific → **redirects 308** en `next.config.ts`. Páginas
  globales (sdk, integraciones, sandbox, postman, estado, faq, soporte) siguen en `/docs`
  con nav simplificado (Herramientas/Ayuda) en `config/navigation.ts`.
- **APRENDIZAJE CLAVE (respétalo):** next-mdx-remote NO evalúa props array/objeto en MDX
  (`<X data={[...]}/>` llega `undefined`). El contenido MDX NO lleva datos inline: usa
  **componentes semánticos** que sacan datos de `config/` (`SdkInstallTabs`,
  `CreateOrderExample`, `WebhookCatalog`, `ChangelogTimeline`, `DeliveryRail`) + fenced
  code blocks. Todos ya registrados en `mdx-components.tsx`.
- Pendiente menor (Fase 4): webhooks/errores aún derivan de `config/*`, no de la spec.
- Nota: `next@15.5.0` tiene un CVE (aviso en install). Actualizar Next es tarea aparte,
  coordinada — no se hizo en paralelo.
- **Nav móvil del producto (cerrada):** en `<lg` el sidebar del producto está oculto; el
  drawer `ProductMobileNav` (botón sticky en el layout `[product]/[version]`) reabre el
  árbol completo (switchers + conceptos + referencia). El hamburguesa del root sigue con
  las herramientas globales.
- **Limpieza legacy hecha:** eliminado el spec huérfano `public/openapi/falconext.json`;
  `siteConfig.links.openapi` repunta al spec versionado. El registry es la fuente por
  producto/versión.
- **Gotcha entorno (agentes en paralelo):** dos `next build`/`dev` sobre el mismo `.next`
  causan ENOENT al renombrar (`.next/export/500.html`, cache). Si pasa, `rm -rf .next` y
  reintentar; idealmente no correr dos builds del portal a la vez.

### Fase 3 — Automatización (EL PILAR) ✅ COMPLETADA (emit a staging + validación)
Estado real (2026-07-09): el backend YA emite el OpenAPI de logística desde el código y
está **validado contra el contrato del portal, sin drift breaking**. Detalle:
- `@nestjs/swagger` instalado; `buildLogisticaDocument(app)` en
  `backend/src/logistica/openapi/logistica-openapi.ts` con `include:[IntegracionesModule]`
  + fachada inglés en `external-orders/dto/openapi-facade.dto.ts` (enums con `enumName`).
- Script `npm run openapi:logistica` (emit en modo `preview:true`, sin levantar server ni
  tocar DB) → escribe `backend/openapi/logistica.generated.json` (**staging, NO el portal**).
- **8 rutas** cubren los 7 operationId del contrato con path idéntico (getOrder→`/orders/{id}`,
  trackOrder→`/orders/{id}/tracking`, getProofOfDelivery→`/orders/{id}/proof` con impl real
  desde `PruebaEntregaLogistica`, createWebhookEndpoint→`/webhook_endpoints`), + 2 extras del
  backend (`bulk`, `trackOrderLegacy` deprecado). `nest build` EXIT 0.
- **Validación**: `spectral lint` (ruleset en `backend/openapi/.spectral.yaml`) → sin errores.
  Drift-check repetible `npm run openapi:check:logistica`
  (`backend/scripts/check-logistica-openapi.mjs`) → compara generado vs este contrato y falla
  si el backend deja de cubrir alguna op/campo. Hoy: ✅ cobertura total.
- **DECISIÓN (respétala):** NO se sobreescribe `public/openapi/logistica/2025-07-01.json` con
  el generado. El contrato hand-authored sigue siendo el spec publicado (más limpio: sin
  bulk/legacy, `Error` en vez de `ErrorResponse`, tags simples) y el sandbox de Fase 4 depende
  de su forma. El generado es la **prueba de conformidad** del backend, no el publicado. Si en
  el futuro se quiere "flip" a generado→publicado, primero normalizar (quitar legacy, decidir
  bulk, renombrar ErrorResponse→Error, tags) para no regresionar los docs.
- Limitación real: `createWebhookEndpoint` genera `id`+`secret` pero **no persiste** (no hay
  modelo Prisma de webhooks; requiere migración controlada, no hecha para no tocar prod).

<details><summary>Plan original de Fase 3 (referencia histórica)</summary>

- Instalar `@nestjs/swagger` (respetar pnpm del backend; ver su propia config).
- Configurar `SwaggerModule` en `src/main.ts` (ya tiene `setGlobalPrefix('api')`,
  `ValidationPipe`, puerto 4001). Exponer un **documento OpenAPI SOLO del módulo logística**
  (no de todo el ERP): usar `DocumentBuilder` + `include: [LogisticaModule]` o filtrar por
  tags. Añadir un script que **emita el JSON a archivo** (p. ej. `openapi:logistica`) sin
  levantar el server, para el pipeline.
- Decorar DTOs/controllers de logística con `@ApiProperty`, `@ApiTags`, `@ApiOperation`,
  `@ApiResponse`. **Aplicar la fachada inglés** en los DTOs públicos (o un mapper) — no
  exponer nombres internos en español.
- Pipeline docs-as-code: backend genera `openapi.json` → CI valida con **spectral** (lint)
  y **oasdiff** (breaking changes) → se copia a
  `falconext-developers/public/openapi/logistica/<versión>.json` → el portal se regenera.
- Al final, el `specPath` del registry apunta al spec generado, no a la plantilla.

</details>

### Fase 4 — DX real ✅ COMPLETADA (search + sandbox); pendientes menores abajo
- **Search full-text** ✅ **Pagefind** (build-time, estático). `postbuild`/`search:index`
  indexan `.next/server/app` → `public/_pagefind`. `data-pagefind-body` en `<main>`,
  `data-pagefind-ignore` en sidebar/breadcrumb (solo `/[product]/[version]/*`). Carga vía
  `src/lib/pagefind.ts` (`new Function` para evadir el bundler). `search-dialog` reescrito:
  query vacío→índice curado; al escribir→Pagefind con excerpts; sin índice (dev)→fallback
  substring. Verificado: 25 páginas indexadas, `/_pagefind/pagefind.js` 200.
- **Sandbox** ✅ consciente de **producto+versión** (spec-driven). `src/lib/openapi/playground.ts`
  reescrito: `extractServers` (base URL desde `servers[]`), `extractAuth` (lee `security` +
  `securitySchemes` → bearer/apiKey/none), `buildOperationPlayground`. `playground.tsx`: entorno
  desde `servers` (default Sandbox), input auth solo si la op lo requiere, snippets cURL+Node
  con placeholder `$FALCONEXT_API_KEY` (la key **nunca** se serializa), degradación por CORS con
  mensaje + snippets copiables. Bloque "Pruébalo" por endpoint en `reference/[operation]`.
  Verificado: typecheck+build EXIT 0, screenshots sin regresión.
- **Pendiente real (infra, no frontend):** ejecución en vivo real requiere un **host sandbox
  con CORS + test keys** (o proxy "try-it" server-side). Hoy la request se construye bien y
  degrada con snippets. Es una decisión de infra del usuario.
- **SDK-gen** (pendiente): generar SDKs desde la spec (Speakeasy/Fern), reducir `config/sdk.ts`
  a ejemplos curados.
- **Pulido** (pendiente): a11y (focus-trap del command palette, aria del accordion),
  sitemap + OG por página, métricas de perf.

### Fase 5 — Prueba de escala ✅ SUPERADA con Facturación Electrónica (2026-10-15)
El segundo producto entró **solo con registry + spec + MDX**, sin tocar un componente:
- `src/config/products.ts`: `facturacion` pasa de `planned` a `beta` con la versión `2026-11-01`.
- `public/openapi/facturacion/2026-11-01.json`: contrato v1 hand-authored, OpenAPI 3.1, 13
  operaciones / 28 esquemas, fachada inglés sobre `CrearComprobanteDto` + `EstadoSunat`.
  Emisión asíncrona (202 + webhooks), `Idempotency-Key` obligatoria en todos los POST,
  `402 credit_limit_reached` para el tope de crédito. `spectral lint` sin errores.
- `content/facturacion/2026-11-01/`: 8 páginas + 5 guías. Incluye **`pricing.mdx`** (tarifario
  por tramos, S/ 0.05 → 0.03). Los eventos `invoice.*` van en tabla MDX, no en
  `WebhookCatalog`: ese componente y `config/webhooks.ts` siguen acoplados a `order.*`
  (pendiente: hacerlos por producto; ver abajo).
- Único cambio en `src/lib`: `openapi/samples.ts` ahora emite las cabeceras **obligatorias**
  declaradas en el contrato (`in: header`, `required`) en cURL/Node/Python. Sin esto, el
  snippet de `POST /invoices` omitía `Idempotency-Key` y un integrador que lo copiaba recibía
  422 en su primera llamada. Es spec-driven y beneficia a todos los productos.
- Aprendizaje: la referencia **no** interpreta markdown en `description` (los backticks salen
  literales). Los specs no deben usar `\`código\`` en descripciones.
- Verificado: typecheck + build EXIT 0, 53 páginas indexadas (antes 25), screenshots de landing,
  pricing, getting-started y `reference/createinvoice`.
- Gotcha repetido: un `next start` viejo seguía en el :3000 y el screenshot era de la build
  anterior. `lsof -ti:3000 | xargs kill -9` antes de volver a levantar.
- El plan completo del producto (fases, precios, riesgos) vive en el doc "Krezka API de
  Facturación — Plan de implementación" (Claude Docs). El backend se implementa contra este
  contrato en sus fases 2–3 y se valida con drift-check como Logística.

**Pendiente derivado:** `config/webhooks.ts` + `WebhookCatalog` + `delivery-rail` + el índice de
búsqueda asumen un solo catálogo de eventos (`order.*`). Hacerlos por producto es el primer
cambio real a componentes que pide el multi-producto.

### Fase 5 (plan original)
- Onboardear el **2º producto** (p. ej. ERP o Facturación) SOLO agregando su entrada en el
  registry + su spec + guías MDX. Si requiere tocar componentes, la arquitectura falló:
  arréglala, no la parchees. Es el test de que "no hay que rehacer".

---

## 7. Reglas de trabajo (guardrails)

- **No rompas la fundación de §2.** Si algo te empuja a violarla, para y propón, no parches.
- **Spec-driven primero**: si un dato puede salir de OpenAPI/MDX, no lo hardcodees en TS.
- **Verifica de verdad**: typecheck + build + screenshot. Reporta fallos con su salida real;
  no digas "listo" sin observar.
- **No toques la config global de pnpm** del usuario ni ejecutes build-scripts no confiables.
- **Patrón de `Link` condicional** (gotcha ya visto): no hagas
  `const Wrapper = cond ? Link : "div"` con `href` opcional — TS falla. Renderiza dos ramas
  explícitas (`return cond ? <Link href=…> : <div>`).
- **Idioma**: prosa/UI español; campos de API inglés. Sé consistente.
- Preferir editar el registry/config y dejar que la UI se derive, sobre duplicar arrays.
- Al terminar un hito, actualiza este HANDOFF.md y la memoria del proyecto.

---

## 8. Tarea inmediata sugerida

Fases 1–4 están COMPLETADAS (multi-producto, migración MDX, emit+validación del contrato,
search full-text y sandbox spec-driven). Lo que queda, en orden de valor:

1. **Persistencia real de webhooks** (backend): modelo Prisma `WebhookEndpointLogistica` vía
   migración controlada + conectar `webhooks.service.createEndpoint` al `prisma.create`. Hoy
   el endpoint responde pero no persiste. Requiere tocar la DB → coordinar, no en paralelo.
2. **Auth real de API key** (backend): el `ApiKeyAuthGuard` de logística está comentado.
   Activarlo + emisión/rotación de keys. Pre-requisito para el sandbox "en vivo".
3. **Host sandbox con CORS + test keys** (infra): habilita la ejecución en vivo del playground
   (hoy degrada a snippets por CORS). Decisión de infra del usuario.
4. ~~**Fase 5 — 2º producto**~~ ✅ hecho con Facturación (ver §6). Siguiente: catálogo de
   webhooks por producto, y el backend de Facturación contra el contrato publicado.
5. **SDK-gen** y **pulido** (a11y, sitemap/OG, perf) de §Fase 4.

> Antes de escribir código: corre `pnpm typecheck && pnpm build` para confirmar que partes
> de verde, y `git status`/lee este archivo por si algo cambió desde que se escribió.
