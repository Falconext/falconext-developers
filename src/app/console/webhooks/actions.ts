"use server";

import { revalidatePath } from "next/cache";
import { mypeApi } from "@/lib/mype-api";
import { CONSOLA } from "@/config/consola";

export async function createWebhookEndpoint(input: { url: string; events: string[] }) {
  const created: any = await mypeApi<{
    endpointId: string;
    url: string;
    events: string[];
    secret: string;
    activo: boolean;
    creadoEn: string;
  }>(CONSOLA.webhooks, {
    method: "POST",
    body: JSON.stringify(input),
  });
  revalidatePath("/console/webhooks");
  return { ...created, endpointId: created.endpointId ?? created.id };
}

export async function deleteWebhookEndpoint(endpointId: string) {
  await mypeApi(`${CONSOLA.webhooks}/${endpointId}`, { method: "DELETE" });
  revalidatePath("/console/webhooks");
}
