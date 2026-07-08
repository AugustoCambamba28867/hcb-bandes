import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  X as XIcon,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_ORDERS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/mock-data";
import { Badge, EmptyState, ConfirmDialog, StatCard } from "@/components/ui-kit";
import { canAccessAdminModule, getAdminAccessMessage } from "@/lib/admin-permissions";
import { addAuditEvent } from "@/lib/audit-store";
import { downloadCsv } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — Admin HCB-BANDES" }] }),
  component: PedidosPage,
});

const STATUS_TONE: Record<OrderStatus, "primary" | "gold" | "success" | "danger" | "muted"> = {
  pendente: "gold",
  aprovado: "primary",
  em_processamento: "primary",
  concluido: "success",
  rejeitado: "danger",
  cancelado: "muted",
};

const PAGE_SIZE = 8;

function formatAOA(n: number) {
  return n.toLocaleString("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 });
}

function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [confirm, setConfirm] = useState<{ order: Order; next: OrderStatus } | null>(null);
  const canView = canAccessAdminModule(undefined, "Pedidos", "View");
  const canApprove = canAccessAdminModule(undefined, "Pedidos", "Approve");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "todos" && o.status !== statusFilter) return false;
      if (!term) return true;
      return (
        o.reference.toLowerCase().includes(term) ||
        o.client.toLowerCase().includes(term) ||
        o.email.toLowerCase().includes(term) ||
        o.service.toLowerCase().includes(term)
      );
    });
  }, [orders, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kpis = useMemo(() => {
    return {
      total: orders.length,
      pendentes: orders.filter((o) => o.status === "pendente").length,
      concluidos: orders.filter((o) => o.status === "concluido").length,
      receita: orders
        .filter((o) => o.status === "concluido" || o.status === "aprovado")
        .reduce((s, o) => s + o.amount, 0),
    };
  }, [orders]);

  function setStatus(id: string, status: OrderStatus) {
    if (!canApprove) {
      toast.error(getAdminAccessMessage(undefined, "Pedidos", "Approve"));
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)),
    );
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : s));
    const order = orders.find((o) => o.id === id);
    addAuditEvent({
      actor: "Administrador",
      action:
        status === "aprovado"
          ? "aprovou pedido"
          : status === "rejeitado"
            ? "rejeitou pedido"
            : status === "concluido"
              ? "concluiu pedido"
              : "actualizou pedido",
      target: order?.reference ?? id,
      details: `Estado alterado para ${ORDER_STATUS_LABELS[status]}.`,
      type: status === "rejeitado" || status === "cancelado" ? "warning" : "success",
    });
    toast.success(`Pedido ${ORDER_STATUS_LABELS[status].toLowerCase()}`);
  }

  function exportCSV() {
    if (filtered.length === 0) {
      toast.error("Sem pedidos para exportar");
      return;
    }
    const rows: (string | number)[][] = [
      ["Referência", "Cliente", "Email", "Serviço", "Montante (AOA)", "Estado", "Criado em", "Actualizado em"],
      ...filtered.map((o) => [
        o.reference,
        o.client,
        o.email,
        o.service,
        o.amount,
        ORDER_STATUS_LABELS[o.status],
        new Date(o.createdAt).toLocaleString("pt-PT"),
        new Date(o.updatedAt).toLocaleString("pt-PT"),
      ]),
    ];
    downloadCsv(`hcb-pedidos-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addAuditEvent({
      actor: "Administrador",
      action: "exportou pedidos",
      target: "Pedidos",
      details: `${filtered.length} pedidos exportados em CSV.`,
      type: "info",
    });
    toast.success(`${filtered.length} pedidos exportados`);
  }

  if (!canView) {
    return (
      <EmptyState
        title="Acesso negado"
        description={getAdminAccessMessage(undefined, "Pedidos", "View")}
        icon={ShoppingCart}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestão de pedidos com pesquisa, filtros e aprovação. Dados simulados.
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de pedidos" value={kpis.total} icon={ShoppingCart} tone="primary" />
        <StatCard label="Pendentes" value={kpis.pendentes} icon={ShoppingCart} tone="gold" />
        <StatCard label="Concluídos" value={kpis.concluidos} icon={Check} tone="success" />
        <StatCard label="Receita (aprovada)" value={formatAOA(kpis.receita)} tone="primary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Pesquisar por referência, cliente, email ou serviço…"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | "todos"); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os estados</option>
          {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Download size={14} /> <span className="hidden sm:inline">Exportar CSV</span><span className="sm:hidden">CSV</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sem pedidos" description="Nenhum pedido corresponde aos filtros aplicados." />
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Referência</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Serviço</th>
                    <th className="px-4 py-3 font-semibold text-right">Montante</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{o.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{o.client}</div>
                        <div className="text-xs text-muted-foreground">{o.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/80">{o.service}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatAOA(o.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelected(o)}
                            aria-label="Detalhes"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                          >
                            <Eye size={14} />
                          </button>
                          {o.status === "pendente" && (
                            <>
                              <button
                                onClick={() => setConfirm({ order: o, next: "aprovado" })}
                                aria-label="Aprovar"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-700 hover:bg-green-500/10"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setConfirm({ order: o, next: "rejeitado" })}
                                aria-label="Rejeitar"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                              >
                                <XIcon size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {pageItems.map((o) => (
              <article key={o.id} className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-muted-foreground">{o.reference}</div>
                    <div className="mt-0.5 font-medium text-foreground truncate">{o.client}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.service}</div>
                  </div>
                  <Badge tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-semibold tabular-nums">{formatAOA(o.amount)}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelected(o)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
                      <Eye size={14} />
                    </button>
                    {o.status === "pendente" && (
                      <>
                        <button onClick={() => setConfirm({ order: o, next: "aprovado" })} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-700 hover:bg-green-500/10">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setConfirm({ order: o, next: "rejeitado" })} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10">
                          <XIcon size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              A mostrar {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 tabular-nums text-foreground font-medium">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={(next) => setConfirm({ order: selected, next })}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm ? `Alterar estado para "${ORDER_STATUS_LABELS[confirm.next]}"?` : ""}
        description={confirm ? `Pedido ${confirm.order.reference} de ${confirm.order.client}.` : ""}
        confirmLabel="Confirmar"
        tone={confirm?.next === "rejeitado" || confirm?.next === "cancelado" ? "danger" : "primary"}
        onConfirm={() => {
          if (confirm) setStatus(confirm.order.id, confirm.next);
          setConfirm(null);
        }}
      />
    </div>
  );
}

function OrderDrawer({
  order,
  onClose,
  onChangeStatus,
}: {
  order: Order;
  onClose: () => void;
  onChangeStatus: (s: OrderStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-card shadow-elegant">
        <header className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">{order.reference}</div>
            <h2 className="font-display text-lg font-bold text-primary">Detalhes do pedido</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary">
            <XIcon size={16} />
          </button>
        </header>
        <div className="space-y-5 p-5 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</div>
            <div className="mt-1 font-medium text-foreground">{order.client}</div>
            <div className="text-xs text-muted-foreground">{order.email}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Serviço</div>
              <div className="mt-1 text-foreground">{order.service}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Montante</div>
              <div className="mt-1 font-semibold text-foreground tabular-nums">{formatAOA(order.amount)}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Estado</div>
            <div className="mt-1"><Badge tone={STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="uppercase tracking-wider text-muted-foreground">Criado</div>
              <div className="mt-1 text-foreground">{new Date(order.createdAt).toLocaleString("pt-PT")}</div>
            </div>
            <div>
              <div className="uppercase tracking-wider text-muted-foreground">Actualizado</div>
              <div className="mt-1 text-foreground">{new Date(order.updatedAt).toLocaleString("pt-PT")}</div>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acções</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeStatus("aprovado")}
                disabled={order.status === "aprovado" || order.status === "concluido"}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
              >
                <Check size={12} /> Aprovar
              </button>
              <button
                onClick={() => onChangeStatus("em_processamento")}
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Em processamento
              </button>
              <button
                onClick={() => onChangeStatus("concluido")}
                className="inline-flex items-center justify-center rounded-md bg-gold px-3 py-2 text-xs font-semibold text-gold-foreground hover:brightness-95"
              >
                Concluir
              </button>
              <button
                onClick={() => onChangeStatus("rejeitado")}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <XIcon size={12} /> Rejeitar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
