import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, TrendingUp, Users, CheckCircle2, ArrowRight, Clock, Package, FileBarChart } from "lucide-react";
import { listLeadsDynamic, type Lead } from "@/lib/leads-store";
import { listPageContentFromSupabase, listServicesFromSupabase } from "@/lib/supabase-data";
import { getSettingsAsync, type SiteSettings } from "@/lib/site-settings";
import { StatCard, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Array<{ title: string }>>([]);
  const [pages, setPages] = useState<Array<{ page_key: string }>>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [remoteLeads, remoteServices, remotePages, remoteSettings] = await Promise.all([
        listLeadsDynamic(),
        listServicesFromSupabase(),
        listPageContentFromSupabase(),
        getSettingsAsync(),
      ]);
      setLeads(remoteLeads);
      setServices(remoteServices);
      setPages(remotePages);
      setSettings(remoteSettings);
      setLoading(false);
    };

    const handleLeadChange = () => {
      void load();
    };

    void load();
    window.addEventListener("hcb_leads_changed", handleLeadChange);
    return () => window.removeEventListener("hcb_leads_changed", handleLeadChange);
  }, []);

  const total = leads.length;
  const novos = leads.filter((l) => l.status === "novo").length;
  const qualificados = leads.filter((l) => l.status === "qualificado").length;
  const fechados = leads.filter((l) => l.status === "fechado").length;

  const last7 = leads.filter((l) => {
    const d = new Date(l.createdAt).getTime();
    return Date.now() - d < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const recentes = leads.slice(0, 5);
  const partnerCount = (settings?.bancosParceiros?.length ?? 0) + (settings?.empresasParceiras?.length ?? 0) + (settings?.promotoresParceiros?.length ?? 0);

  const stats = [
    { label: "Leads totais", value: total, icon: Inbox, color: "bg-primary text-primary-foreground" },
    { label: "Novos por tratar", value: novos, icon: Clock, color: "bg-gold text-gold-foreground" },
    { label: "Últimos 7 dias", value: last7, icon: TrendingUp, color: "bg-primary/10 text-primary" },
    { label: "Qualificados", value: qualificados, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Fechados", value: fechados, icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da actividade do site e dos leads recolhidos.
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-primary">Actividade recente</h2>
        </header>
        <ul className="divide-y divide-border">
          {loading ? (
            <li className="px-5 py-6 text-sm text-muted-foreground">A carregar actividade...</li>
          ) : (
            [
              ...leads.slice(0, 3).map((lead) => ({
                id: `lead-${lead.id}`,
                actor: lead.nome,
                action: "enviou um novo lead",
                target: lead.perfil,
                at: lead.createdAt,
                type: "info" as const,
              })),
              ...services.slice(0, 2).map((service, index) => ({
                id: `service-${index}`,
                actor: "Admin",
                action: "actualizou o serviço",
                target: service.title,
                at: new Date().toISOString(),
                type: "success" as const,
              })),
            ]
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
              .slice(0, 5)
              .map((a) => (
                <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate text-foreground"><span className="font-semibold">{a.actor}</span> {a.action} <span className="text-muted-foreground">{a.target}</span></div>
                    <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("pt-PT")}</div>
                  </div>
                  <Badge tone={a.type === "success" ? "success" : a.type === "error" ? "danger" : a.type === "warn" ? "gold" : "primary"}>{a.type}</Badge>
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
              <li key={l.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{l.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {l.perfil} · {l.email}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  {new Date(l.createdAt).toLocaleString("pt-PT")}
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
