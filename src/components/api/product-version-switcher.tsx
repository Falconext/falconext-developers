"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Box } from "lucide-react";
import { cn } from "@/lib/utils";

type Opt = { id: string; label: string; disabled?: boolean };

/**
 * Selector de producto y de versión. Cambiar de producto/versión reescribe la URL
 * `/{product}/{version}/…`. Es el eje de un portal multi-API.
 */
export function ProductVersionSwitcher({
  product,
  version,
  products,
  versions,
  className,
}: {
  product: string;
  version: string;
  products: Opt[];
  versions: Opt[];
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Select
        icon={<Box className="h-3.5 w-3.5 text-violet-400" />}
        value={product}
        options={products}
        onChange={(id) => {
          if (id !== product) router.push(`/${id}/latest/reference`);
        }}
        ariaLabel="Producto"
      />
      <Select
        value={version}
        options={versions}
        onChange={(id) => {
          if (id !== version) router.push(`/${product}/${id}/reference`);
        }}
        ariaLabel="Versión"
        mono
      />
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
  ariaLabel,
  icon,
  mono,
}: {
  value: string;
  options: Opt[];
  onChange: (id: string) => void;
  ariaLabel: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">{icon}</span>}
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-app bg-surface pr-8 text-[0.8rem] text-fg outline-none transition-colors hover:border-strong focus:border-violet-500/50",
          icon ? "pl-8" : "pl-3",
          mono && "font-mono text-[0.75rem]",
        )}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
    </div>
  );
}
