/** Subconjunto tipado de OpenAPI 3.x que consume el renderizador. */

export type OpenApiSchema = {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  example?: unknown;
  enum?: unknown[];
  default?: unknown;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  maximum?: number;
  minimum?: number;
  nullable?: boolean;
  deprecated?: boolean;
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  $ref?: string;
};

export type OpenApiParameter = {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  schema?: OpenApiSchema;
};

export type OpenApiMediaType = { schema?: OpenApiSchema };

export type OpenApiRequestBody = {
  required?: boolean;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};

export type OpenApiResponse = {
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};

export type OpenApiOperation = {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
  security?: Record<string, string[]>[];
};

export type OpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    "x-status"?: string;
  };
  servers?: { url: string; description?: string }[];
  security?: Record<string, string[]>[];
  tags?: { name: string; description?: string }[];
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    securitySchemes?: Record<string, { type: string; scheme?: string; bearerFormat?: string; description?: string }>;
    responses?: Record<string, OpenApiResponse>;
    schemas?: Record<string, OpenApiSchema>;
  };
};

export const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export type NormalizedOperation = {
  method: HttpMethod;
  path: string;
  operation: OpenApiOperation;
  slug: string;
};

export type ApiTagGroup = {
  name: string;
  description?: string;
  operations: NormalizedOperation[];
};
