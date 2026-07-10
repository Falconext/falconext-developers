import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { resolveProductVersion, documentedProducts } from "@/config/products";
import { loadSpec, flattenOperations, findOperation } from "@/lib/openapi/loader";
import { ApiOperation } from "@/components/api/operation";
import { MethodBadge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string; version: string; operation: string }>;
}) {
  const { product, version, operation } = await params;
  const resolved = resolveProductVersion(product, version);
  if (!resolved) return { title: "API Reference" };
  const doc = await loadSpec(resolved.version.specPath);
  const op = findOperation(doc, operation);
  return {
    title: op ? `${op.operation.summary} · ${resolved.product.name}` : "API Reference",
    description: op?.operation.description,
  };
}

export default async function OperationPage({
  params,
}: {
  params: Promise<{ product: string; version: string; operation: string }>;
}) {
  const { product: productId, version: versionId, operation: operationSlug } = await params;
  const resolved = resolveProductVersion(productId, versionId);
  if (!resolved) notFound();
  const { product, version } = resolved;
  const doc = await loadSpec(version.specPath);

  const flat = flattenOperations(doc);
  const idx = flat.findIndex((o) => o.slug === operationSlug);
  if (idx === -1) notFound();
  const op = flat[idx];
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const basePath = `/${product.id}/${version.id}/reference`;

  return (
    <div>
      <ApiOperation
        doc={doc}
        op={op}
        meta={{
          product: { id: product.id, name: product.name },
          version: { id: version.id, label: version.label },
        }}
      />

      <nav className="mt-8 grid grid-cols-1 gap-3 border-t border-app pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`${basePath}/${prev.slug}`} className="group flex flex-col gap-1 rounded-card border border-app p-4 transition-colors hover:border-violet-500/40">
            <span className="flex items-center gap-1 text-[0.72rem] text-subtle"><ArrowLeft className="h-3.5 w-3.5" /> Anterior</span>
            <span className="flex items-center gap-2 font-medium text-fg group-hover:text-violet-400">
              <MethodBadge method={prev.method} /> {prev.operation.summary}
            </span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`${basePath}/${next.slug}`} className="group flex flex-col items-end gap-1 rounded-card border border-app p-4 text-right transition-colors hover:border-violet-500/40">
            <span className="flex items-center gap-1 text-[0.72rem] text-subtle">Siguiente <ArrowRight className="h-3.5 w-3.5" /></span>
            <span className="flex items-center gap-2 font-medium text-fg group-hover:text-violet-400">
              {next.operation.summary} <MethodBadge method={next.method} />
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}

export async function generateStaticParams() {
  const out: { product: string; version: string; operation: string }[] = [];
  for (const p of documentedProducts()) {
    for (const v of p.versions) {
      const doc = await loadSpec(v.specPath);
      for (const op of flattenOperations(doc)) {
        out.push({ product: p.id, version: v.id, operation: op.slug });
      }
    }
  }
  return out;
}

export const dynamicParams = false;
