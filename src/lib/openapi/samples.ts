import type { OpenApiDocument, NormalizedOperation, OpenApiParameter } from "./types";
import { requestExample } from "./loader";
import { siteConfig } from "@/config/site";

/**
 * Cabeceras obligatorias declaradas en el contrato (`in: header`, `required`),
 * con su `example` como valor. Sin esto, el snippet de `POST /invoices` omitía
 * `Idempotency-Key` aunque el contrato la exige: un integrador que lo copiaba
 * recibía 422 en su primera llamada. Es espec-driven: lo que el spec declare,
 * sale en los tres lenguajes.
 */
function requiredHeaders(op: NormalizedOperation): { name: string; value: string }[] {
  return (op.operation.parameters ?? [])
    .filter((p: OpenApiParameter) => p.in === "header" && p.required)
    .map((p: OpenApiParameter) => ({
      name: p.name,
      value: String((p as { example?: unknown }).example ?? p.schema?.example ?? `<${p.name}>`),
    }));
}

function buildUrl(doc: OpenApiDocument, op: NormalizedOperation): string {
  const base = doc.servers?.[0]?.url ?? `${siteConfig.apiBaseUrl}/v1`;
  const path = op.path.replace(/\{(\w+)\}/g, (_, name) => `:${name}`);
  return `${base}${path}`;
}

/** Snippets de request en varios lenguajes para el bloque de código de la referencia. */
export function operationSamples(doc: OpenApiDocument, op: NormalizedOperation) {
  const url = buildUrl(doc, op);
  const method = op.method.toUpperCase();
  const body = requestExample(doc, op);
  const hasBody = body !== null && (method === "POST" || method === "PUT" || method === "PATCH");
  const bodyJson = hasBody ? JSON.stringify(body, null, 2) : "";
  const extra = requiredHeaders(op);
  const curlExtra = extra.map((h) => `  -H "${h.name}: ${h.value}" \\`);
  const jsExtra = extra.map((h) => `    "${h.name}": "${h.value}",`).join("\n");
  const pyExtra = extra.map((h) => `, "${h.name}": "${h.value}"`).join("");

  const curl = [
    `curl ${method === "GET" ? "" : `-X ${method} `}${url} \\`,
    `  -H "Authorization: Bearer $FALCONEXT_API_KEY"${hasBody || extra.length ? " \\" : ""}`,
    ...curlExtra.map((l, i) => (i === curlExtra.length - 1 && !hasBody ? l.replace(/ \\$/, "") : l)),
    ...(hasBody
      ? [`  -H "Content-Type: application/json" \\`, `  -d '${bodyJson.replace(/\n/g, "\n  ")}'`]
      : []),
  ].join("\n");

  const node = hasBody
    ? `const res = await fetch("${url}", {
  method: "${method}",
  headers: {
    Authorization: \`Bearer \${process.env.FALCONEXT_API_KEY}\`,
    "Content-Type": "application/json",${jsExtra ? "\n" + jsExtra : ""}
  },
  body: JSON.stringify(${bodyJson}),
});
const data = await res.json();`
    : `const res = await fetch("${url}", {
  headers: { Authorization: \`Bearer \${process.env.FALCONEXT_API_KEY}\`${jsExtra ? ",\n" + jsExtra.replace(/,$/, "") : ""} },
});
const data = await res.json();`;

  const python = hasBody
    ? `import os, requests

res = requests.${op.method}(
    "${url}",
    headers={"Authorization": f"Bearer {os.environ['FALCONEXT_API_KEY']}"${pyExtra}},
    json=${bodyJson || "{}"},
)
data = res.json()`
    : `import os, requests

res = requests.${op.method}(
    "${url}",
    headers={"Authorization": f"Bearer {os.environ['FALCONEXT_API_KEY']}"${pyExtra}},
)
data = res.json()`;

  return [
    { label: "cURL", lang: "bash", code: curl },
    { label: "Node.js", lang: "javascript", code: node },
    { label: "Python", lang: "python", code: python },
  ];
}
