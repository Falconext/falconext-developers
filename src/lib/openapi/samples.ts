import type { OpenApiDocument, NormalizedOperation } from "./types";
import { requestExample } from "./loader";
import { siteConfig } from "@/config/site";

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

  const curl = [
    `curl ${method === "GET" ? "" : `-X ${method} `}${url} \\`,
    `  -H "Authorization: Bearer $FALCONEXT_API_KEY"${hasBody ? " \\" : ""}`,
    ...(hasBody
      ? [`  -H "Content-Type: application/json" \\`, `  -d '${bodyJson.replace(/\n/g, "\n  ")}'`]
      : []),
  ].join("\n");

  const node = hasBody
    ? `const res = await fetch("${url}", {
  method: "${method}",
  headers: {
    Authorization: \`Bearer \${process.env.FALCONEXT_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${bodyJson}),
});
const data = await res.json();`
    : `const res = await fetch("${url}", {
  headers: { Authorization: \`Bearer \${process.env.FALCONEXT_API_KEY}\` },
});
const data = await res.json();`;

  const python = hasBody
    ? `import os, requests

res = requests.${op.method}(
    "${url}",
    headers={"Authorization": f"Bearer {os.environ['FALCONEXT_API_KEY']}"},
    json=${bodyJson || "{}"},
)
data = res.json()`
    : `import os, requests

res = requests.${op.method}(
    "${url}",
    headers={"Authorization": f"Bearer {os.environ['FALCONEXT_API_KEY']}"},
)
data = res.json()`;

  return [
    { label: "cURL", lang: "bash", code: curl },
    { label: "Node.js", lang: "javascript", code: node },
    { label: "Python", lang: "python", code: python },
  ];
}
