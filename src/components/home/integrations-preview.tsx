import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { integrations } from "@/config/integrations";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export function IntegrationsPreview() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Ecosistema</p>
            <h2 className="text-balance font-display text-[2rem] font-semibold tracking-tight sm:text-[2.4rem]">
              Conecta con lo que ya usas
            </h2>
            <p className="mt-4 text-muted">
              Integraciones nativas con los principales ERP, ecommerce, marketplaces y
              pasarelas de pago de la región. Y si no está, la API REST te cubre.
            </p>
          </div>
          <Link
            href="/docs/integraciones"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:underline"
          >
            Ver integraciones{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup
        className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        stagger={0.04}
      >
        {integrations.slice(0, 12).map((it) => (
          <StaggerItem
            key={it.slug}
            hover
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-card border border-app bg-surface p-4 text-center transition-colors hover:border-violet-500/30 hover:bg-elevated"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-amber-signal/15 font-display text-sm font-bold text-fg">
              {it.name.slice(0, 2)}
            </span>
            <span className="text-[0.8rem] font-medium text-muted">{it.name}</span>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
