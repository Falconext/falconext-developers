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

export type DatosFacturacion = {
  complete: boolean;
  document_type: "ruc" | "dni" | null;
  document_number: string | null;
  name: string | null;
  address: string | null;
  email: string | null;
};

/** Guarda a nombre de quién se emite la factura del consumo. */
export async function guardarDatosFacturacion(
  datos: Partial<DatosFacturacion>,
): Promise<{ ok: true; datos: DatosFacturacion } | { ok: false; error: string }> {
  try {
    const r = await mypeApi<DatosFacturacion>("/facturacion/consola/datos-facturacion", { method: "POST", body: JSON.stringify(datos) });
    return { ok: true, datos: r };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudieron guardar los datos." };
  }
}

/** Nombre y dirección desde SUNAT (RUC) o RENIEC (DNI). */
export async function consultarDocumento(
  tipo: string,
  numero: string,
): Promise<{ ok: true; name: string; address: string | null } | { ok: false; error: string }> {
  try {
    const q = new URLSearchParams({ tipo, numero });
    const r = await mypeApi<{ name: string; address: string | null }>(`/facturacion/consola/datos-facturacion/consultar?${q}`);
    return { ok: true, ...r };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo consultar." };
  }
}
