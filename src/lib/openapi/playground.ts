import { getApiGroups, requestExample } from "./loader";
import { loadSpec } from "./loader";
import type { NormalizedOperation, OpenApiDocument } from "./types";

export type PlaygroundParam = {
  name: string;
  in: "path" | "query";
  required: boolean;
  description?: string;
  example?: string;
};

export type PlaygroundEndpoint = {
  id: string;
  method: string;
  path: string;
  summary: string;
  tag: string;
  params: PlaygroundParam[];
  bodyExample: string | null;
};

/**
 * Esquema de autenticación derivado del `securityScheme` de la spec.
 * - `bearer`: se inyecta `Authorization: Bearer <key>`.
 * - `apiKey`: se inyecta un header propio (`headerName`) con la key cruda.
 * - `none`: la operación no requiere auth.
 */
export type PlaygroundAuth =
  | { type: "bearer"; label: string; bearerFormat?: string; description?: string }
  | { type: "apiKey"; label: string; headerName: string; description?: string }
  | { type: "none" };

/** Metadatos de contexto (producto/versión) que la página inyecta al playground. */
export type PlaygroundMeta = {
  product?: { id: string; name: string };
  version?: { id: string; label: string };
};

export type PlaygroundData = PlaygroundMeta & {
  servers: { url: string; description?: string }[];
  auth: PlaygroundAuth;
  endpoints: PlaygroundEndpoint[];
};

// ------------------------------------------------------------------ //
// Extractores desde el documento OpenAPI (fuente de verdad).
// ------------------------------------------------------------------ //

/** Servers declarados en la spec (producción/sandbox). Nunca hardcodeado. */
export function extractServers(doc: OpenApiDocument): { url: string; description?: string }[] {
  const servers = doc.servers?.filter((s) => Boolean(s?.url));
  return servers?.length ? servers : [{ url: "https://api.falconext.com/v1" }];
}

/**
 * Resuelve el esquema de seguridad aplicable a una operación (o al documento).
 * Lee `security` (operación → documento) y lo cruza con `components.securitySchemes`.
 */
export function extractAuth(doc: OpenApiDocument, op?: NormalizedOperation): PlaygroundAuth {
  const requirement = op?.operation.security ?? doc.security;
  const schemes = doc.components?.securitySchemes ?? {};
  if (!requirement?.length) return { type: "none" };

  for (const req of requirement) {
    const key = Object.keys(req)[0];
    if (!key) continue;
    const scheme = schemes[key] as
      | { type?: string; scheme?: string; bearerFormat?: string; description?: string; in?: string; name?: string }
      | undefined;
    if (!scheme) continue;

    if (scheme.type === "http" && scheme.scheme === "bearer") {
      return { type: "bearer", label: key, bearerFormat: scheme.bearerFormat, description: scheme.description };
    }
    if (scheme.type === "apiKey" && (scheme.in ?? "header") === "header") {
      return { type: "apiKey", label: key, headerName: scheme.name ?? "X-API-Key", description: scheme.description };
    }
  }
  return { type: "none" };
}

/** Normaliza una operación OpenAPI al modelo serializable del playground. */
export function operationToEndpoint(
  doc: OpenApiDocument,
  op: NormalizedOperation,
  tag?: string,
): PlaygroundEndpoint {
  const params = (op.operation.parameters ?? [])
    .filter((p) => p.in === "path" || p.in === "query")
    .map<PlaygroundParam>((p) => ({
      name: p.name,
      in: p.in as "path" | "query",
      required: Boolean(p.required),
      description: p.description,
      example: p.schema?.example !== undefined ? String(p.schema.example) : undefined,
    }));
  const body = requestExample(doc, op);
  return {
    id: op.slug,
    method: op.method.toUpperCase(),
    path: op.path,
    summary: op.operation.summary ?? op.slug,
    tag: tag ?? op.operation.tags?.[0] ?? "General",
    params,
    bodyExample: body ? JSON.stringify(body, null, 2) : null,
  };
}

// ------------------------------------------------------------------ //
// Constructores de PlaygroundData.
// ------------------------------------------------------------------ //

/** Datos del playground para TODAS las operaciones de un documento (sandbox global). */
export function buildPlaygroundData(doc: OpenApiDocument, meta?: PlaygroundMeta): PlaygroundData {
  const groups = getApiGroups(doc);
  const endpoints = groups.flatMap((g) => g.operations.map((op) => operationToEndpoint(doc, op, g.name)));
  return {
    ...meta,
    servers: extractServers(doc),
    auth: extractAuth(doc),
    endpoints,
  };
}

/** Datos del playground acotados a UNA operación (playground por endpoint). */
export function buildOperationPlayground(
  doc: OpenApiDocument,
  op: NormalizedOperation,
  meta?: PlaygroundMeta,
): PlaygroundData {
  return {
    ...meta,
    servers: extractServers(doc),
    auth: extractAuth(doc, op),
    endpoints: [operationToEndpoint(doc, op)],
  };
}

/** Carga la spec por `specPath` y aplana todas sus operaciones (sandbox global). */
export async function getPlaygroundData(specPath: string, meta?: PlaygroundMeta): Promise<PlaygroundData> {
  const doc = await loadSpec(specPath);
  return buildPlaygroundData(doc, meta);
}
