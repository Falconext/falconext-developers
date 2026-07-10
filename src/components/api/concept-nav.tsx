"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type ConceptNavGroup = {
  title: string;
  items: { title: string; slugPath: string }[];
};

/** Navegación de conceptos/guías (MDX) dentro de un producto/versión. */
export function ConceptNav({
  groups,
  basePath,
  className,
}: {
  groups: ConceptNavGroup[];
  basePath: string;
  className?: string;
}) {
  const pathname = usePathname();
  if (groups.length === 0) return null;

  return (
    <nav className={cn("mb-6", className)} aria-label="Guías y conceptos">
      {groups.map((group) => (
        <div key={group.title} className="mb-5">
          <p className="eyebrow mb-2 px-2">{group.title}</p>
          <ul className="space-y-px border-l border-app">
            {group.items.map((item) => {
              const href = `${basePath}/${item.slugPath}`;
              const active = pathname === href;
              return (
                <li key={item.slugPath} className="relative">
                  {active && <span className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-violet-500" />}
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-r-md py-1.5 pl-4 pr-2 text-[0.8125rem] transition-colors",
                      active ? "font-medium text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {item.title}
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
