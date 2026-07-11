import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listPageContentFromSupabase, savePageContentToSupabase } from "@/lib/supabase-data";
import { isSupabaseConfigured } from "@/lib/supabase-client";

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

  useEffect(() => {
    async function load() {
      if (await isSupabaseConfigured()) {
        const rows = await listPageContentFromSupabase();
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
          setLoading(false);
          return;
        }
      }

      try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) setData({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
      setLoading(false);
    }

    load();
  }, []);

  async function save() {
    if (await isSupabaseConfigured()) {
      const rows = Object.entries(data).map(([page_key, value]) => ({
        page_key,
        title: value.title,
        description: value.description,
        hero: value.hero ?? null,
      }));
      const results = await Promise.all(rows.map((row) => savePageContentToSupabase(row)));
      if (results.every((result) => result !== null)) {
        toast.success("Conteúdos guardados", {
          description: "Alterações foram publicadas com sucesso.",
        });
        return;
      }
      toast.error("Falha ao guardar no backend. Consulte a consola.");
      return;
    }

    window.localStorage.setItem(KEY, JSON.stringify(data));
    toast.success("Conteúdos guardados", {
      description: "Alterações guardadas localmente.",
    });
  }

  function update(page: string, field: keyof PageContent, value: string) {
    setData((d) => ({ ...d, [page]: { ...d[page], [field]: value } }));
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
