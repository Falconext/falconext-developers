export type IntegrationStatus = "available" | "beta" | "planned";

export type Integration = {
  name: string;
  slug: string;
  category: "ERP" | "Ecommerce" | "Marketplace" | "Pagos" | "POS";
  status: IntegrationStatus;
  description: string;
  /** Guía relacionada si existe. */
  guide?: string;
};

export const integrations: Integration[] = [
  { name: "SAP", slug: "sap", category: "ERP", status: "available", description: "Sincroniza pedidos y entregas desde SAP ERP / S4HANA.", guide: "/logistica/2025-07-01/guides/sap" },
  { name: "Odoo", slug: "odoo", category: "ERP", status: "available", description: "Conecta el módulo de ventas e inventario de Odoo.", guide: "/logistica/2025-07-01/guides/odoo" },
  { name: "Oracle", slug: "oracle", category: "ERP", status: "planned", description: "Integración con Oracle NetSuite / Fusion." },
  { name: "Microsoft Dynamics", slug: "dynamics", category: "ERP", status: "planned", description: "Conector para Dynamics 365 Business Central." },
  { name: "Shopify", slug: "shopify", category: "Ecommerce", status: "available", description: "Crea entregas automáticamente desde tus órdenes de Shopify.", guide: "/logistica/2025-07-01/guides/shopify" },
  { name: "WooCommerce", slug: "woocommerce", category: "Ecommerce", status: "available", description: "Plugin para disparar entregas desde WooCommerce.", guide: "/logistica/2025-07-01/guides/woocommerce" },
  { name: "VTEX", slug: "vtex", category: "Ecommerce", status: "beta", description: "Orquesta el last-mile de tus tiendas VTEX." },
  { name: "PrestaShop", slug: "prestashop", category: "Ecommerce", status: "planned", description: "Módulo de envíos para PrestaShop." },
  { name: "Amazon", slug: "amazon", category: "Marketplace", status: "beta", description: "Cumple pedidos de Amazon con la red Falconext." },
  { name: "Mercado Libre", slug: "mercadolibre", category: "Marketplace", status: "available", description: "Gestiona envíos de tus publicaciones de Mercado Libre." },
  { name: "Culqi", slug: "culqi", category: "Pagos", status: "available", description: "Concilia pagos Culqi con el estado de la entrega." },
  { name: "Mercado Pago", slug: "mercadopago", category: "Pagos", status: "beta", description: "Vincula cobros de Mercado Pago con entregas." },
  { name: "Stripe", slug: "stripe", category: "Pagos", status: "planned", description: "Reconciliación de pagos Stripe con entregas." },
];

export const statusMeta: Record<IntegrationStatus, { label: string; tone: "green" | "amber" | "neutral" }> = {
  available: { label: "Disponible", tone: "green" },
  beta: { label: "Beta", tone: "amber" },
  planned: { label: "Próximamente", tone: "neutral" },
};
