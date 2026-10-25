import { mypeApi } from "@/lib/mype-api";
import { Pagos, type Cobro } from "./pagos";

export const metadata = { title: "Consumo — Consola" };
export const dynamic = "force-dynamic";

type Consumo = {
  period: string;
  status: "open" | "closed";
  billable_count: number;
  subtotal: number;
  tax: number;
  total: number;
  by_issuer: { issuer_id: string; name: string; ruc: string; count: number; charge: number }[];
};

const soles = (n: number) => `S/ ${Number(n || 0).toFixed(2)}`;

type Cobros = { online_payment: boolean; data: Cobro[] };

export default async function ConsumoPage({
  searchParams,
}: {
  searchParams: Promise<{ cobro?: string; payment_id?: string; collection_id?: string; status?: string }>;
}) {
  const q = await searchParams;
  let c: Consumo | null = null;
  let error: string | null = null;
  try {
    c = await mypeApi<Consumo>("/facturacion/consola/consumo");
  } catch (e: any) {
    error = e?.message ?? "No se pudo cargar el consumo.";
  }

  // Vuelta de Mercado Pago: se confirma el pago acá mismo, sin esperar el
  // aviso de Mercado Pago, para que la tabla ya diga "Pagado".
  let retorno: "paid" | "pending" | "failed" | null = null;
  const cobroId = Number(q.cobro);
  if (Number.isInteger(cobroId) && cobroId > 0) {
    try {
      const r = await mypeApi<{ status: "paid" | "pending" }>(`/facturacion/consola/cobros/${cobroId}/verificar`, {
        method: "POST",
        body: JSON.stringify({ payment_id: q.payment_id || q.collection_id || undefined }),
      });
      retorno = r.status === "paid" ? "paid" : q.status === "rejected" || q.status === "null" ? "failed" : "pending";
    } catch {
      retorno = "pending";
    }
  }

  let cobros: Cobros = { online_payment: false, data: [] };
  try {
    cobros = await mypeApi<Cobros>("/facturacion/consola/cobros");
  } catch {
    // Sin la lista de cobros la página sigue sirviendo para ver el consumo.
  }

  return (
    <>
      <header className="mb-6">
        <p className="eyebrow mb-1">Facturación</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">Consumo y precios</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pagas por empresa y por mes, solo por los comprobantes que SUNAT acepta. Las pruebas no cuentan.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Hasta 20 comprobantes", "S/ 0.05 c/u"],
          ["De 21 a 100", "S/ 5.00 al mes"],
          ["Más de 100", "S/ 5.00 + S/ 0.05 c/u extra"],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl border border-app bg-surface p-4">
            <p className="text-xs text-subtle">{a}</p>
            <p className="mt-1 font-display text-lg font-semibold text-fg">{b}</p>
          </div>
        ))}
      </div>
      <p className="-mt-3 mb-6 text-xs text-subtle">Precios por empresa (RUC), más IGV.</p>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">{error}</div>
      ) : c ? (
        <div className="overflow-hidden rounded-xl border border-app bg-surface">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-app px-5 py-4">
            <p className="text-sm text-muted">
              Mes <span className="font-medium text-fg">{c.period}</span> · {c.status === "open" ? "en curso" : "cerrado"}
            </p>
            <p className="text-sm text-muted">
              {c.billable_count} comprobantes · <span className="font-semibold text-fg">{soles(c.total)}</span> con IGV
            </p>
          </div>
          {c.by_issuer.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Este mes todavía no hay comprobantes aceptados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-subtle text-xs uppercase tracking-wider text-subtle">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Empresa</th>
                  <th className="px-5 py-3 text-right font-medium">Comprobantes</th>
                  <th className="px-5 py-3 text-right font-medium">Cargo (sin IGV)</th>
                </tr>
              </thead>
              <tbody>
                {c.by_issuer.map((e) => (
                  <tr key={e.issuer_id} className="border-t border-app">
                    <td className="px-5 py-3 text-fg">{e.name} <span className="text-xs text-subtle">· {e.ruc}</span></td>
                    <td className="px-5 py-3 text-right text-fg">{e.count}</td>
                    <td className="px-5 py-3 text-right text-fg">{soles(e.charge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-1 font-display text-xl font-semibold text-fg">Pagos</h2>
        <p className="mb-4 text-sm text-muted">
          Cerramos cada mes el día 2 y tienes 15 días para pagarlo. Te avisamos por correo.
        </p>
        {retorno === "paid" && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">¡Listo! Recibimos tu pago.</div>
        )}
        {retorno === "pending" && (
          <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
            Mercado Pago todavía no confirma el pago. Si pagaste en efectivo o por transferencia puede tardar: vuelve a esta página en unos
            minutos y lo verás como pagado.
          </div>
        )}
        {retorno === "failed" && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            El pago no se completó. Puedes intentarlo de nuevo.
          </div>
        )}
        <Pagos cobros={cobros.data} enLinea={cobros.online_payment} />
      </section>
    </>
  );
}
