import { notFound } from "next/navigation";
import { ArrowRight, Download } from "lucide-react";
import { resolveProductVersion, documentedProducts } from "@/config/products";
import { loadSpec, getApiGroups } from "@/lib/openapi/loader";
import { MethodBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import Link from "next/link";

/** Overview del producto en una versión: resumen + acceso rápido a los endpoints. */
export default async function ProductVersionOverview({
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
      <p className="eyebrow mb-2">{product.name} · {version.label}</p>
      <h1 className="font-display text-[2.4rem] font-bold tracking-tight text-fg">{product.tagline}</h1>
      <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">{product.description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={`${basePath}`}>
          Ver API Reference <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href={version.specPath} variant="secondary" size="md">
          <Download className="h-4 w-4" /> OpenAPI
        </Button>
      </div>

      {version.notice && (
        <div className="mt-6">
          <Callout type="warning" title="Aviso de versión">{version.notice}</Callout>
        </div>
      )}

      <h2 className="mt-12 font-display text-xl font-semibold text-fg">Endpoints</h2>
      <div className="mt-4 space-y-8">
        {groups.map((group) => (
          <div key={group.name}>
            <p className="eyebrow mb-3">{group.name}</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {group.operations.map((op) => (
                <li key={op.slug}>
                  <Link
                    href={`${basePath}/${op.slug}`}
                    className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
                  >
                    <MethodBadge method={op.method} />
                    <span className="truncate">{op.operation.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
