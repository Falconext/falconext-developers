/**
 * SDK oficial de Falconext Logística para Node.js / TypeScript.
 *
 * Cliente ergonómico y sin dependencias sobre la API pública de Logística.
 * Autenticación por API key (Bearer). Expone camelCase; mapea a snake_case
 * en el cable automáticamente. Incluye verificación de firma HMAC de webhooks.
 *
 * @example
 * ```ts
 * import { FalconextLogistica } from "@falconext/logistica";
 * const fx = new FalconextLogistica({ apiKey: process.env.FALCONEXT_API_KEY! });
 * const order = await fx.orders.create({
 *   customer: { name: "María Fernández", phone: "+51987654321" },
 *   deliveryAddress: { address: "Av. Javier Prado 123", district: "San Isidro" },
 *   items: [{ description: "Caja", quantity: 1 }],
 * });
 * ```
 */
import { createHmac, timingSafeEqual } from "node:crypto";

// ─── Tipos ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending" | "validated" | "assigned" | "ready_for_pickup" | "picked_up"
  | "in_transit" | "arriving" | "at_location" | "delivered"
  | "partially_delivered" | "failed" | "returned" | "rescheduled" | "cancelled";

export type OrderSource =
  | "manual" | "excel" | "api" | "webhook" | "ecommerce" | "falconext_erp" | "falconext";

export type WebhookEvent =
  | "order.created" | "order.assigned" | "order.picked_up" | "order.in_transit"
  | "order.delivered" | "order.failed" | "order.returned";

export interface Customer {
  name: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export interface Address {
  label?: string;
  address: string;
  district?: string;
  city?: string;
  department?: string;
  lat?: number;
  lng?: number;
  reference?: string;
  accessNotes?: string;
}

export interface OrderItem {
  sku?: string;
  description: string;
  quantity?: number;
  weightKg?: number;
  declaredValue?: number;
}

export interface TimeWindow {
  start?: string;
  end?: string;
}

export interface OrderCreateParams {
  externalOrderId?: string;
  source?: OrderSource;
  customer: Customer;
  deliveryAddress: Address;
  items?: OrderItem[];
  requestedDate?: string;
  timeWindow?: TimeWindow;
  priority?: number;
  isUrgent?: boolean;
  requiresSignature?: boolean;
  requiresPhoto?: boolean;
  cashOnDelivery?: number;
  customerNotes?: string;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  object: "order";
  trackingCode: string;
  externalOrderId?: string;
  source: OrderSource;
  status: OrderStatus;
  customer: Customer;
  deliveryAddress: Address;
  items?: OrderItem[];
  weightKg?: number;
  packages?: number;
  cashOnDelivery?: number;
  shippingCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderList {
  object: "list";
  data: Order[];
  hasMore: boolean;
}

export interface TrackingEvent {
  status: OrderStatus;
  occurredAt: string;
  lat?: number;
  lng?: number;
}

export interface Tracking {
  status: OrderStatus;
  courier?: string;
  etaMinutes?: number;
  timeline: TrackingEvent[];
}

export interface ProofOfDelivery {
  receiverName?: string;
  receiverDocument?: string;
  relationship?: string;
  signatureUrl?: string;
  photoUrls?: string[];
  collectedAmount?: number;
  paymentMethod?: string;
  deliveredAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
}

export interface ListParams {
  limit?: number;
  status?: OrderStatus;
}

export interface FalconextLogisticaOptions {
  /** API key (Bearer). Empieza con `sk_live_` o `sk_test_`. */
  apiKey: string;
  /** Base URL de la API. Default: `https://api.falconext.pe/api`. */
  baseUrl?: string;
  /** Timeout por request en ms. Default: 30000. */
  timeoutMs?: number;
  /** `fetch` alterno (para tests o entornos sin fetch global). */
  fetch?: typeof fetch;
}

/** Error tipado de la API de Falconext. */
export class FalconextError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: unknown;
  constructor(message: string, status: number, code?: string, detail?: unknown) {
    super(message);
    this.name = "FalconextError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

// ─── Utilidades snake_case ↔ camelCase ───────────────────────────────────────
const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function deepConvert(input: unknown, keyFn: (k: string) => string): unknown {
  if (Array.isArray(input)) return input.map((v) => deepConvert(v, keyFn));
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      // `metadata` es libre: no tocar sus claves.
      out[keyFn(k)] = k === "metadata" ? v : deepConvert(v, keyFn);
    }
    return out;
  }
  return input;
}
const camelize = <T>(v: unknown): T => deepConvert(v, toCamel) as T;
const snakeize = (v: unknown): unknown => deepConvert(v, toSnake);

// ─── Cliente ─────────────────────────────────────────────────────────────────
const DEFAULT_BASE_URL = "https://api.falconext.pe/api";

export class FalconextLogistica {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly _fetch: typeof fetch;

  readonly orders: OrdersResource;
  readonly webhooks: WebhooksResource;

  constructor(opts: FalconextLogisticaOptions) {
    if (!opts?.apiKey) throw new FalconextError("Falta `apiKey`.", 0, "missing_api_key");
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this._fetch = opts.fetch ?? globalThis.fetch;
    if (!this._fetch) {
      throw new FalconextError("No hay `fetch` disponible; pásalo en las opciones.", 0);
    }
    this.orders = new OrdersResource(this);
    this.webhooks = new WebhooksResource(this);
  }

  /** @internal Ejecuta una request contra `/v1/logistics{path}` y devuelve `data`. */
  async request<T>(
    method: string,
    path: string,
    opts: { body?: unknown; query?: Record<string, unknown> } = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/v1/logistics${path}`);
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await this._fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: opts.body !== undefined ? JSON.stringify(snakeize(opts.body)) : undefined,
        signal: ctrl.signal,
      });
    } catch (e: any) {
      throw new FalconextError(
        e?.name === "AbortError" ? "La request excedió el timeout." : `Fallo de red: ${e?.message}`,
        0,
        "network_error",
        e,
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    let json: any = undefined;
    try { json = text ? JSON.parse(text) : undefined; } catch { /* respuesta no-JSON */ }

    if (!res.ok || json?.code === 0) {
      const msg = json?.message ?? json?.error?.message ?? res.statusText ?? "Error";
      const code = json?.error?.code ?? json?.code;
      throw new FalconextError(String(msg), res.status, code != null ? String(code) : undefined, json);
    }
    // La API envuelve en { code, message, data }.
    const data = json && "data" in json ? json.data : json;
    return camelize<T>(data);
  }

  /**
   * Verifica la firma HMAC de un webhook entrante (`Falconext-Signature`).
   *
   * @param rawBody  El cuerpo crudo (string) EXACTO tal como llegó (no re-serializado).
   * @param signatureHeader  El valor del header `Falconext-Signature` (`t=…,v1=…`).
   * @param secret  El `secret` (`whsec_…`) del endpoint.
   * @param toleranceSeconds  Ventana anti-replay. Default 300s (0 = sin chequeo de tiempo).
   */
  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null | undefined,
    secret: string,
    toleranceSeconds = 300,
  ): boolean {
    if (!signatureHeader || !secret) return false;
    const m = /t=(\d+),v1=([a-f0-9]+)/.exec(signatureHeader);
    if (!m) return false;
    const tStr = m[1];
    const sig = m[2];
    if (!tStr || !sig) return false;
    if (toleranceSeconds > 0) {
      const age = Math.abs(Date.now() / 1000 - Number(tStr));
      if (age > toleranceSeconds) return false;
    }
    const expected = createHmac("sha256", secret).update(`${tStr}.${rawBody}`).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}

// ─── Recursos ────────────────────────────────────────────────────────────────
class OrdersResource {
  constructor(private readonly c: FalconextLogistica) {}

  /** Crea una orden de entrega. */
  create(params: OrderCreateParams): Promise<Order> {
    return this.c.request<Order>("POST", "/orders", { body: params });
  }

  /** Crea varias órdenes en una sola llamada. */
  createBulk(params: OrderCreateParams[]): Promise<OrderList> {
    return this.c.request<OrderList>("POST", "/orders/bulk", { body: params });
  }

  /** Lista las órdenes de tu cuenta. */
  list(params: ListParams = {}): Promise<OrderList> {
    return this.c.request<OrderList>("GET", "/orders", { query: { ...params } });
  }

  /** Obtiene una orden por su `id` (`ord_…`) o su `trackingCode`. */
  get(idOrTrackingCode: string): Promise<Order> {
    return this.c.request<Order>("GET", `/orders/${encodeURIComponent(idOrTrackingCode)}`);
  }

  /** Rastreo (estado + línea de tiempo) de una orden. */
  tracking(idOrTrackingCode: string): Promise<Tracking> {
    return this.c.request<Tracking>("GET", `/orders/${encodeURIComponent(idOrTrackingCode)}/tracking`);
  }

  /** Prueba de entrega de una orden entregada. */
  proof(idOrTrackingCode: string): Promise<ProofOfDelivery> {
    return this.c.request<ProofOfDelivery>("GET", `/orders/${encodeURIComponent(idOrTrackingCode)}/proof`);
  }

  /** Cancela una orden que aún no fue entregada. */
  cancel(idOrTrackingCode: string): Promise<Order> {
    return this.c.request<Order>("POST", `/orders/${encodeURIComponent(idOrTrackingCode)}/cancel`);
  }
}

class WebhooksResource {
  constructor(private readonly c: FalconextLogistica) {}

  /** Registra un endpoint para recibir eventos `order.*`. Devuelve el `secret` de firma. */
  create(params: { url: string; events: WebhookEvent[] }): Promise<WebhookEndpoint> {
    return this.c.request<WebhookEndpoint>("POST", "/webhook_endpoints", { body: params });
  }
}
