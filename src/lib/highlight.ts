import type { BundledLanguage } from "shiki";
import { createHighlighter, type Highlighter } from "shiki";

/**
 * Resaltado de sintaxis con Shiki en el servidor.
 * Usamos temas duales (claro/oscuro) que emiten variables CSS, de modo que el
 * mismo HTML sirve para ambos modos y el toggle es instantáneo sin re-render.
 */

const LANGS: BundledLanguage[] = [
  "bash",
  "json",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "php",
  "python",
  "java",
  "csharp",
  "go",
  "http",
  "yaml",
  "sql",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark-default"],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

export type SupportedLang = BundledLanguage | "text";

export async function highlightCode(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  const language = (LANGS as string[]).includes(lang) ? lang : "text";
  return hl.codeToHtml(code.trimEnd(), {
    lang: language,
    themes: { light: "github-light", dark: "github-dark-default" },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          // Dejamos el estilo al contenedor CodeBlock; sólo limpiamos el fondo inline.
          this.addClassToHast(node, "shiki-pre");
          node.properties.style = "";
        },
      },
    ],
  });
}
