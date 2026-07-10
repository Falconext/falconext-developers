export type ChangeType = "added" | "improved" | "fixed" | "breaking";

export type ChangelogEntry = {
  date: string;
  version: string;
  changes: { type: ChangeType; text: string }[];
};

/** Historial de cambios de la API. Reemplaza/expande con las notas reales de cada release. */
export const changelog: ChangelogEntry[] = [
  {
    date: "2025-07-01",
    version: "2025-07-01",
    changes: [
      { type: "added", text: "Webhooks del ciclo de vida del pedido con firma HMAC y reintentos." },
      { type: "added", text: "Endpoint de rastreo en tiempo real GET /orders/{id}/tracking." },
      { type: "improved", text: "Latencia p50 de creación de pedidos reducida a <120 ms." },
    ],
  },
  {
    date: "2025-05-15",
    version: "2025-05-15",
    changes: [
      { type: "added", text: "SDK oficial de Python y Laravel (beta)." },
      { type: "fixed", text: "Corrección en la paginación por cursor de GET /orders." },
    ],
  },
  {
    date: "2025-03-02",
    version: "2025-03-02",
    changes: [
      { type: "breaking", text: "El campo status_code se renombró a status en el recurso Order." },
      { type: "added", text: "Entorno Sandbox con claves sk_test_." },
    ],
  },
];

export const changeMeta: Record<ChangeType, { label: string; tone: "green" | "violet" | "blue" | "red" }> = {
  added: { label: "Nuevo", tone: "green" },
  improved: { label: "Mejora", tone: "violet" },
  fixed: { label: "Fix", tone: "blue" },
  breaking: { label: "Breaking", tone: "red" },
};
