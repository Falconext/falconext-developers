"use client";

import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{ value: string; setValue: (v: string) => void; id: string } | null>(null);

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();
  return (
    <TabsContext.Provider value={{ value, setValue, id }}>
      <div className={cn("my-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn("flex items-center gap-1 border-b border-app", className)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger debe usarse dentro de <Tabs>");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`${ctx.id}-${value}`}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "text-fg" : "text-subtle hover:text-muted",
      )}
    >
      {children}
      {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-500" />}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent debe usarse dentro de <Tabs>");
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" id={`${ctx.id}-${value}`} className="pt-4">
      {children}
    </div>
  );
}
