import path from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import {
  HTTP_METHODS,
  type ApiTagGroup,
  type HttpMethod,
  type NormalizedOperation,
  type OpenApiDocument,
  type OpenApiSchema,
} from "./types";
import { slugify } from "@/lib/utils";

/**
 * Motor OpenAPI production-grade.
 * - Dereferencia y valida la spec con @apidevtools/swagger-parser (resuelve todos
 *   los $ref: los schemas quedan inline y el renderer no tiene que resolver nada).
 * - Es consciente de producto/versión: se carga por `specPath` desde el registry.
 * Para conectar el spec real: apunta cada versión del registry al OpenAPI del backend.
 */

const cache = new Map<string, Promise<OpenApiDocument>>();

function absoluteSpecPath(specPath: string): string {
  // specPath es una URL public (p. ej. "/openapi/logistica/2025-07-01.json").
  return path.join(process.cwd(), "public", specPath);
}

export function loadSpec(specPath: string): Promise<OpenApiDocument> {
  let cached = cache.get(specPath);
  if (!cached) {
    cached = SwaggerParser.dereference(absoluteSpecPath(specPath)) as Promise<OpenApiDocument>;
    cache.set(specPath, cached);
  }
  return cached;
}

/** Tras dereferenciar no quedan $ref; deref simplemente devuelve el schema. */
export function deref(_doc: OpenApiDocument, schema?: OpenApiSchema): OpenApiSchema | undefined {
  return schema;
}

/** Agrupa todas las operaciones por tag, respetando el orden de `tags`. */
export function getApiGroups(doc: OpenApiDocument): ApiTagGroup[] {
  const groups = new Map<string, NormalizedOperation[]>();

  for (const [p, methods] of Object.entries(doc.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = methods[method];
      if (!operation) continue;
      const tag = operation.tags?.[0] ?? "General";
      const slug = slugify(operation.operationId ?? `${method}-${p}`);
      const arr = groups.get(tag) ?? [];
      arr.push({ method: method as HttpMethod, path: p, operation, slug });
      groups.set(tag, arr);
    }
  }

  const ordered = doc.tags?.map((t) => t.name) ?? [...groups.keys()];
  const seen = new Set<string>();
  const result: ApiTagGroup[] = [];
  for (const name of [...ordered, ...groups.keys()]) {
    if (seen.has(name) || !groups.has(name)) continue;
    seen.add(name);
    result.push({
      name,
      description: doc.tags?.find((t) => t.name === name)?.description,
      operations: groups.get(name)!,
    });
  }
  return result;
}

/** Todas las operaciones en una lista plana (para generateStaticParams y prev/next). */
export function flattenOperations(doc: OpenApiDocument): NormalizedOperation[] {
  return getApiGroups(doc).flatMap((g) => g.operations);
}

export function findOperation(doc: OpenApiDocument, slug: string): NormalizedOperation | undefined {
  return flattenOperations(doc).find((op) => op.slug === slug);
}

/** Genera un ejemplo JSON a partir de un schema (usa `example` cuando existe). */
export function schemaToExample(doc: OpenApiDocument, schema?: OpenApiSchema, depth = 0): unknown {
  const s = schema;
  if (!s || depth > 8) return null;
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  if (s.enum?.length) return s.enum[0];

  // Composición (allOf: fusiona propiedades; oneOf/anyOf: toma la primera).
  if (s.allOf?.length) {
    const merged: Record<string, unknown> = {};
    for (const part of s.allOf) Object.assign(merged as object, schemaToExample(doc, part, depth) as object);
    return merged;
  }
  if (s.oneOf?.length) return schemaToExample(doc, s.oneOf[0], depth);
  if (s.anyOf?.length) return schemaToExample(doc, s.anyOf[0], depth);

  switch (s.type) {
    case "object": {
      const obj: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(s.properties ?? {})) {
        obj[key] = schemaToExample(doc, prop, depth + 1);
      }
      return obj;
    }
    case "array":
      return [schemaToExample(doc, s.items, depth + 1)];
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return true;
    case "string":
      return s.format === "date-time" ? "2025-07-01T14:03:11Z" : "string";
    default:
      return null;
  }
}

/** Construye un ejemplo de request body para una operación. */
export function requestExample(doc: OpenApiDocument, op: NormalizedOperation): unknown | null {
  const schema = op.operation.requestBody?.content?.["application/json"]?.schema;
  if (!schema) return null;
  return schemaToExample(doc, schema);
}
