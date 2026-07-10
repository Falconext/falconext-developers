import Link from "next/link";
import { ArrowUpRight, Truck, Boxes, ReceiptText, ShoppingBag, Users, Store, type LucideIcon } from "lucide-react";
import { products, productHref } from "@/config/products";
import { Badge } from "@/components/ui/badge";

const icons: Record<string, LucideIcon> = { Truck, Boxes, ReceiptText, ShoppingBag, Users, Store };

const statusMeta = {
  ga: { label: "Disponible", tone: "green" as const },
  beta: { label: "Beta", tone: "amber" as const },
  planned: { label: "Próximamente", tone: "neutral" as const },
};

export function Ecosystem() {
  return (
    <section id="ecosistema" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">El ecosistema Falconext</p>
        <h2 className="text-balance font-display text-[2rem] font-semibold tracking-tight sm:text-[2.4rem]">
          Una plataforma, muchas APIs
        </h2>
        <p className="mt-4 text-muted">
          Empieza con Logística e integra el resto del ecosistema a medida que crece tu
          operación. Todas las APIs comparten autenticación, convenciones y este portal.
        </p>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const Icon = icons[product.icon] ?? Truck;
          const meta = statusMeta[product.status];
          const documented = product.versions.length > 0;
          const className = `group relative flex flex-col gap-3 rounded-card border border-app bg-surface p-6 transition-all ${documented ? "hover:border-violet-500/40 hover:bg-elevated" : "opacity-70"}`;
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${product.accent}1f`, color: product.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {documented ? (
                  <ArrowUpRight className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-400" />
                ) : (
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[1.05rem] font-semibold text-fg">{product.name}</h3>
                  {documented && <Badge tone={meta.tone}>{meta.label}</Badge>}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{product.tagline}</p>
              </div>
            </>
          );
          return documented ? (
            <Link key={product.id} href={productHref(product)} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={product.id} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
