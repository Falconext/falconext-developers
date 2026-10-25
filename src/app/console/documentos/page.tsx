import Link from "next/link";
import { mypeApi } from "@/lib/mype-api";
import type { Empresa } from "../empresas/actions";
import { ESTADO_DOC, dinero, tipoDoc, type Documento } from "./model";

export const metadata = { title: "Documentos — Consola" };
export const dynamic = "force-dynamic";

type Lista = { data: Documento[]; has_more: boolean; next_cursor: string | null };

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ issuer?: string; cursor?: string }> }) {
  const { issuer, cursor } = await searchParams;
  let empresas: Empresa[] = [];
  let lista: Lista = { data: [], has_more: false, next_cursor: null };
  let error: string | null = null;
  try {
    empresas = (await mypeApi<{ data: Empresa[] }>("/facturacion/consola/empresas")).data ?? [];
    const q = new URLSearchParams();
    if (issuer) q.set("issuer_id", issuer);
    if (cursor) q.set("cursor", cursor);
    lista = await mypeApi<Lista>(`/facturacion/consola/documentos?${q}`);
  } catch (e: any) {
    error = e?.message ?? "No se pudieron cargar los documentos.";
  }
  const nombre = (id: string) => {
    const e = empresas.find((x) => x.id === id);
    return e ? e.trade_name || e.legal_name : id;
  };
  const enlace = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ issuer, ...extra })) if (v) q.set(k, v);
    const s = q.toString();
    return `/console/documentos${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-subtle">Facturación</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-fg">Documentos</h1>
          <p className="mt-1 text-sm text-muted">Las facturas y boletas emitidas, por la API o desde aquí.</p>
        </div>
        <Link
          href={issuer ? `/console/probar?issuer=${encodeURIComponent(issuer)}` : "/console/probar"}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Nuevo comprobante
        </Link>
      </header>

      {empresas.length > 1 && (
        <form className="mb-4 flex flex-wrap items-center gap-2" action="/console/documentos">
          <select
            name="issuer"
            defaultValue={issuer ?? ""}
            className="rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50"
          >
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.trade_name || e.legal_name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg border border-app px-3 py-2 text-sm text-muted hover:text-fg">
            Filtrar
          </button>
        </form>
      )}

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">{error}</div>
      ) : lista.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-app p-8 text-center text-sm text-muted">
          {cursor ? "No hay más documentos." : "Todavía no hay comprobantes emitidos. Los de prueba (sk_test_) no se guardan, así que no aparecen aquí."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-app bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-app text-left text-xs text-subtle">
                <th className="px-4 py-2.5 font-normal">Número</th>
                <th className="px-4 py-2.5 font-normal">Cliente</th>
                <th className="px-4 py-2.5 font-normal">Fecha</th>
                <th className="px-4 py-2.5 text-right font-normal">Total</th>
                <th className="px-4 py-2.5 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.data.map((d) => {
                const est = ESTADO_DOC[d.status];
                return (
                  <tr key={d.id} className="border-b border-app/60 last:border-0 hover:bg-app/40">
                    <td className="px-4 py-2.5">
                      <Link href={`/console/documentos/${d.id}`} className="font-mono text-fg hover:text-violet-300">
                        {d.full_number}
                      </Link>
                      <p className="text-xs text-subtle">
                        {tipoDoc(d.document_type)}
                        {empresas.length > 1 ? ` · ${nombre(d.issuer_id)}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-fg">
                      {d.customer?.name}
                      <p className="text-xs text-subtle">{d.customer?.document_number}</p>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{d.issue_date}</td>
                    <td className="px-4 py-2.5 text-right text-fg">{dinero(d.totals?.total, d.currency)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${est?.clase ?? ""}`}>{est?.texto ?? d.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex gap-3 text-sm">
        {cursor && (
          <Link href={enlace({})} className="text-violet-400 hover:text-violet-300">
            ← Más recientes
          </Link>
        )}
        {lista.has_more && lista.next_cursor && (
          <Link href={enlace({ cursor: lista.next_cursor })} className="text-violet-400 hover:text-violet-300">
            Anteriores →
          </Link>
        )}
      </div>
    </>
  );
}
