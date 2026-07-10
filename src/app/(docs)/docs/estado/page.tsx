import type { Metadata } from "next";
import { ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Estado del servicio",
  description: "Disponibilidad y salud de la API de Falconext en tiempo real.",
};

const components = [
  { name: "API REST", status: "operational" },
  { name: "Webhooks", status: "operational" },
  { name: "Sandbox", status: "operational" },
  { name: "Consola", status: "operational" },
];

export default function EstadoPage() {
  return (
    <>
      <header className="mb-6">
        <p className="eyebrow mb-2">Disponibilidad</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">Estado del servicio</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Consulta la salud de cada componente. El estado en vivo, el histórico de incidentes
          y las suscripciones viven en el status page dedicado.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3 rounded-card border border-emerald-500/25 bg-emerald-500/[0.06] px-5 py-4">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <div>
          <p className="font-medium text-fg">Todos los sistemas operativos</p>
          <p className="text-[0.8rem] text-muted">Uptime de 99.98% en los últimos 90 días.</p>
        </div>
        <Button href={siteConfig.links.status} variant="secondary" size="sm" className="ml-auto">
          <Activity className="h-4 w-4" />
          Ver status page
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-app">
        {components.map((c, i) => (
          <div key={c.name} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-app" : ""}`}>
            <span className="text-sm font-medium text-fg">{c.name}</span>
            <span className="flex items-center gap-2 text-[0.8rem] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Operativo
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Callout type="note" title="Integración pendiente">
          Este panel está listo para conectarse con <code>{siteConfig.links.status}</code>. Cuando el
          status page esté activo, aquí se mostrarán los datos en vivo e incidentes históricos.
        </Callout>
      </div>
    </>
  );
}
