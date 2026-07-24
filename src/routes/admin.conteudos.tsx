import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Info, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  listPageContentFromSupabase,
  savePageContentToSupabase,
  listServicesFromSupabase,
  saveServiceToSupabase,
  deleteServiceFromSupabase,
  type DbService,
} from "@/lib/supabase-data";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { CONTENT_EVENT, CONTENT_KEY } from "@/lib/site-content";

export const Route = createFileRoute("/admin/conteudos")({
  component: ConteudosPage,
});

interface PageContent {
  title: string;
  description: string;
  hero?: string;
}

const DEFAULTS: Record<string, PageContent> = {
  home: {
    title: "Conectamos pessoas, empresas, bancos e imóveis.",
    description: "Soluções habitacionais para trabalhadores angolanos.",
    hero: "A HCB-BANDES facilita o acesso à habitação através de parcerias com empresas, bancos e promotores.",
  },
  quemSomos: {
    title: "Uma unidade de negócios dedicada à habitação corporativa.",
    description: "História, missão, visão e valores.",
  },
  servicos: {
    title: "Quatro pilares para uma solução habitacional completa.",
    description: "Habitação Corporativa, Crédito, Imobiliário, Gestão Condominial.",
  },
  beneficios: {
    title: "Vantagens concretas para cada parceiro do ecossistema.",
    description: "Empresas, bancos e trabalhadores.",
  },
};

const KEY = "hcb_content_v1";

function ConteudosPage() {
  const [data, setData] = useState<Record<string, PageContent>>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<DbService[]>([]);
  const [serviceEditor, setServiceEditor] = useState<DbService | null>(null);
  const [serviceSaving, setServiceSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (await isSupabaseConfigured()) {
        const [rows, remoteServices] = await Promise.all([
          listPageContentFromSupabase(),
          listServicesFromSupabase(),
        ]);
        if (rows.length > 0) {
          const loaded: Record<string, PageContent> = { ...DEFAULTS };
          rows.forEach((row) => {
            loaded[row.page_key] = {
              title: row.title,
              description: row.description,
              hero: row.hero ?? undefined,
            };
          });
          setData(loaded);
        }
        setServices(remoteServices);
        setLoading(false);
        return;
      }

      try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) setData({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
      setLoading(false);
    }

    void load();
  }, []);

  async function save() {
    // Sempre espelhar localmente + disparar evento para reflectir no site imediatamente.
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CONTENT_EVENT));

    if (await isSupabaseConfigured()) {
      const rows = Object.entries(data).map(([page_key, value]) => ({
        page_key,
        title: value.title,
        description: value.description,
        hero: value.hero ?? null,
      }));
      const results = await Promise.all(rows.map((row) => savePageContentToSupabase(row)));
      if (results.every((result) => result !== null)) {
        toast.success("Conteúdos publicados", {
          description: "Alterações reflectidas em todo o site.",
        });
        return;
      }
      toast.error("Guardado localmente, mas falhou no backend.");
      return;
    }

    toast.success("Conteúdos publicados", {
      description: "Alterações reflectidas em todo o site.",
    });
  }

  function update(page: string, field: keyof PageContent, value: string) {
    setData((d) => ({ ...d, [page]: { ...d[page], [field]: value } }));
  }

  async function addService() {
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
    setServiceEditor(newService);
  }

  async function saveService(service: DbService) {
    setServiceSaving(true);
    setServices((prev) => prev.map((item) => (item.id === service.id ? service : item)));
    if (await isSupabaseConfigured()) {
      const remote = await saveServiceToSupabase(service);
      if (remote) {
        setServices((prev) => prev.map((item) => (item.id === service.id ? remote : item)));
      }
    }
    setServiceSaving(false);
    setServiceEditor(null);
    toast.success("Serviço guardado");
  }

  async function removeService(id: string) {
    setServices((prev) => prev.filter((service) => service.id !== id));
    if (await isSupabaseConfigured()) {
      await deleteServiceFromSupabase(id);
    }
    toast.success("Serviço removido");
  }

  const tabs = [
    { id: "home", label: "Início" },
    { id: "quemSomos", label: "Quem Somos" },
    { id: "servicos", label: "Serviços" },
    { id: "beneficios", label: "Benefícios" },
  ];

  const current = data[activeTab];

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Conteúdos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edite os textos principais de cada página do site.
          </p>
        </div>
        <button
          onClick={save}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95"
        >
          <Save size={14} /> Guardar
        </button>
      </header>

      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <Info size={16} className="mt-0.5 shrink-0 text-gold" />
        <p>
          As alterações são guardadas localmente para pré-visualização. Quando ligar a base de dados,
          serão publicadas automaticamente nas páginas correspondentes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === t.id
                ? "border-gold text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <FieldRow label="Título principal">
          <input
            value={current.title}
            onChange={(e) => update(activeTab, "title", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldRow>
        <FieldRow label="Descrição curta (SEO)">
          <textarea
            value={current.description}
            onChange={(e) => update(activeTab, "description", e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {current.description.length}/200 caracteres
          </div>
        </FieldRow>
        {"hero" in current && (
          <FieldRow label="Subtítulo do hero">
            <textarea
              value={current.hero ?? ""}
              onChange={(e) => update(activeTab, "hero", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </FieldRow>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-primary">Serviços</h2>
            <p className="mt-1 text-sm text-muted-foreground">Adicione, edite e remova serviços exibidos no site.</p>
          </div>
          <button
            onClick={addService}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95"
          >
            <Plus size={14} /> Novo serviço
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar serviços...
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {services.length === 0 && !serviceEditor ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Ainda não há serviços. Crie o primeiro para aparecer na página principal.
              </div>
            ) : null}

            {serviceEditor ? (
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-primary">Editar serviço</h3>
                    <p className="text-sm text-muted-foreground">Atualize os dados do serviço e a sua visibilidade.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setServiceEditor(null)} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">Cancelar</button>
                    <button onClick={() => void saveService(serviceEditor)} disabled={serviceSaving} className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-gold-foreground hover:brightness-95 disabled:opacity-60">
                      {serviceSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />} Guardar
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span>Título</span>
                    <input value={serviceEditor.title} onChange={(e) => setServiceEditor({ ...serviceEditor, title: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Slug</span>
                    <input value={serviceEditor.slug} onChange={(e) => setServiceEditor({ ...serviceEditor, slug: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                </div>
                <label className="mt-4 block text-sm">
                  <span className="mb-2 block">Descrição</span>
                  <textarea value={serviceEditor.description} onChange={(e) => setServiceEditor({ ...serviceEditor, description: e.target.value })} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </label>
                <label className="mt-4 block text-sm">
                  <span className="mb-2 block">Pontos (separados por vírgula)</span>
                  <input value={serviceEditor.points.join(", ")} onChange={(e) => setServiceEditor({ ...serviceEditor, points: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <label className="mt-4 flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={serviceEditor.is_active ?? true} onChange={(e) => setServiceEditor({ ...serviceEditor, is_active: e.target.checked })} className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring" />
                  Activo
                </label>
              </div>
            ) : null}

            {services.map((service) => (
              <div key={service.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{service.slug}</div>
                  <h3 className="mt-1 font-semibold text-primary">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setServiceEditor(service)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
                    <Pencil size={14} /> Editar
                  </button>
                  <button onClick={() => void removeService(service.id)} className="inline-flex items-center gap-2 rounded-md border border-destructive px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} /> Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
