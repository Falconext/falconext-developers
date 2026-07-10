import type { Metadata } from "next";
import { Mail, MessageCircle, BookOpen, Activity, Github } from "lucide-react";
import { LinkCard } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Soporte técnico",
  description: "Canales de soporte para desarrolladores que integran con Falconext.",
};

export default function SoportePage() {
  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">Estamos para ayudarte</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">Soporte técnico</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          ¿Bloqueado en una integración? Elige el canal que prefieras. Para reportes de
          incidentes incluye tu <code className="font-mono text-[0.85em]">delivery id</code> o el
          <code className="font-mono text-[0.85em]"> request id</code> de la respuesta.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard
          href={siteConfig.links.support}
          title="Correo a developers@"
          description="Respondemos dudas de integración en horario laboral (GMT-5)."
          icon={<Mail className="h-4 w-4" />}
        />
        <LinkCard
          href={siteConfig.links.github}
          title="GitHub"
          description="Issues de los SDKs y ejemplos oficiales."
          icon={<Github className="h-4 w-4" />}
        />
        <LinkCard
          href="/docs/faq"
          title="FAQ"
          description="Las preguntas más comunes, resueltas."
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <LinkCard
          href={siteConfig.links.status}
          title="Estado del servicio"
          description="¿Algo no responde? Verifica la disponibilidad."
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="mt-10 rounded-card border border-app bg-subtle/50 p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          <h2 className="font-display text-lg font-semibold text-fg">Antes de escribir</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>· Revisa la <a href="/logistica/2025-07-01/reference" className="text-violet-400 hover:underline">API Reference</a> y los <a href="/logistica/2025-07-01/errors" className="text-violet-400 hover:underline">códigos de error</a>.</li>
          <li>· Reproduce el request en el <a href="/docs/sandbox" className="text-violet-400 hover:underline">Sandbox</a>.</li>
          <li>· Ten a mano el request id, el timestamp y el entorno (test / live).</li>
        </ul>
      </div>
    </>
  );
}
