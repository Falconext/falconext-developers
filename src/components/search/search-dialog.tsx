"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  Webhook,
  Package,
  BookOpen,
  Braces,
  CornerDownLeft,
  Search,
} from "lucide-react";
import { buildSearchIndex, type SearchEntry } from "@/lib/search-index";
import {
  pagefindAvailable,
  pagefindSearch,
  type PagefindDoc,
} from "@/lib/pagefind";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const typeIcon = {
  page: FileText,
  endpoint: Braces,
  webhook: Webhook,
  sdk: Package,
  guide: BookOpen,
  error: FileText,
} as const;

/** Pagefind indexa `*.html` → normaliza a la ruta real de la app. */
function normalizeUrl(url: string): string {
  return url.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const index = useMemo(() => buildSearchIndex(), []);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<PagefindDoc[]>([]);
  const [searching, setSearching] = useState(false);
  // null = aún no probado; true/false = disponibilidad de Pagefind (full-text).
  const pfReady = useRef<boolean | null>(null);

  // Índice curado agrupado por sección (descubrimiento con query vacío).
  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const entry of index) {
      const arr = map.get(entry.section) ?? [];
      arr.push(entry);
      map.set(entry.section, arr);
    }
    return [...map.entries()];
  }, [index]);

  // Fallback substring sobre el índice curado (dev / si no hay Pagefind).
  const curatedMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((e) =>
      `${e.title} ${e.section} ${(e.keywords ?? []).join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }, [index, query]);

  // Probar disponibilidad de Pagefind al abrir (una vez).
  useEffect(() => {
    if (!open || pfReady.current !== null) return;
    void pagefindAvailable().then((ok) => {
      pfReady.current = ok;
    });
  }, [open]);

  // Reset al cerrar.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDocs([]);
    }
  }, [open]);

  // Buscar (debounced) con Pagefind cuando esté disponible.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setDocs([]);
      return;
    }
    let cancel = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        if (pfReady.current === null) pfReady.current = await pagefindAvailable();
        const results = pfReady.current ? await pagefindSearch(q, 8) : [];
        if (!cancel) setDocs(results);
      } catch {
        if (!cancel) setDocs([]);
      } finally {
        if (!cancel) setSearching(false);
      }
    }, 150);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [query]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const usingFullText = pfReady.current === true && docs.length > 0;
  const showCuratedFallback = hasQuery && !usingFullText;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      data-pagefind-ignore
    >
      <button
        aria-label="Cerrar búsqueda"
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <Command
        label="Buscar en la documentación"
        shouldFilter={false}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-strong bg-elevated shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-app px-4">
          <Search className="h-4 w-4 shrink-0 text-subtle" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Busca en toda la documentación…"
            className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          />
          <Kbd>Esc</Kbd>
        </div>

        <Command.List className="max-h-[52vh] overflow-y-auto p-2">
          {hasQuery && searching && docs.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-subtle">
              Buscando…
            </div>
          )}

          {hasQuery && !searching && docs.length === 0 && curatedMatches.length === 0 && (
            <Command.Empty className="px-3 py-8 text-center text-sm text-subtle">
              Sin resultados para “{query}”. Prueba con “webhooks”, “api key” o
              “rate limit”.
            </Command.Empty>
          )}

          {/* Resultados full-text (Pagefind) */}
          {usingFullText && (
            <Command.Group
              heading="Resultados"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.62rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle"
            >
              {docs.map((doc) => {
                const href = normalizeUrl(doc.url);
                return (
                  <Command.Item
                    key={doc.url}
                    value={doc.url}
                    onSelect={() => go(href)}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-sm text-muted",
                      "data-[selected=true]:bg-violet-500/10 data-[selected=true]:text-fg",
                    )}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fg">
                        {doc.meta?.title ?? href}
                      </span>
                      <span
                        className="mt-0.5 block truncate text-[0.78rem] text-subtle [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-violet-400"
                        dangerouslySetInnerHTML={{ __html: doc.excerpt }}
                      />
                    </span>
                    <CornerDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 group-data-[selected=true]:opacity-100" />
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {/* Fallback substring (dev / sin índice) */}
          {showCuratedFallback && curatedMatches.length > 0 && (
            <Command.Group
              heading="Coincidencias"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.62rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle"
            >
              {curatedMatches.map((entry) => {
                const Icon = typeIcon[entry.type];
                return (
                  <Command.Item
                    key={entry.href}
                    value={entry.href}
                    onSelect={() => go(entry.href)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted",
                      "data-[selected=true]:bg-violet-500/10 data-[selected=true]:text-fg",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-subtle" />
                    <span className="flex-1 truncate">{entry.title}</span>
                    <span className="text-[0.68rem] text-subtle">{entry.section}</span>
                    <CornerDownLeft className="h-3.5 w-3.5 opacity-0 group-data-[selected=true]:opacity-100" />
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {/* Query vacío → accesos rápidos curados (descubrimiento) */}
          {!hasQuery &&
            grouped.map(([section, entries]) => (
              <Command.Group
                key={section}
                heading={section}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.62rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle"
              >
                {entries.map((entry) => {
                  const Icon = typeIcon[entry.type];
                  return (
                    <Command.Item
                      key={entry.href}
                      value={entry.href}
                      onSelect={() => go(entry.href)}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted",
                        "data-[selected=true]:bg-violet-500/10 data-[selected=true]:text-fg",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-subtle" />
                      <span className="flex-1 truncate">{entry.title}</span>
                      <CornerDownLeft className="h-3.5 w-3.5 opacity-0 group-data-[selected=true]:opacity-100" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
        </Command.List>

        <div className="flex items-center gap-4 border-t border-app px-4 py-2.5 text-[0.7rem] text-subtle">
          <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
          <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> abrir</span>
          <span className="ml-auto font-mono">Falconext Search</span>
        </div>
      </Command>
    </div>
  );
}
