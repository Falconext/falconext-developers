"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Braces, Package, BookOpen, Blocks, type LucideIcon } from "lucide-react";
import { docsNav } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Sparkles,
  Braces,
  Package,
  BookOpen,
  Blocks,
};

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("pb-16 pr-2", className)} aria-label="Navegación de documentación">
      {docsNav.map((group) => {
        const Icon = group.icon ? icons[group.icon] : null;
        return (
          <div key={group.title} className="mb-6">
            <div className="mb-2 flex items-center gap-2 px-2">
              {Icon && <Icon className="h-3.5 w-3.5 text-violet-400" />}
              <p className="eyebrow">{group.title}</p>
            </div>
            <ul className="space-y-px border-l border-app">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="relative">
                    {active && (
                      <span className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-violet-500" />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-r-md py-1.5 pl-4 pr-2 text-[0.8125rem] transition-colors",
                        active
                          ? "font-medium text-fg"
                          : "text-muted hover:text-fg",
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge tone={item.badge === "Live" ? "amber" : "violet"} className="shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
