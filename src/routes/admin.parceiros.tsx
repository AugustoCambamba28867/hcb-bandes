import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ChangeEvent } from "react";
import { Plus, Trash2, Pencil, X, Loader2, Building2, Landmark, Briefcase, RefreshCw, Globe, Image, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui-kit";
import {
  useAdminPartners,
  upsertPartner,
  removePartner,
  refreshPartnersFromSupabase,
  PARTNER_CATEGORIES,
  type Partner,
  type PartnerCategory,
} from "@/lib/partners-store";

export const Route = createFileRoute("/admin/parceiros")({
  component: ParceirosAdminPage,
});

const CATEGORY_META: Record<PartnerCategory, { label: string; icon: typeof Building2; color: string }> = {
  empresa: { label: "Empresas Parceiras", icon: Briefcase, color: "text-accent" },
  banco: { label: "Bancos Parceiros", icon: Landmark, color: "text-primary" },
  promotor: { label: "Promotores Imobiliarios", icon: Building2, color: "text-gold" },
};

function emptyPartner(category: PartnerCategory): Partner {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    category,
    logo_url: undefined,
    website: undefined,
    description: undefined,
    is_active: true,
    order_index: 0,
    created_at: now,
    updated_at: now,
  };
}

function PartnerDrawer({
  partner,
  onClose,
  onSaved,
}: {
  partner: Partner;
  onClose: () => void;
  onSaved: (p: Partner) => void;
}) {
  const [form, setForm] = useState<Partner>(partner);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  function set<K extends keyof Partner>(key: K, value: Partner[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um ficheiro de imagem válido (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      set("logo_url", result);
      setUploadingLogo(false);
      toast.success("Logotipo carregado com sucesso");
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar o logotipo");
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("O nome do parceiro é obrigatório"); return; }
    setSaving(true);
    try {
      const saved = await upsertPartner(form);
      toast.success("Parceiro guardado com sucesso");
      onSaved(saved);
      onClose();
    } catch {
      toast.error("Erro ao guardar parceiro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-primary">
            {partner.name ? "Editar Parceiro" : "Novo Parceiro"}
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-secondary">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome *</label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex: Banco BIC, Soft, Vida Imobiliária..."
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Categoria *</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as PartnerCategory)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(PARTNER_CATEGORIES).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Descrição</label>
              <textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value || undefined)}
                placeholder="Breve descrição do parceiro..."
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* UPLOAD DE LOGOTIPO */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                <span className="flex items-center gap-1.5"><Image size={14} /> Logotipo</span>
              </label>

              {form.logo_url ? (
                <div className="relative flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <img
                    src={form.logo_url}
                    alt="Preview logotipo"
                    className="h-16 w-16 rounded-lg border border-border object-contain bg-white p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">Logotipo anexado</p>
                    <p className="text-[11px] text-muted-foreground truncate">Pronto para guardar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("logo_url", undefined)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                    title="Remover logotipo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="partner-logo-upload"
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/60 rounded-xl cursor-pointer transition text-center group"
                >
                  <input
                    id="partner-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <div className="p-3 bg-primary/10 text-primary rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {uploadingLogo ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {uploadingLogo ? "A processar ficheiro..." : "Clique para carregar o logotipo"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    PNG, JPG, SVG, WebP até 5MB
                  </span>
                </label>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                <span className="flex items-center gap-1.5"><Globe size={13} /> Website</span>
              </label>
              <input
                value={form.website ?? ""}
                onChange={(e) => set("website", e.target.value || undefined)}
                placeholder="https://www.parceiro.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Ordem</label>
                <input
                  type="number"
                  min={0}
                  value={form.order_index}
                  onChange={(e) => set("order_index", parseInt(e.target.value) || 0)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => set("is_active", e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Activo
                </label>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar
          </button>
        </footer>
      </aside>
    </>
  );
}

function ParceirosAdminPage() {
  const { partners, loading } = useAdminPartners();
  const [editing, setEditing] = useState<Partner | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function handleDelete() {
    if (!confirmDel) return;
    await removePartner(confirmDel);
    toast.success("Parceiro eliminado");
    setConfirmDel(null);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await refreshPartnersFromSupabase();
      toast.success("Sincronizado com Supabase");
    } catch {
      toast.error("Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  const categorias = (Object.keys(CATEGORY_META) as PartnerCategory[]);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Parceiros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerir empresas, bancos e promotores imobiliarios parceiros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin text-primary" : "text-muted-foreground"} />
            <span className="hidden sm:inline">{syncing ? "A sincronizar..." : "Sincronizar"}</span>
          </button>
          <button
            onClick={() => setEditing(emptyPartner("empresa"))}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Novo parceiro</span><span className="sm:hidden">Novo</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground py-10">
          <Loader2 size={20} className="animate-spin text-primary" /> A carregar parceiros...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {categorias.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const list = partners.filter((p) => p.category === cat).sort((a, b) => a.order_index - b.order_index);
            return (
              <section key={cat} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Icon size={18} className={meta.color} />
                  <h2 className="font-display text-base font-semibold text-primary">{meta.label}</h2>
                  <span className="ml-auto text-xs text-muted-foreground font-medium">{list.length}</span>
                </div>

                {list.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Sem parceiros nesta categoria.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {list.map((p) => (
                      <li key={p.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.name} className="h-8 w-8 rounded object-contain border border-border bg-white p-0.5 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          {p.website && (
                            <a href={p.website} target="_blank" rel="noopener noreferrer"
                              className="truncate text-xs text-primary hover:underline">{p.website}</a>
                          )}
                        </div>
                        {!p.is_active && (
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">Inactivo</span>
                        )}
                        <div className="flex shrink-0 gap-1">
                          <button onClick={() => setEditing(p)}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-primary"
                            title="Editar">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirmDel(p.id)}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => setEditing(emptyPartner(cat))}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  <Plus size={13} /> Adicionar
                </button>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <PartnerDrawer
          partner={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {}}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onOpenChange={(o) => !o && setConfirmDel(null)}
        title="Eliminar parceiro?"
        description="Esta accao e irreversivel. O parceiro sera eliminado do Supabase e do site."
        tone="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
      />
    </div>
  );
}
