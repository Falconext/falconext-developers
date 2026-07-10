"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchButton } from "@/components/search/search-button";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { label: "Productos", href: "/#ecosistema", match: "/#ecosistema" },
  { label: "Documentación", href: "/logistica/2025-07-01/getting-started", match: "/logistica" },
  { label: "API Reference", href: "/logistica", match: "/logistica/2025-07-01/reference" },
  { label: "SDKs", href: "/docs/sdk", match: "/docs/sdk" },
  { label: "Changelog", href: "/logistica/2025-07-01/changelog", match: "/changelog" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-app bg-app/80 backdrop-blur-xl"
          : "border-transparent bg-app/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Falconext Developers — inicio" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => {
            const active = pathname.startsWith(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <SearchButton />
          </div>
          <div className="md:hidden">
            <SearchButton compact />
          </div>
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-app text-muted hover:bg-elevated hover:text-fg sm:inline-flex"
          >
            <Github className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <Button href={siteConfig.links.dashboard} size="sm" className="hidden sm:inline-flex">
            Comenzar
          </Button>
          <button
            type="button"
            aria-label="Menú"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app text-muted hover:bg-elevated lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
