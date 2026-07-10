# @falconext/logistica

SDK oficial de **Falconext Logística** para Node.js / TypeScript. Sin dependencias, tipado completo, con verificación de firma de webhooks incluida.

## Instalación

```bash
npm install @falconext/logistica
```

Requiere **Node.js ≥ 18** (usa `fetch` global).

## Uso

```ts
import { FalconextLogistica } from "@falconext/logistica";

const fx = new FalconextLogistica({
  apiKey: process.env.FALCONEXT_API_KEY!, // sk_live_… o sk_test_…
  // baseUrl: "https://api.falconext.pe/api", // opcional (default)
});

// Crear una orden
const order = await fx.orders.create({
  externalOrderId: "ORD-10482",
  customer: { name: "María Fernández", phone: "+51987654321", documentType: "DNI", documentNumber: "70123456" },
  deliveryAddress: { address: "Av. Javier Prado 123", district: "San Isidro", city: "Lima", lat: -12.09, lng: -77.04 },
  items: [{ description: "Caja de zapatos", quantity: 1, weightKg: 0.8 }],
  cashOnDelivery: 150,
  requiresSignature: true,
});
console.log(order.id, order.trackingCode, order.status);

// Listar / obtener / rastrear / cancelar
const { data, hasMore } = await fx.orders.list({ limit: 20, status: "pending" });
const one = await fx.orders.get(order.id);            // por id o trackingCode
const tracking = await fx.orders.tracking(order.id);  // estado + timeline
const proof = await fx.orders.proof(order.id);        // prueba de entrega (si entregada)
await fx.orders.cancel(order.id);
```

## Webhooks

Registra un endpoint y **verifica la firma** de cada evento entrante:

```ts
// 1) Registrar (una vez)
const wh = await fx.webhooks.create({
  url: "https://miapp.com/webhooks/falconext",
  events: ["order.delivered", "order.failed"],
});
// Guarda wh.secret de forma segura.

// 2) En tu handler (Express) — usa el body CRUDO
import express from "express";
const app = express();
app.post("/webhooks/falconext", express.raw({ type: "application/json" }), (req, res) => {
  const raw = req.body.toString("utf8");
  const ok = FalconextLogistica.verifyWebhookSignature(
    raw,
    req.header("Falconext-Signature"),
    process.env.FALCONEXT_WEBHOOK_SECRET!,
  );
  if (!ok) return res.status(400).send("firma inválida");
  const event = JSON.parse(raw); // { id, type, created, data }
  // … procesa event.type ("order.delivered", …) y event.data
  res.sendStatus(200);
});
```

## Manejo de errores

Todos los métodos lanzan `FalconextError` en caso de fallo:

```ts
import { FalconextError } from "@falconext/logistica";
try {
  await fx.orders.get("ord_inexistente");
} catch (e) {
  if (e instanceof FalconextError) console.error(e.status, e.message); // 404 …
}
```

## Notas

- El SDK expone **camelCase** y mapea a `snake_case` en el cable automáticamente.
- `baseUrl` por defecto: `https://api.falconext.pe/api`. La URL pública de marca (`api.falconext.com`) está reservada para cuando se habilite el gateway público.
- Nunca uses una API key `live` en el navegador: este SDK es para servidores.

## Eventos disponibles

`order.created` · `order.assigned` · `order.picked_up` · `order.in_transit` · `order.delivered` · `order.failed` · `order.returned`
