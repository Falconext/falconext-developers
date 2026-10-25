"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Braces, FlaskConical, Plus, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { probarComprobante, type ResultadoPrueba } from "./actions";

type Item = { description: string; quantity: string; unit_value: string; tax_affectation: string };

const AFECTACIONES: { valor: string; texto: string }[] = [
  { valor: "taxed", texto: "Gravado (IGV 18%)" },
  { valor: "exempt", texto: "Exonerado" },
  { valor: "unaffected", texto: "Inafecto" },
];

const DOCUMENTOS_CLIENTE: { valor: string; texto: string }[] = [
  { valor: "dni", texto: "DNI" },
  { valor: "ruc", texto: "RUC" },
  { valor: "ce", texto: "Carné de extranjería" },
  { valor: "passport", texto: "Pasaporte" },
];

const URL_API = "https://api.krezka.com/api/v1/invoicing/invoices";

const campo =
  "w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50";
const etiqueta = "mb-1 block text-xs text-subtle";

const numero = (v: string) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** El cuerpo exacto que hay que mandar a la API: lo que se ve con { }. */
function armarCuerpo(f: {
  issuer: string;
  tipo: string;
  moneda: string;
  cliente: { document_type: string; document_number: string; name: string; email: string; address: string };
  items: Item[];
}) {
  const cliente: Record<string, string> = {
    document_type: f.cliente.document_type,
    document_number: f.cliente.document_number.trim(),
    name: f.cliente.name.trim(),
  };
  if (f.cliente.address.trim()) cliente.address = f.cliente.address.trim();
  if (f.cliente.email.trim()) cliente.email = f.cliente.email.trim();
  return {
    issuer_id: f.issuer,
    document_type: f.tipo,
    currency: f.moneda,
    customer: cliente,
    items: f.items.map((it) => ({
      description: it.description.trim(),
      quantity: numero(it.quantity),
      unit_value: numero(it.unit_value),
      ...(it.tax_affectation !== "taxed" ? { tax_affectation: it.tax_affectation } : {}),
    })),
  };
}

function fragmentos(cuerpo: object) {
  const json = JSON.stringify(cuerpo, null, 2);
  const enUnaLinea = JSON.stringify(cuerpo);
  return [
    { etiqueta: "JSON", codigo: json },
    {
      etiqueta: "cURL",
      codigo: `curl -X POST ${URL_API} \\
  -H "Authorization: Bearer sk_test_…" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -H "Content-Type: application/json" \\
  -d '${json.replace(/'/g, "'\\''")}'`,
    },
    {
      etiqueta: "JavaScript",
      codigo: `const res = await fetch("${URL_API}", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.KREZKA_API_KEY}\`,
    "Idempotency-Key": crypto.randomUUID(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${json.replace(/\n/g, "\n  ")}),
});
const comprobante = await res.json();`,
    },
    {
      etiqueta: "Python",
      codigo: `import os, uuid, requests

res = requests.post(
    "${URL_API}",
    headers={
        "Authorization": f"Bearer {os.environ['KREZKA_API_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json=${json.replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None").replace(/\n/g, "\n    ")},
)
comprobante = res.json()`,
    },
    {
      etiqueta: "PHP",
      codigo: `$ch = curl_init("${URL_API}");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . getenv("KREZKA_API_KEY"),
        "Idempotency-Key: " . bin2hex(random_bytes(16)),
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => '${enUnaLinea.replace(/'/g, "\\'")}',
]);
$comprobante = json_decode(curl_exec($ch), true);`,
    },
  ];
}

function Codigo({ codigo, className }: { codigo: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-app", className)} style={{ backgroundColor: "var(--bg-code)" }}>
      <CopyButton value={codigo} className="absolute right-2 top-2" />
      <pre className="max-h-[28rem] overflow-auto p-4 pr-12 font-mono text-xs leading-relaxed text-fg">{codigo}</pre>
    </div>
  );
}

export function Probador({ empresas, inicial }: { empresas: { id: string; nombre: string; ruc: string }[]; inicial: string }) {
  const [issuer, setIssuer] = useState(inicial);
  const [tipo, setTipo] = useState("receipt");
  const [moneda, setMoneda] = useState("PEN");
  const [cliente, setCliente] = useState({ document_type: "dni", document_number: "12345678", name: "Ana Pérez", email: "", address: "" });
  const [items, setItems] = useState<Item[]>([{ description: "Producto de prueba", quantity: "1", unit_value: "50", tax_affectation: "taxed" }]);
  const [verCodigo, setVerCodigo] = useState(false);
  const [lenguaje, setLenguaje] = useState(0);
  const [resultado, setResultado] = useState<ResultadoPrueba | null>(null);
  const [pendiente, startTransition] = useTransition();

  const cuerpo = useMemo(() => armarCuerpo({ issuer, tipo, moneda, cliente, items }), [issuer, tipo, moneda, cliente, items]);
  const codigos = useMemo(() => fragmentos(cuerpo), [cuerpo]);
  // Un resultado viejo junto a un formulario ya cambiado confunde: se borra.
  useEffect(() => setResultado(null), [cuerpo]);
  const conError = (param: string) => resultado && !resultado.ok && resultado.param?.startsWith(param);

  const cambiarTipo = (t: string) => {
    setTipo(t);
    // La factura exige RUC: cambiarlo solo evita el primer error de todos.
    if (t === "invoice" && cliente.document_type !== "ruc") {
      setCliente({ ...cliente, document_type: "ruc", document_number: "20131312955", name: "SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACION TRIBUTARIA - SUNAT" });
    }
  };
  const cambiarItem = (i: number, cambios: Partial<Item>) => setItems(items.map((it, j) => (j === i ? { ...it, ...cambios } : it)));

  const probar = () => {
    setResultado(null);
    startTransition(async () => setResultado(await probarComprobante(cuerpo)));
  };

  const r = resultado?.ok ? resultado.respuesta : null;
  const simbolo = (r?.currency ?? moneda) === "USD" ? "US$" : "S/";
  const dinero = (n: number | null | undefined) => `${simbolo} ${(Number(n) || 0).toFixed(2)}`;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-xl border border-app bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="sm:col-span-3">
            <span className={etiqueta}>Empresa que emite</span>
            <select className={campo} value={issuer} onChange={(e) => setIssuer(e.target.value)}>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} · RUC {e.ruc}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={etiqueta}>Comprobante</span>
            <select className={campo} value={tipo} onChange={(e) => cambiarTipo(e.target.value)}>
              <option value="receipt">Boleta</option>
              <option value="invoice">Factura</option>
            </select>
          </label>
          <label>
            <span className={etiqueta}>Moneda</span>
            <select className={campo} value={moneda} onChange={(e) => setMoneda(e.target.value)}>
              <option value="PEN">Soles</option>
              <option value="USD">Dólares</option>
            </select>
          </label>
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold text-fg">Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className={etiqueta}>Documento</span>
            <select
              className={cn(campo, conError("customer.document_type") && "border-rose-500/60")}
              value={cliente.document_type}
              onChange={(e) => setCliente({ ...cliente, document_type: e.target.value })}
            >
              {DOCUMENTOS_CLIENTE.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.texto}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={etiqueta}>Número</span>
            <input
              className={cn(campo, "font-mono", conError("customer.document_number") && "border-rose-500/60")}
              value={cliente.document_number}
              onChange={(e) => setCliente({ ...cliente, document_number: e.target.value })}
            />
          </label>
          <label className="sm:col-span-3">
            <span className={etiqueta}>Nombre o razón social</span>
            <input
              className={cn(campo, conError("customer.name") && "border-rose-500/60")}
              value={cliente.name}
              onChange={(e) => setCliente({ ...cliente, name: e.target.value })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={etiqueta}>Dirección (opcional)</span>
            <input className={campo} value={cliente.address} onChange={(e) => setCliente({ ...cliente, address: e.target.value })} />
          </label>
          <label>
            <span className={etiqueta}>Correo (opcional)</span>
            <input className={campo} type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
          </label>
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold text-fg">Ítems</h2>
        <div className="flex flex-col gap-3">
          {items.map((it, i) => (
            <div key={i} className={cn("grid gap-2 rounded-lg border border-app p-3 sm:grid-cols-12", conError(`items[${i}]`) && "border-rose-500/60")}>
              <label className="sm:col-span-12">
                <span className={etiqueta}>Descripción</span>
                <input className={campo} value={it.description} onChange={(e) => cambiarItem(i, { description: e.target.value })} />
              </label>
              <label className="sm:col-span-3">
                <span className={etiqueta}>Cantidad</span>
                <input className={campo} inputMode="decimal" value={it.quantity} onChange={(e) => cambiarItem(i, { quantity: e.target.value })} />
              </label>
              <label className="sm:col-span-4">
                <span className={etiqueta}>Valor unitario (sin IGV)</span>
                <input className={campo} inputMode="decimal" value={it.unit_value} onChange={(e) => cambiarItem(i, { unit_value: e.target.value })} />
              </label>
              <label className="sm:col-span-4">
                <span className={etiqueta}>IGV</span>
                <select className={campo} value={it.tax_affectation} onChange={(e) => cambiarItem(i, { tax_affectation: e.target.value })}>
                  {AFECTACIONES.map((a) => (
                    <option key={a.valor} value={a.valor}>
                      {a.texto}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end justify-end sm:col-span-1">
                <button
                  type="button"
                  disabled={items.length === 1}
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                  className="rounded-lg p-2 text-subtle hover:text-rose-400 disabled:opacity-30"
                  aria-label="Quitar ítem"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems([...items, { description: "", quantity: "1", unit_value: "", tax_affectation: "taxed" }])}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            <Plus className="h-4 w-4" /> Agregar ítem
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={probar}
            disabled={pendiente}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
          >
            <FlaskConical className="h-4 w-4" />
            {pendiente ? "Probando…" : "Probar"}
          </button>
          <button
            type="button"
            onClick={() => setVerCodigo(!verCodigo)}
            aria-pressed={verCodigo}
            title="Ver el JSON para tu código"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              verCodigo ? "border-violet-500/60 bg-violet-500/10 text-fg" : "border-app text-muted hover:text-fg",
            )}
          >
            <Braces className="h-4 w-4" />
            JSON
          </button>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        {verCodigo && (
          <div>
            <div className="mb-2 flex flex-wrap gap-1">
              {codigos.map((c, i) => (
                <button
                  key={c.etiqueta}
                  type="button"
                  onClick={() => setLenguaje(i)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium",
                    i === lenguaje ? "bg-violet-500/15 text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {c.etiqueta}
                </button>
              ))}
            </div>
            <Codigo codigo={codigos[lenguaje].codigo} />
            <p className="mt-2 text-xs text-subtle">
              Usa una clave <code className="font-mono">sk_test_</code> para probar y una <code className="font-mono">sk_live_</code> cuando la empresa esté en producción. El
              cuerpo es el mismo.
            </p>
          </div>
        )}

        {resultado && !resultado.ok && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <p className="font-medium">{resultado.error}</p>
            {resultado.param && <p className="mt-1 font-mono text-xs text-rose-300/80">Campo: {resultado.param}</p>}
          </div>
        )}

        {r && (
          <>
            <div className="rounded-xl border border-app bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-amber-signal/15 px-2 py-0.5 text-[0.7rem] font-medium text-amber-signal">Prueba · sin valor legal</span>
                  <h2 className="mt-2 font-display text-lg font-semibold text-fg">
                    {r.document_type === "invoice" ? "Factura" : "Boleta"} {r.number_preview ?? ""}
                  </h2>
                  <p className="text-xs text-muted">
                    {empresas.find((e) => e.id === r.issuer_id)?.nombre} · {r.issue_date}
                  </p>
                </div>
                <p className="text-right font-display text-2xl font-semibold text-fg">{dinero(r.totals?.total)}</p>
              </div>
              <p className="mt-4 text-sm text-fg">
                {r.customer?.name} <span className="text-muted">· {String(r.customer?.document_type ?? "").toUpperCase()} {r.customer?.document_number}</span>
              </p>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-app text-left text-xs text-subtle">
                    <th className="py-1.5 font-normal">Descripción</th>
                    <th className="py-1.5 text-right font-normal">Cant.</th>
                    <th className="py-1.5 text-right font-normal">Valor</th>
                    <th className="py-1.5 text-right font-normal">IGV</th>
                  </tr>
                </thead>
                <tbody>
                  {(r.items ?? []).map((it: any, i: number) => (
                    <tr key={i} className="border-b border-app/60">
                      <td className="py-1.5 text-fg">{it.description}</td>
                      <td className="py-1.5 text-right text-muted">{it.quantity}</td>
                      <td className="py-1.5 text-right text-muted">{dinero(it.unit_value * it.quantity - (it.discount ?? 0))}</td>
                      <td className="py-1.5 text-right text-muted">{dinero(it.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="mt-3 ml-auto w-full max-w-xs space-y-1 text-sm">
                {(
                  [
                    ["Gravado", r.totals?.taxable],
                    ["Exonerado", r.totals?.exempt],
                    ["Inafecto", r.totals?.unaffected],
                    ["IGV", r.totals?.tax],
                  ] as const
                )
                  .filter(([, v]) => Number(v) > 0)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-muted">
                      <dt>{k}</dt>
                      <dd>{dinero(v)}</dd>
                    </div>
                  ))}
                <div className="flex justify-between border-t border-app pt-1 font-semibold text-fg">
                  <dt>Total</dt>
                  <dd>{dinero(r.totals?.total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-subtle">{r.message}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Respuesta de la API</h3>
              <Codigo codigo={JSON.stringify(r, null, 2)} />
            </div>
          </>
        )}

        {!verCodigo && !resultado && (
          <div className="rounded-xl border border-dashed border-app p-6 text-sm text-muted">
            Llena el formulario y aprieta <strong className="text-fg">Probar</strong> para ver cómo quedaría el comprobante, o{" "}
            <strong className="text-fg">JSON</strong> para ver el código.
          </div>
        )}
      </section>
    </div>
  );
}
