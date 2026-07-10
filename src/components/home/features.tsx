import { KeyRound, Webhook, Package, FlaskConical, FileJson, Gauge } from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "Autenticación en un paso",
    body: "API keys por entorno con Bearer token. Sin OAuth complejo para empezar a integrar.",
  },
  {
    icon: Webhook,
    title: "Webhooks en tiempo real",
    body: "Recibe cada cambio de estado de la entrega con firma HMAC y reintentos automáticos.",
  },
  {
    icon: FileJson,
    title: "OpenAPI 3.1",
    body: "Toda la referencia se genera desde el spec. Un cambio en la API actualiza la documentación.",
  },
  {
    icon: Package,
    title: "SDKs oficiales",
    body: "JavaScript, TypeScript, PHP, Laravel, Python, Java, .NET y Go con ejemplos listos.",
  },
  {
    icon: FlaskConical,
    title: "Sandbox integrado",
    body: "Prueba cada endpoint con tu API key desde el navegador y copia el código en tu lenguaje.",
  },
  {
    icon: Gauge,
    title: "Rate limits claros",
    body: "Cabeceras de límite en cada respuesta y cuotas generosas que escalan con tu operación.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Por qué Falconext</p>
        <h2 className="text-balance font-display text-[2rem] font-semibold tracking-tight sm:text-[2.4rem]">
          Diseñada para que integrar sea lo fácil
        </h2>
        <p className="mt-4 text-muted">
          Una API REST predecible, documentación que nunca queda desactualizada y las
          herramientas para llevar tu integración de la idea a producción.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-app bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group bg-app p-6 transition-colors hover:bg-subtle">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-app bg-elevated text-violet-400 transition-colors group-hover:border-violet-500/40">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 font-display text-[1.05rem] font-semibold text-fg">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
