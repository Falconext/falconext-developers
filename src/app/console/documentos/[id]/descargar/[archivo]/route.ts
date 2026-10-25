import { auth } from "@/auth";

const API = process.env.MYPE_API_URL ?? "http://localhost:4001/api";
const ARCHIVOS = new Set(["pdf", "xml", "cdr"]);

/**
 * Las descargas pasan por aquí porque el backend pide el JWT de la sesión,
 * que el navegador no tiene: vive en la cookie cifrada de NextAuth.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; archivo: string }> }) {
  const { id, archivo } = await params;
  if (!ARCHIVOS.has(archivo)) return new Response("No existe.", { status: 404 });
  const session = await auth();
  if (!session?.accessToken) return new Response("Ingresa a la consola.", { status: 401 });

  const formato = new URL(req.url).searchParams.get("format");
  const url = `${API}/facturacion/consola/documentos/${encodeURIComponent(id)}/${archivo}${formato ? `?format=${encodeURIComponent(formato)}` : ""}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    return new Response(cuerpo?.message ?? cuerpo?.error?.message ?? "No se pudo descargar.", {
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
