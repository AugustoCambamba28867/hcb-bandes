import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Download, FileBarChart, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  REPORT_CATEGORY_LABELS,
  type ReportCategory,
  type ReportItem,
} from "@/lib/mock-data";
import { listReports, fetchReportsRemote } from "@/lib/admin-dynamic-store";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { Badge, EmptyState, StatCard } from "@/components/ui-kit";
import { canAccessAdminModule, getAdminAccessMessage } from "@/lib/admin-permissions";
import { addAuditEvent } from "@/lib/audit-store";
import { downloadCsv } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Admin HCB-BANDES" }] }),
  component: RelatoriosPage,
});

const STATUS_TONE: Record<ReportItem["status"], "success" | "gold" | "muted"> = {
  publicado: "success",
  rascunho: "gold",
  arquivado: "muted",
};

const STATUS_LABEL: Record<ReportItem["status"], string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  arquivado: "Arquivado",
};

function RelatoriosPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ReportCategory | "todas">("todas");
  const [status, setStatus] = useState<ReportItem["status"] | "todos">("todos");
  const [period, setPeriod] = useState("");
  const canView = canAccessAdminModule(undefined, "Relatórios", "View");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (await isSupabaseConfigured()) {
        const remote = await fetchReportsRemote();
        if (remote !== null) {
          setReports(remote);
          setLoading(false);
          return;
        }
      }
      setReports(listReports());
      setLoading(false);
    }

    load();
    const sync = () => setReports(listReports());
    window.addEventListener("hcb_admin_data_changed", sync);
    return () => window.removeEventListener("hcb_admin_data_changed", sync);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return reports.filter((r) => {
      if (cat !== "todas" && r.category !== cat) return false;
      if (status !== "todos" && r.status !== status) return false;
      if (period && !r.period.includes(period)) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        r.author.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term)
      );
    });
  }, [q, cat, status, period]);

  const kpis = useMemo(() => {
    return {
      total: reports.length,
      publicados: reports.filter((r) => r.status === "publicado").length,
      rascunhos: reports.filter((r) => r.status === "rascunho").length,
      registos: reports.reduce((s, r) => s + r.records, 0),
    };
  }, [reports]);

  function exportSingle(r: ReportItem) {
    const rows: (string | number)[][] = [
      ["ID", "Título", "Categoria", "Período", "Autor", "Registos", "Estado", "Gerado em"],
      [
        r.id,
        r.title,
        REPORT_CATEGORY_LABELS[r.category],
        r.period,
        r.author,
        r.records,
        STATUS_LABEL[r.status],
        new Date(r.generatedAt).toLocaleString("pt-PT"),
      ],
    ];
    downloadCsv(`${r.id}-${r.title.slice(0, 24).replace(/\s+/g, "-")}.csv`, rows);
    addAuditEvent({
      actor: "Administrador",
      action: "exportou relatório",
      target: r.id,
      details: `Exportação CSV de "${r.title}".`,
      type: "info",
    });
    toast.success(`Relatório ${r.id} exportado`);
  }

  function exportAll() {
    if (filtered.length === 0) {
      toast.error("Sem relatórios para exportar");
      return;
    }
    const rows: (string | number)[][] = [
      ["ID", "Título", "Categoria", "Período", "Autor", "Registos", "Estado", "Gerado em"],
      ...filtered.map((r) => [
        r.id,
        r.title,
        REPORT_CATEGORY_LABELS[r.category],
        r.period,
        r.author,
        r.records,
        STATUS_LABEL[r.status],
        new Date(r.generatedAt).toLocaleString("pt-PT"),
      ]),
    ];
    downloadCsv(`hcb-relatorios-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addAuditEvent({
      actor: "Administrador",
      action: "exportou relatórios",
      target: "Relatórios",
      details: `${filtered.length} registos exportados em CSV.`,
      type: "info",
    });
    toast.success(`${filtered.length} relatórios exportados`);
  }

  if (!canView) {
    return (
      <EmptyState
        title="Acesso negado"
        description={getAdminAccessMessage(undefined, "Relatórios", "View")}
        icon={FileBarChart}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" /> Carregando relatórios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulte, filtre e exporte relatórios institucionais. Dados simulados.
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Relatórios" value={kpis.total} icon={FileBarChart} tone="primary" />
        <StatCard label="Publicados" value={kpis.publicados} tone="success" />
        <StatCard label="Rascunhos" value={kpis.rascunhos} tone="gold" />
        <StatCard label="Registos totais" value={kpis.registos.toLocaleString("pt-PT")} tone="primary" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por título, autor ou ID…"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as ReportCategory | "todas")}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todas">Todas as categorias</option>
          {(Object.entries(REPORT_CATEGORY_LABELS) as [ReportCategory, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportItem["status"] | "todos")}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os estados</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
          <option value="arquivado">Arquivado</option>
        </select>
        <div className="relative">
          <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Período (ex.: 03/2026)"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={exportAll}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Download size={14} /> <span className="hidden sm:inline">Exportar CSV</span><span className="sm:hidden">CSV</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sem relatórios" description="Nenhum relatório corresponde aos filtros." icon={FileBarChart} />
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Título</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Período</th>
                    <th className="px-4 py-3 font-semibold">Autor</th>
                    <th className="px-4 py-3 font-semibold text-right">Registos</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Gerado {new Date(r.generatedAt).toLocaleDateString("pt-PT")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{REPORT_CATEGORY_LABELS[r.category]}</td>
                      <td className="px-4 py-3 text-xs tabular-nums">{r.period}</td>
                      <td className="px-4 py-3 text-xs">{r.author}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.records.toLocaleString("pt-PT")}</td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => exportSingle(r)}
                          aria-label="Exportar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <article key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-muted-foreground">{r.id}</div>
                    <div className="mt-0.5 font-medium text-foreground truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {REPORT_CATEGORY_LABELS[r.category]} · {r.period} · {r.author}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {r.records.toLocaleString("pt-PT")} registos
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    <button
                      onClick={() => exportSingle(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
