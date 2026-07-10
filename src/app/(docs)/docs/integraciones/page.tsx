import type { Metadata } from "next";
import { IntegrationsGrid } from "@/components/integrations/integrations-grid";
import { Callout } from "@/components/ui/callout";

export const metadata: Metadata = {
  title: "Integraciones",
  description: "Conecta Falconext con SAP, Odoo, Shopify, WooCommerce, Mercado Libre y más.",
};

export default function IntegracionesPage() {
  return (
    <>
      <span data-wide className="hidden" aria-hidden />
      <header className="mb-8">
        <p className="eyebrow mb-2">Ecosistema</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">Integraciones</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Conectores oficiales para los sistemas que ya usas. Instala, autoriza y empieza a
          crear entregas desde tu ERP, ecommerce o marketplace sin escribir código.
        </p>
      </header>

      <IntegrationsGrid />

      <div className="mt-10">
        <Callout type="note" title="¿No ves tu sistema?">
          Toda plataforma con webhooks o API puede integrarse con la{" "}
          <a href="/logistica/2025-07-01/guides/integrar-rest">API REST</a>. Cuéntanos qué necesitas en{" "}
          <a href="/docs/soporte">soporte</a> y lo priorizamos.
        </Callout>
      </div>
    </>
  );
}
