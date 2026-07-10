import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/content/mdx-components";

/**
 * Componentes MDX globales. Next.js usa este archivo para mapear los elementos
 * markdown a nuestros componentes de diseño (headings anclados, code blocks,
 * callouts, tablas, etc.). Toda la definición vive en un único lugar reutilizable.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
