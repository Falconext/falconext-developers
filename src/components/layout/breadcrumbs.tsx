import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { title: string; href: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-[0.78rem] text-subtle">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.href}-${i}`} className="flex items-center gap-1">
              {last ? (
                <span className="font-medium text-muted" aria-current="page">
                  {item.title}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-fg">
                  {item.title}
                </Link>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
