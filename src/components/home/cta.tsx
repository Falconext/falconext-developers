import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeliveryRail } from "@/components/brand/delivery-rail";

export function HomeCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-strong bg-elevated px-6 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <div className="absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
        </div>
        <p className="eyebrow mb-4">Empieza hoy</p>
        <h2 className="mx-auto max-w-2xl text-balance font-display text-[2rem] font-semibold tracking-tight sm:text-[2.6rem]">
          Tu primera entrega por API, esta misma tarde
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Crea tu cuenta, genera una API key de pruebas y sigue la guía de primeros
          pasos. El sandbox te deja probar sin escribir una línea de backend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/logistica/2025-07-01/getting-started" size="lg" className="group">
            Comenzar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button href="/logistica/2025-07-01/reference" variant="secondary" size="lg">
            <BookOpen className="h-4 w-4" />
            Leer la referencia
          </Button>
        </div>
        <div className="mx-auto mt-14 max-w-2xl">
          <DeliveryRail showEventChip={false} />
        </div>
      </div>
    </section>
  );
}
