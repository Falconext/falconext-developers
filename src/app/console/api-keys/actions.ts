"use server";

import { revalidatePath } from "next/cache";
import { mypeApi } from "@/lib/mype-api";
import { CONSOLA } from "@/config/consola";

export async function createApiKey(input: { nombre?: string; entorno: "live" | "test" }) {
  const created = await mypeApi<{
    id: number;
    apiKey: string;
    nombre: string | null;
    entorno: string;
    prefijo: string;
    ultimosCuatro: string;
    creadoEn: string;
  }>(CONSOLA.claves, {
    method: "POST",
    body: JSON.stringify(CONSOLA.cuerpoClave(input.nombre, input.entorno)),
  });
  revalidatePath("/console/api-keys");
  return created;
}

export async function revokeApiKey(id: number) {
  await mypeApi(`${CONSOLA.claves}/${id}`, { method: "DELETE" });
  revalidatePath("/console/api-keys");
}
