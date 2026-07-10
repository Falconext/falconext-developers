import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import { resolveProductVersion, documentedProducts } from "@/config/products";
import { loadSpec, getApiGroups } from "@/lib/openapi/loader";
import { MethodBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

export async function generateMetadata({ params }: { params: Promise<{ product: string; version: string }> }) {
  const { product, version } = await params;
  const resolved = resolveProductVersion(product, version);
  return { title: resolved ? `API Reference · ${resolved.product.name}` : "API Reference" };
}

export default async function ReferenceIndex({
  params,
}: {
  params: Promise<{ product: string; version: string }>;
}) {
  const { product: productId, version: versionId } = await params;
  const resolved = resolveProductVersion(productId, versionId);
  if (!resolved) notFound();
  const { product, version } = resolved;
  const doc = await loadSpec(version.specPath);
  const groups = getApiGroups(doc);
  const basePath = `/${product.id}/${version.id}/reference`;

  return (
    <div className="max-w-3xl">
      <p className="eyebrow mb-2">Referencia · OpenAPI {doc.openapi}</p>
      <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">API Reference</h1>
      <p className="mt-3 leading-relaxed text-muted">{doc.info.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button href={version.specPath} variant="secondary" size="sm">
          <Download className="h-4 w-4" /> Descargar OpenAPI
        </Button>
        <span className="font-mono text-[0.72rem] text-subtle">Base: {doc.servers?.[0]?.url}</span>
      </div>

      {doc.info["x-status"] && (
        <div className="mt-6">
          <Callout type="warning" title="Documento de plantilla">{doc.info["x-status"]}</Callout>
        </div>
      )}

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="font-display text-xl font-semibold text-fg">{group.name}</h2>
            {group.description && <p className="mt-1 text-sm text-muted">{group.description}</p>}
            <ul className="mt-4 divide-y divide-[color:var(--border)] overflow-hidden rounded-card border border-app">
              {group.operations.map((op) => (
                <li key={op.slug}>
                  <Link
                    href={`${basePath}/${op.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated"
                  >
                    <MethodBadge method={op.method} />
                    <span className="font-medium text-fg">{op.operation.summary}</span>
                    <code className="ml-auto hidden font-mono text-[0.75rem] text-subtle sm:block">{op.path}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 flex items-start gap-2 rounded-card border border-app bg-subtle/40 p-4 text-sm text-subtle">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Cada endpoint tiene su propia página (deep-link y SEO). Todo se genera desde{" "}
          <code className="font-mono text-muted">{version.specPath}</code>: cambia el spec y la
          referencia se regenera.
        </p>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return documentedProducts().flatMap((p) =>
    p.versions.map((v) => ({ product: p.id, version: v.id })),
  );
}

export const dynamicParams = false;
