import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { mypeApi } from "@/lib/mype-api";
import { ESTADO_DOC, dinero, tipoDoc, type Documento } from "../model";
import { Anular } from "./anular";

export const metadata = { title: "Documento — Consola" };
export const dynamic = "force-dynamic";

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d: Documento | null = null;
  let error: string | null = null;
  try {
    d = await mypeApi<Documento>(`/facturacion/consola/documentos/${encodeURIComponent(id)}`);
  } catch (e: any) {
    error = e?.message ?? "No se pudo cargar el documento.";
  }
  if (!d) {
    return <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">{error}</div>;
  }
  const est = ESTADO_DOC[d.status];
  const base = `/console/documentos/${encodeURIComponent(d.id)}/descargar`;
  const descargas = [
    { href: `${base}/pdf?format=a4`, texto: "PDF A4", hay: true },
    { href: `${base}/pdf?format=ticket`, texto: "PDF ticket", hay: true },
    { href: `${base}/xml`, texto: "XML", hay: !!d.files?.xml },
    { href: `${base}/cdr`, texto: "CDR", hay: !!d.files?.cdr },
  ];
  const anulable = d.status === "accepted" || d.status === "observed";

  return (
    <>
      <Link href="/console/documentos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Documentos
      </Link>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${est?.clase ?? ""}`}>{est?.texto ?? d.status}</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
            {tipoDoc(d.document_type)} {d.full_number}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {d.issue_date} · <span className="font-mono text-xs">{d.id}</span>
          </p>
        </div>
        <p className="whitespace-nowrap font-display text-3xl font-semibold text-fg">{dinero(d.totals?.total, d.currency)}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-app bg-surface p-5 lg:col-span-2">
          <p className="text-sm text-fg">
            {d.customer?.name}{" "}
            <span className="text-muted">
              · {String(d.customer?.document_type ?? "").toUpperCase()} {d.customer?.document_number}
            </span>
          </p>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-app text-left text-xs text-subtle">
                  <th className="py-1.5 font-normal">Descripción</th>
                  <th className="py-1.5 text-right font-normal">Cant.</th>
                  <th className="py-1.5 text-right font-normal">Valor unit.</th>
                  <th className="py-1.5 text-right font-normal">IGV</th>
                </tr>
              </thead>
              <tbody>
                {d.items.map((it, i) => (
                  <tr key={i} className="border-b border-app/60">
                    <td className="py-1.5 text-fg">{it.description}</td>
                    <td className="py-1.5 text-right text-muted">{it.quantity}</td>
                    <td className="py-1.5 text-right text-muted">{dinero(it.unit_value, d.currency)}</td>
                    <td className="py-1.5 text-right text-muted">{dinero(it.tax, d.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="ml-auto mt-3 w-full max-w-xs space-y-1 text-sm">
            {(
              [
                ["Gravado", d.totals.taxable],
                ["Exonerado", d.totals.exempt],
                ["Inafecto", d.totals.unaffected],
                ["Descuento", d.totals.discount],
                ["IGV", d.totals.tax],
              ] as const
            )
              .filter(([, v]) => Number(v) > 0)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between text-muted">
                  <dt>{k}</dt>
                  <dd>{dinero(v, d.currency)}</dd>
                </div>
              ))}
            <div className="flex justify-between border-t border-app pt-1 font-semibold text-fg">
              <dt>Total</dt>
              <dd>{dinero(d.totals.total, d.currency)}</dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-app bg-surface p-5">
            <h2 className="text-sm font-semibold text-fg">SUNAT</h2>
            <p className="mt-2 text-sm text-muted">
              {d.sunat?.response_message || (d.status === "pending" || d.status === "sent" ? "Esperando la respuesta de SUNAT." : "Sin mensaje.")}
            </p>
            {d.sunat?.response_code && <p className="mt-1 font-mono text-xs text-subtle">Código {d.sunat.response_code}</p>}
          </section>
          <section className="rounded-xl border border-app bg-surface p-5">
            <h2 className="text-sm font-semibold text-fg">Archivos</h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {descargas.map((a) => (
                <li key={a.texto}>
                  {a.hay ? (
                    <a href={a.href} className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300">
                      <Download className="h-4 w-4" /> {a.texto}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-subtle">
                      <Download className="h-4 w-4" /> {a.texto} (todavía no)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
          {anulable && (
            <section className="rounded-xl border border-app bg-surface p-5">
              <h2 className="mb-2 text-sm font-semibold text-fg">¿Te equivocaste?</h2>
              <Anular id={d.id} numero={d.full_number} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
