import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const nextConfig: NextConfig = {
  // Permite usar .mdx como páginas y componentes.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  // Este portal vive en su propio repo; fija la raíz para el file-tracing.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Ajusta los dominios de imágenes remotas cuando conectes el CMS/backend.
    remotePatterns: [],
  },
  // Rutas legacy /docs/* (single-product) → nuevo modelo /{producto}/{versión}/.
  // No rompe enlaces existentes mientras se consolida el modelo multi-producto.
  async redirects() {
    const V = "/logistica/2025-07-01";
    const map: Record<string, string> = {
      "/docs/primeros-pasos": `${V}/getting-started`,
      "/docs/autenticacion": `${V}/authentication`,
      "/docs/rate-limits": `${V}/rate-limits`,
      "/docs/errores": `${V}/errors`,
      "/docs/versiones": `${V}/versions`,
      "/docs/ejemplos": `${V}/examples`,
      "/docs/webhooks": `${V}/webhooks`,
      "/docs/changelog": `${V}/changelog`,
      "/docs/guias": `${V}/getting-started`,
      "/docs/guias/generar-api-keys": `${V}/guides/generar-api-keys`,
      "/docs/guias/integrar-rest": `${V}/guides/integrar-rest`,
      "/docs/guias/integrar-webhooks": `${V}/guides/integrar-webhooks`,
      "/docs/guias/consumir-eventos": `${V}/guides/consumir-eventos`,
      "/docs/guias/sap": `${V}/guides/sap`,
      "/docs/guias/odoo": `${V}/guides/odoo`,
      "/docs/guias/shopify": `${V}/guides/shopify`,
      "/docs/guias/woocommerce": `${V}/guides/woocommerce`,
    };
    // developers.krezka.com solo documenta la API de Krezka: las páginas
    // generales de /docs (SDKs, Postman, integraciones de Logística…) llevan a
    // sus primeros pasos. El sandbox y la referencia sí son de cada marca.
    if (process.env.NEXT_PUBLIC_BRAND === "krezka") {
      return [
        { source: "/docs", destination: "/erp/2026-10-22/getting-started", permanent: false },
        {
          source: "/docs/:pagina((?!sandbox|api-reference).*)",
          destination: "/erp/2026-10-22/getting-started",
          permanent: false,
        },
      ];
    }
    return Object.entries(map).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
