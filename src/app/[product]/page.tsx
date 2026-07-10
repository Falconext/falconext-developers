import { redirect } from "next/navigation";
import { documentedProducts, resolveProductVersion } from "@/config/products";

/** /{product} entra a la referencia de su versión por defecto. */
export default async function ProductIndex({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const resolved = resolveProductVersion(product, "latest");
  if (!resolved) redirect("/");
  redirect(`/${resolved.product.id}/${resolved.version.id}/reference`);
}

export function generateStaticParams() {
  return documentedProducts().map((p) => ({ product: p.id }));
}

export const dynamicParams = false;
