import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { esKrezka } from "@/config/brand";
import { CONSOLA } from "@/config/consola";

export const metadata = { title: "Iniciar sesión — Consola" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await auth();
  const { next, error } = await searchParams;
  if (session) redirect(next ?? CONSOLA.inicio);

  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;
  const hasGithub = !!process.env.GITHUB_ID;
  const nextUrl = next ?? CONSOLA.inicio;

  return (
    <div className="mx-auto max-w-md">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-fg">
          {esKrezka ? "Consola de Krezka" : "Consola Falconext"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {esKrezka
            ? "Ingresa para manejar tus empresas, tus claves y tus webhooks de la API de Facturación."
            : "Ingresa con las credenciales de tu cuenta Falconext MyPE para gestionar API keys y webhooks."}
        </p>
        {esKrezka && (
          <p className="mt-3 text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/console/registro" className="font-medium text-violet-400 hover:text-violet-300">
              Regístrate gratis
            </Link>
          </p>
        )}
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          Credenciales incorrectas o cuenta no encontrada.
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: nextUrl,
          });
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-subtle">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-violet-500/50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-subtle">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-violet-500/50"
          />
        </label>
        <Button type="submit" size="lg" className="mt-2 justify-center">
          <LogIn className="h-4 w-4" />
          Ingresar
        </Button>
      </form>

      {(hasGoogle || hasGithub) && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-subtle">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col gap-2">
            {hasGoogle && (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: nextUrl });
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-app bg-surface px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-elevated"
                >
                  Continuar con Google
                </button>
              </form>
            )}
            {hasGithub && (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: nextUrl });
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-app bg-surface px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-elevated"
                >
                  Continuar con GitHub
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
