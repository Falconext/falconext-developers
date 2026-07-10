import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeGroup } from "@/components/ui/code-group";
import { sdks } from "@/config/sdk";

export async function SdkPreview() {
  const snippets = sdks
    .filter((s) => s.status !== "planned")
    .slice(0, 6)
    .map((s) => ({ label: s.label, lang: s.lang, code: s.createSnippet }));

  return (
    <section className="border-y border-app bg-subtle/50">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-3">SDKs oficiales</p>
          <h2 className="text-balance font-display text-[2rem] font-semibold tracking-tight sm:text-[2.4rem]">
            Tu lenguaje, tu forma de trabajar
          </h2>
          <p className="mt-4 text-muted">
            El mismo request en cada SDK. Instala, autentica y crea tu primera entrega
            en minutos, con tipos y autocompletado incluidos.
          </p>
          <Link
            href="/docs/sdk"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:underline"
          >
            Ver todos los SDKs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="min-w-0">
          <CodeGroup snippets={snippets} title="orders.create" />
        </div>
      </div>
    </section>
  );
}
