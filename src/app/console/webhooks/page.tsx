import { mypeApi } from "@/lib/mype-api";
import { deleteWebhookEndpoint } from "./actions";
import { CreateWebhookDialog } from "./create-webhook-dialog";
import { Webhook } from "lucide-react";

export const metadata = { title: "Webhooks — Consola" };
export const dynamic = "force-dynamic";

type Endpoint = {
  endpointId: string;
  url: string;
  events: string[];
  activo: boolean;
  ultimoEnvioEn: string | null;
  creadoEn: string;
};

export default async function WebhooksPage() {
  let endpoints: Endpoint[] = [];
  let loadError: string | null = null;

  try {
    endpoints = await mypeApi<Endpoint[]>("/logistica/webhooks");
  } catch (err: any) {
    loadError = err?.message ?? "No se pudieron cargar los endpoints";
  }

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Eventos en tiempo real</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">Webhooks</h1>
          <p className="mt-2 text-sm text-muted">
            Registra URLs que recibirán eventos del ciclo de vida de tus entregas. Cada
            envío incluye una firma HMAC en{" "}
            <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs">
              X-Falconext-Signature
            </code>{" "}
            que debes validar con el secret devuelto al crear el endpoint.
          </p>
        </div>
        <CreateWebhookDialog />
      </header>

      {loadError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
          {loadError}
        </div>
      ) : endpoints.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-app bg-surface p-12 text-center">
          <Webhook className="mb-3 h-8 w-8 text-subtle" />
          <p className="text-sm font-medium text-fg">Aún no tienes endpoints registrados</p>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Registra tu primer endpoint para recibir eventos cuando cambie el estado de tus
            entregas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {endpoints.map((ep) => (
            <div
              key={ep.endpointId}
              className="rounded-xl border border-app bg-surface p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate font-mono text-sm text-fg">{ep.url}</p>
                <form
                  action={async () => {
                    "use server";
                    await deleteWebhookEndpoint(ep.endpointId);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-medium text-rose-400 hover:text-rose-300"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ep.events.map((ev) => (
                  <span
                    key={ev}
                    className="rounded-full border border-app bg-subtle px-2 py-0.5 font-mono text-[0.7rem] text-muted"
                  >
                    {ev}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-3 text-[0.7rem] text-subtle">
                <span>
                  <span className="font-mono">{ep.endpointId}</span>
                </span>
                <span>·</span>
                <span>
                  {ep.ultimoEnvioEn
                    ? `Último envío ${new Date(ep.ultimoEnvioEn).toLocaleString("es-PE")}`
                    : "Sin envíos aún"}
                </span>
                <span>·</span>
                <span>Creado {new Date(ep.creadoEn).toLocaleDateString("es-PE")}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
