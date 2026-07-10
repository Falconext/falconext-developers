import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { resolveProductVersion, documentedProducts } from "@/config/products";
import { getDoc, getDocsNav, getAllDocParams } from "@/lib/content";
import { mdxComponents } from "@/components/content/mdx-components";
import { TableOfContents } from "@/components/layout/toc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string; version: string; slug: string[] }>;
}) {
  const { product, version, slug } = await params;
  const resolved = resolveProductVersion(product, version);
  if (!resolved) return { title: "Documentación" };
  const doc = getDoc(resolved.product.id, resolved.version.id, slug);
  return {
    title: doc ? `${doc.title} · ${resolved.product.name}` : "Documentación",
    description: doc?.description,
  };
}

export default async function ConceptDoc({
  params,
}: {
  params: Promise<{ product: string; version: string; slug: string[] }>;
}) {
  const { product: productId, version: versionId, slug } = await params;
  const resolved = resolveProductVersion(productId, versionId);
  if (!resolved) notFound();
  const { product, version } = resolved;

  const doc = getDoc(product.id, version.id, slug);
  if (!doc) notFound();

  // prev/next dentro del recorrido de conceptos (orden del sidebar).
  const flat = getDocsNav(product.id, version.id).flatMap((g) => g.items);
  const idx = flat.findIndex((i) => i.slugPath === doc.slugPath);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const base = `/${product.id}/${version.id}`;

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_200px]">
      <div className="min-w-0">
        <article id="doc-article" className="max-w-3xl">
          <h1 className="mb-3 text-[2.15rem] font-bold leading-tight tracking-tight text-fg">
            {doc.title}
          </h1>
          {doc.description && <p className="mb-8 text-lg leading-relaxed text-muted">{doc.description}</p>}
          <MDXRemote
            source={doc.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
          />
        </article>

        <nav className="mt-16 grid max-w-3xl grid-cols-1 gap-3 border-t border-app pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`${base}/${prev.slugPath}`} className="group flex flex-col gap-1 rounded-card border border-app p-4 transition-colors hover:border-violet-500/40">
              <span className="flex items-center gap-1 text-[0.72rem] text-subtle"><ArrowLeft className="h-3.5 w-3.5" /> Anterior</span>
              <span className="font-medium text-fg group-hover:text-violet-400">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`${base}/${next.slugPath}`} className="group flex flex-col items-end gap-1 rounded-card border border-app p-4 text-right transition-colors hover:border-violet-500/40">
              <span className="flex items-center gap-1 text-[0.72rem] text-subtle">Siguiente <ArrowRight className="h-3.5 w-3.5" /></span>
              <span className="font-medium text-fg group-hover:text-violet-400">{next.title}</span>
            </Link>
          )}
        </nav>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-20 py-1">
          <TableOfContents />
        </div>
      </aside>
    </div>
  );
}

export function generateStaticParams() {
  return getAllDocParams(documentedProducts());
}

export const dynamicParams = false;
