import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

const columns = [
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

export function Footer() {
  return (
    <footer className="border-t border-app bg-subtle">
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              La API de logística de Falconext. Integra tus sistemas y lleva tus entregas a producción.
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
          <p>© {new Date().getFullYear()} Falconext. Hecho en Perú.</p>
          <div className="flex items-center gap-5">
            <Link href={siteConfig.links.website} className="hover:text-fg">falconext.com</Link>
            <Link href="/logistica/2025-07-01/versions" className="hover:text-fg">v{siteConfig.currentApiVersion}</Link>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Operativo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
