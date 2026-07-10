"use server";

import { revalidatePath } from "next/cache";
import { mypeApi } from "@/lib/mype-api";

export async function createApiKey(input: { nombre?: string; entorno: "live" | "test" }) {
  const created = await mypeApi<{
    id: number;
    apiKey: string;
    nombre: string | null;
    entorno: string;
    prefijo: string;
    ultimosCuatro: string;
    creadoEn: string;
  }>("/logistica/api-keys", {
    method: "POST",
    body: JSON.stringify(input),
  });
  revalidatePath("/console/api-keys");
  return created;
}

export async function revokeApiKey(id: number) {
  await mypeApi(`/logistica/api-keys/${id}`, { method: "DELETE" });
  revalidatePath("/console/api-keys");
}
