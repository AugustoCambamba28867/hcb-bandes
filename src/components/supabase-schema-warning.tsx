import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type SchemaStatus = { ok: true } | { ok: false; error?: string; migration?: string };

export function SupabaseSchemaWarning() {
  const [status, setStatus] = useState<SchemaStatus | null>(null);

  useEffect(() => {
    const readStatus = () => {
      if (typeof window === "undefined") {
        setStatus(null);
        return;
      }

      const current = (window as any).__HCB_SUPABASE_SCHEMA_STATUS as SchemaStatus | undefined;
      setStatus(current ?? null);
    };

    readStatus();
    window.addEventListener("hcb_supabase_schema_status_changed", readStatus);
    return () => {
      window.removeEventListener("hcb_supabase_schema_status_changed", readStatus);
    };
  }, []);

  if (!status || status.ok) return null;

  const migration = status.migration;

  return (
    <aside
      aria-label="Alerta de esquema Supabase em falta"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-900 shadow-lg md:left-auto md:right-4 md:w-96"
    >
      <div className="font-semibold">Aviso: Esquema Supabase em falta</div>
      <div className="mt-1 text-xs">
        {status.error ??
          "Não foi possível aplicar automaticamente as migrações na sua base de dados Supabase."}
      </div>
      {migration ? (
        <pre className="mt-3 max-h-72 overflow-auto rounded bg-white/80 p-3 text-xs text-slate-900">
          {migration}
        </pre>
      ) : (
        <div className="mt-3 text-xs">SQL de migração indisponível.</div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            if (!migration) return;
            navigator.clipboard?.writeText(migration);
            toast.success("SQL copiado para a área de transferência com sucesso");
          }}
          className="rounded bg-amber-400 px-3 py-1 text-xs font-medium text-white"
        >
          Copiar SQL
        </button>
        <a
          href="https://app.supabase.com/"
          target="_blank"
          rel="noreferrer"
          className="rounded border border-amber-400 px-3 py-1 text-xs font-medium text-amber-900"
        >
          Abrir Supabase
        </a>
      </div>
    </aside>
  );
}
