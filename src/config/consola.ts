import { esKrezka } from "./brand";

/**
 * Qué maneja la consola según la marca.
 *
 * developers.krezka.com es la consola de la API de Facturación (registro,
 * Mis empresas, claves, webhooks, consumo — como apisunat). El portal de
 * Falconext sigue con la de Logística. Las pantallas son las mismas; cambian
 * las rutas del backend y los textos.
 */
export const CONSOLA = esKrezka
  ? {
      producto: "API de Facturación de Krezka",
      inicio: "/console/empresas",
      claves: "/facturacion/consola/claves",
      webhooks: "/facturacion/consola/webhooks",
      cuerpoClave: (nombre: string | undefined, entorno: "live" | "test") => ({ name: nombre, environment: entorno }),
      eventos: ["invoice.accepted", "invoice.observed", "invoice.rejected", "invoice.voided"],
      firma: "Krezka-Signature",
      queCambia: "tus comprobantes",
      ejemploUrl: "https://tu-app.com/webhooks/krezka",
    }
  : {
      producto: "API de Falconext Logística",
      inicio: "/console/api-keys",
      claves: "/logistica/api-keys",
      webhooks: "/logistica/webhooks",
      cuerpoClave: (nombre: string | undefined, entorno: "live" | "test") => ({ nombre, entorno }),
      eventos: [
        "order.created",
        "order.assigned",
        "order.picked_up",
        "order.in_transit",
        "order.delivered",
        "order.failed",
        "order.returned",
      ],
      firma: "Falconext-Signature",
      queCambia: "tus entregas",
      ejemploUrl: "https://tu-app.com/webhooks/falconext",
    };

/** Los endpoints de webhook vienen con nombres distintos según el backend. */
export type EndpointWebhook = {
  endpointId: string;
  url: string;
  events: string[];
  activo: boolean;
  ultimoEnvioEn: string | null;
  creadoEn: string;
};

export function normalizarEndpoints(res: any): EndpointWebhook[] {
  const lista: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  return lista.map((e) => ({
    endpointId: e.endpointId ?? e.id,
    url: e.url,
    events: e.events ?? [],
    activo: e.activo ?? e.active ?? true,
    ultimoEnvioEn: e.ultimoEnvioEn ?? e.last_delivery_at ?? null,
    creadoEn: e.creadoEn ?? e.created_at,
  }));
}
