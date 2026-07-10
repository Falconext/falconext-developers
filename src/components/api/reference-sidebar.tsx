"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MethodBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RefNavGroup = {
  name: string;
  operations: { slug: string; method: string; summary: string }[];
};

/**
 * Sidebar de la API Reference: una entrada por operación, agrupadas por tag.
 * Escala a cientos de endpoints porque cada operación es una página propia.
 */
export function ReferenceSidebar({
  groups,
  basePath,
  className,
}: {
  groups: RefNavGroup[];
  basePath: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("pb-16 pr-2", className)} aria-label="Referencia de la API">
      <Link
        href={basePath}
        className={cn(
          "mb-4 block rounded-md px-2 py-1.5 text-[0.8125rem] font-medium transition-colors",
          pathname === basePath ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        Introducción
      </Link>
      {groups.map((group) => (
        <div key={group.name} className="mb-6">
          <p className="eyebrow mb-2 px-2">{group.name}</p>
          <ul className="space-y-px border-l border-app">
            {group.operations.map((op) => {
              const href = `${basePath}/${op.slug}`;
              const active = pathname === href;
              return (
                <li key={op.slug} className="relative">
                  {active && (
                    <span className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-violet-500" />
                  )}
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-r-md py-1.5 pl-3 pr-2 text-[0.8125rem] transition-colors",
                      active ? "font-medium text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <MethodBadge method={op.method} className="min-w-[2.75rem] scale-90" />
                    <span className="truncate">{op.summary}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
