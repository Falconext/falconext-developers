import type { ReactNode } from "react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { KeyRound, Webhook, LogOut, ArrowLeft, Building2, Gauge, FlaskConical, FileText } from "lucide-react";
import { esKrezka } from "@/config/brand";
import { mypeApi } from "@/lib/mype-api";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // Con un cobro vencido la API no emite: se avisa en todas las pantallas, no
  // solo en Consumo, para que nadie lo descubra por un 402 en producción.
  let vencido: { total: number } | null = null;
  if (esKrezka && session?.user) {
    try {
      const r = await mypeApi<{ data: { status: string; overdue: boolean; amount: number }[] }>("/facturacion/consola/cobros");
      const v = (r.data ?? []).filter((c) => c.status === "pending" && c.overdue);
      if (v.length) vencido = { total: v.reduce((s, c) => s + Number(c.amount || 0), 0) };
    } catch {
      vencido = null;
    }
  }

  return (
    <div className="min-h-screen bg-app text-fg">
      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al portal
          </Link>
          <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-wider text-subtle">
            Consola
          </p>
          <nav className="flex flex-col gap-1">
            {esKrezka && session?.user && (
              <ConsoleNavLink href="/console/empresas" icon={<Building2 className="h-4 w-4" />}>
                Mis empresas
              </ConsoleNavLink>
            )}
            {esKrezka && session?.user && (
              <ConsoleNavLink href="/console/probar" icon={<FlaskConical className="h-4 w-4" />}>
                Probar
              </ConsoleNavLink>
            )}
            {esKrezka && session?.user && (
              <ConsoleNavLink href="/console/documentos" icon={<FileText className="h-4 w-4" />}>
                Documentos
              </ConsoleNavLink>
            )}
            {(session?.user || !esKrezka) && (
              <>
                <ConsoleNavLink href="/console/api-keys" icon={<KeyRound className="h-4 w-4" />}>
                  {esKrezka ? "Claves" : "API keys"}
                </ConsoleNavLink>
                <ConsoleNavLink href="/console/webhooks" icon={<Webhook className="h-4 w-4" />}>
                  Webhooks
                </ConsoleNavLink>
              </>
            )}
            {esKrezka && session?.user && (
              <ConsoleNavLink href="/console/consumo" icon={<Gauge className="h-4 w-4" />}>
                Consumo y precios
              </ConsoleNavLink>
            )}
          </nav>

          {session?.user && (
            <div className="mt-10 rounded-xl border border-app bg-subtle p-4">
              <p className="text-xs font-medium text-fg">{session.user.name}</p>
              <p className="mt-0.5 truncate text-[0.7rem] text-subtle">{session.user.email}</p>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/console/login" });
                }}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-fg"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          {vencido && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              <p>
                <strong>Tienes un pago vencido (S/ {vencido.total.toFixed(2)}).</strong> La emisión de comprobantes está pausada hasta que
                pagues. Probar, consultar y anular siguen funcionando.
              </p>
              <Link href="/console/consumo" className="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-500">
                Pagar ahora
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function ConsoleNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-fg"
    >
      {icon}
      {children}
    </Link>
  );
}
