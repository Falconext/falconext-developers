import type { Metadata } from "next";
import { FaqAccordion, type FaqItem } from "@/components/content/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Preguntas frecuentes sobre la integración con Falconext.",
};

const faqs: FaqItem[] = [
  {
    q: "¿Necesito una cuenta para probar la API?",
    a: "Sí. Crea una cuenta gratuita en la consola y genera una API key de pruebas (sk_test_) para usar el Sandbox sin costo ni efectos reales.",
  },
  {
    q: "¿Cuál es la diferencia entre Sandbox y Producción?",
    a: "Sandbox usa claves sk_test_ y simula entregas: ideal para desarrollar. Producción usa claves sk_live_ y genera entregas reales. El código es idéntico; solo cambian la key y el host.",
  },
  {
    q: "¿Debo hacer polling para conocer el estado de una entrega?",
    a: "No. Usa webhooks: Falconext te notifica cada cambio de estado en tiempo real (order.created, assigned, picked_up, in_transit, delivered). El polling desperdicia tu cuota de rate limit.",
  },
  {
    q: "¿Cómo verifico que un webhook viene de Falconext?",
    a: "Cada request incluye la cabecera Falconext-Signature. Calcula el HMAC SHA-256 del cuerpo con el secret de tu endpoint y compáralo en tiempo constante. Descarta los que no coincidan.",
  },
  {
    q: "¿Qué pasa si mi servidor no responde a un webhook?",
    a: "Reintentamos con backoff exponencial hasta 24 horas. Responde con un 2xx en menos de 5 segundos para confirmar la recepción.",
  },
  {
    q: "¿La API tiene límites de tasa?",
    a: "Sí. Cada respuesta incluye cabeceras RateLimit-*. Si superas el límite recibes un 429; respeta la cabecera Retry-After. Revisa la página de Rate limits para más detalle.",
  },
  {
    q: "¿En qué lenguajes hay SDK oficial?",
    a: "JavaScript, TypeScript, PHP, Laravel, Python, Java, .NET y Go. Y como la API es REST estándar, cualquier cliente HTTP funciona.",
  },
  {
    q: "¿Cómo reporto un problema o pido una integración nueva?",
    a: "Escríbenos desde la página de Soporte. Para integraciones específicas (ERP, ecommerce, marketplace) las priorizamos según demanda.",
  },
];

export default function FaqPage() {
  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">Preguntas frecuentes</p>
        <h1 className="font-display text-[2.15rem] font-bold tracking-tight text-fg">FAQ</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Las dudas más comunes al integrar con Falconext. ¿No encuentras la tuya?{" "}
          <a href="/docs/soporte" className="font-medium text-violet-400 hover:underline">Escríbenos</a>.
        </p>
      </header>

      <FaqAccordion items={faqs} />
    </>
  );
}
