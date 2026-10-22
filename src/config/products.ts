/**
 * REGISTRY DE PRODUCTOS Y VERSIONES — fuente única del ecosistema Falconext.
 *
 * Añadir un producto nuevo (ERP, Ecommerce, CRM…) = agregar una entrada aquí con
 * su(s) versión(es) y su spec OpenAPI. El routing, la navegación, los switchers y
 * el home se derivan de este archivo. Ningún componente se toca al escalar.
 */

export type ProductStatus = "ga" | "beta" | "planned";
export type VersionStatus = "stable" | "beta" | "deprecated";

export type ApiVersion = {
  /** Segmento de URL, p. ej. "2025-07-01". */
  id: string;
  /** Etiqueta corta para UI, p. ej. "v1 · 2025-07-01". */
  label: string;
  status: VersionStatus;
  releasedAt: string;
  /** Ruta del spec OpenAPI (public/), fuente de la referencia y el sandbox. */
  specPath: string;
  /** Nota de deprecación / migración, si aplica. */
  notice?: string;
};

export type Product = {
  /** Segmento de URL, p. ej. "logistica". */
  id: string;
  name: string;
  /** Nombre corto para chips/switchers. */
  shortName: string;
  tagline: string;
  description: string;
  /** Ícono lucide por nombre. */
  icon: string;
  status: ProductStatus;
  /** Acento de marca por producto (permite diferenciar visualmente cada API). */
  accent: string;
  versions: ApiVersion[];
  /** id de la versión por defecto (normalmente la última estable). */
  defaultVersion?: string;
};

export const products: Product[] = [
  {
    id: "logistica",
    name: "Falconext Logística",
    shortName: "Logística",
    tagline: "La API de last-mile para tu operación",
    description:
      "Crea pedidos de entrega, optimiza rutas, sigue el estado en tiempo real por webhooks y cierra con prueba de entrega.",
    icon: "Truck",
    status: "ga",
    accent: "#8A38F5",
    defaultVersion: "2025-07-01",
    versions: [
      {
        id: "2025-07-01",
        label: "2025-07-01",
        status: "stable",
        releasedAt: "2025-07-01",
        specPath: "/openapi/logistica/2025-07-01.json",
      },
    ],
  },
  {
    id: "erp",
    name: "API de Krezka (ERP)",
    shortName: "ERP",
    tagline: "Tu catálogo, tu stock y tus ventas en tu web",
    description:
      "Muestra tus productos con precio, ofertas, tallas y stock disponible; sincroniza el stock con tu sistema y registra cada venta de tu web con su boleta o factura, igual que en tu POS.",
    icon: "Boxes",
    status: "beta",
    accent: "#3B82F6",
    defaultVersion: "2026-10-22",
    versions: [
      {
        id: "2026-10-22",
        label: "2026-10-22",
        status: "beta",
        releasedAt: "2026-10-22",
        specPath: "/openapi/erp/2026-10-22.json",
        notice:
          "Beta: las claves se crean en el panel de Krezka (API de Krezka). Con una clave sk_test_ las escrituras se validan pero no se guardan.",
      },
    ],
  },
  {
    id: "facturacion",
    name: "Facturación Electrónica",
    shortName: "Facturación",
    tagline: "Emite facturas y boletas SUNAT desde tu sistema",
    description:
      "Facturas, boletas y notas de crédito válidas ante SUNAT. Falconext firma, envía, guarda el CDR y te avisa por webhook; tú no tocas XML ni certificados.",
    icon: "ReceiptText",
    status: "beta",
    accent: "#10B981",
    defaultVersion: "2026-11-01",
    versions: [
      {
        id: "2026-11-01",
        label: "2026-11-01",
        status: "beta",
        releasedAt: "2026-11-01",
        specPath: "/openapi/facturacion/2026-11-01.json",
        notice:
          "Beta: el contrato está congelado y el backend se implementa contra él. Las API keys de producción se entregan a integradores piloto.",
      },
    ],
  },
  {
    id: "ecommerce",
    name: "Falconext Ecommerce",
    shortName: "Ecommerce",
    tagline: "Tu tienda online, programable",
    description: "Catálogo, carrito, checkout y órdenes de la tienda Falconext.",
    icon: "ShoppingBag",
    status: "planned",
    accent: "#F59E0B",
    versions: [],
  },
  {
    id: "crm",
    name: "Falconext CRM",
    shortName: "CRM",
    tagline: "Clientes, contactos y actividades",
    description: "Gestiona relaciones, segmentos y actividades comerciales por API.",
    icon: "Users",
    status: "planned",
    accent: "#EC4899",
    versions: [],
  },
  {
    id: "marketplace",
    name: "Falconext Marketplace",
    shortName: "Marketplace",
    tagline: "Vende en múltiples canales",
    description: "Publicaciones, órdenes y liquidaciones del marketplace Falconext.",
    icon: "Store",
    status: "planned",
    accent: "#6366F1",
    versions: [],
  },
];

// ------------------------------------------------------------------ //
// Helpers de acceso al registry.
// ------------------------------------------------------------------ //

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function documentedProducts(): Product[] {
  return products.filter((p) => p.versions.length > 0);
}

export function latestVersion(product: Product): ApiVersion | undefined {
  return (
    product.versions.find((v) => v.id === product.defaultVersion) ??
    product.versions[0]
  );
}

export function getVersion(product: Product, versionId: string): ApiVersion | undefined {
  return product.versions.find((v) => v.id === versionId);
}

/** Resuelve producto + versión (acepta "latest"). */
export function resolveProductVersion(productId: string, versionId: string) {
  const product = getProduct(productId);
  if (!product) return null;
  const version =
    versionId === "latest" ? latestVersion(product) : getVersion(product, versionId);
  if (!version) return null;
  return { product, version };
}

/** URL base de un producto en su versión por defecto. */
export function productHref(product: Product): string {
  const v = latestVersion(product);
  return v ? `/${product.id}/${v.id}` : `/${product.id}`;
}
