import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui-kit";
import { getSettingsAsync, saveSettings, resetSettings, type SiteSettings, DEFAULT_SETTINGS } from "@/lib/site-settings";
import { clearLeads } from "@/lib/leads-store";

export const Route = createFileRoute("/admin/definicoes")({
  component: DefinicoesPage,
});

function DefinicoesPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  useEffect(() => {
    async function load() {
      const settings = await getSettingsAsync();
      setS(settings);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        A carregar definições...
      </div>
    );
  }

  if (!s) return null;

  function update<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setS((prev) => prev && { ...prev, [k]: v });
  }

  const [saving, setSaving] = useState(false);

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      await saveSettings(s);
      toast.success("Definições guardadas com sucesso no Supabase!");
    } catch {
      toast.error("Erro ao guardar definições no Supabase");
    } finally {
      setSaving(false);
    }
  }

  function doReset() {
    resetSettings();
    setS(DEFAULT_SETTINGS);
    toast.success("Definições repostas com sucesso");
    setConfirmReset(false);
  }

  function reset() {
    setConfirmReset(true);
  }

  function doPurgeLeads() {
    clearLeads();
    toast.success("Leads eliminados com sucesso");
    setConfirmPurge(false);
  }

  function purgeLeads() {
    setConfirmPurge(true);
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Definições</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados institucionais, contactos e gestão de dados salvos no Supabase.
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
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "A guardar..." : "Guardar"}
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

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Repor definições?"
        description="Repor todas as definições para os valores predefinidos?"
        tone="danger"
        confirmLabel="Repor"
        onConfirm={doReset}
      />
      <ConfirmDialog
        open={confirmPurge}
        onOpenChange={setConfirmPurge}
        title="Eliminar todos os leads?"
        description="Esta acção não pode ser revertida."
        tone="danger"
        confirmLabel="Eliminar"
        onConfirm={doPurgeLeads}
      />
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
