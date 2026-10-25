"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { agregarEmpresa } from "./actions";

export function AgregarEmpresa() {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const router = useRouter();

  const enviar = (fd: FormData) => {
    const ruc = String(fd.get("ruc") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const r = await agregarEmpresa(ruc);
      if (!r.ok) return setError(r.error);
      setAbierto(false);
      router.push(`/console/empresas/${r.empresa.id}`);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Agregar empresa
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !pendiente && setAbierto(false)}>
          <div className="w-full max-w-md rounded-2xl border border-app bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-fg">Agregar empresa</h2>
                <p className="mt-1 text-sm text-muted">
                  Escribe el RUC: traemos la razón social y la dirección de SUNAT. La empresa empieza en prueba.
                </p>
              </div>
              <button type="button" onClick={() => setAbierto(false)} className="text-subtle hover:text-fg" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={enviar} className="flex flex-col gap-3">
              <input
                name="ruc"
                inputMode="numeric"
                pattern="\d{11}"
                maxLength={11}
                required
                autoFocus
                autoComplete="off"
                placeholder="RUC de 11 dígitos"
                className="rounded-lg border border-app bg-app px-3 py-2.5 font-mono text-sm text-fg outline-none focus:border-violet-500/50"
              />
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={pendiente}
                className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
              >
                {pendiente ? "Consultando SUNAT…" : "Agregar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
