import type { Empresa } from "./actions";

/** Cómo se le dice al integrador en qué está cada empresa. */
export const ESTADO: Record<Empresa["status"], { texto: string; clase: string; detalle: string }> = {
  pending_setup: {
    texto: "Prueba",
    clase: "bg-amber-signal/15 text-amber-signal",
    detalle: "Prueba todo con una clave sk_test_: se valida de verdad y no se emite nada. Para emitir comprobantes reales, pasa a producción.",
  },
  pending: {
    texto: "En revisión",
    clase: "bg-sky-500/15 text-sky-300",
    detalle: "Estamos habilitándola ante SUNAT. Suele tomar unas 24 horas.",
  },
  active: {
    texto: "Producción",
    clase: "bg-emerald-500/15 text-emerald-300",
    detalle: "Emite comprobantes válidos ante SUNAT con una clave sk_live_.",
  },
  not_authorized: {
    texto: "Sin habilitar en SUNAT",
    clase: "bg-rose-500/15 text-rose-300",
    detalle: "SUNAT rechazó por falta de habilitación. Revisa en SUNAT SOL que la empresa sea emisor electrónico y haya autorizado al proveedor.",
  },
};
