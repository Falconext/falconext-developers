"use server";

import { mypeApi, MypeApiError } from "@/lib/mype-api";

export type ResultadoPrueba =
  | { ok: true; respuesta: any }
  | { ok: false; error: string; param?: string };

/** Corre el comprobante en modo prueba: valida todo, no emite ni cobra. */
export async function probarComprobante(cuerpo: unknown): Promise<ResultadoPrueba> {
  try {
    const respuesta = await mypeApi("/facturacion/consola/probar", { method: "POST", body: JSON.stringify(cuerpo) });
    return { ok: true, respuesta };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo probar.", param: e instanceof MypeApiError ? e.param : undefined };
  }
}
