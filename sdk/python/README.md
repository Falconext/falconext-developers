# falconext-logistica (Python)

SDK oficial de **Falconext Logística** para Python. Sin dependencias (solo stdlib), tipado, con verificación de firma de webhooks.

## Instalación

```bash
pip install falconext-logistica
```

Requiere **Python ≥ 3.8**.

## Uso

```python
import os
from falconext_logistica import FalconextLogistica

fx = FalconextLogistica(api_key=os.environ["FALCONEXT_API_KEY"])  # sk_live_… / sk_test_…

# Crear una orden
order = fx.orders.create(
    external_order_id="ORD-10482",
    customer={"name": "María Fernández", "phone": "+51987654321",
              "document_type": "DNI", "document_number": "70123456"},
    delivery_address={"address": "Av. Javier Prado 123", "district": "San Isidro",
                      "city": "Lima", "lat": -12.09, "lng": -77.04},
    items=[{"description": "Caja de zapatos", "quantity": 1, "weight_kg": 0.8}],
    cash_on_delivery=150,
    requires_signature=True,
)
print(order["id"], order["tracking_code"], order["status"])

# Listar / obtener / rastrear / cancelar
page = fx.orders.list(limit=20, status="pending")   # {"object","data","has_more"}
one = fx.orders.get(order["id"])                     # por id o tracking_code
tracking = fx.orders.tracking(order["id"])
fx.orders.cancel(order["id"])
```

## Webhooks

```python
from falconext_logistica import verify_webhook_signature

wh = fx.webhooks.create(url="https://miapp.com/webhooks/falconext",
                        events=["order.delivered", "order.failed"])
# Guarda wh["secret"].

# En tu handler (Flask) — usa el cuerpo CRUDO:
@app.post("/webhooks/falconext")
def handler():
    raw = request.get_data(as_text=True)
    ok = verify_webhook_signature(raw, request.headers.get("Falconext-Signature"),
                                  os.environ["FALCONEXT_WEBHOOK_SECRET"])
    if not ok:
        return "firma inválida", 400
    event = request.get_json()  # {"id","type","created","data"}
    return "", 200
```

## Errores

```python
from falconext_logistica import FalconextError
try:
    fx.orders.get("ord_inexistente")
except FalconextError as e:
    print(e.status, e.message)  # 404 …
```

## Notas

- `base_url` por defecto: `https://api.falconext.pe/api`. La URL de marca `api.falconext.com` está reservada para el gateway público.
- Nunca uses una API key `live` en el cliente: este SDK es para servidores.
