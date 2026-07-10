import { Sidebar } from "@/components/layout/sidebar";
import { TableOfContents } from "@/components/layout/toc";
import { AutoBreadcrumbs, AutoPager } from "@/components/layout/auto-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
        {/* Sidebar izquierdo fijo */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto py-8">
            <Sidebar />
          </div>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 py-8 lg:py-10">
          <AutoBreadcrumbs />
          <article id="doc-article">
            {children}
            <AutoPager />
          </article>
        </main>

        {/* TOC derecho */}
        <aside className="hidden xl:block">
          <div className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto py-10">
            <TableOfContents />
          </div>
        </aside>
      </div>
    </div>
  );
}
