import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Plus, Trash, Edit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/servicos")({
  component: ServicosPage,
});

type Service = {
  id: string;
  title: string;
  description: string;
  points: string[];
  is_active?: boolean;
};

const KEY = "hcb_services_v1";

const SAMPLE: Service[] = [
  { id: "s1", title: "Habitação Corporativa", description: "Programas habitacionais para colaboradores.", points: ["Benefício habitacional","Parcerias"], is_active: true },
  { id: "s2", title: "Crédito Imobiliário", description: "Financiamento com bancos parceiros.", points: ["Apoio financeiro","Taxas competitivas"], is_active: true },
];

function ServicosPage() {
  const [services, setServices] = useState<Service[]>(SAMPLE);
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setServices(JSON.parse(raw));
    } catch {}
  }, []);

  function saveLocal(list: Service[]) {
    setServices(list);
    window.localStorage.setItem(KEY, JSON.stringify(list));
  }

  function add() {
    const s: Service = { id: `${Date.now()}`, title: "Novo serviço", description: "Descrição...", points: [], is_active: true };
    saveLocal([...services, s]);
    setEditing(s);
  }

  function remove(id: string) {
    saveLocal(services.filter((s) => s.id !== id));
    toast.success("Serviço removido");
  }

  function update(s: Service) {
    saveLocal(services.map((it) => (it.id === s.id ? s : it)));
    toast.success("Serviço atualizado");
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova serviços exibidos no site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={add} className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-gold-foreground">
            <Plus size={14} /> Novo
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.description}</div>
                <ul className="mt-2 list-inside list-disc text-sm">
                  {s.points.map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => setEditing(s)} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                  <Edit size={12} /> Editar
                </button>
                <button onClick={() => remove(s.id)} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-destructive">
                  <Trash size={12} /> Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold">Editar Serviço</h3>
          <div className="mt-3 grid gap-3">
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-md border px-3 py-2" />
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-md border px-3 py-2" />
            <input value={editing.points.join(", ")} onChange={(e) => setEditing({ ...editing, points: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} className="w-full rounded-md border px-3 py-2" />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Activo
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => update(editing)} className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-gold-foreground"><Save size={14} /> Guardar</button>
              <button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
