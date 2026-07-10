"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { integrations, statusMeta, type Integration } from "@/config/integrations";
import { cn } from "@/lib/utils";

const categories = ["Todas", "ERP", "Ecommerce", "Marketplace", "Pagos", "POS"] as const;

export function IntegrationsGrid() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");

  const filtered = useMemo(
    () => (category === "Todas" ? integrations : integrations.filter((i) => i.category === category)),
    [category],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = cat === category;
          const count = cat === "Todas" ? integrations.length : integrations.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors",
                active
                  ? "border-violet-500/40 bg-violet-500/12 text-violet-300"
                  : "border-app text-muted hover:border-strong hover:text-fg",
              )}
            >
              {cat}
              <span className="font-mono text-[0.68rem] text-subtle">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => (
          <IntegrationCard key={it.slug} integration={it} />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const meta = statusMeta[integration.status];
  const className = cn(
    "group flex flex-col gap-3 rounded-card border border-app bg-surface p-5 transition-colors",
    integration.guide && "hover:border-violet-500/40 hover:bg-elevated",
  );
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-amber-signal/15 font-display text-base font-bold text-fg">
          {integration.name.slice(0, 2)}
        </span>
        {integration.guide && (
          <ArrowUpRight className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-400" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[1rem] font-semibold text-fg">{integration.name}</h3>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">{integration.description}</p>
      </div>
      <span className="mt-auto font-mono text-[0.68rem] uppercase tracking-wider text-subtle">
        {integration.category}
      </span>
    </>
  );

  if (integration.guide) {
    return (
      <Link href={integration.guide} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
