import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import type { WebhookEvent } from "@/config/webhooks";

const toneBadge = {
  live: "amber",
  done: "green",
  fail: "red",
  idle: "neutral",
} as const;

export async function EventCard({ event }: { event: WebhookEvent }) {
  const anchor = event.name.replace(/\./g, "-");
  return (
    <section id={anchor} className="scroll-mt-24 border-t border-app py-8 first:border-t-0">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <code className="font-mono text-[0.95rem] font-medium text-fg">{event.name}</code>
            <Badge tone={toneBadge[event.tone]} mono>
              {event.tone === "fail" ? "excepción" : event.tone === "done" ? "final" : "ciclo"}
            </Badge>
          </div>
          <p className="leading-relaxed text-muted">{event.description}</p>
          {event.stage !== null && (
            <p className="mt-3 text-[0.8rem] text-subtle">
              Etapa {event.stage + 1} del ciclo de vida · avanza el estado de la entrega.
            </p>
          )}
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <CodeBlock code={JSON.stringify(event.payload, null, 2)} lang="json" filename={`${event.name} · payload`} />
        </div>
      </div>
    </section>
  );
}
