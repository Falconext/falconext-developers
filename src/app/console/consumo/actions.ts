"use server";

import { mypeApi } from "@/lib/mype-api";

/** El link de Mercado Pago para pagar un cobro. */
export async function pagarCobro(id: number): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const r = await mypeApi<{ url: string }>(`/facturacion/consola/cobros/${id}/pagar`, { method: "POST" });
    return { ok: true, url: r.url };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo iniciar el pago." };
  }
}
