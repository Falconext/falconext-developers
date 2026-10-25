"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, X } from "lucide-react";
import { anularComprobante } from "../actions";

export function Anular({ id, numero }: { id: string; numero: string }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clave] = useState(() => crypto.randomUUID());
  const [pendiente, startTransition] = useTransition();
  const router = useRouter();

  const confirmar = () => {
    setError(null);
    startTransition(async () => {
      const r = await anularComprobante(id, motivo.trim(), clave);
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
      >
        <Ban className="h-4 w-4" /> Anular
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !pendiente && setAbierto(false)}>
          <div className="w-full max-w-md rounded-2xl border border-app bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-fg">Anular {numero}</h2>
                <p className="mt-1 text-sm text-muted">Se informa a SUNAT y no se puede deshacer.</p>
              </div>
              <button type="button" onClick={() => !pendiente && setAbierto(false)} className="text-subtle hover:text-fg" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mb-1 block text-xs text-subtle" htmlFor="motivo">
              Motivo
            </label>
            <input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={100}
              placeholder="Ej.: error en los datos del cliente"
              className="w-full rounded-lg border border-app bg-app px-3 py-2.5 text-sm text-fg outline-none focus:border-violet-500/50"
            />
            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
            <button
              type="button"
              onClick={confirmar}
              disabled={pendiente || motivo.trim().length < 3}
              className="mt-4 w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
            >
              {pendiente ? "Anulando…" : "Sí, anular"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
