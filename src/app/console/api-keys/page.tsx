import { mypeApi } from "@/lib/mype-api";
import { revokeApiKey } from "./actions";
import { CreateKeyDialog } from "./create-key-dialog";
import { KeyRound } from "lucide-react";

export const metadata = { title: "API keys — Consola" };
export const dynamic = "force-dynamic";

type ApiKey = {
  id: number;
  nombre: string | null;
  entorno: "live" | "test";
  prefijo: string;
  ultimosCuatro: string;
  activo: boolean;
  ultimoUsoEn: string | null;
  creadoEn: string;
};

export default async function ApiKeysPage() {
  let keys: ApiKey[] = [];
  let loadError: string | null = null;

  try {
    keys = await mypeApi<ApiKey[]>("/logistica/api-keys");
  } catch (err: any) {
    loadError = err?.message ?? "No se pudieron cargar las API keys";
  }

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Autenticación</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">API keys</h1>
          <p className="mt-2 text-sm text-muted">
            Genera claves para autenticar tus llamadas a la API de Falconext Logística.
            Usa <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs">sk_test_…</code>{" "}
            para desarrollo y{" "}
            <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs">sk_live_…</code>{" "}
            para producción.
          </p>
        </div>
        <CreateKeyDialog />
      </header>

      {loadError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
          {loadError}
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-app bg-surface p-12 text-center">
          <KeyRound className="mb-3 h-8 w-8 text-subtle" />
          <p className="text-sm font-medium text-fg">Aún no tienes API keys</p>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Crea tu primera clave para empezar a integrar. La clave completa se muestra una
            sola vez al generarla.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-app bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-subtle text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Clave</th>
                <th className="px-4 py-3 text-left font-medium">Entorno</th>
                <th className="px-4 py-3 text-left font-medium">Último uso</th>
                <th className="px-4 py-3 text-left font-medium">Creada</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-app text-fg">
                  <td className="px-4 py-3">{k.nombre ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {k.prefijo}…{k.ultimosCuatro}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
                        k.entorno === "live"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-signal/15 text-amber-signal"
                      }`}
                    >
                      {k.entorno}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {k.ultimoUsoEn ? new Date(k.ultimoUsoEn).toLocaleString("es-PE") : "Nunca"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(k.creadoEn).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await revokeApiKey(k.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs font-medium text-rose-400 hover:text-rose-300"
                      >
                        Revocar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
