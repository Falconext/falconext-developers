export const siteConfig = {
  name: "Falconext Developers",
  shortName: "Falconext",
  domain: "developers.falconext.com",
  url: "https://developers.falconext.com",
  description:
    "Integra tu ERP, ecommerce, WMS u OMS con Falconext Logística. API REST, webhooks, SDKs y guías para llevar tus entregas a producción.",
  tagline: "La API de logística para tu operación",
  // El producto documentado hoy. La arquitectura permite añadir más (ERP, POS, Facturación…).
  product: {
    id: "logistica",
    name: "Falconext Logística",
  },
  apiBaseUrl: "https://api.falconext.pe",
  currentApiVersion: "2025-07-01",
  links: {
    dashboard: "https://app.falconext.com",
    status: "https://status.falconext.com",
    support: "mailto:developers@falconext.com",
    website: "https://falconext.com",
    github: "https://github.com/falconext",
    postman: "/downloads/falconext.postman_collection.json",
    // El spec por producto/versión vive en el registry (src/config/products.ts).
    // Este apunta al producto GA por conveniencia (descargas genéricas).
    openapi: "/openapi/logistica/2025-07-01.json",
  },
} as const;

export type SiteConfig = typeof siteConfig;
