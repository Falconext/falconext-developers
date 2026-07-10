/**
 * Cliente de Pagefind (búsqueda full-text, build-time, estática).
 *
 * Pagefind indexa el HTML prerenderizado en el postbuild (`pnpm postbuild`) y
 * emite su bundle a `public/_pagefind`. En runtime lo cargamos dinámicamente
 * desde esa URL — invisible al bundler (webpack/turbopack) mediante un
 * `import()` construido en tiempo de ejecución, para que Next no intente
 * resolverlo en build.
 *
 * En `next dev` el índice no existe todavía → `loadPagefind()` falla y la UI
 * cae al índice curado (substring). En producción usa full-text real.
 */

export type PagefindDoc = {
  url: string;
  meta: Record<string, string>;
  excerpt: string;
  content?: string;
};

type PagefindModule = {
  search: (query: string) => Promise<{
    results: { id: string; data: () => Promise<PagefindDoc> }[];
  }>;
  options?: (opts: Record<string, unknown>) => Promise<void>;
};

let pagefindPromise: Promise<PagefindModule> | null = null;

/** Carga (una sola vez) el bundle de Pagefind servido en /_pagefind/pagefind.js */
export function loadPagefind(): Promise<PagefindModule> {
  if (pagefindPromise) return pagefindPromise;
  pagefindPromise = (async () => {
    // `new Function` evita que webpack/turbopack analicen y resuelvan el import.
    const dynamicImport = new Function(
      "url",
      "return import(url)",
    ) as (url: string) => Promise<PagefindModule>;
    const mod = await dynamicImport("/_pagefind/pagefind.js");
    // Trunca la longitud del excerpt para líneas compactas en el diálogo.
    await mod.options?.({ excerptLength: 20 });
    return mod;
  })();
  // Si falla, permite reintentar en una próxima apertura.
  pagefindPromise.catch(() => {
    pagefindPromise = null;
  });
  return pagefindPromise;
}

/** ¿Está disponible el índice de Pagefind? (false en dev / si no se construyó). */
export async function pagefindAvailable(): Promise<boolean> {
  try {
    await loadPagefind();
    return true;
  } catch {
    return false;
  }
}

/** Busca en el índice full-text y devuelve los primeros `limit` documentos. */
export async function pagefindSearch(
  query: string,
  limit = 8,
): Promise<PagefindDoc[]> {
  const q = query.trim();
  if (!q) return [];
  const pf = await loadPagefind();
  const res = await pf.search(q);
  const docs = await Promise.all(
    res.results.slice(0, limit).map((r) => r.data()),
  );
  return docs;
}
