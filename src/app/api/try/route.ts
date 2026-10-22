/**
 * Proxy server-side del sandbox "try-it".
 *
 * El navegador no puede llamar a la API directamente (CORS). El playground POSTea
 * aquí `{ method, url, headers, body }` y este handler reenvía la request desde el
 * servidor (sin CORS) y devuelve `{ status, statusText, body }`.
 *
 * Seguridad: solo reenvía a hosts de Falconext (allowlist → evita open-proxy/SSRF)
 * y solo propaga headers seguros (auth + content-type + x-*).
 *
 * Gateway: el contrato publicita `api.falconext.com/v1` (URL de marca, aún sin
 * gateway público). Mientras no exista, este proxy hace de gateway y mapea esa
 * URL "limpia" al backend real. Cuando el gateway público exista, quita el mapeo.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hosts a los que se permite reenviar. */
const ALLOWED_HOSTS = new Set([
  "api.falconext.com",
  "sandbox.api.falconext.com",
  "api.falconext.pe",
  "api.krezka.com",
]);

/** Backend real que resuelve el contrato "limpio" `…/v1/{recurso}`. */
const REAL_BASE = "https://api.falconext.pe/api/v1/logistics";

/** Headers que se propagan al upstream (el resto se descarta). */
// idempotency-key: los POST de Facturación y del ERP la exigen; sin ella el
// probador no podía crear nada.
const SAFE_HEADERS = new Set(["authorization", "content-type", "idempotency-key"]);

function resolveTarget(url: URL): URL {
  // El gateway de marca aún no existe: mapear `api(.sandbox).falconext.com/v1/x`
  // → `api.falconext.pe/api/v1/logistics/x`.
  if (url.hostname === "api.falconext.com" || url.hostname === "sandbox.api.falconext.com") {
    const path = url.pathname.replace(/^\/v1/, "");
    return new URL(REAL_BASE + path + url.search);
  }
  return url;
}

export async function POST(req: Request) {
  let payload: { method?: string; url?: string; headers?: Record<string, string>; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const { method = "GET", url, headers = {}, body } = payload ?? {};
  if (typeof url !== "string") {
    return NextResponse.json({ error: "Falta `url`." }, { status: 400 });
  }

  let requested: URL;
  try {
    requested = new URL(url);
  } catch {
    return NextResponse.json({ error: "`url` inválida." }, { status: 400 });
  }
  if (requested.protocol !== "https:" || !ALLOWED_HOSTS.has(requested.hostname)) {
    return NextResponse.json(
      { error: `Host no permitido: ${requested.hostname}. El sandbox solo llama a la API de Falconext.` },
      { status: 400 },
    );
  }

  const target = resolveTarget(requested);
  const hasBody = body != null && method.toUpperCase() !== "GET";
  const fwd: Record<string, string> = { Accept: "application/json" };
  for (const [k, v] of Object.entries(headers)) {
    const lk = k.toLowerCase();
    if (SAFE_HEADERS.has(lk) || lk.startsWith("x-")) fwd[k] = String(v);
  }
  // Si hay body y no vino Content-Type, asumir JSON (si no, el backend no parsea).
  if (hasBody && !Object.keys(fwd).some((k) => k.toLowerCase() === "content-type")) {
    fwd["Content-Type"] = "application/json";
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const upstream = await fetch(target.toString(), {
      method,
      headers: fwd,
      body: hasBody ? String(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await upstream.text();
    return NextResponse.json({
      status: upstream.status,
      statusText: upstream.statusText,
      body: text,
    });
  } catch (e) {
    const msg = e instanceof Error && e.name === "AbortError" ? "Timeout al llamar al API." : `No se pudo alcanzar el API: ${(e as Error)?.message ?? e}`;
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
