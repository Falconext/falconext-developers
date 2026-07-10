"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { lifecycleStages } from "@/config/webhooks";
import { cn } from "@/lib/utils";

/**
 * FIRMA DEL PORTAL — el riel del ciclo de vida de una entrega.
 * Una línea fina con nodos que se encienden en ámbar mientras "disparan" eventos,
 * con un chip de evento que aparece en cada etapa. Es el ADN logístico de Falconext.
 */
export function DeliveryRail({ className, showEventChip = true }: { className?: string; showEventChip?: boolean }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const stages = lifecycleStages;

  useEffect(() => {
    if (reduce) {
      setActive(stages.length - 1);
      return;
    }
    const t = setInterval(() => setActive((a) => (a + 1) % stages.length), 1900);
    return () => clearInterval(t);
  }, [reduce, stages.length]);

  const progress = stages.length > 1 ? (active / (stages.length - 1)) * 100 : 0;
  const current = stages[active];

  return (
    <div className={cn("w-full", className)}>
      {showEventChip && (
        <div className="mb-6 flex h-7 items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-signal/30 bg-amber-signal/[0.08] px-3 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-signal/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-signal" />
              </span>
              <code className="font-mono text-[0.72rem] text-amber-signal">{current.name}</code>
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      <div className="relative">
        {/* Riel base */}
        <div className="absolute left-0 right-0 top-[11px] h-px bg-border-strong" style={{ backgroundColor: "var(--border-strong)" }} />
        {/* Progreso */}
        <motion.div
          className="absolute left-0 top-[11px] h-px bg-gradient-to-r from-violet-500 to-amber-signal"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />

        <ol className="relative flex justify-between">
          {stages.map((stage, i) => {
            const reached = i <= active;
            const isCurrent = i === active;
            return (
              <li key={stage.name} className="flex flex-col items-center gap-3 text-center">
                <span
                  className={cn(
                    "relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-colors duration-500",
                    reached
                      ? "border-amber-signal bg-amber-signal/20"
                      : "border-strong bg-app",
                  )}
                  style={isCurrent && !reduce ? { animation: "node-pulse 1.9s ease-in-out infinite" } : undefined}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors duration-500",
                      reached ? "bg-amber-signal" : "bg-border-strong",
                    )}
                    style={!reached ? { backgroundColor: "var(--border-strong)" } : undefined}
                  />
                </span>
                <span
                  className={cn(
                    "max-w-[4.5rem] text-[0.7rem] font-medium leading-tight transition-colors sm:max-w-none",
                    isCurrent ? "text-fg" : reached ? "text-muted" : "text-subtle",
                  )}
                >
                  {stage.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
