"use server";

import { revalidatePath } from "next/cache";
import { mypeApi } from "@/lib/mype-api";

export async function createWebhookEndpoint(input: { url: string; events: string[] }) {
  const created = await mypeApi<{
    endpointId: string;
    url: string;
    events: string[];
    secret: string;
    activo: boolean;
    creadoEn: string;
  }>("/logistica/webhooks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  revalidatePath("/console/webhooks");
  return created;
}

export async function deleteWebhookEndpoint(endpointId: string) {
  await mypeApi(`/logistica/webhooks/${endpointId}`, { method: "DELETE" });
  revalidatePath("/console/webhooks");
}
