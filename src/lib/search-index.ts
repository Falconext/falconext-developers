import { docsNav } from "@/config/navigation";
import { sdks } from "@/config/sdk";
import { deliveryEvents } from "@/config/webhooks";

export type SearchEntry = {
  title: string;
  href: string;
  section: string;
  type: "page" | "endpoint" | "webhook" | "sdk" | "guide" | "error";
  keywords?: string[];
};

/**
 * Índice de búsqueda del portal (client-side, estático).
 * NOTA (Fase 4): reemplazar por full-text real (Pagefind/Orama) que indexe el MDX y la
 * referencia. Por ahora es un índice curado de navegación con URLs válidas.
 */

// Base del producto documentado hoy. Cuando haya más productos/versiones, este índice
// se generará en build desde el registry + content, no a mano.
const LOG = "/logistica/2025-07-01";

const productDocs: SearchEntry[] = [
  { title: "Primeros pasos", href: `${LOG}/getting-started`, section: "Logística", type: "page", keywords: ["quickstart", "empezar", "setup"] },
  { title: "Autenticación", href: `${LOG}/authentication`, section: "Logística", type: "page", keywords: ["api key", "token", "bearer"] },
  { title: "Rate limits", href: `${LOG}/rate-limits`, section: "Logística", type: "page", keywords: ["límites", "429", "throttling"] },
  { title: "Errores", href: `${LOG}/errors`, section: "Logística", type: "error", keywords: ["error", "códigos", "status"] },
  { title: "Versiones", href: `${LOG}/versions`, section: "Logística", type: "page", keywords: ["versionado", "version"] },
  { title: "Webhooks", href: `${LOG}/webhooks`, section: "Logística", type: "page", keywords: ["eventos", "events", "callbacks"] },
  { title: "Ejemplos", href: `${LOG}/examples`, section: "Logística", type: "page", keywords: ["snippets", "recetas"] },
  { title: "Changelog", href: `${LOG}/changelog`, section: "Logística", type: "page", keywords: ["cambios", "releases"] },
  { title: "API Reference", href: `${LOG}/reference`, section: "Logística", type: "endpoint", keywords: ["endpoints", "reference", "openapi"] },
];

const guides: SearchEntry[] = [
  ["Generar API Keys", "generar-api-keys"],
  ["Integrar por REST", "integrar-rest"],
  ["Integrar con Webhooks", "integrar-webhooks"],
  ["Consumir eventos", "consumir-eventos"],
  ["Integrar con SAP", "sap"],
  ["Integrar con Odoo", "odoo"],
  ["Integrar con Shopify", "shopify"],
  ["Integrar con WooCommerce", "woocommerce"],
].map(([title, slug]) => ({
  title,
  href: `${LOG}/guides/${slug}`,
  section: "Guías",
  type: "guide" as const,
}));

export function buildSearchIndex(): SearchEntry[] {
  const fromNav: SearchEntry[] = docsNav.flatMap((group) =>
    group.items.map((item) => ({
      title: item.title,
      href: item.href,
      section: group.title,
      type: "page" as const,
      keywords: item.keywords,
    })),
  );

  const webhooks: SearchEntry[] = deliveryEvents.map((evt) => ({
    title: evt.name,
    href: `${LOG}/webhooks#${evt.name.replace(/\./g, "-")}`,
    section: "Webhooks",
    type: "webhook",
    keywords: ["evento", "event", "payload", evt.label],
  }));

  const sdkEntries: SearchEntry[] = sdks.map((sdk) => ({
    title: `SDK · ${sdk.label}`,
    href: `/docs/sdk#${sdk.id}`,
    section: "SDKs",
    type: "sdk",
  }));

  return [...productDocs, ...guides, ...fromNav, ...webhooks, ...sdkEntries];
}
