import Link from "next/link";
import { ArrowRight, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DeliveryRail } from "@/components/brand/delivery-rail";
import { siteConfig } from "@/config/site";

const requestSample = `curl https://api.falconext.pe/api/v1/logistics/orders \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_order_id": "ORD-10482",
    "customer": { "name": "María Fernández", "phone": "+51987654321" },
    "delivery_address": { "address": "Calle Los Pinos 120, Miraflores", "city": "Lima" },
    "items": [{ "description": "Polo talla M", "quantity": 2 }],
    "cash_on_delivery": 120.00
  }'`;

export async function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Atmósfera de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-[0.5]" />
        <div className="absolute left-1/2 top-[-8rem] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute right-[-6rem] top-[8rem] h-[20rem] w-[20rem] rounded-full bg-amber-signal/10 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* Columna izquierda: tesis */}
          <div>
            <Link
              href="/logistica/2025-07-01/changelog"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-app bg-subtle px-3 py-1 text-[0.78rem] text-muted transition-colors hover:border-strong"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[0.68rem] text-violet-400">
                <Zap className="h-3 w-3" /> v{siteConfig.currentApiVersion}
              </span>
              <span className="h-3 w-px bg-border-strong" style={{ backgroundColor: "var(--border-strong)" }} />
              Webhooks de ciclo de vida ya disponibles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="text-balance font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-[3.4rem]">
              La API de logística
              <br />
              <span className="text-gradient">para tu operación</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">
              Conecta tu ERP, ecommerce, WMS u OMS con Falconext Logística. Crea
              entregas, sigue cada estado en tiempo real por webhooks y lleva tu
              last-mile a producción en una tarde.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/logistica/2025-07-01/getting-started" size="lg" className="group">
                Comenzar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href="/logistica" variant="secondary" size="lg">
                <Terminal className="h-4 w-4" />
                Explorar API
              </Button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { k: "99.98%", v: "uptime de la API" },
                { k: "<120ms", v: "latencia p50" },
                { k: "7", v: "eventos de entrega" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-semibold text-fg">{s.k}</dt>
                  <dd className="mt-0.5 font-mono text-[0.72rem] uppercase tracking-wider text-subtle">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Columna derecha: código → eventos */}
          <div className="relative">
            <div className="glow-violet rounded-2xl border border-strong bg-elevated p-1.5">
              <div className="rounded-xl bg-app">
                <div className="flex items-center gap-2 border-b border-app px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-signal/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 font-mono text-[0.7rem] text-subtle">POST /v1/orders</span>
                </div>
                <CodeBlock code={requestSample} lang="bash" hideHeader className="my-0 rounded-none border-0" />
              </div>
            </div>
            <p className="mt-3 px-1 font-mono text-[0.7rem] text-subtle">
              # una entrega creada emite eventos por todo su ciclo de vida ↓
            </p>
          </div>
        </div>

        {/* Firma: el riel del ciclo de vida cruza todo el hero */}
        <div className="mt-16 rounded-2xl border border-app bg-subtle/60 p-6 sm:p-8">
          <DeliveryRail />
        </div>
      </div>
    </section>
  );
}
