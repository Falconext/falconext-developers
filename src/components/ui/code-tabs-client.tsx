"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export type RenderedSnippet = {
  label: string;
  lang: string;
  html: string;
  raw: string;
};

export function CodeTabsClient({
  snippets,
  title,
}: {
  snippets: RenderedSnippet[];
  title?: string;
}) {
  const [active, setActive] = useState(0);
  const current = snippets[active];

  return (
    <div
      className="group relative my-6 overflow-hidden rounded-card border border-app"
      style={{ backgroundColor: "var(--bg-code)" }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-app pl-2 pr-3">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {title && (
            <span className="mr-2 shrink-0 py-2 font-mono text-[0.72rem] text-muted">{title}</span>
          )}
          {snippets.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[0.78rem] font-medium transition-colors",
                i === active ? "text-fg" : "text-subtle hover:text-muted",
              )}
            >
              {s.label}
              {i === active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-500" />
              )}
            </button>
          ))}
        </div>
        <CopyButton value={current.raw} />
      </div>
      <div
        className="overflow-x-auto px-4 py-3.5 text-sm"
        dangerouslySetInnerHTML={{ __html: current.html }}
      />
    </div>
  );
}
