import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const metadata = { title: "Crear cuenta — Consola" };

const API = process.env.MYPE_API_URL ?? "http://localhost:4001/api";

/**
 * Registro de la consola: correo y contraseña, nada más. La cuenta no es un
 * sistema de ventas; sirve para agregar empresas y sacar claves de la API de
 * Facturación. Al terminar entra solo.
 */
export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/console/empresas");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-fg">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-muted">
          Gratis. Agrega tus empresas por RUC, prueba con una clave de prueba sin emitir nada y pasa a
          producción cuando estés listo. Solo pagas por los comprobantes que SUNAT acepta.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          "use server";
          const body = {
            name: String(formData.get("name") ?? ""),
            company: String(formData.get("company") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };
          const res = await fetch(`${API}/facturacion/consola/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
          });
          const r = await res.json().catch(() => null);
          if (!res.ok || r?.code === 0) {
            redirect(`/console/registro?error=${encodeURIComponent(r?.message ?? "No se pudo crear la cuenta.")}`);
          }
          await signIn("credentials", { email: body.email, password: body.password, redirectTo: "/console/empresas" });
        }}
        className="flex flex-col gap-4"
      >
        {[
          { name: "name", label: "Tu nombre", type: "text", auto: "name" },
          { name: "company", label: "Tu empresa o marca (opcional)", type: "text", auto: "organization", optional: true },
          { name: "email", label: "Correo", type: "email", auto: "email" },
          { name: "password", label: "Contraseña (mínimo 8)", type: "password", auto: "new-password" },
        ].map((c) => (
          <label key={c.name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-subtle">{c.label}</span>
            <input
              name={c.name}
              type={c.type}
              required={!c.optional}
              minLength={c.name === "password" ? 8 : undefined}
              autoComplete={c.auto}
              className="rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-violet-500/50"
            />
          </label>
        ))}
        <Button type="submit" size="lg" className="mt-2 justify-center">
          <UserPlus className="h-4 w-4" />
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/console/login" className="font-medium text-violet-400 hover:text-violet-300">
          Ingresa
        </Link>
      </p>
    </div>
  );
}
