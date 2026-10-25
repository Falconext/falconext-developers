import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { mypeApi } from "@/lib/mype-api";
import { AgregarEmpresa } from "./agregar-empresa";
import { ESTADO } from "./estado";
import type { Empresa } from "./actions";

export const metadata = { title: "Mis empresas — Consola" };
export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  let empresas: Empresa[] = [];
  let error: string | null = null;
  try {
    empresas = (await mypeApi<{ data: Empresa[] }>("/facturacion/consola/empresas")).data;
  } catch (e: any) {
    error = e?.message ?? "No se pudieron cargar tus empresas.";
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Facturación</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">Mis empresas</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Cada empresa (RUC) emite sus propias facturas y boletas. Usa su <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs">issuer_id</code> en
            cada llamada a la API.
          </p>
        </div>
        <AgregarEmpresa />
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">{error}</div>
      ) : empresas.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-app bg-surface p-12 text-center">
          <Building2 className="mb-3 h-8 w-8 text-subtle" />
          <p className="text-sm font-medium text-fg">Todavía no tienes empresas</p>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Agrega la primera con su RUC. Empieza en prueba: puedes integrar todo sin emitir nada real.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-app bg-surface">
          {empresas.map((e) => (
            <Link key={e.id} href={`/console/empresas/${e.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-subtle">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${ESTADO[e.status]?.clase ?? ""}`}>
                    {ESTADO[e.status]?.texto ?? e.status}
                  </span>
                  <span className="truncate font-medium text-fg">{e.trade_name || e.legal_name}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  RUC {e.ruc} · <span className="font-mono">{e.id}</span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-subtle" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
