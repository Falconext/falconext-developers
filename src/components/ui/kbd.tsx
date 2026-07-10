import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-app bg-elevated px-1.5 font-mono text-[0.6875rem] font-medium text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
