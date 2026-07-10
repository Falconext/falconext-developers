"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <div className="border-t border-app bg-app/95 backdrop-blur-xl lg:hidden">
      <nav className="max-h-[70vh] overflow-y-auto px-4 py-4">
        {docsNav.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="eyebrow mb-2 px-2">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm",
                        active ? "bg-violet-500/10 font-medium text-fg" : "text-muted",
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
