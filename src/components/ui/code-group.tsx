import { highlightCode } from "@/lib/highlight";
import { CodeTabsClient, type RenderedSnippet } from "./code-tabs-client";

export type Snippet = { label: string; lang: string; code: string };

/**
 * Grupo de bloques de código con pestañas (p.ej. el mismo request en varios SDKs).
 * Resalta cada snippet en el servidor y delega la interacción al cliente.
 */
export async function CodeGroup({
  snippets,
  title,
}: {
  snippets: Snippet[];
  title?: string;
}) {
  const rendered: RenderedSnippet[] = await Promise.all(
    snippets.map(async (s) => ({
      label: s.label,
      lang: s.lang,
      raw: s.code,
      html: await highlightCode(s.code, s.lang),
    })),
  );

  return <CodeTabsClient snippets={rendered} title={title} />;
}
