import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Plus, Trash, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  listServicesFromSupabase,
  saveServiceToSupabase,
  deleteServiceFromSupabase,
  DbService,
} from "@/lib/supabase-data";
import { isSupabaseConfigured } from "@/lib/supabase-client";

export const Route = createFileRoute("/admin/servicos")({
  component: ServicosPage,
});

function ServicosPage() {
  const [services, setServices] = useState<DbService[]>([]);
  const [editing, setEditing] = useState<DbService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (await isSupabaseConfigured()) {
        const remote = await listServicesFromSupabase();
        setServices(remote);
      }
      setLoading(false);
    };
    load();
  }, []);

  async function add() {
    const newService: DbService = {
      id: `${Date.now()}`,
      slug: `servico-${Date.now()}`,
      title: "Novo serviço",
      description: "Descrição do serviço",
      points: [],
      order_index: services.length + 1,
      is_active: true,
    };
    setServices((prev) => [...prev, newService]);
    setEditing(newService);
  }

  async function remove(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (await isSupabaseConfigured()) {
      await deleteServiceFromSupabase(id);
    }
    toast.success("Serviço removido");
  }

  async function save(service: DbService) {
    setSaving(true);
    setServices((prev) => prev.map((item) => (item.id === service.id ? service : item)));
    if (await isSupabaseConfigured()) {
      const remote = await saveServiceToSupabase(service);
      if (remote) {
        setServices((prev) => prev.map((item) => (item.id === service.id ? remote : item)));
      }
    }
    setSaving(false);
    toast.success("Serviço guardado");
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-muted-foreground">Gerencie serviços exibidos no site, com CRUD dinâmico.</p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95">
          <Plus size={16} /> Novo serviço
        </button>
      </header>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" /> Carregando serviços...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <div key={service.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{service.slug}</div>
                  <h2 className="mt-2 text-xl font-semibold text-primary">{service.title}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setEditing(service)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
                    <Edit size={14} /> Editar
                  </button>
                  <button onClick={() => remove(service.id)} className="inline-flex items-center gap-2 rounded-md border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10">
                    <Trash size={14} /> Remover
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
              {service.points.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-foreground">
                  {service.points.map((point, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-gold" /> {point}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{service.is_active ? "Activo" : "Inactivo"}</span>
                <span>Ordem {service.order_index}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-primary">Editar serviço</h3>
              <p className="text-sm text-muted-foreground">Atualize título, descrição, pontos e visibilidade.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
                Cancelar
              </button>
              <button onClick={() => save(editing)} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />} Guardar
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Título</span>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Slug</span>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-2 block">Descrição</span>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-2 block">Pontos (separados por vírgula)</span>
            <input
              value={editing.points.join(", ")}
              onChange={(e) => setEditing({ ...editing, points: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
            />
            Activo
          </label>
        </div>
      )}
    </div>
  );
}
