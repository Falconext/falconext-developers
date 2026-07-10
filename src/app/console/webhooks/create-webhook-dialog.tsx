"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus, Webhook, X } from "lucide-react";
import { createWebhookEndpoint } from "./actions";

const AVAILABLE_EVENTS = [
  "order.created",
  "order.assigned",
  "order.picked_up",
  "order.in_transit",
  "order.delivered",
  "order.failed",
  "order.returned",
];

type Created = {
  endpointId: string;
  url: string;
  secret: string;
};

export function CreateWebhookDialog() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["order.delivered"]);

  const toggleEvent = (ev: string) => {
    setSelected((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]));
  };

  const onSubmit = (formData: FormData) => {
    const url = String(formData.get("url") ?? "").trim();
    if (!url) return setError("La URL es obligatoria");
    if (selected.length === 0) return setError("Selecciona al menos un evento");
    setError(null);
    startTransition(async () => {
      try {
        const wh = await createWebhookEndpoint({ url, events: selected });
        setCreated(wh);
      } catch (err: any) {
        setError(err?.message ?? "No se pudo crear el webhook");
      }
    });
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const close = () => {
    setOpen(false);
    setCreated(null);
    setError(null);
    setCopied(false);
    setSelected(["order.delivered"]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Nuevo endpoint
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-app bg-elevated shadow-2xl">
            <div className="flex items-center justify-between border-b border-app px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                <Webhook className="h-4 w-4 text-violet-400" />
                {created ? "Copia tu webhook secret" : "Nuevo webhook endpoint"}
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
                    URL del endpoint
                  </span>
                  <input
                    name="url"
                    type="url"
                    required
                    placeholder="https://tu-app.com/webhooks/falconext"
                    className="rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50"
                  />
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-subtle">
                    Eventos
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AVAILABLE_EVENTS.map((ev) => (
                      <label
                        key={ev}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-app bg-app px-2.5 py-2 text-xs text-fg transition-colors hover:bg-subtle"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(ev)}
                          onChange={() => toggleEvent(ev)}
                          className="h-3.5 w-3.5 accent-violet-500"
                        />
                        <code className="font-mono">{ev}</code>
                      </label>
                    ))}
                  </div>
                </div>
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
                    {pending ? "Creando…" : "Crear"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3 p-5">
                <div className="rounded-lg border border-amber-signal/30 bg-amber-signal/10 px-3 py-2 text-xs text-amber-signal">
                  Guarda este secret ahora. Se usa para validar la firma HMAC
                  <code className="mx-1 rounded bg-black/20 px-1 py-0.5 font-mono">
                    X-Falconext-Signature
                  </code>{" "}
                  y no podrás verlo de nuevo.
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-app bg-app p-3 font-mono text-xs text-fg">
                  <code className="min-w-0 flex-1 truncate">{created.secret}</code>
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
