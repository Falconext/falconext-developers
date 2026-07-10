import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-app bg-surface p-5 transition-colors",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Tarjeta enlazable con hover de marca — usada en índices de guías e integraciones. */
export function LinkCard({
  href,
  title,
  description,
  icon,
  external = false,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const isExternal = external || href.startsWith("http");
  return (
    <Link
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "group relative flex flex-col gap-2 rounded-card border border-app bg-surface p-5 transition-all hover:border-violet-500/40 hover:bg-elevated",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-violet-400">{icon}</span>}
          <h3 className="font-display text-[0.95rem] font-semibold text-fg">{title}</h3>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-400" />
      </div>
      {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
    </Link>
  );
}
