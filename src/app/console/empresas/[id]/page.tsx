import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mypeApi } from "@/lib/mype-api";
import { CodeBlock } from "@/components/ui/code-block";
import { ESTADO } from "../estado";
import type { Empresa } from "../actions";

export const metadata = { title: "Empresa — Consola" };
export const dynamic = "force-dynamic";

export default async function EmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let e: Empresa | null = null;
  let error: string | null = null;
  try {
    e = await mypeApi<Empresa>(`/facturacion/consola/empresas/${encodeURIComponent(id)}`);
  } catch (err: any) {
    error = err?.message ?? "No se pudo cargar la empresa.";
  }
  if (!e) {
    return <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">{error}</div>;
  }
  const estado = ESTADO[e.status];
  const ejemplo = `curl -X POST https://api.krezka.com/api/v1/invoicing/invoices \\
  -H "Authorization: Bearer sk_test_…" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "issuer_id": "${e.id}",
    "document_type": "receipt",
    "customer": { "document_type": "dni", "document_number": "12345678", "name": "Ana Pérez" },
    "items": [{ "description": "Producto", "quantity": 1, "unit_value": 50 }]
  }'`;

  return (
    <>
      <Link href="/console/empresas" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Mis empresas
      </Link>
      <header className="mb-6">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${estado?.clase ?? ""}`}>{estado?.texto ?? e.status}</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">{e.trade_name || e.legal_name}</h1>
        <p className="mt-1 text-sm text-muted">{e.legal_name} · RUC {e.ruc}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-app bg-surface p-5">
          <h2 className="text-sm font-semibold text-fg">Datos</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-xs text-subtle">issuer_id (úsalo en la API)</dt><dd className="font-mono text-fg">{e.id}</dd></div>
            <div><dt className="text-xs text-subtle">Dirección fiscal</dt><dd className="text-fg">{e.address || "—"}</dd></div>
            <div><dt className="text-xs text-subtle">Ambiente</dt><dd className="text-fg">{e.environment === "test" ? "Pruebas (SUNAT beta)" : "Producción"}</dd></div>
          </dl>
        </section>
        <section className="rounded-xl border border-app bg-surface p-5">
          <h2 className="text-sm font-semibold text-fg">Estado</h2>
          <p className="mt-3 text-sm text-muted">{estado?.detalle}</p>
          {e.status === "pending_setup" && (
            <p className="mt-3 text-sm text-muted">
              <strong className="text-fg">Pasar a producción:</strong> muy pronto lo harás desde aquí en un par de pasos. Mientras
              tanto, escríbenos y lo activamos:{" "}
              <a className="font-medium text-violet-400 hover:text-violet-300" href="https://wa.me/51955184284" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              .
            </p>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-fg">Tu primera boleta de prueba</h2>
        <p className="mb-3 text-sm text-muted">
          Crea una clave de prueba en <Link href="/console/api-keys" className="text-violet-400 hover:text-violet-300">Claves</Link> y
          prueba esto. Con <code className="font-mono text-xs">sk_test_</code> la respuesta trae el total, el IGV y el número que le tocaría, sin emitir nada.
        </p>
        <CodeBlock code={ejemplo} lang="bash" />
      </section>
    </>
  );
}
