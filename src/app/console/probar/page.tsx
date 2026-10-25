import Link from "next/link";
import { mypeApi } from "@/lib/mype-api";
import type { Empresa } from "../empresas/actions";
import { Probador } from "./probador";

export const metadata = { title: "Probar — Consola" };
export const dynamic = "force-dynamic";

export default async function ProbarPage({ searchParams }: { searchParams: Promise<{ issuer?: string }> }) {
  const { issuer } = await searchParams;
  let empresas: Empresa[] = [];
  try {
    empresas = (await mypeApi<{ data: Empresa[] }>("/facturacion/consola/empresas")).data ?? [];
  } catch {
    empresas = [];
  }

  return (
    <>
      <header className="mb-6">
        <p className="font-mono text-[0.68rem] uppercase tracking-wider text-subtle">Facturación</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-fg">Probar</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Arma una boleta o factura y pruébala: se valida igual que en producción, pero no se emite, no va a SUNAT y no se
          cobra. Con el botón <code className="font-mono text-xs">{"{ }"}</code> te llevas el JSON listo para tu código.
        </p>
      </header>
      {empresas.length === 0 ? (
        <div className="rounded-xl border border-app bg-surface p-6 text-sm text-muted">
          Primero agrega una empresa en{" "}
          <Link href="/console/empresas" className="font-medium text-violet-400 hover:text-violet-300">
            Mis empresas
          </Link>
          .
        </div>
      ) : (
        <Probador
          empresas={empresas.map((e) => ({ id: e.id, nombre: e.trade_name || e.legal_name, ruc: e.ruc }))}
          inicial={empresas.some((e) => e.id === issuer) ? issuer! : empresas[0].id}
        />
      )}
    </>
  );
}
