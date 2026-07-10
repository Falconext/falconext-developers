import { redirect } from "next/navigation";
import { resolveProductVersion } from "@/config/products";

/** Ruta legacy: la referencia ahora vive en /{producto}/{versión}/reference. */
export default function LegacyApiReference() {
  const resolved = resolveProductVersion("logistica", "latest");
  redirect(resolved ? `/${resolved.product.id}/${resolved.version.id}/reference` : "/");
}
