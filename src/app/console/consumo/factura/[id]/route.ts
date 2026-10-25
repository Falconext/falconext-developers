import { auth } from "@/auth";

const API = process.env.MYPE_API_URL ?? "http://localhost:4001/api";

/** El PDF del comprobante que Krezka emitió por un pago (pasa con el JWT de la sesión). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("No existe.", { status: 404 });
  const session = await auth();
  if (!session?.accessToken) return new Response("Ingresa a la consola.", { status: 401 });
  const res = await fetch(`${API}/facturacion/consola/cobros/${id}/factura`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    return new Response(cuerpo?.message ?? "No se pudo descargar.", {
      status: res.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const headers = new Headers();
  for (const h of ["content-type", "content-disposition", "content-length"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(res.body, { status: 200, headers });
}
