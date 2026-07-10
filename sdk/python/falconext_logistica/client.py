"""SDK oficial de Falconext Logística para Python. Sin dependencias (stdlib)."""
from __future__ import annotations

import hashlib
import hmac
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Optional

__all__ = ["FalconextLogistica", "FalconextError", "verify_webhook_signature"]

DEFAULT_BASE_URL = "https://api.falconext.pe/api"


class FalconextError(Exception):
    """Error de la API de Falconext."""

    def __init__(self, message: str, status: int = 0, code: Optional[str] = None, detail: Any = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.detail = detail

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"[{self.status}] {self.message}"


class FalconextLogistica:
    """Cliente de la API pública de Logística. Autenticación por API key (Bearer).

    Ejemplo::

        fx = FalconextLogistica(api_key=os.environ["FALCONEXT_API_KEY"])
        order = fx.orders.create(
            customer={"name": "María Fernández", "phone": "+51987654321"},
            delivery_address={"address": "Av. Javier Prado 123", "district": "San Isidro"},
            items=[{"description": "Caja", "quantity": 1}],
        )
        print(order["id"], order["tracking_code"])
    """

    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL, timeout: float = 30.0):
        if not api_key:
            raise FalconextError("Falta `api_key`.", 0, "missing_api_key")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.orders = _Orders(self)
        self.webhooks = _Webhooks(self)

    def request(
        self,
        method: str,
        path: str,
        body: Any = None,
        query: Optional[dict[str, Any]] = None,
    ) -> Any:
        """Ejecuta una request contra ``/v1/logistics{path}`` y devuelve ``data``."""
        url = f"{self.base_url}/v1/logistics{path}"
        if query:
            clean = {k: v for k, v in query.items() if v is not None}
            if clean:
                url += "?" + urllib.parse.urlencode(clean)
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Bearer {self.api_key}")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8")
                status = resp.status
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8") if e.fp else ""
            status = e.code
        except urllib.error.URLError as e:
            raise FalconextError(f"Fallo de red: {e.reason}", 0, "network_error", e) from e

        parsed: Any = None
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = None

        is_env_err = isinstance(parsed, dict) and parsed.get("code") == 0
        if status >= 400 or is_env_err:
            msg: Any = "Error"
            code: Any = None
            if isinstance(parsed, dict):
                err = parsed.get("error")
                err_obj = err if isinstance(err, dict) else {}
                msg = parsed.get("message") or err_obj.get("message") or msg
                code = err_obj.get("code") or parsed.get("code")
            raise FalconextError(str(msg), status, str(code) if code is not None else None, parsed)

        # La API pública devuelve el recurso limpio (contrato). Por
        # compatibilidad, si llega el envelope interno {code, message, data},
        # lo desenvolvemos.
        if (
            isinstance(parsed, dict)
            and "code" in parsed
            and "message" in parsed
            and "data" in parsed
        ):
            return parsed["data"]
        return parsed


class _Orders:
    def __init__(self, client: FalconextLogistica):
        self._c = client

    def create(self, **params: Any) -> dict:
        """Crea una orden de entrega. Acepta customer, delivery_address, items, etc."""
        return self._c.request("POST", "/orders", body=params)

    def create_bulk(self, orders: list[dict]) -> dict:
        """Crea varias órdenes en una sola llamada."""
        return self._c.request("POST", "/orders/bulk", body=orders)

    def list(self, limit: Optional[int] = None, status: Optional[str] = None) -> dict:
        """Lista las órdenes de tu cuenta."""
        return self._c.request("GET", "/orders", query={"limit": limit, "status": status})

    def get(self, id_or_tracking_code: str) -> dict:
        """Obtiene una orden por su id (``ord_…``) o su ``tracking_code``."""
        return self._c.request("GET", f"/orders/{urllib.parse.quote(id_or_tracking_code)}")

    def tracking(self, id_or_tracking_code: str) -> dict:
        """Rastreo (estado + línea de tiempo)."""
        return self._c.request("GET", f"/orders/{urllib.parse.quote(id_or_tracking_code)}/tracking")

    def proof(self, id_or_tracking_code: str) -> dict:
        """Prueba de entrega de una orden entregada."""
        return self._c.request("GET", f"/orders/{urllib.parse.quote(id_or_tracking_code)}/proof")

    def cancel(self, id_or_tracking_code: str) -> dict:
        """Cancela una orden que aún no fue entregada."""
        return self._c.request("POST", f"/orders/{urllib.parse.quote(id_or_tracking_code)}/cancel")


class _Webhooks:
    def __init__(self, client: FalconextLogistica):
        self._c = client

    def create(self, url: str, events: list[str]) -> dict:
        """Registra un endpoint para recibir eventos ``order.*``. Devuelve el ``secret``."""
        return self._c.request("POST", "/webhook_endpoints", body={"url": url, "events": events})


def verify_webhook_signature(
    raw_body: str | bytes,
    signature_header: Optional[str],
    secret: str,
    tolerance_seconds: int = 300,
) -> bool:
    """Verifica la firma HMAC de un webhook entrante (header ``Falconext-Signature``).

    ``raw_body`` debe ser el cuerpo CRUDO tal como llegó (no re-serializado).
    """
    if not signature_header or not secret:
        return False
    parts = dict(
        p.split("=", 1) for p in signature_header.split(",") if "=" in p
    )
    t = parts.get("t")
    v1 = parts.get("v1")
    if not t or not v1:
        return False
    if tolerance_seconds > 0:
        try:
            if abs(time.time() - int(t)) > tolerance_seconds:
                return False
        except ValueError:
            return False
    body_bytes = raw_body.encode("utf-8") if isinstance(raw_body, str) else raw_body
    signed = f"{t}.".encode("utf-8") + body_bytes
    expected = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, v1)
