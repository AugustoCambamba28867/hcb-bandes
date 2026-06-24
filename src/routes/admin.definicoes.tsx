import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings, resetSettings, type SiteSettings, DEFAULT_SETTINGS } from "@/lib/site-settings";
import { clearLeads } from "@/lib/leads-store";

export const Route = createFileRoute("/admin/definicoes")({
  component: DefinicoesPage,
});

function DefinicoesPage() {
  const [s, setS] = useState<SiteSettings | null>(null);

  useEffect(() => { setS(getSettings()); }, []);

  if (!s) return null;

  function update<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setS((prev) => prev && { ...prev, [k]: v });
  }

  function save() {
    if (!s) return;
    saveSettings(s);
    toast.success("Definições guardadas");
  }

  function reset() {
    if (!confirm("Repor todas as definições para os valores predefinidos?")) return;
    resetSettings();
    setS(DEFAULT_SETTINGS);
    toast.success("Definições repostas");
  }

  function purgeLeads() {
    if (!confirm("Eliminar TODOS os leads? Esta acção não pode ser revertida.")) return;
    clearLeads();
    toast.success("Leads eliminados");
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Definições</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados institucionais, contactos e gestão de dados.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <RotateCcw size={13} /> Repor
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95"
          >
            <Save size={14} /> Guardar
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-primary">Identidade</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="Nome da empresa" value={s.empresa} onChange={(v) => update("empresa", v)} />
          <TextField label="Tagline" value={s.tagline} onChange={(v) => update("tagline", v)} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-primary">Contactos</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="E-mail" type="email" value={s.email} onChange={(v) => update("email", v)} />
          <TextField label="Telefone" value={s.telefone} onChange={(v) => update("telefone", v)} />
          <TextField label="WhatsApp" value={s.whatsapp} onChange={(v) => update("whatsapp", v)} />
          <TextField label="Endereço" value={s.endereco} onChange={(v) => update("endereco", v)} />
        </div>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-destructive">
          <AlertTriangle size={18} /> Zona de risco
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Acções irreversíveis sobre os dados armazenados localmente.
        </p>
        <button
          onClick={purgeLeads}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-background px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
        >
          Eliminar todos os leads
        </button>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
