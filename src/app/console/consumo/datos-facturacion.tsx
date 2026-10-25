"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { consultarDocumento, guardarDatosFacturacion, type DatosFacturacion } from "./actions";

const campo =
  "w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-fg outline-none focus:border-violet-500/50";
const etiqueta = "mb-1 block text-xs text-subtle";

/** A nombre de quién le emitimos la factura del consumo. */
export function DatosFacturacionForm({ inicial }: { inicial: DatosFacturacion | null }) {
  const [editando, setEditando] = useState(!inicial?.complete);
  const [tipo, setTipo] = useState<"ruc" | "dni">(inicial?.document_type ?? "ruc");
  const [numero, setNumero] = useState(inicial?.document_number ?? "");
  const [nombre, setNombre] = useState(inicial?.name ?? "");
  const [direccion, setDireccion] = useState(inicial?.address ?? "");
  const [email, setEmail] = useState(inicial?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [buscando, startBusqueda] = useTransition();
  const router = useRouter();

  const buscar = () => {
    setError(null);
    startBusqueda(async () => {
      const r = await consultarDocumento(tipo, numero);
      if (!r.ok) return setError(r.error);
      setNombre(r.name);
      if (r.address) setDireccion(r.address);
    });
  };

  const guardar = () => {
    setError(null);
    startTransition(async () => {
      const r = await guardarDatosFacturacion({ document_type: tipo, document_number: numero, name: nombre, address: direccion, email });
      if (!r.ok) return setError(r.error);
      setEditando(false);
      router.refresh();
    });
  };

  if (!editando && inicial?.complete) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-app bg-surface p-4 text-sm">
        <div>
          <p className="font-medium text-fg">{inicial.name}</p>
          <p className="text-muted">
            {inicial.document_type?.toUpperCase()} {inicial.document_number}
            {inicial.address ? ` · ${inicial.address}` : ""}
          </p>
          {inicial.email && <p className="text-xs text-subtle">Comprobantes a {inicial.email}</p>}
        </div>
        <button type="button" onClick={() => setEditando(true)} className="text-sm font-medium text-violet-400 hover:text-violet-300">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-app bg-surface p-5">
      {!inicial?.complete && (
        <p className="mb-4 text-sm text-muted">
          Para pagar necesitamos saber a nombre de quién emitirte el comprobante: <strong className="text-fg">factura</strong> con RUC
          o <strong className="text-fg">boleta</strong> con DNI.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-6">
        <label className="sm:col-span-2">
          <span className={etiqueta}>Documento</span>
          <select className={campo} value={tipo} onChange={(e) => setTipo(e.target.value as "ruc" | "dni")}>
            <option value="ruc">RUC (factura)</option>
            <option value="dni">DNI (boleta)</option>
          </select>
        </label>
        <label className="sm:col-span-4">
          <span className={etiqueta}>Número</span>
          <div className="flex gap-2">
            <input
              className={`${campo} font-mono`}
              inputMode="numeric"
              maxLength={tipo === "ruc" ? 11 : 8}
              value={numero}
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
            />
            <button
              type="button"
              onClick={buscar}
              disabled={buscando || numero.length !== (tipo === "ruc" ? 11 : 8)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-app px-3 text-sm text-muted hover:text-fg disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {buscando ? "Buscando…" : "Buscar"}
            </button>
          </div>
        </label>
        <label className="sm:col-span-6">
          <span className={etiqueta}>{tipo === "ruc" ? "Razón social" : "Nombre completo"}</span>
          <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="sm:col-span-4">
          <span className={etiqueta}>{tipo === "ruc" ? "Dirección fiscal" : "Dirección (opcional)"}</span>
          <input className={campo} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className={etiqueta}>Correo para comprobantes (opcional)</span>
          <input className={campo} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={pendiente}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        {inicial?.complete && (
          <button type="button" onClick={() => setEditando(false)} className="px-3 py-2 text-sm text-muted hover:text-fg">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
