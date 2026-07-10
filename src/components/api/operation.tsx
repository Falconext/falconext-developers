import { FlaskConical } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { CodeGroup } from "@/components/ui/code-group";
import { CodeBlock } from "@/components/ui/code-block";
import { SchemaTable } from "./schema-table";
import { Playground } from "./playground";
import { deref, schemaToExample } from "@/lib/openapi/loader";
import { operationSamples } from "@/lib/openapi/samples";
import { buildOperationPlayground, type PlaygroundMeta } from "@/lib/openapi/playground";
import type { NormalizedOperation, OpenApiDocument } from "@/lib/openapi/types";

function statusTone(code: string) {
  if (code.startsWith("2")) return "text-emerald-400";
  if (code.startsWith("4")) return "text-amber-signal";
  if (code.startsWith("5")) return "text-rose-400";
  return "text-muted";
}

export async function ApiOperation({
  doc,
  op,
  meta,
}: {
  doc: OpenApiDocument;
  op: NormalizedOperation;
  /** Contexto producto/versión para el playground (de la página de operación). */
  meta?: PlaygroundMeta;
}) {
  const { operation } = op;
  const samples = operationSamples(doc, op);
  const playground = buildOperationPlayground(doc, op, meta);
  const reqSchema = operation.requestBody?.content?.["application/json"]?.schema;
  const params = operation.parameters ?? [];
  const pathParams = params.filter((p) => p.in === "path");
  const queryParams = params.filter((p) => p.in === "query");

  // Ejemplo de respuesta 2xx
  const okCode = Object.keys(operation.responses ?? {}).find((c) => c.startsWith("2"));
  const okSchema = okCode ? operation.responses?.[okCode]?.content?.["application/json"]?.schema : undefined;
  const responseExample = okSchema ? JSON.stringify(schemaToExample(doc, okSchema), null, 2) : null;

  return (
    <section className="border-t border-app py-12 first:border-t-0">
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)]">
        {/* Documentación */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <MethodBadge method={op.method} />
            <code className="break-all font-mono text-[0.85rem] text-fg">{op.path}</code>
          </div>
          <h3 id={op.slug} className="scroll-mt-24 font-display text-[1.35rem] font-semibold text-fg">
            {operation.summary}
          </h3>
          {operation.description && (
            <p className="mt-2 leading-relaxed text-muted">{operation.description}</p>
          )}

          {pathParams.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Parámetros de ruta</p>
              <ParamList doc={doc} params={pathParams} />
            </div>
          )}
          {queryParams.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Parámetros de consulta</p>
              <ParamList doc={doc} params={queryParams} />
            </div>
          )}
          {reqSchema && (
            <div className="mt-6">
              <SchemaTable doc={doc} schema={reqSchema} title="Cuerpo de la solicitud" />
            </div>
          )}

          <div className="mt-6">
            <p className="eyebrow mb-2">Respuestas</p>
            <ul className="space-y-1.5">
              {Object.entries(operation.responses ?? {}).map(([code, res]) => (
                <li key={code} className="flex items-baseline gap-3 text-sm">
                  <code className={`font-mono font-semibold ${statusTone(code)}`}>{code}</code>
                  <span className="text-muted">{res.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panel de código */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <CodeGroup snippets={samples} title={`${op.method.toUpperCase()} ${op.path}`} />
          {responseExample && (
            <CodeBlock code={responseExample} lang="json" filename={`Respuesta · ${okCode}`} />
          )}
        </div>
      </div>

      {/* Playground: consciente de producto/versión, request derivada de la spec */}
      <div className="mt-10 rounded-card border border-app bg-surface/40 p-5 sm:p-6">
        <div className="mb-4 inline-flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-signal" />
          <span className="eyebrow">Pruébalo</span>
        </div>
        <Playground data={playground} />
      </div>
    </section>
  );
}

function ParamList({
  doc,
  params,
}: {
  doc: OpenApiDocument;
  params: NonNullable<NormalizedOperation["operation"]["parameters"]>;
}) {
  return (
    <div className="rounded-card border border-app">
      {params.map((p, i) => {
        const s = deref(doc, p.schema) ?? p.schema;
        return (
          <div key={p.name} className={i > 0 ? "border-t border-app px-4 py-3" : "px-4 py-3"}>
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="font-mono text-[0.8rem] font-medium text-fg">{p.name}</code>
              <span className="font-mono text-[0.7rem] text-violet-400">{s?.type ?? "string"}</span>
              {p.required && (
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-amber-signal">requerido</span>
              )}
            </div>
            {p.description && <p className="mt-1 text-[0.82rem] text-muted">{p.description}</p>}
          </div>
        );
      })}
    </div>
  );
}
