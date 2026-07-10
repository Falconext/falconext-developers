import type { Metadata } from "next";
import { Download, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Steps, Step } from "@/components/content/steps";
import { Callout } from "@/components/ui/callout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Postman",
  description: "Importa la colección de Postman de Falconext y prueba la API en segundos.",
};

export default function PostmanPage() {
  return (
    <>
      <header className="mb-6">
        <p className="eyebrow mb-2">Colección lista para usar</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">Postman</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Importa la colección oficial en Postman o Insomnia, configura tus variables y empieza
          a llamar a la API sin escribir código.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-card border border-app bg-subtle/50 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-amber-signal/15 text-violet-400">
          <FileJson className="h-5 w-5" />
        </span>
        <div className="mr-auto">
          <p className="font-medium text-fg">falconext.postman_collection.json</p>
          <p className="text-[0.8rem] text-muted">Colección v2.1 · Entregas, Rastreo y Webhooks</p>
        </div>
        <Button href={siteConfig.links.postman} size="sm">
          <Download className="h-4 w-4" />
          Descargar colección
        </Button>
      </div>

      <h2 id="importar" className="scroll-mt-24 font-display text-2xl font-semibold text-fg">Cómo importarla</h2>
      <Steps>
        <Step title="Descarga la colección">
          Usa el botón de arriba para obtener el archivo <code>.json</code>.
        </Step>
        <Step title="Impórtala en Postman">
          En Postman: <strong>Import → Files</strong> y selecciona el archivo descargado.
        </Step>
        <Step title="Configura tus variables">
          Define <code>{"{{baseUrl}}"}</code> y <code>{"{{apiKey}}"}</code> en el entorno. La
          autenticación Bearer ya está preconfigurada a nivel de colección.
        </Step>
      </Steps>

      <CodeBlock
        lang="json"
        filename="Variables del entorno"
        code={`{
  "baseUrl": "https://sandbox.api.falconext.com/v1",
  "apiKey":  "fx_test_••••••••"
}`}
      />

      <Callout type="warning" title="Plantilla ilustrativa">
        Esta colección es una plantilla. Cuando conectes el OpenAPI real, puedes regenerarla
        automáticamente para mantenerla siempre sincronizada con los endpoints vigentes.
      </Callout>
    </>
  );
}
