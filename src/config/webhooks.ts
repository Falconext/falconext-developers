/**
 * Catálogo de eventos del ciclo de vida de un pedido (Order / PedidoLogistica).
 * Fachada en inglés sobre el enum real EstadoPedidoLogistica del backend.
 * Es la base del riel-firma, de la página de Webhooks y del índice de búsqueda.
 * Los payloads son ilustrativos; el esquema real llegará del backend.
 */

export type WebhookEvent = {
  name: string;
  label: string;
  description: string;
  /** Etapa del riel (los eventos "off-track" como failed/returned no avanzan la línea). */
  stage: number | null;
  tone: "idle" | "live" | "done" | "fail";
  payload: Record<string, unknown>;
};

const baseOrder = {
  id: "ord_3xK8p2Qm",
  object: "order",
  external_order_id: "ORD-10482",
  tracking_code: "FX-7Q2M8K",
};

export const deliveryEvents: WebhookEvent[] = [
  {
    name: "order.created",
    label: "Creado",
    description: "El pedido se registró en Falconext y está pendiente de validación y asignación.",
    stage: 0,
    tone: "live",
    payload: {
      event: "order.created",
      data: { ...baseOrder, status: "pending", created_at: "2025-07-01T14:03:11Z" },
    },
  },
  {
    name: "order.assigned",
    label: "Asignado",
    description: "El pedido se asignó a un despacho/ruta y a un repartidor.",
    stage: 1,
    tone: "live",
    payload: {
      event: "order.assigned",
      data: { ...baseOrder, status: "assigned", courier: { id: "crr_91", name: "Repartidor" } },
    },
  },
  {
    name: "order.picked_up",
    label: "Recogido",
    description: "El repartidor recogió el paquete en el almacén de origen.",
    stage: 2,
    tone: "live",
    payload: {
      event: "order.picked_up",
      data: { ...baseOrder, status: "picked_up", picked_up_at: "2025-07-01T14:35:00Z" },
    },
  },
  {
    name: "order.in_transit",
    label: "En tránsito",
    description: "El pedido va en camino hacia la dirección de entrega.",
    stage: 3,
    tone: "live",
    payload: {
      event: "order.in_transit",
      data: { ...baseOrder, status: "in_transit", eta_minutes: 18 },
    },
  },
  {
    name: "order.delivered",
    label: "Entregado",
    description: "El pedido se entregó con éxito y cuenta con prueba de entrega (firma/foto).",
    stage: 4,
    tone: "done",
    payload: {
      event: "order.delivered",
      data: {
        ...baseOrder,
        status: "delivered",
        proof: { receiver_name: "María Fernández", signature_url: "https://cdn.falconext.com/pod/sig_9Q2m.png" },
        delivered_at: "2025-07-01T15:12:44Z",
      },
    },
  },
  {
    name: "order.failed",
    label: "Fallido",
    description: "La entrega no pudo completarse (cliente ausente, dirección errónea, rechazo…).",
    stage: null,
    tone: "fail",
    payload: {
      event: "order.failed",
      data: { ...baseOrder, status: "failed", reason: "customer_absent" },
    },
  },
  {
    name: "order.returned",
    label: "Devuelto",
    description: "El paquete regresó al origen tras uno o más intentos fallidos.",
    stage: null,
    tone: "fail",
    payload: {
      event: "order.returned",
      data: { ...baseOrder, status: "returned", returned_at: "2025-07-01T18:22:40Z" },
    },
  },
];

/** Sólo las etapas que avanzan el riel, en orden. */
export const lifecycleStages = deliveryEvents.filter((e) => e.stage !== null);
