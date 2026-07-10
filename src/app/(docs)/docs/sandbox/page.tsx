import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { Playground } from "@/components/api/playground";
import { Callout } from "@/components/ui/callout";
import { getPlaygroundData } from "@/lib/openapi/playground";
import { resolveProductVersion } from "@/config/products";

export const metadata: Metadata = {
  title: "Sandbox",
  description: "Prueba los endpoints de Falconext con tu API key directamente desde el navegador.",
};

export default async function SandboxPage() {
  // TODO(multi-producto): hacer el sandbox consciente de producto/versión vía ruta.
  const resolved = resolveProductVersion("logistica", "latest");
  const data = await getPlaygroundData(resolved!.version.specPath);

  return (
    <>
      <span data-wide className="hidden" aria-hidden />
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-amber-signal" />
          <span className="eyebrow">Playground · Live</span>
        </div>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">Sandbox</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Elige un endpoint, pega tu API key de pruebas y envía solicitudes reales sin
          salir del navegador. El código se genera al vuelo para que lo copies a tu proyecto.
        </p>
      </header>

      <Callout type="tip" title="Usa una API key de pruebas">
        Genera una clave <code>fx_test_…</code> desde la consola. Las solicitudes se envían
        desde tu navegador al entorno seleccionado; nunca pasan por Falconext Developers.
      </Callout>

      <div className="mt-6">
        <Playground data={data} />
      </div>
    </>
  );
}
