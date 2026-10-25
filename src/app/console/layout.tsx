import type { ReactNode } from "react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { KeyRound, Webhook, LogOut, ArrowLeft, Building2, Gauge, FlaskConical } from "lucide-react";
import { esKrezka } from "@/config/brand";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const session = await auth();

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

        <main className="min-w-0 flex-1">{children}</main>
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
