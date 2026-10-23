import Link from "next/link";
import { ArrowRight, BellRing, Boxes, FileText, KeyRound, Receipt, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { siteConfig } from "@/config/site";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const V = "/erp/2026-10-22";

const ventaEjemplo = `curl -X POST https://api.krezka.com/api/v1/erp/sales \\
  -H "Authorization: Bearer sk_test_••••••••" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "items": [
      { "description": "Polera algodón talla M", "quantity": 2, "unit_price": 59 },
      { "description": "Envío a domicilio", "quantity": 1, "unit_price": 12, "unit": "ZZ" }
    ],
    "payment": { "method": "card" },
    "external_id": "PEDIDO-1001"
  }'`;

const usos = [
  {
    icono: Receipt,
    titulo: "Boletas y facturas desde tu web",
    texto: "Cada pedido emite su comprobante ante SUNAT, igual que en tu POS: con tu catálogo de Krezka o solo facturando.",
    href: `${V}/guides/registrar-ventas`,
  },
  {
    icono: Boxes,
    titulo: "Tu catálogo y tu stock",
    texto: "Productos con precio, ofertas, fotos, tallas y stock disponible por sede. Crea productos y ajusta el stock con su kardex.",
    href: `${V}/guides/mostrar-catalogo`,
  },
  {
    icono: BellRing,
    titulo: "Avisos automáticos",
    texto: "Tu servidor se entera solo cuando SUNAT acepta, rechaza o se anula una venta. Firmados con HMAC.",
    href: `${V}/webhooks`,
  },
  {
    icono: FileText,
    titulo: "PDF y anulaciones",
    texto: "El PDF de cada venta en A4 o ticket, y anulaciones con su nota de crédito cuando corresponde.",
    href: `${V}/guides/anular-ventas`,
  },
  {
    icono: ShieldCheck,
    titulo: "Modo prueba",
    texto: "Con una clave sk_test_ todo se valida de verdad contra tu negocio, pero nada se guarda ni va a SUNAT.",
    href: `${V}/modo-prueba`,
  },
  {
    icono: KeyRound,
    titulo: "Tus claves, en tu panel",
    texto: "Las creas en Krezka → API de Krezka, con un probador para ejecutar cada llamada y el código en curl, JavaScript y PHP.",
    href: siteConfig.links.dashboard,
  },
];

/** La portada de developers.krezka.com. */
export function KrezkaHome() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid mask-fade-b opacity-[0.5]" />
          <div className="absolute left-1/2 top-[-8rem] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute right-[-6rem] top-[8rem] h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-[110px]" />
        </div>
        <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <StaggerGroup mode="load" delay={0.05} stagger={0.09}>
              <StaggerItem>
                <h1 className="text-balance font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-[3.4rem]">
                  La API de Krezka
                  <br />
                  <span className="text-gradient">para tu negocio</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-6 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">
                  Conecta tu página web o tu sistema con Krezka: muestra tu catálogo con stock al día y emite cada venta
                  con su boleta o factura electrónica ante SUNAT, sin tocar XML ni certificados.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button href={`${V}/getting-started`} size="lg" className="group">
                    Comenzar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button href={`${V}/reference`} variant="secondary" size="lg">
                    <Terminal className="h-4 w-4" />
                    API Reference
                  </Button>
                </div>
              </StaggerItem>
            </StaggerGroup>
            <div className="overflow-hidden rounded-card border border-app bg-surface shadow-2xl">
              <CodeBlock code={ventaEjemplo} lang="bash" hideHeader className="my-0 rounded-none border-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">Qué puedes hacer</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usos.map(({ icono: Icono, titulo, texto, href }) => (
            <Link
              key={titulo}
              href={href}
              className="group flex h-full flex-col gap-3 rounded-card border border-app bg-surface p-6 transition-colors hover:border-violet-500/40 hover:bg-elevated"
            >
              <Icono className="h-5 w-5 text-violet-400" />
              <p className="font-semibold">{titulo}</p>
              <p className="text-sm leading-relaxed text-muted">{texto}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
