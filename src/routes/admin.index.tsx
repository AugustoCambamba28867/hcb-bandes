import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, TrendingUp, Users, CheckCircle2, ArrowRight, Clock, Package, FileBarChart, MessageCircle, Globe2, ExternalLink } from "lucide-react";
import { listLeadsDynamic, type Lead } from "@/lib/leads-store";
import { listAuditEventsFromSupabase, listOrdersFromSupabase, listPageContentFromSupabase, listReportsFromSupabase, listServicesFromSupabase, listUsersFromSupabase } from "@/lib/supabase-data";
import { getSettingsAsync, type SiteSettings } from "@/lib/site-settings";
import { StatCard, Badge } from "@/components/ui-kit";
import type { AuditEvent, Order, ReportItem, User } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Array<{ title: string }>>([]);
  const [pages, setPages] = useState<Array<{ page_key: string }>>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [remoteLeads, remoteServices, remotePages, remoteSettings, remoteOrders, remoteReports, remoteUsers, remoteAuditEvents] = await Promise.all([
          listLeadsDynamic(),
          listServicesFromSupabase(),
          listPageContentFromSupabase(),
          getSettingsAsync(),
          listOrdersFromSupabase(),
          listReportsFromSupabase(),
          listUsersFromSupabase(),
          listAuditEventsFromSupabase(),
        ]);
        setLeads(remoteLeads);
        setServices(remoteServices);
        setPages(remotePages);
        setOrders(remoteOrders);
        setReports(remoteReports);
        setUsers(remoteUsers);
        setAuditEvents(remoteAuditEvents);
        setSettings(remoteSettings);
      } finally {
        setLoading(false);
      }
    };

    const handleDataChange = () => {
      void load();
    };

    void load();
    window.addEventListener("hcb_leads_changed", handleDataChange);
    window.addEventListener("hcb_admin_data_changed", handleDataChange);
    window.addEventListener("hcb_settings_changed", handleDataChange);
    return () => {
      window.removeEventListener("hcb_leads_changed", handleDataChange);
      window.removeEventListener("hcb_admin_data_changed", handleDataChange);
      window.removeEventListener("hcb_settings_changed", handleDataChange);
    };
  }, []);

  const total = leads.length;
  const novos = leads.filter((l) => l.status === "novo").length;
  const qualificados = leads.filter((l) => l.status === "qualificado").length;
  const fechados = leads.filter((l) => l.status === "fechado").length;
  const leadsSite = leads.filter((l) => l.canal === "site").length;
  const leadsWhatsapp = leads.filter((l) => l.canal === "whatsapp").length;
  const taxaConversao = total > 0 ? Math.round((qualificados / total) * 100) : 0;
  const tempoMedio = total > 0 ? Math.round((leads.reduce((acc, lead) => acc + (Date.now() - new Date(lead.createdAt).getTime()), 0) / total) / (1000 * 60 * 60)) : 0;

  const last7 = leads.filter((l) => {
    const d = new Date(l.createdAt).getTime();
    return Date.now() - d < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const recentes = leads.slice(0, 5);
  const partnerCount = (settings?.bancosParceiros?.length ?? 0) + (settings?.empresasParceiras?.length ?? 0) + (settings?.promotoresParceiros?.length ?? 0);
  const pendingOrders = orders.filter((order) => order.status === "pendente").length;
  const approvedOrders = orders.filter((order) => order.status === "aprovado").length;
  const completedOrders = orders.filter((order) => order.status === "concluido").length;
  const activeUsers = users.filter((user) => user.status === "activo" && !user.archived).length;
  const reportsCount = reports.length;
  const recentActivity = [
    ...auditEvents.slice(0, 4).map((event) => ({
      id: `audit-${event.id}`,
      actor: event.actor,
      action: event.action,
      target: event.target,
      at: event.at,
      type: event.type === "warning" ? "warn" as const : event.type === "error" ? "danger" as const : event.type === "success" ? "success" as const : "info" as const,
    })),
    ...leads.slice(0, 2).map((lead) => ({
      id: `lead-${lead.id}`,
      actor: lead.nome,
      action: "enviou um novo lead",
      target: lead.perfil,
      at: lead.createdAt,
      type: "info" as const,
    })),
    ...orders.slice(0, 1).map((order) => ({
      id: `order-${order.id}`,
      actor: order.client,
      action: "registou um pedido",
      target: order.service,
      at: order.createdAt,
      type: "success" as const,
    })),
    ...reports.slice(0, 1).map((report) => ({
      id: `report-${report.id}`,
      actor: report.author,
      action: "gerou um relatório",
      target: report.title,
      at: report.generatedAt,
      type: "primary" as const,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Leads totais", value: total, icon: Inbox, color: "bg-primary text-primary-foreground" },
    { label: "Novos por tratar", value: novos, icon: Clock, color: "bg-gold text-gold-foreground" },
    { label: "Últimos 7 dias", value: last7, icon: TrendingUp, color: "bg-primary/10 text-primary" },
    { label: "Leads por site", value: leadsSite, icon: Globe2, color: "bg-primary/10 text-primary" },
    { label: "Leads por WhatsApp", value: leadsWhatsapp, icon: MessageCircle, color: "bg-primary/10 text-primary" },
    { label: "Conversão", value: `${taxaConversao}%`, icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da actividade do site e dos leads recolhidos.
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div className="mt-3 font-display text-2xl sm:text-3xl font-bold text-primary tabular-nums">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Visão geral dinâmica</h2>
        <div className="mt-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Serviços activos" value={services.length} icon={Package} tone="primary" />
          <StatCard label="Conteúdos publicados" value={pages.length} icon={FileBarChart} tone="gold" />
          <StatCard label="Parcerias registadas" value={partnerCount} icon={Users} tone="primary" />
          <StatCard label="Leads qualificados" value={qualificados} icon={CheckCircle2} tone="success" />
          <StatCard label="Leads fechados" value={fechados} icon={CheckCircle2} tone="success" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Resumo operacional</h2>
        <div className="mt-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Pedidos pendentes" value={pendingOrders} icon={Clock} tone="gold" />
          <StatCard label="Pedidos aprovados" value={approvedOrders} icon={CheckCircle2} tone="success" />
          <StatCard label="Pedidos concluídos" value={completedOrders} icon={Package} tone="primary" />
          <StatCard label="Utilizadores activos" value={activeUsers} icon={Users} tone="primary" />
          <StatCard label="Relatórios gerados" value={reportsCount} icon={FileBarChart} tone="gold" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-primary">Resumo de conversão</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total > 0 ? `A taxa atual é de ${taxaConversao}% de leads qualificados.` : "Ainda não há leads suficientes para calcular uma taxa."}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            Tempo médio desde o pedido: {tempoMedio}h
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-primary">Actividade recente</h2>
        </header>
        <ul className="divide-y divide-border">
          {loading ? (
            <li className="px-5 py-6 text-sm text-muted-foreground">A carregar actividade...</li>
          ) : recentActivity.length === 0 ? (
            <li className="px-5 py-6 text-sm text-muted-foreground">Ainda não há actividade registada no painel.</li>
          ) : (
            recentActivity.map((a) => (
              <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate text-foreground"><span className="font-semibold">{a.actor}</span> {a.action} <span className="text-muted-foreground">{a.target}</span></div>
                  <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("pt-PT")}</div>
                </div>
                <Badge tone={a.type === "success" ? "success" : a.type === "danger" ? "danger" : a.type === "warn" ? "gold" : "primary"}>{a.type}</Badge>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-primary">Leads recentes</h2>
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-gold"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </header>
        {recentes.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Ainda não há leads. Os pedidos enviados pelo formulário aparecerão aqui.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentes.map((l) => (
              <li key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{l.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {l.perfil} · {l.email}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge tone={l.canal === "whatsapp" ? "gold" : "primary"}>
                    {l.canal === "whatsapp" ? "WhatsApp" : "Site"}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString("pt-PT")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/leads"
          className="group rounded-xl border border-border bg-card p-5 transition hover:border-gold hover:shadow-elegant"
        >
          <div className="font-display text-lg font-semibold text-primary">Gerir Leads</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesquisar, filtrar, alterar estado e exportar para CSV.
          </p>
        </Link>
        <Link
          to="/admin/definicoes"
          className="group rounded-xl border border-border bg-card p-5 transition hover:border-gold hover:shadow-elegant"
        >
          <div className="font-display text-lg font-semibold text-primary">Definições do site</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Actualizar contactos, dados institucionais e identidade.
          </p>
        </Link>
      </section>
    </div>
  );
}
