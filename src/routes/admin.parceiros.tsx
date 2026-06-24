import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/parceiros")({
  component: ParceirosPage,
});

type CategoryKey = "empresasParceiras" | "bancosParceiros" | "promotoresParceiros";

const CATEGORIES: { key: CategoryKey; label: string; desc: string }[] = [
  { key: "empresasParceiras", label: "Empresas parceiras", desc: "Empregadores que oferecem o benefício habitacional." },
  { key: "bancosParceiros", label: "Bancos parceiros", desc: "Instituições financeiras que financiam o crédito." },
  { key: "promotoresParceiros", label: "Promotores imobiliários", desc: "Promotores e condomínios da carteira." },
];

function ParceirosPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => { setSettings(getSettings()); }, []);

  if (!settings) return null;

  function add(cat: CategoryKey) {
    const name = prompt("Nome do parceiro?");
    if (!name?.trim()) return;
    setSettings((s) => s && { ...s, [cat]: [...s[cat], name.trim()] });
  }
  function remove(cat: CategoryKey, idx: number) {
    setSettings((s) => s && { ...s, [cat]: s[cat].filter((_, i) => i !== idx) });
  }
  function save() {
    if (!settings) return;
    saveSettings(settings);
    toast.success("Parceiros guardados");
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Parceiros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerir a lista de parceiros apresentados publicamente no site.
          </p>
        </div>
        <button
          onClick={save}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95"
        >
          <Save size={14} /> Guardar
        </button>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <section key={c.key} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold text-primary">{c.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            <ul className="mt-4 space-y-2">
              {settings[c.key].length === 0 && (
                <li className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Sem parceiros nesta categoria.
                </li>
              )}
              {settings[c.key].map((name, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">
                  <span className="truncate text-foreground">{name}</span>
                  <button
                    onClick={() => remove(c.key, idx)}
                    aria-label="Remover"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => add(c.key)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-foreground hover:border-gold hover:text-primary"
            >
              <Plus size={14} /> Adicionar
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
