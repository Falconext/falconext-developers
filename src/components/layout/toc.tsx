"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; text: string; level: number };

/**
 * Tabla de contenido derivada del DOM del artículo. Observa los headings con
 * IntersectionObserver para resaltar la sección visible.
 */
export function TableOfContents({ className }: { className?: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.getElementById("doc-article");
    if (!article) return;
    const headings = Array.from(article.querySelectorAll("h2, h3")) as HTMLElement[];
    const collected = headings
      .filter((h) => h.id)
      .map((h) => ({ id: h.id, text: h.textContent ?? "", level: Number(h.tagName[1]) }));
    setItems(collected);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label="En esta página">
      <p className="eyebrow mb-3">En esta página</p>
      <ul className="space-y-1 border-l border-app">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-1 leading-snug transition-colors",
                item.level === 3 ? "pl-6" : "pl-3",
                activeId === item.id
                  ? "border-violet-500 text-fg"
                  : "border-transparent text-subtle hover:text-muted",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
