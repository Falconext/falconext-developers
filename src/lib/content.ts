import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Sistema de contenido por producto/versión (docs-as-code).
 * Guías y conceptos viven en content/PRODUCTO/VERSION como archivos .mdx con frontmatter.
 * Añadir una página = soltar un .mdx. La navegación se deriva del frontmatter.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type DocFrontmatter = {
  title: string;
  description?: string;
  /** Grupo del sidebar, p. ej. "Introducción". */
  group?: string;
  /** Orden dentro del grupo. */
  order?: number;
};

export type DocMeta = DocFrontmatter & {
  /** Segmentos de ruta relativos al producto/versión, p. ej. ["guides", "sap"]. */
  slug: string[];
  /** slug unido por "/", para llaves y comparaciones. */
  slugPath: string;
};

export type DocContent = DocMeta & { body: string };

export type DocNavGroup = {
  title: string;
  items: { title: string; slug: string[]; slugPath: string; order: number }[];
};

function versionDir(product: string, version: string): string {
  return path.join(CONTENT_ROOT, product, version);
}

function walkMdx(dir: string, base: string[] = []): string[][] {
  if (!existsSync(dir)) return [];
  const out: string[][] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMdx(full, [...base, entry]));
    } else if (entry.endsWith(".mdx")) {
      out.push([...base, entry.replace(/\.mdx$/, "")]);
    }
  }
  return out;
}

export function getAllDocs(product: string, version: string): DocMeta[] {
  const dir = versionDir(product, version);
  return walkMdx(dir).map((slug) => {
    const file = path.join(dir, ...slug) + ".mdx";
    const { data } = matter(readFileSync(file, "utf-8"));
    const fm = data as DocFrontmatter;
    return {
      ...fm,
      title: fm.title ?? slug[slug.length - 1],
      slug,
      slugPath: slug.join("/"),
    };
  });
}

export function getDoc(product: string, version: string, slug: string[]): DocContent | null {
  const file = path.join(versionDir(product, version), ...slug) + ".mdx";
  if (!existsSync(file)) return null;
  const { data, content } = matter(readFileSync(file, "utf-8"));
  const fm = data as DocFrontmatter;
  return {
    ...fm,
    title: fm.title ?? slug[slug.length - 1],
    slug,
    slugPath: slug.join("/"),
    body: content,
  };
}

/** Sidebar de conceptos, agrupado y ordenado. Los grupos se ordenan por su menor `order`. */
export function getDocsNav(product: string, version: string): DocNavGroup[] {
  const docs = getAllDocs(product, version);
  const groups = new Map<string, DocNavGroup["items"]>();

  for (const doc of docs) {
    const group = doc.group ?? "Guías";
    const arr = groups.get(group) ?? [];
    arr.push({
      title: doc.title,
      slug: doc.slug,
      slugPath: doc.slugPath,
      order: doc.order ?? 999,
    });
    groups.set(group, arr);
  }

  const result: DocNavGroup[] = [...groups.entries()].map(([title, items]) => ({
    title,
    items: items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
  }));

  // Orden de grupos por el menor `order` de sus items (introducción arriba).
  return result.sort((a, b) => Math.min(...a.items.map((i) => i.order)) - Math.min(...b.items.map((i) => i.order)));
}

/** Para generateStaticParams del catch-all de conceptos. */
export function getAllDocParams(products: { id: string; versions: { id: string }[] }[]) {
  const out: { product: string; version: string; slug: string[] }[] = [];
  for (const p of products) {
    for (const v of p.versions) {
      for (const doc of getAllDocs(p.id, v.id)) {
        out.push({ product: p.id, version: v.id, slug: doc.slug });
      }
    }
  }
  return out;
}
