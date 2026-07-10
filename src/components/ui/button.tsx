import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_-12px_rgba(138,56,245,0.7)] hover:bg-violet-500 active:bg-violet-700",
  secondary:
    "bg-elevated text-fg border border-app hover:border-strong hover:bg-surface",
  outline:
    "border border-strong text-fg hover:bg-elevated",
  ghost: "text-muted hover:bg-elevated hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8125rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

type CommonProps = { variant?: Variant; size?: Size; className?: string };

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonAsButton | ButtonAsLink>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);
    if ("href" in props && props.href !== undefined) {
      const { href, ...rest } = props as ButtonAsLink;
      const external = href.startsWith("http") || href.startsWith("mailto:");
      return (
        <Link
          href={href}
          className={classes}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          {...rest}
        />
      );
    }
    return <button ref={ref} className={classes} {...(props as ButtonAsButton)} />;
  },
);
Button.displayName = "Button";
