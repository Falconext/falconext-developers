import { cn } from "@/lib/utils";

type Tone = "neutral" | "violet" | "amber" | "green" | "red" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-elevated text-muted border-app",
  violet: "bg-violet-500/12 text-violet-400 border-violet-500/25",
  amber: "bg-amber-signal/12 text-amber-signal border-amber-signal/25",
  green: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  red: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  blue: "bg-sky-500/12 text-sky-400 border-sky-500/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  mono = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.6875rem] font-medium leading-none",
        mono && "font-mono uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Píldora de método HTTP con color por verbo, reutilizada en API Ref, sidebar y playground. */
const methodTone: Record<string, Tone> = {
  GET: "green",
  POST: "blue",
  PUT: "amber",
  PATCH: "violet",
  DELETE: "red",
};

export function MethodBadge({ method, className }: { method: string; className?: string }) {
  const m = method.toUpperCase();
  return (
    <Badge tone={methodTone[m] ?? "neutral"} mono className={cn("min-w-[3.25rem] justify-center", className)}>
      {m}
    </Badge>
  );
}
