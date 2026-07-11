import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, Trash2, Mail, Phone, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  listLeadsDynamic,
  updateLeadStatus,
  deleteLead,
  exportLeadsCSV,
  downloadCSV,
  formatLeadWhatsAppText,
  buildWhatsAppUrl,
  type Lead,
  type LeadStatus,
} from "@/lib/leads-store";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contacto: "Em contacto",
  qualificado: "Qualificado",
  fechado: "Fechado",
  descartado: "Descartado",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  novo: "bg-gold/15 text-gold border-gold/30",
  em_contacto: "bg-primary/10 text-primary border-primary/20",
  qualificado:
    "bg-[oklch(0.62_0.17_150)]/15 text-[oklch(0.45_0.15_150)] border-[oklch(0.62_0.17_150)]/30",
  fechado: "bg-primary text-primary-foreground border-primary",
  descartado: "bg-muted text-muted-foreground border-border",
};

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos">("todos");
  const [perfilFilter, setPerfilFilter] = useState<string>("todos");
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    const load = async () => {
      const dynamicLeads = await listLeadsDynamic();
      setLeads(dynamicLeads);
    };
    load();
    window.addEventListener("hcb_leads_changed", load);
    return () => window.removeEventListener("hcb_leads_changed", load);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "todos" && l.status !== statusFilter) return false;
      if (perfilFilter !== "todos" && l.perfil !== perfilFilter) return false;
      if (!term) return true;
      return (
        l.nome.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        (l.empresa ?? "").toLowerCase().includes(term) ||
        (l.telefone ?? "").toLowerCase().includes(term) ||
        l.mensagem.toLowerCase().includes(term)
      );
    });
  }, [leads, q, statusFilter, perfilFilter]);

  const perfis = useMemo(() => Array.from(new Set(leads.map((l) => l.perfil))), [leads]);

  function exportarCSV() {
    if (filtered.length === 0) {
      toast.error("Sem leads para exportar");
      return;
    }
    const csv = exportLeadsCSV(filtered);
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(`hcb-leads-${date}.csv`, csv);
    toast.success(`${filtered.length} leads exportados`);
  }

  function changeStatus(id: string, status: LeadStatus) {
    updateLeadStatus(id, status);
    if (selected?.id === id) setSelected({ ...selected, status });
    toast.success("Estado actualizado");
  }

  function remove(id: string) {
    if (!confirm("Eliminar este lead? Esta acção não pode ser revertida.")) return;
    deleteLead(id);
    if (selected?.id === id) setSelected(null);
    toast.success("Lead eliminado");
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} de {leads.length}
            .
          </p>
        </div>
        <button
          onClick={exportarCSV}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          <Download size={14} /> <span className="hidden sm:inline">Exportar CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </header>

      {/* filtros */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por nome, e-mail, empresa, telefone…"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "todos")}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={perfilFilter}
          onChange={(e) => setPerfilFilter(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os perfis</option>
          {perfis.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* tabela / cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {leads.length === 0
            ? "Ainda não existem leads. Quando alguém preencher o formulário de contacto, aparecerá aqui."
            : "Sem resultados para os filtros aplicados."}
        </div>
      ) : (
        <>
          {/* desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Perfil</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(l)} className="text-left">
                          <div className="font-medium text-foreground">{l.nome}</div>
                          <div className="text-xs text-muted-foreground">{l.email}</div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/80">{l.perfil}</td>
                      <td className="px-4 py-3">
                        <select
                          value={l.status}
                          onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${STATUS_STYLES[l.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, lbl]) => (
                            <option key={v} value={v}>
                              {lbl}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelected(l)}
                            aria-label="Ver detalhes"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-primary"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            onClick={() => remove(l.id)}
                            aria-label="Eliminar"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((l) => (
              <article key={l.id} className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <button onClick={() => setSelected(l)} className="min-w-0 text-left">
                    <div className="font-medium text-foreground truncate">{l.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.email}</div>
                  </button>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[l.status]}`}
                  >
                    {STATUS_LABELS[l.status]}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {l.perfil} · {new Date(l.createdAt).toLocaleDateString("pt-PT")}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, lbl]) => (
                      <option key={v} value={v}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(l.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* detail drawer */}
      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={changeStatus}
          onDelete={remove}
        />
      )}
    </div>
  );
}

function LeadDrawer({
  lead,
  onClose,
  onChangeStatus,
  onDelete,
}: {
  lead: Lead;
  onClose: () => void;
  onChangeStatus: (id: string, s: LeadStatus) => void;
  onDelete: (id: string) => void;
}) {
  const whatsappText = formatLeadWhatsAppText(lead);
  const whatsappUrl = buildWhatsAppUrl(whatsappText);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-card shadow-elegant">
        <header className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-display text-lg font-bold text-primary">Detalhes do lead</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </header>
        <div className="space-y-5 p-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Nome</div>
            <div className="mt-1 font-medium text-foreground">{lead.nome}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`mailto:${lead.email}`}
              className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-foreground hover:border-gold"
            >
              <Mail size={14} className="text-gold" />
              <div className="mt-1.5 break-all">{lead.email}</div>
            </a>
            {lead.telefone ? (
              <a
                href={`tel:${lead.telefone}`}
                className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-foreground hover:border-gold"
              >
                <Phone size={14} className="text-gold" />
                <div className="mt-1.5 break-all">{lead.telefone}</div>
              </a>
            ) : (
              <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                Sem telefone
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="uppercase tracking-wider text-muted-foreground">Empresa</div>
              <div className="mt-1 text-foreground">{lead.empresa || "—"}</div>
            </div>
            <div>
              <div className="uppercase tracking-wider text-muted-foreground">Perfil</div>
              <div className="mt-1 text-foreground">{lead.perfil}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Mensagem</div>
            <p className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-3 text-sm text-foreground/90">
              {lead.mensagem}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Mensagem automática para WhatsApp
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{whatsappText}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:brightness-95 transition"
            >
              Abrir WhatsApp com mensagem
            </a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Estado</div>
            <select
              value={lead.status}
              onChange={(e) => onChangeStatus(lead.id, e.target.value as LeadStatus)}
              className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm font-medium ${STATUS_STYLES[lead.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Recebido em {new Date(lead.createdAt).toLocaleString("pt-PT")}
          </div>
          <button
            onClick={() => onDelete(lead.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} /> Eliminar lead
          </button>
        </div>
      </aside>
    </div>
  );
}
