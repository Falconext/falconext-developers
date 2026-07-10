import { cn } from "@/lib/utils";

/**
 * Pasos numerados para procesos reales (quickstart, integraciones).
 * El número codifica secuencia — sólo úsalo cuando el orden importa.
 */
export function Steps({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "my-8 [counter-reset:step] [&>*]:relative [&>*]:border-l [&>*]:border-app [&>*]:pb-8 [&>*]:pl-9 [&>*:last-child]:border-transparent [&>*:last-child]:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="[counter-increment:step]">
      <span
        className="absolute -left-[15px] top-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-app bg-elevated font-mono text-[0.72rem] font-semibold text-violet-400 before:[content:counter(step)]"
        aria-hidden
      />
      <h3 className="mb-2 mt-0 font-display text-[1.05rem] font-semibold text-fg">{title}</h3>
      <div className="text-sm leading-relaxed text-muted [&>p:first-child]:mt-0">{children}</div>
    </div>
  );
}
