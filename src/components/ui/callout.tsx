import { AlertTriangle, Info, Lightbulb, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "note" | "tip" | "warning" | "danger" | "success";

const config: Record<Kind, { icon: typeof Info; ring: string; iconColor: string; label: string }> = {
  note: { icon: Info, ring: "border-sky-500/25 bg-sky-500/[0.06]", iconColor: "text-sky-400", label: "Nota" },
  tip: { icon: Lightbulb, ring: "border-violet-500/25 bg-violet-500/[0.06]", iconColor: "text-violet-400", label: "Tip" },
  warning: { icon: AlertTriangle, ring: "border-amber-signal/30 bg-amber-signal/[0.07]", iconColor: "text-amber-signal", label: "Atención" },
  danger: { icon: ShieldAlert, ring: "border-rose-500/25 bg-rose-500/[0.06]", iconColor: "text-rose-400", label: "Importante" },
  success: { icon: CheckCircle2, ring: "border-emerald-500/25 bg-emerald-500/[0.06]", iconColor: "text-emerald-400", label: "Listo" },
};

export function Callout({
  type = "note",
  title,
  children,
  className,
}: {
  type?: Kind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, ring, iconColor, label } = config[type];
  return (
    <div className={cn("my-6 flex gap-3 rounded-card border p-4", ring, className)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} aria-hidden />
      <div className="min-w-0 text-sm leading-relaxed text-fg [&>p]:m-0 [&>p+p]:mt-2">
        {title && <p className="mb-1 font-medium text-fg">{title}</p>}
        {!title && <span className="sr-only">{label}: </span>}
        {children}
      </div>
    </div>
  );
}
