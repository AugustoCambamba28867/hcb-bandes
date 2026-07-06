import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, Download, Upload, Play, RefreshCw, HardDrive, Activity, FileArchive, Search } from "lucide-react";
import { toast } from "sonner";
import { MOCK_TABLES, MOCK_BACKUPS } from "@/lib/mock-data";
import { Badge, ConfirmDialog, StatCard } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/database")({
  component: DatabasePage,
});

type Tab = "tabelas" | "backup" | "sql" | "monitor" | "logs";

function DatabasePage() {
  const [tab, setTab] = useState<Tab>("tabelas");
  const [q, setQ] = useState("");
  const [sql, setSql] = useState("SELECT id, nome, email FROM users\nWHERE status = 'activo'\nORDER BY created_at DESC\nLIMIT 20;");
  const [running, setRunning] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const tables = MOCK_TABLES.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  function runQuery() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast.success("Query executada (mock) · 3 linhas retornadas");
    }, 700);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Base de Dados</h1>
        <p className="mt-1 text-sm text-muted-foreground">Interface de gestão · dados simulados prontos para integração.</p>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tabelas" value={MOCK_TABLES.length} icon={Database} tone="primary" />
        <StatCard label="Registos totais" value="13.4k" icon={HardDrive} tone="gold" />
        <StatCard label="Tamanho total" value="47.6 MB" icon={FileArchive} tone="success" />
        <StatCard label="Sessões activas" value={12} icon={Activity} tone="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {[
          { id: "tabelas", label: "Tabelas" },
          { id: "backup", label: "Backup & Restore" },
          { id: "sql", label: "SQL Viewer" },
          { id: "monitor", label: "Monitoramento" },
          { id: "logs", label: "Auditoria" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tabelas" && (
        <section className="space-y-4">
          <div className="relative max-w-md">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar tabela…" className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold text-right">Registos</th>
                    <th className="px-4 py-3 font-semibold text-right">Tamanho</th>
                    <th className="px-4 py-3 font-semibold">Actualizada</th>
                    <th className="px-4 py-3 text-right font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tables.map((t) => (
                    <tr key={t.name} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{t.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.rows.toLocaleString("pt-PT")}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{t.size}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.lastUpdated}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-xs font-semibold text-primary hover:text-gold">Ver registos</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "backup" && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toast.success("Backup iniciado (mock)")} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Download size={14} /> Criar backup
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
              <Upload size={14} /> Restaurar de ficheiro
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ficheiro</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-right">Tamanho</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 text-right font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_BACKUPS.map((b) => (
                    <tr key={b.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs">{b.name}</td>
                      <td className="px-4 py-3"><Badge tone={b.type === "automático" ? "primary" : "gold"}>{b.type}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums">{b.size}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.at).toLocaleString("pt-PT")}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setConfirmRestore(b.name)} className="text-xs font-semibold text-primary hover:text-gold">Restaurar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "sql" && (
        <section className="space-y-3">
          <div className="rounded-xl border border-border bg-[oklch(0.18_0.03_142)] p-4 font-mono text-sm text-primary-foreground">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full resize-y bg-transparent text-primary-foreground/90 outline-none placeholder:text-primary-foreground/40"
              rows={7}
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={runQuery} disabled={running} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:brightness-95 disabled:opacity-60">
              {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />} Executar
            </button>
            <button onClick={() => setSql("")} className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">Limpar</button>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">Resultado (mock)</div>
            <pre className="mt-2 overflow-x-auto font-mono text-[11px]">{`id     nome              email
u-001  Ana Silva         ana.silva@hcb-bandes.ao
u-002  João Cardoso      joao.cardoso@hcb-bandes.ao
u-003  Marco Kiala       marco.kiala@hcb-bandes.ao`}</pre>
          </div>
        </section>
      )}

      {tab === "monitor" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="CPU" value="34%" icon={Activity} tone="primary" hint="média · 5 min" />
          <StatCard label="Memória" value="1.2 / 4 GB" icon={HardDrive} tone="gold" hint="30% utilizada" />
          <StatCard label="Conexões" value="12 / 100" icon={Database} tone="success" />
          <StatCard label="Uptime" value="14d 6h" icon={Activity} tone="primary" hint="desde 01/01/2026" />
        </section>
      )}

      {tab === "logs" && (
        <section className="rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border text-sm">
            {[
              { t: "há 30s", who: "Ana Silva", act: "INSERT em users (id=usr-013)" },
              { t: "há 2 min", who: "Sistema", act: "backup automático concluído" },
              { t: "há 8 min", who: "João Cardoso", act: "UPDATE em roles (id=Manager)" },
              { t: "há 22 min", who: "Sistema", act: "índice reconstruído em audit_logs" },
              { t: "há 1h", who: "Pedro Almeida", act: "DELETE em leads (id=lead-4821)" },
            ].map((l, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-3 px-5 py-3">
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{l.t}</span>
                <div className="min-w-0">
                  <div className="truncate text-foreground">{l.act}</div>
                  <div className="text-xs text-muted-foreground">por {l.who}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={!!confirmRestore}
        onOpenChange={() => setConfirmRestore(null)}
        title="Restaurar backup?"
        description={`Toda a base de dados será substituída pelo conteúdo de ${confirmRestore}. Esta operação não pode ser revertida.`}
        tone="danger"
        confirmLabel="Restaurar"
        onConfirm={() => {
          toast.success("Restauro iniciado (mock)");
          setConfirmRestore(null);
        }}
      />
    </div>
  );
}
