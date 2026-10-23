import { cn } from "@/lib/utils";
import { esKrezka } from "@/config/brand";

/**
 * Marca Falconext Developers. El glifo es un nodo de entrega: un punto de origen
 * violeta enlazado a un destino ámbar por una arista — el ADN logístico del portal.
 */
export function LogoMark({ className }: { className?: string }) {
  if (esKrezka) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/brand/krezka-mark.png" alt="" aria-hidden="true" className={cn("h-7 w-auto", className)} />;
  }
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
    >
      <defs>
        <linearGradient id="fx-node" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8A38F5" />
          <stop offset="1" stopColor="#FFAB00" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#fx-node)" opacity="0.12" />
      <path d="M8 22 L14 12 L20 20 L24 10" stroke="url(#fx-node)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="22" r="2.6" fill="#8A38F5" />
      <circle cx="24" cy="10" r="2.6" fill="#FFAB00" />
    </svg>
  );
}

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {withWordmark && (
        <span className="flex items-baseline gap-1.5 font-display text-[0.95rem] font-semibold tracking-tight">
          {esKrezka ? "Krezka" : "Falconext"}
          <span className="rounded bg-violet-500/12 px-1.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-widest text-violet-400">
            dev
          </span>
        </span>
      )}
    </span>
  );
}
