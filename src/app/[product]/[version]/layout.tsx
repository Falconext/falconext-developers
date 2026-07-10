import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { resolveProductVersion, documentedProducts } from "@/config/products";
import { loadSpec, getApiGroups } from "@/lib/openapi/loader";
import { ReferenceSidebar, type RefNavGroup } from "@/components/api/reference-sidebar";
import { ConceptNav } from "@/components/api/concept-nav";
import { ProductMobileNav } from "@/components/api/product-mobile-nav";
import { ProductVersionSwitcher } from "@/components/api/product-version-switcher";
import { Badge } from "@/components/ui/badge";
import { getDocsNav } from "@/lib/content";

export default async function ProductVersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ product: string; version: string }>;
}) {
  const { product: productId, version: versionId } = await params;
  const resolved = resolveProductVersion(productId, versionId);
  if (!resolved) notFound();
  const { product, version } = resolved;

  const doc = await loadSpec(version.specPath);
  const groups: RefNavGroup[] = getApiGroups(doc).map((g) => ({
    name: g.name,
    operations: g.operations.map((op) => ({
      slug: op.slug,
      method: op.method,
      summary: op.operation.summary ?? op.slug,
    })),
  }));

  const basePath = `/${product.id}/${version.id}/reference`;
  const conceptBase = `/${product.id}/${version.id}`;
  const conceptGroups = getDocsNav(product.id, version.id).map((g) => ({
    title: g.title,
    items: g.items.map((i) => ({ title: i.title, slugPath: i.slugPath })),
  }));

  const productOpts = documentedProducts().map((p) => ({ id: p.id, label: p.name }));
  const versionOpts = product.versions.map((v) => ({
    id: v.id,
    label: `${v.label}${v.status !== "stable" ? ` · ${v.status}` : ""}`,
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block" data-pagefind-ignore>
          <div className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto py-8">
            {/* Cabecera de producto + switchers */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-fg">{product.name}</span>
                {product.status === "beta" && <Badge tone="amber">Beta</Badge>}
              </div>
              <ProductVersionSwitcher
                product={product.id}
                version={version.id}
                products={productOpts}
                versions={versionOpts}
              />
            </div>

            {/* Enlaces del producto */}
            <div className="mb-6 space-y-px">
              <SidebarLink href={`/${product.id}/${version.id}`} label="Overview" />
            </div>

            {/* Conceptos y guías (MDX) */}
            <ConceptNav groups={conceptGroups} basePath={conceptBase} />

            {/* Referencia (spec OpenAPI) */}
            <p className="eyebrow mb-2 px-2">API Reference</p>
            <ReferenceSidebar groups={groups} basePath={basePath} />
          </div>
        </aside>

        <main className="min-w-0 py-8 lg:py-10" data-pagefind-body>
          <ProductMobileNav
            productName={product.name}
            versionLabel={version.label}
            overviewHref={`/${product.id}/${version.id}`}
            conceptGroups={conceptGroups}
            conceptBase={conceptBase}
            referenceGroups={groups}
            referenceBase={basePath}
            product={product.id}
            version={version.id}
            productOpts={productOpts}
            versionOpts={versionOpts}
          />
          <nav aria-label="Ruta" data-pagefind-ignore className="mb-4 flex flex-wrap items-center gap-1 text-[0.78rem] text-subtle">
            <Link href="/" className="hover:text-fg">Ecosistema</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${product.id}/${version.id}`} className="hover:text-fg">{product.shortName}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-mono text-muted">{version.label}</span>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-2 py-1.5 text-[0.8125rem] text-muted transition-colors hover:text-fg"
    >
      {label}
    </Link>
  );
}

export function generateStaticParams() {
  return documentedProducts().flatMap((p) =>
    p.versions.map((v) => ({ product: p.id, version: v.id })),
  );
}

export const dynamicParams = false;
