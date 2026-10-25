/** Un comprobante como lo devuelve la API de facturación. */
export type Documento = {
  id: string;
  object: string;
  issuer_id: string;
  document_type: "invoice" | "receipt" | string;
  full_number: string;
  status: string;
  issue_date: string;
  currency: string;
  customer?: { document_type?: string; document_number?: string; name?: string; email?: string; address?: string };
  items: { description: string; quantity: number; unit: string; unit_value: number; discount: number; tax_affectation: string; tax: number }[];
  totals: { taxable: number; exempt: number; unaffected: number; export: number; discount: number; tax: number; total: number };
  sunat?: { response_code?: string; response_message?: string; cdr_available?: boolean };
  files?: { xml?: boolean; cdr?: boolean; pdf?: boolean };
  created_at?: string;
};

/** Cómo se le dice al usuario en qué está cada comprobante. */
export const ESTADO_DOC: Record<string, { texto: string; clase: string }> = {
  pending: { texto: "Pendiente", clase: "bg-sky-500/15 text-sky-300" },
  sent: { texto: "Enviado a SUNAT", clase: "bg-sky-500/15 text-sky-300" },
  accepted: { texto: "Aceptado", clase: "bg-emerald-500/15 text-emerald-300" },
  observed: { texto: "Aceptado con observaciones", clase: "bg-emerald-500/15 text-emerald-300" },
  rejected: { texto: "Rechazado", clase: "bg-rose-500/15 text-rose-300" },
  reconciling: { texto: "Confirmando con SUNAT", clase: "bg-amber-signal/15 text-amber-signal" },
  voiding: { texto: "Anulando", clase: "bg-amber-signal/15 text-amber-signal" },
  voided: { texto: "Anulado", clase: "bg-zinc-500/20 text-zinc-300" },
};

export const tipoDoc = (t: string) => (t === "invoice" ? "Factura" : t === "receipt" ? "Boleta" : t === "credit_note" ? "Nota de crédito" : t);

export const dinero = (n: number | null | undefined, moneda = "PEN") =>
  `${moneda === "USD" ? "US$" : "S/"} ${(Number(n) || 0).toFixed(2)}`;
