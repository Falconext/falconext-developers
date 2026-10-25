"use client";

import { useState, useTransition } from "react";
import { CreditCard } from "lucide-react";
import { pagarCobro } from "./actions";

export type Cobro = {
  id: number;
  period: string;
  description?: string;
  amount: number;
  status: "paid" | "pending";
  due_date: string;
  overdue: boolean;
  paid_at?: string;
  payment_method?: string;
  invoice_number?: string;
};

const soles = (n: number) => `S/ ${Number(n || 0).toFixed(2)}`;
const fecha = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("es-PE", { timeZone: "America/Lima", dateStyle: "medium" });

function BotonPagar({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const pagar = () => {
    setError(null);
    startTransition(async () => {
      const r = await pagarCobro(id);
      if (!r.ok) return setError(r.error);
      window.location.href = r.url;
    });
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={pagar}
        disabled={pendiente}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {pendiente ? "Abriendo…" : "Pagar"}
      </button>
      {error && <p className="max-w-[16rem] text-right text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function Pagos({ cobros, enLinea, datosCompletos }: { cobros: Cobro[]; enLinea: boolean; datosCompletos: boolean }) {
  if (cobros.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-app p-6 text-sm text-muted">
        Todavía no tienes cobros. El día 2 de cada mes cerramos el mes anterior y, si hubo comprobantes aceptados, aquí aparece lo que
        toca pagar.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-app bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-subtle text-xs uppercase tracking-wider text-subtle">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Mes</th>
            <th className="px-5 py-3 text-right font-medium">Total (con IGV)</th>
            <th className="px-5 py-3 text-left font-medium">Estado</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {cobros.map((c) => (
            <tr key={c.id} className="border-t border-app">
              <td className="px-5 py-3 text-fg">
                {c.period}
                {c.description && <p className="text-xs text-subtle">{c.description.replace(/^API de facturación \S+ — /, "")}</p>}
              </td>
              <td className="px-5 py-3 text-right font-medium text-fg">{soles(c.amount)}</td>
              <td className="px-5 py-3">
                {c.status === "paid" ? (
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-300">
                    Pagado{c.paid_at ? ` · ${fecha(c.paid_at)}` : ""}
                  </span>
                ) : c.overdue ? (
                  <span className="inline-flex rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.7rem] font-medium text-rose-300">
                    Vencido · emisión pausada
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-signal/15 px-2 py-0.5 text-[0.7rem] font-medium text-amber-signal">
                    Por pagar · vence {fecha(c.due_date)}
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-right">
                {c.status === "paid" && c.invoice_number && (
                  <a href={`/console/consumo/factura/${c.id}`} className="text-sm font-medium text-violet-400 hover:text-violet-300">
                    {c.invoice_number.startsWith("F") ? "Factura" : "Boleta"} {c.invoice_number}
                  </a>
                )}
                {c.status === "pending" && !datosCompletos && (
                  <span className="text-xs text-subtle">Completa tus datos de facturación para pagar</span>
                )}
                {c.status === "pending" &&
                  datosCompletos &&
                  (enLinea ? (
                    <BotonPagar id={c.id} />
                  ) : (
                    <a
                      href="https://wa.me/51955184284"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-violet-400 hover:text-violet-300"
                    >
                      Pagar por WhatsApp
                    </a>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
