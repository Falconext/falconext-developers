import { MARCA } from "./brand";

const falconext = {
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
    // TODO: cambiar por la URL del console cuando exista (app.falconext.pe o similar).
    // Por ahora apunta al inicio del onboarding.
    dashboard: "/logistica/2025-07-01/getting-started",
    status: "https://status.falconext.com",
    support: "mailto:developers@falconext.com",
    website: "https://falconext.com",
    github: "https://github.com/falconext",
    postman: "/downloads/falconext.postman_collection.json",
    // El spec por producto/versión vive en el registry (src/config/products.ts).
    // Este apunta al producto GA por conveniencia (descargas genéricas).
    openapi: "/openapi/logistica/2025-07-01.json",
  },
};

/** Krezka: la API para el propio negocio (catálogo, stock, ventas y facturación). */
const krezka: typeof falconext = {
  name: "Krezka Developers",
  shortName: "Krezka",
  domain: "developers.krezka.com",
  url: "https://developers.krezka.com",
  description:
    "Conecta tu página web o tu sistema con Krezka: tu catálogo, tu stock y tus ventas con boleta o factura electrónica ante SUNAT. API REST, webhooks y modo prueba.",
  tagline: "La API de Krezka para tu negocio",
  product: { id: "erp", name: "API de Krezka" },
  apiBaseUrl: "https://api.krezka.com",
  currentApiVersion: "2026-10-22",
  links: {
    // Las claves se crean en el panel de Krezka, no en este portal.
    dashboard: "/console",
    status: "https://krezka.com",
    support: "mailto:ventas@krezka.com",
    website: "https://krezka.com",
    github: "",
    postman: "",
    openapi: "/openapi/erp/2026-10-22.json",
  },
};

export const siteConfig = MARCA === "krezka" ? krezka : falconext;

export type SiteConfig = typeof siteConfig;
