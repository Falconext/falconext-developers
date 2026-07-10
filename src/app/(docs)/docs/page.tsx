import { redirect } from "next/navigation";

/** /docs entra a los primeros pasos del producto Logística (modelo versionado). */
export default function DocsIndex() {
  redirect("/logistica/2025-07-01/getting-started");
}
