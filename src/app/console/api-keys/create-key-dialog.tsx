"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { createApiKey } from "./actions";

type Created = {
  apiKey: string;
  nombre: string | null;
  entorno: string;
  prefijo: string;
  ultimosCuatro: string;
};

export function CreateKeyDialog() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    const nombre = String(formData.get("nombre") ?? "").trim() || undefined;
    const entorno = (formData.get("entorno") as "live" | "test") ?? "test";
    setError(null);
    startTransition(async () => {
      try {
        const key = await createApiKey({ nombre, entorno });
        setCreated(key);
      } catch (err: any) {
        setError(err?.message ?? "No se pudo crear la clave");
      }
    });
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const close = () => {
    setOpen(false);
    setCreated(null);
    setError(null);
    setCopied(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Nueva API key
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-app bg-elevated shadow-2xl">
            <div className="flex items-center justify-between border-b border-app px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                <KeyRound className="h-4 w-4 text-violet-400" />
                {created ? "Copia tu API key" : "Nueva API key"}
              </h3>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-subtle hover:bg-subtle hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!created ? (
              <form action={onSubmit} className="flex flex-col gap-4 p-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-subtle">
                    Nombre (opcional)
                  </span>
                  <input
                    name="nombre"
                    placeholder="Ej: Integración producción"
                    className="rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-subtle">
                    Entorno
                  </span>
                  <select
                    name="entorno"
                    defaultValue="test"
                    className="rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50"
                  >
                    <option value="test">Test (sk_test_…)</option>
                    <option value="live">Live (sk_live_…)</option>
                  </select>
                </label>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                  >
                    {pending ? "Generando…" : "Generar"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3 p-5">
                <div className="rounded-lg border border-amber-signal/30 bg-amber-signal/10 px-3 py-2 text-xs text-amber-signal">
                  Guarda esta clave ahora. No podrás verla de nuevo.
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-app bg-app p-3 font-mono text-xs text-fg">
                  <code className="min-w-0 flex-1 truncate">{created.apiKey}</code>
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-muted hover:bg-subtle hover:text-fg"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="mt-1 self-end rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
