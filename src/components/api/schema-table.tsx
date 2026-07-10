import { deref } from "@/lib/openapi/loader";
import type { OpenApiDocument, OpenApiSchema } from "@/lib/openapi/types";
import { cn } from "@/lib/utils";

function typeLabel(doc: OpenApiDocument, schema: OpenApiSchema): string {
  const s = deref(doc, schema) ?? schema;
  if (s.enum?.length) return "enum";
  if (s.type === "array") {
    const item = deref(doc, s.items);
    return `${item?.type ?? "object"}[]`;
  }
  return s.type ?? (s.$ref ? "object" : "any");
}

function PropertyRow({
  doc,
  name,
  schema,
  required,
  depth,
}: {
  doc: OpenApiDocument;
  name: string;
  schema: OpenApiSchema;
  required: boolean;
  depth: number;
}) {
  const s = deref(doc, schema) ?? schema;
  const nested = s.type === "object" ? s.properties : s.type === "array" ? deref(doc, s.items)?.properties : undefined;

  return (
    <>
      <div
        className={cn("border-t border-app py-3", depth > 0 && "pl-4")}
        style={depth > 0 ? { paddingLeft: `${depth * 0.9 + 0}rem` } : undefined}
      >
        <div className="flex flex-wrap items-baseline gap-2">
          <code className="font-mono text-[0.8rem] font-medium text-fg">{name}</code>
          <span className="font-mono text-[0.7rem] text-violet-400">{typeLabel(doc, s)}</span>
          {required && <span className="font-mono text-[0.65rem] uppercase tracking-wide text-amber-signal">requerido</span>}
        </div>
        {s.description && <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">{s.description}</p>}
        {s.enum && (
          <p className="mt-1 flex flex-wrap gap-1">
            {s.enum.map((e) => (
              <code key={String(e)} className="rounded border border-app bg-elevated px-1.5 py-0.5 font-mono text-[0.68rem] text-muted">
                {String(e)}
              </code>
            ))}
          </p>
        )}
      </div>
      {nested &&
        depth < 2 &&
        Object.entries(nested).map(([childName, childSchema]) => (
          <PropertyRow
            key={`${name}.${childName}`}
            doc={doc}
            name={childName}
            schema={childSchema}
            required={(s.type === "object" ? s.required : deref(doc, s.items)?.required)?.includes(childName) ?? false}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

export function SchemaTable({
  doc,
  schema,
  title,
}: {
  doc: OpenApiDocument;
  schema?: OpenApiSchema;
  title?: string;
}) {
  const s = deref(doc, schema);
  if (!s) return null;
  const props = s.type === "object" ? s.properties : s.type === "array" ? deref(doc, s.items)?.properties : s.properties;
  if (!props) return null;
  const requiredList = s.required ?? [];

  return (
    <div>
      {title && <p className="eyebrow mb-1">{title}</p>}
      <div className="rounded-card border border-app">
        {Object.entries(props).map(([name, propSchema]) => (
          <PropertyRow
            key={name}
            doc={doc}
            name={name}
            schema={propSchema}
            required={requiredList.includes(name)}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
