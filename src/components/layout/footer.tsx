import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { esKrezka } from "@/config/brand";

const columnasFalconext = [
  {
    title: "Logística",
    links: [
      { label: "Primeros pasos", href: "/logistica/2025-07-01/getting-started" },
      { label: "API Reference", href: "/logistica/2025-07-01/reference" },
      { label: "Webhooks", href: "/logistica/2025-07-01/webhooks" },
      { label: "Changelog", href: "/logistica/2025-07-01/changelog" },
    ],
  },
  {
    title: "Desarrolladores",
    links: [
      { label: "SDKs", href: "/docs/sdk" },
      { label: "Sandbox", href: "/docs/sandbox" },
      { label: "Postman", href: "/docs/postman" },
      { label: "Integraciones", href: "/docs/integraciones" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Ecosistema", href: "/#ecosistema" },
      { label: "Estado del servicio", href: siteConfig.links.status },
      { label: "FAQ", href: "/docs/faq" },
      { label: "Soporte", href: "/docs/soporte" },
    ],
  },
];

const columnasKrezka = [
  {
    title: "API de Krezka",
    links: [
      { label: "Primeros pasos", href: "/erp/2026-10-22/getting-started" },
      { label: "API Reference", href: "/erp/2026-10-22/reference" },
      { label: "Webhooks", href: "/erp/2026-10-22/webhooks" },
      { label: "Changelog", href: "/erp/2026-10-22/changelog" },
    ],
  },
  {
    title: "Guías",
    links: [
      { label: "Registrar ventas", href: "/erp/2026-10-22/guides/registrar-ventas" },
      { label: "Mostrar tu catálogo", href: "/erp/2026-10-22/guides/mostrar-catalogo" },
      { label: "Anular una venta", href: "/erp/2026-10-22/guides/anular-ventas" },
      { label: "Modo prueba", href: "/erp/2026-10-22/modo-prueba" },
    ],
  },
  {
    title: "Krezka",
    links: [
      { label: "Tus claves (panel)", href: "https://app.krezka.com/administrador/api-krezka" },
      { label: "krezka.com", href: "https://krezka.com" },
      { label: "Ventas", href: "mailto:ventas@krezka.com" },
    ],
  },
];

const columns = esKrezka ? columnasKrezka : columnasFalconext;

export function Footer() {
  return (
    <footer className="border-t border-app bg-subtle">
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {esKrezka ? "Tu catálogo, tu stock y tus ventas con boleta o factura, desde tu web." : "La API de logística de Falconext. Integra tus sistemas y lleva tus entregas a producción."}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-3">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-app pt-6 text-[0.78rem] text-subtle sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {esKrezka ? "Krezka" : "Falconext"}. Hecho en Perú.</p>
          <div className="flex items-center gap-5">
            <Link href={siteConfig.links.website} className="hover:text-fg">{esKrezka ? "krezka.com" : "falconext.com"}</Link>
            <Link href={esKrezka ? "/erp/2026-10-22/changelog" : "/logistica/2025-07-01/versions"} className="hover:text-fg">v{siteConfig.currentApiVersion}</Link>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Operativo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
