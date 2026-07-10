"use client";

import { Search } from "lucide-react";
import { useSearch } from "./search-provider";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export function SearchButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { setOpen } = useSearch();

  if (compact) {
    return (
      <button
        type="button"
        aria-label="Buscar"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app text-muted hover:bg-elevated hover:text-fg",
          className,
        )}
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "group inline-flex h-9 w-full items-center gap-2 rounded-lg border border-app bg-subtle px-3 text-sm text-subtle transition-colors hover:border-strong sm:w-64",
        className,
      )}
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Buscar…</span>
      <span className="hidden items-center gap-1 sm:flex">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}
