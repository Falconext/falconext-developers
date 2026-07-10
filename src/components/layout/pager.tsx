import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NavLink } from "@/config/navigation";

export function DocsPager({ prev, next }: { prev: NavLink | null; next: NavLink | null }) {
  if (!prev && !next) return null;
  return (
    <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-app pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-card border border-app p-4 transition-colors hover:border-violet-500/40"
        >
          <span className="flex items-center gap-1 text-[0.72rem] text-subtle">
            <ArrowLeft className="h-3.5 w-3.5" /> Anterior
          </span>
          <span className="font-medium text-fg group-hover:text-violet-400">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-card border border-app p-4 text-right transition-colors hover:border-violet-500/40"
        >
          <span className="flex items-center gap-1 text-[0.72rem] text-subtle">
            Siguiente <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-fg group-hover:text-violet-400">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
