"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ConceptNav, type ConceptNavGroup } from "./concept-nav";
import { ReferenceSidebar, type RefNavGroup } from "./reference-sidebar";
import { ProductVersionSwitcher } from "./product-version-switcher";

type Opt = { id: string; label: string };

/**
 * Navegación de la doc del producto para móvil/tablet (<lg): un botón sticky que
 * abre un drawer con el MISMO árbol del sidebar (switchers + conceptos + referencia).
 * Cierra el hueco de que en móvil el sidebar del producto está oculto.
 */
export function ProductMobileNav({
  productName,
  versionLabel,
  overviewHref,
  conceptGroups,
  conceptBase,
  referenceGroups,
  referenceBase,
  product,
  version,
  productOpts,
  versionOpts,
}: {
  productName: string;
  versionLabel: string;
  overviewHref: string;
  conceptGroups: ConceptNavGroup[];
  conceptBase: string;
  referenceGroups: RefNavGroup[];
  referenceBase: string;
  product: string;
  version: string;
  productOpts: Opt[];
  versionOpts: Opt[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el drawer al navegar y bloquea el scroll del body mientras está abierto.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="lg:hidden" data-pagefind-ignore>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir navegación de la documentación"
        className="sticky top-16 z-30 -mx-4 mb-4 flex w-[calc(100%+2rem)] items-center gap-2 border-b border-app bg-app/85 px-4 py-2.5 text-sm font-medium text-fg backdrop-blur-xl sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6"
      >
        <Menu className="h-4 w-4 text-violet-400" />
        {productName}
        <span className="ml-auto font-mono text-[0.72rem] text-subtle">{versionLabel}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
          <button
            aria-label="Cerrar navegación"
            className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-strong bg-elevated">
            <div className="flex items-center justify-between border-b border-app px-4 py-3">
              <span className="font-display text-sm font-semibold text-fg">{productName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app text-muted hover:bg-surface hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-6">
                <ProductVersionSwitcher
                  product={product}
                  version={version}
                  products={productOpts}
                  versions={versionOpts}
                />
              </div>
              <div className="mb-6">
                <Link
                  href={overviewHref}
                  className="block rounded-md px-2 py-1.5 text-[0.8125rem] text-muted transition-colors hover:text-fg"
                >
                  Overview
                </Link>
              </div>
              <ConceptNav groups={conceptGroups} basePath={conceptBase} />
              <p className="eyebrow mb-2 px-2">API Reference</p>
              <ReferenceSidebar groups={referenceGroups} basePath={referenceBase} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
