import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, TrendingUp, Users, CheckCircle2, ArrowRight, Clock, ShoppingCart, Package, DollarSign, FileBarChart, Activity, UserCog } from "lucide-react";
import { listLeads, type Lead } from "@/lib/leads-store";
import { DASHBOARD_STATS, MOCK_ACTIVITIES } from "@/lib/mock-data";
import { StatCard, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const load = () => setLeads(listLeads());
    load();
    window.addEventListener("hcb_leads_changed", load);
    return () => window.removeEventListener("hcb_leads_changed", load);
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

      {/* Widgets institucionais (mock) */}
      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Visão geral (dados simulados)</h2>
        <div className="mt-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Utilizadores" value={DASHBOARD_STATS.totalUsers} icon={Users} tone="primary" />
          <StatCard label="Administradores" value={DASHBOARD_STATS.administrators} icon={UserCog} tone="gold" />
          <StatCard label="Clientes" value={DASHBOARD_STATS.clients.toLocaleString("pt-PT")} icon={Users} tone="primary" />
          <StatCard label="Pedidos" value={DASHBOARD_STATS.orders} icon={ShoppingCart} tone="success" />
          <StatCard label="Produtos" value={DASHBOARD_STATS.products} icon={Package} tone="primary" />
          <StatCard label="Receita (AOA)" value={(DASHBOARD_STATS.revenue / 1_000_000).toFixed(1) + "M"} icon={DollarSign} tone="success" />
          <StatCard label="Relatórios" value={DASHBOARD_STATS.reports} icon={FileBarChart} tone="primary" />
          <StatCard label="Actividades" value={DASHBOARD_STATS.activities} icon={Activity} tone="gold" />
        </div>
      </section>

      {/* Actividade recente */}
      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-primary">Actividade recente</h2>
        </header>
        <ul className="divide-y divide-border">
          {MOCK_ACTIVITIES.map((a) => (
            <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <div className="truncate text-foreground"><span className="font-semibold">{a.actor}</span> {a.action} <span className="text-muted-foreground">{a.target}</span></div>
                <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("pt-PT")}</div>
              </div>
              <Badge tone={a.type === "success" ? "success" : a.type === "error" ? "danger" : a.type === "warn" ? "gold" : "primary"}>{a.type}</Badge>
            </li>
          ))}
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
