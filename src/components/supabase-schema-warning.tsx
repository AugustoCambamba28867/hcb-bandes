import React, { useEffect, useState } from "react";

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
  const error = status.error;

  return (
    <div className="mx-auto max-w-4xl rounded-md border border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">Supabase schema não foi aplicado automaticamente</div>
          <div className="mt-1">O bootstrap do esquema falhou: <span className="font-mono">{error ?? "Erro desconhecido"}</span></div>
          <div className="mt-2">Para prosseguir, copie e cole o SQL abaixo no <strong>SQL Editor</strong> do seu projeto Supabase e execute-o manualmente.</div>
        </div>
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
            try {
              alert("SQL copiado para a área de transferência");
            } catch {}
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
    </div>
  );
}
