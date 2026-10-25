"use server";

import { revalidatePath } from "next/cache";
import { mypeApi, MypeApiError } from "@/lib/mype-api";
import type { Documento } from "./model";

type Resultado = { ok: true; documento: Documento } | { ok: false; error: string; param?: string };

/**
 * Emite de verdad: va a SUNAT y se cobra. `clave` es el Idempotency-Key: el
 * mismo para los reintentos del mismo formulario, así un doble clic no emite
 * dos veces.
 */
export async function emitirComprobante(cuerpo: unknown, clave: string): Promise<Resultado> {
  try {
    const documento = await mypeApi<Documento>("/facturacion/consola/emitir", {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: { "Idempotency-Key": clave },
    });
    revalidatePath("/console/documentos");
    return { ok: true, documento };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo emitir.", param: e instanceof MypeApiError ? e.param : undefined };
  }
}

export async function anularComprobante(id: string, motivo: string, clave: string): Promise<Resultado> {
  try {
    const documento = await mypeApi<Documento>(`/facturacion/consola/documentos/${encodeURIComponent(id)}/anular`, {
      method: "POST",
      body: JSON.stringify({ reason: motivo }),
      headers: { "Idempotency-Key": clave },
    });
    revalidatePath(`/console/documentos/${id}`);
    revalidatePath("/console/documentos");
    return { ok: true, documento };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo anular." };
  }
}
