"use server";

import { revalidatePath } from "next/cache";
import { mypeApi } from "@/lib/mype-api";

export type Empresa = {
  id: string;
  ruc: string;
  legal_name: string;
  trade_name?: string;
  address?: string;
  environment: "test" | "production";
  status: "pending_setup" | "pending" | "active" | "not_authorized";
  status_detail?: string;
  available_at?: string;
  created_at?: string;
};

export async function agregarEmpresa(ruc: string): Promise<{ ok: true; empresa: Empresa } | { ok: false; error: string }> {
  try {
    const empresa = await mypeApi<Empresa>("/facturacion/consola/empresas", {
      method: "POST",
      body: JSON.stringify({ ruc: ruc.replace(/\s/g, "") }),
    });
    revalidatePath("/console/empresas");
    return { ok: true, empresa };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo agregar la empresa." };
  }
}
