import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { sdks } from "@/config/sdk";

export const metadata: Metadata = {
  title: "SDKs",
  description: "SDKs oficiales de Falconext para JavaScript, TypeScript, PHP, Laravel, Python, Java, .NET y Go.",
};

const statusTone = { available: "green", beta: "amber", planned: "neutral" } as const;
const statusLabel = { available: "Estable", beta: "Beta", planned: "Próximamente" } as const;

export default function SdkPage() {
  return (
    <>
      <span data-wide className="hidden" aria-hidden />
      <header className="mb-6">
        <p className="eyebrow mb-2">Librerías oficiales</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">SDKs</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Envoltorios idiomáticos sobre la API REST, con tipos, reintentos y manejo de
          errores incluidos. Instala, autentica y crea tu primera entrega en minutos.
        </p>
      </header>

      {/* Índice de lenguajes */}
      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sdks.map((sdk) => (
          <a
            key={sdk.id}
            href={`#${sdk.id}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-app bg-surface px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:border-violet-500/40 hover:text-fg"
          >
            {sdk.label}
            <Badge tone={statusTone[sdk.status]}>{statusLabel[sdk.status]}</Badge>
          </a>
        ))}
      </div>

      <Callout type="tip" title="¿Falta tu lenguaje?">
        Cualquier cliente HTTP funciona con la API REST. Mira los <a href="/logistica/2025-07-01/examples">ejemplos</a> o
        genera un cliente desde el <a href="/logistica/2025-07-01/reference">spec OpenAPI</a>.
      </Callout>

      <div className="mt-4">
        {sdks.map((sdk) => (
          <section key={sdk.id} id={sdk.id} className="scroll-mt-24 border-t border-app py-10 first:border-t-0">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-semibold text-fg">{sdk.label}</h2>
              <Badge tone={statusTone[sdk.status]}>{statusLabel[sdk.status]}</Badge>
            </div>
            <p className="mb-4 text-[0.85rem] text-subtle">Crear un pedido de entrega con el SDK de {sdk.label}.</p>
            <CodeBlock code={sdk.install} lang={sdk.installLang} filename="Instalación" />
            <CodeBlock code={sdk.createSnippet} lang={sdk.lang} filename={`orders.create · ${sdk.label}`} />
          </section>
        ))}
      </div>
    </>
  );
}
