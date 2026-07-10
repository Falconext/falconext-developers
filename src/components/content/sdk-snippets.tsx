import { CodeGroup } from "@/components/ui/code-group";
import { sdks } from "@/config/sdk";

/**
 * Componentes semánticos para MDX que sacan sus datos de config/sdk.ts.
 * El contenido MDX los usa sin props de datos (más robusto entre renderers y DRY):
 * si cambian los SDKs, el contenido no se toca.
 */

const AVAILABLE = sdks.filter((s) => s.status !== "planned");

/** Tabs de instalación de todos los SDKs disponibles. */
export async function SdkInstallTabs() {
  const snippets = AVAILABLE.slice(0, 6).map((s) => ({
    label: s.label,
    lang: s.installLang,
    code: s.install,
  }));
  return <CodeGroup snippets={snippets} title="Instalación" />;
}

/** El ejemplo "crear un pedido" en todos los lenguajes disponibles. */
export async function CreateOrderExample() {
  const snippets = AVAILABLE.slice(0, 6).map((s) => ({
    label: s.label,
    lang: s.lang,
    code: s.createSnippet,
  }));
  return <CodeGroup snippets={snippets} title="orders.create" />;
}
