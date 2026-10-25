"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket, X } from "lucide-react";
import { pasarAProduccion } from "../actions";

/** Lo que la empresa tiene que tener hecho en SUNAT antes del pase. */
const REQUISITOS = [
  {
    id: "emisor",
    texto: "La empresa ya es emisor electrónico en SUNAT (emite facturas o boletas electrónicas, o se afilia ahora).",
  },
  {
    id: "pse",
    texto:
      "En SUNAT SOL, con la Clave SOL de la empresa, autorizó a QPSE como su Proveedor de Servicios Electrónicos (PSE). Es quien firma y envía los comprobantes por Krezka.",
  },
  {
    id: "titular",
    texto: "Soy el representante de esta empresa o tengo su autorización para facturar a su nombre.",
  },
] as const;

export function PasarProduccion({ id, razonSocial, ruc }: { id: string; razonSocial: string; ruc: string }) {
  const [abierto, setAbierto] = useState(false);
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const router = useRouter();
  const listos = REQUISITOS.every((r) => marcados[r.id]);

  const confirmar = () => {
    setError(null);
    startTransition(async () => {
      const r = await pasarAProduccion(id);
      if (!r.ok) return setError(r.error);
      setAbierto(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Rocket className="h-4 w-4" />
        Pasar a producción
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !pendiente && setAbierto(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-app bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-fg">Pasar a producción</h2>
                <p className="mt-1 text-sm text-muted">
                  {razonSocial} · RUC {ruc}
                </p>
              </div>
              <button type="button" onClick={() => !pendiente && setAbierto(false)} className="text-subtle hover:text-fg" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-sm text-muted">Antes de seguir, confirma que esto ya está hecho:</p>
            <ul className="flex flex-col gap-2.5">
              {REQUISITOS.map((r) => (
                <li key={r.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-violet-600"
                      checked={!!marcados[r.id]}
                      onChange={(e) => setMarcados((m) => ({ ...m, [r.id]: e.target.checked }))}
                    />
                    <span>{r.texto}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-amber-signal/30 bg-amber-signal/10 p-3 text-sm text-fg">
              <strong>No se puede deshacer.</strong> Desde ahí, lo que emitas con una clave <code className="font-mono text-xs">sk_live_</code> va a
              SUNAT con valor legal y se cobra según el consumo. Las claves <code className="font-mono text-xs">sk_test_</code> siguen sirviendo para probar.
              SUNAT tarda unas 24 horas en habilitar la empresa: hasta entonces la API responde que está en revisión y no emite.
            </div>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

            <button
              type="button"
              onClick={confirmar}
              disabled={!listos || pendiente}
              className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {pendiente ? "Activando…" : "Sí, pasar a producción"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
