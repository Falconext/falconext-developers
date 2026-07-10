"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Loader2, Eye, EyeOff, KeyRound, Send } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Callout } from "@/components/ui/callout";
import type { PlaygroundAuth, PlaygroundData, PlaygroundEndpoint } from "@/lib/openapi/playground";
import { cn } from "@/lib/utils";

type ResponseState = {
  status: number;
  statusText: string;
  timeMs: number;
  body: string;
  ok: boolean;
} | null;

const KEY_STORAGE = "fx_playground_api_key";
/** Placeholder usado en los snippets copiables: la key real jamás se serializa. */
const KEY_PLACEHOLDER = "$FALCONEXT_API_KEY";

export function Playground({ data }: { data: PlaygroundData }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => defaultServer(data.servers));
  const [selectedId, setSelectedId] = useState(data.endpoints[0]?.id ?? "");
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState>(null);
  const [error, setError] = useState<string | null>(null);
  const [snippet, setSnippet] = useState<"curl" | "node">("curl");

  const single = data.endpoints.length <= 1;

  const endpoint = useMemo(
    () => data.endpoints.find((e) => e.id === selectedId) ?? data.endpoints[0],
    [data.endpoints, selectedId],
  );

  // Persistir la API key en localStorage (solo estado del cliente).
  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) setApiKey(saved);
  }, []);
  useEffect(() => {
    if (apiKey) localStorage.setItem(KEY_STORAGE, apiKey);
  }, [apiKey]);

  // Resetear parámetros y body al cambiar de endpoint.
  useEffect(() => {
    if (!endpoint) return;
    const pv: Record<string, string> = {};
    const qv: Record<string, string> = {};
    for (const p of endpoint.params) {
      if (p.in === "path") pv[p.name] = p.example ?? "";
      else qv[p.name] = "";
    }
    setPathValues(pv);
    setQueryValues(qv);
    setBody(endpoint.bodyExample ?? "");
    setResponse(null);
    setError(null);
  }, [endpoint]);

  const requestUrl = useMemo(
    () => buildUrl(serverUrl, endpoint, pathValues, queryValues),
    [serverUrl, endpoint, pathValues, queryValues],
  );

  const hasBody = Boolean(endpoint && endpoint.method !== "GET" && body.trim());

  // Snippets copiables: usan el PLACEHOLDER, nunca la key real.
  const curl = useMemo(
    () => buildCurl(endpoint, requestUrl, data.auth, hasBody, body),
    [endpoint, requestUrl, data.auth, hasBody, body],
  );
  const node = useMemo(
    () => buildNode(endpoint, requestUrl, data.auth, hasBody, body),
    [endpoint, requestUrl, data.auth, hasBody, body],
  );

  async function send() {
    if (!endpoint) return;
    setLoading(true);
    setResponse(null);
    setError(null);
    const started = performance.now();
    try {
      const headers: Record<string, string> = authHeaders(data.auth, apiKey);
      if (hasBody) headers["Content-Type"] = "application/json";
      // Se envía por un proxy server-side (mismo origen) que reenvía a la API:
      // evita CORS y hace de gateway. La key viaja al proxio del portal, no a un
      // tercero. Nunca se persiste fuera del navegador.
      const res = await fetch("/api/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: endpoint.method,
          url: requestUrl,
          headers,
          body: hasBody ? body : undefined,
        }),
      });
      const proxied = await res.json();
      if (!res.ok || typeof proxied?.status !== "number") {
        setError(
          proxied?.error ??
            "No se pudo ejecutar la solicitud. Copia el cURL o el snippet de Node y ejecútalo desde tu terminal.",
        );
        return;
      }
      let pretty = proxied.body ?? "";
      try {
        pretty = JSON.stringify(JSON.parse(proxied.body), null, 2);
      } catch {
        /* respuesta no-JSON */
      }
      setResponse({
        status: proxied.status,
        statusText: proxied.statusText ?? "",
        timeMs: Math.round(performance.now() - started),
        body: pretty || "(sin cuerpo)",
        ok: proxied.status >= 200 && proxied.status < 300,
      });
    } catch {
      setError(
        "No se pudo ejecutar la solicitud en vivo. El request está bien formado — copia el cURL o el snippet de Node y ejecútalo desde tu terminal o backend.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!endpoint) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Panel de request */}
      <div className="space-y-4">
        {/* Contexto producto/versión */}
        {(data.product || data.version) && (
          <div className="flex flex-wrap items-center gap-2 text-[0.72rem]">
            {data.product && (
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-medium text-violet-300">
                {data.product.name}
              </span>
            )}
            {data.version && (
              <span className="rounded-full border border-app bg-surface px-2.5 py-0.5 font-mono text-subtle">
                {data.version.label}
              </span>
            )}
          </div>
        )}

        {/* API key — solo si la operación requiere auth */}
        {data.auth.type !== "none" && (
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-medium text-muted">
              <KeyRound className="h-3.5 w-3.5" /> API Key
              <span className="font-mono text-[0.68rem] text-subtle">
                · {data.auth.type === "bearer" ? "Authorization: Bearer" : data.auth.headerName}
              </span>
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-app bg-surface px-3 focus-within:border-violet-500/50">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="fx_test_…"
                autoComplete="off"
                spellCheck={false}
                className="h-10 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-subtle"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="text-subtle hover:text-fg"
                aria-label="Mostrar/ocultar API key"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[0.72rem] text-subtle">
              Se guarda solo en tu navegador (localStorage). Nunca se incluye en el código copiable.
            </p>
          </div>
        )}

        {/* Endpoint (multi) + server */}
        <div className={cn("grid gap-3", single ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
          {!single && (
            <div>
              <label className="mb-1.5 block text-[0.78rem] font-medium text-muted">Endpoint</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="h-10 w-full rounded-lg border border-app bg-surface px-3 text-sm text-fg outline-none focus:border-violet-500/50"
              >
                {groupByTag(data.endpoints).map(([tag, eps]) => (
                  <optgroup key={tag} label={tag}>
                    {eps.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.method} {e.path}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-[0.78rem] font-medium text-muted">Entorno</label>
            <select
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="h-10 w-full rounded-lg border border-app bg-surface px-3 text-sm text-fg outline-none focus:border-violet-500/50"
            >
              {data.servers.map((s) => (
                <option key={s.url} value={s.url}>
                  {s.description ? `${s.description} — ${s.url}` : s.url}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* URL preview */}
        <div
          className="flex items-center gap-2 rounded-lg border border-app px-3 py-2"
          style={{ backgroundColor: "var(--bg-code)" }}
        >
          <MethodBadge method={endpoint.method} />
          <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[0.78rem] text-muted">
            {requestUrl}
          </code>
        </div>

        {/* Path & query params */}
        {endpoint.params.length > 0 && (
          <div className="space-y-2">
            <p className="text-[0.78rem] font-medium text-muted">Parámetros</p>
            {endpoint.params.map((p) => (
              <div key={`${p.in}-${p.name}`} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate font-mono text-[0.72rem] text-subtle">
                  {p.name}
                  {p.required && <span className="text-amber-signal">*</span>}
                </span>
                <input
                  value={(p.in === "path" ? pathValues[p.name] : queryValues[p.name]) ?? ""}
                  onChange={(e) =>
                    p.in === "path"
                      ? setPathValues((v) => ({ ...v, [p.name]: e.target.value }))
                      : setQueryValues((v) => ({ ...v, [p.name]: e.target.value }))
                  }
                  placeholder={p.example ?? p.in}
                  className="h-9 flex-1 rounded-md border border-app bg-surface px-2.5 font-mono text-[0.78rem] text-fg outline-none focus:border-violet-500/50"
                />
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        {endpoint.method !== "GET" && endpoint.bodyExample !== null && (
          <div>
            <label className="mb-1.5 block text-[0.78rem] font-medium text-muted">Cuerpo (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              rows={10}
              className="w-full rounded-lg border border-app bg-surface p-3 font-mono text-[0.78rem] leading-relaxed text-fg outline-none focus:border-violet-500/50"
            />
          </div>
        )}

        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>

      {/* Panel de respuesta + código */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-card border border-app" style={{ backgroundColor: "var(--bg-code)" }}>
          <div className="flex items-center justify-between border-b border-app px-4 py-2">
            <div className="flex items-center gap-1">
              {(["curl", "node"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSnippet(k)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[0.72rem] transition-colors",
                    snippet === k ? "bg-violet-500/15 text-violet-300" : "text-muted hover:text-fg",
                  )}
                >
                  {k === "curl" ? "cURL" : "Node"}
                </button>
              ))}
            </div>
            <CopyButton value={snippet === "curl" ? curl : node} />
          </div>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.78rem] leading-relaxed text-muted">
            {snippet === "curl" ? curl : node}
          </pre>
        </div>

        <div className="overflow-hidden rounded-card border border-app" style={{ backgroundColor: "var(--bg-code)" }}>
          <div className="flex items-center justify-between border-b border-app px-4 py-2">
            <span className="font-mono text-[0.72rem] text-muted">Respuesta</span>
            {response && (
              <span className="flex items-center gap-3 font-mono text-[0.72rem]">
                <span className={response.ok ? "text-emerald-400" : "text-amber-signal"}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-subtle">{response.timeMs} ms</span>
              </span>
            )}
          </div>
          <div className="max-h-[28rem] overflow-auto">
            {error ? (
              <div className="p-4">
                <Callout type="note" title="Ejecución en vivo no disponible aún">
                  {error}
                </Callout>
              </div>
            ) : response ? (
              <pre className="px-4 py-3 font-mono text-[0.78rem] leading-relaxed text-muted">{response.body}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-subtle">
                <Send className="h-6 w-6" />
                <p className="text-sm">Envía una solicitud para ver la respuesta</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Helpers puros.
// ------------------------------------------------------------------ //

/** Preselecciona el entorno "Sandbox" si existe; si no, el primero. */
function defaultServer(servers: PlaygroundData["servers"]): string {
  const sandbox = servers.find((s) =>
    `${s.description ?? ""} ${s.url}`.toLowerCase().includes("sandbox"),
  );
  return sandbox?.url ?? servers[0]?.url ?? "";
}

/** Headers de auth para el fetch en vivo (usa la key REAL, solo en runtime cliente). */
function authHeaders(auth: PlaygroundAuth, key: string): Record<string, string> {
  if (!key) return {};
  if (auth.type === "bearer") return { Authorization: `Bearer ${key}` };
  if (auth.type === "apiKey") return { [auth.headerName]: key };
  return {};
}

function buildUrl(
  server: string,
  endpoint: PlaygroundEndpoint | undefined,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>,
): string {
  if (!endpoint) return server;
  const path = endpoint.path.replace(/\{(\w+)\}/g, (_, name) =>
    encodeURIComponent(pathValues[name] || `{${name}}`),
  );
  const qs = Object.entries(queryValues)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${server}${path}${qs ? `?${qs}` : ""}`;
}

function buildCurl(
  endpoint: PlaygroundEndpoint | undefined,
  url: string,
  auth: PlaygroundAuth,
  hasBody: boolean,
  body: string,
): string {
  if (!endpoint) return "";
  const lines = [`curl ${endpoint.method === "GET" ? "" : `-X ${endpoint.method} `}${url} \\`];
  if (auth.type === "bearer") lines.push(`  -H "Authorization: Bearer ${KEY_PLACEHOLDER}"${hasBody ? " \\" : ""}`);
  else if (auth.type === "apiKey") lines.push(`  -H "${auth.headerName}: ${KEY_PLACEHOLDER}"${hasBody ? " \\" : ""}`);
  if (hasBody) {
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${body.replace(/\n/g, "\n  ")}'`);
  }
  // Sin auth y sin body: elimina el backslash colgante.
  if (auth.type === "none" && !hasBody) lines[0] = lines[0].replace(/ \\$/, "");
  return lines.join("\n");
}

function buildNode(
  endpoint: PlaygroundEndpoint | undefined,
  url: string,
  auth: PlaygroundAuth,
  hasBody: boolean,
  body: string,
): string {
  if (!endpoint) return "";
  const headers: string[] = [];
  if (auth.type === "bearer") headers.push(`    "Authorization": \`Bearer \${${KEY_PLACEHOLDER.slice(1)}}\`,`);
  else if (auth.type === "apiKey") headers.push(`    "${auth.headerName}": ${KEY_PLACEHOLDER.slice(1)},`);
  if (hasBody) headers.push(`    "Content-Type": "application/json",`);

  const lines = [`const ${KEY_PLACEHOLDER.slice(1)} = process.env.FALCONEXT_API_KEY;`, ""];
  lines.push(`const res = await fetch("${url}", {`);
  lines.push(`  method: "${endpoint.method}",`);
  if (headers.length) lines.push(`  headers: {`, ...headers, `  },`);
  if (hasBody) lines.push(`  body: JSON.stringify(${body}),`);
  lines.push(`});`, ``, `const data = await res.json();`, `console.log(data);`);
  return lines.join("\n");
}

function groupByTag(endpoints: PlaygroundEndpoint[]): [string, PlaygroundEndpoint[]][] {
  const map = new Map<string, PlaygroundEndpoint[]>();
  for (const e of endpoints) {
    const arr = map.get(e.tag) ?? [];
    arr.push(e);
    map.set(e.tag, arr);
  }
  return [...map.entries()];
}
