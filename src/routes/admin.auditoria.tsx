import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type AuditEvent } from "@/lib/mock-data";
import { Badge, EmptyState, StatCard } from "@/components/ui-kit";
import { listAuditEvents } from "@/lib/audit-store";
import { listAuditEventsDynamic, fetchAuditEventsRemote } from "@/lib/admin-dynamic-store";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { downloadCsv } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria - Admin HCB-BANDES" }] }),
  component: AuditoriaPage,
});

const EVENT_TONE: Record<AuditEvent["type"], "primary" | "gold" | "success" | "danger" | "muted"> = {
  info: "primary",
  warning: "gold",
  success: "success",
  error: "danger",
};

function AuditoriaPage() {
  const [events, setEvents] = useState(() => listAuditEvents());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState<AuditEvent["type"] | "todos">("todos");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (await isSupabaseConfigured()) {
        const remote = await fetchAuditEventsRemote();
        if (remote && remote.length > 0) {
          setEvents([...listAuditEvents(), ...remote]);
          setLoading(false);
          return;
        }
      }
      setEvents([...listAuditEvents(), ...listAuditEventsDynamic()]);
      setLoading(false);
    }

    load();
    const sync = () => setEvents([...listAuditEvents(), ...listAuditEventsDynamic()]);
    window.addEventListener("hcb_audit_changed", sync);
    window.addEventListener("hcb_admin_data_changed", sync);
    return () => {
      window.removeEventListener("hcb_audit_changed", sync);
      window.removeEventListener("hcb_admin_data_changed", sync);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" /> Carregando auditoria...
      </div>
    );
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return events.filter((event) => {
      if (type !== "todos" && event.type !== type) return false;
      if (!term) return true;
      return [event.actor, event.action, event.target, event.details].some((value) =>
        value.toLowerCase().includes(term),
      );
    });
  }, [events, q, type]);

  function exportCsv() {
    if (filtered.length === 0) {
      toast.error("Sem eventos de auditoria para exportar");
      return;
    }

    downloadCsv(`hcb-auditoria-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Data", "Actor", "Acao", "Destino", "Detalhes", "Tipo"],
      ...filtered.map((event) => [
        new Date(event.at).toLocaleString("pt-PT"),
        event.actor,
        event.action,
        event.target,
        event.details,
        event.type,
      ]),
    ]);
    toast.success(`${filtered.length} eventos exportados`);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">Auditoria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registo de aprovacoes, rejeicoes, conclusoes e exportacoes feitas pelos administradores.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Eventos" value={events.length} icon={ShieldCheck} tone="primary" />
        <StatCard
          label="Aprovacoes"
          value={events.filter((event) => event.action.includes("aprovou")).length}
          tone="success"
        />
        <StatCard
          label="Exportacoes"
          value={events.filter((event) => event.action.includes("exportou")).length}
          tone="gold"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por actor, acao ou detalhe..."
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AuditEvent["type"] | "todos")}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os tipos</option>
          <option value="info">Info</option>
          <option value="warning">Aviso</option>
          <option value="success">Sucesso</option>
          <option value="error">Erro</option>
        </select>
        <button
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sem eventos"
          description="Nenhum registo de auditoria corresponde a pesquisa."
          icon={FileText}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Accao</th>
                  <th className="px-4 py-3 font-semibold">Destino</th>
                  <th className="px-4 py-3 font-semibold">Detalhes</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-secondary/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums">
                      {new Date(event.at).toLocaleString("pt-PT")}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{event.actor}</td>
                    <td className="px-4 py-3 text-xs">{event.action}</td>
                    <td className="px-4 py-3 font-mono text-xs">{event.target}</td>
                    <td className="min-w-72 px-4 py-3 text-xs text-muted-foreground">{event.details}</td>
                    <td className="px-4 py-3">
                      <Badge tone={EVENT_TONE[event.type]}>{event.type}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
