import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { resolveProductVersion } from "@/config/products";

/** Ruta legacy: la referencia ahora vive en /{producto}/{versión}/reference. */
export default function LegacyApiReference() {
  const resolved = resolveProductVersion(siteConfig.product.id, "latest");
  redirect(resolved ? `/${resolved.product.id}/${resolved.version.id}/reference` : "/");
}
