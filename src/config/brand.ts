/**
 * Qué marca se publica. Un mismo portal, dos sitios:
 *  - developers.falconext.pe → Falconext (Logística, Facturación para integradores);
 *  - developers.krezka.com   → Krezka (la API de Krezka: catálogo, stock y ventas).
 *
 * Se elige al construir con NEXT_PUBLIC_BRAND=krezka (cada sitio es un proyecto
 * de Vercel con su variable), como el panel elige su marca con VITE_PUBLIC_BRAND.
 */
export type Marca = "falconext" | "krezka";

export const MARCA: Marca = process.env.NEXT_PUBLIC_BRAND === "krezka" ? "krezka" : "falconext";

export const esKrezka = MARCA === "krezka";
