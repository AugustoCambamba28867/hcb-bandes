import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, X, Building, Loader2, UploadCloud, ImagePlus, Star, ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  listProperties,
  upsertProperty,
  deleteProperty,
  fetchPropertiesRemote,
  forcePushLocalToSupabase,
  type Property,
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  PROVINCES,
} from "@/lib/properties-store";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { Badge, ConfirmDialog, EmptyState } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/condominios")({
  component: CondominiosAdminPage,
});

const STATUS_TONES: Record<Property["status"], "success" | "gold" | "primary" | "muted"> = {
  disponivel: "success",
  em_construcao: "gold",
  pronto_habitar: "primary",
  vendido: "muted",
};

function CondominiosAdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<Property["type"] | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<Property["status"] | "todos">("todos");
  const [provinceFilter, setProvinceFilter] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof Property; dir: "asc" | "desc" }>({ key: "created_at", dir: "desc" });
  const [editing, setEditing] = useState<Property | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Property | null>(null);

  const perPage = 10;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const local = listProperties();
      setProperties(local);
      if (await isSupabaseConfigured()) {
        // Enviar os imóveis locais para o Supabase automaticamente se ainda não estiverem lá
        await forcePushLocalToSupabase().catch(() => {});
        const remote = await fetchPropertiesRemote();
        if (remote !== null && remote.length > 0) {
          setProperties(remote);
        }
      }
      setLoading(false);
    }

    load();
    const sync = () => setProperties(listProperties());
    window.addEventListener("hcb_properties_changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hcb_properties_changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleManualSync() {
    setSyncing(true);
    try {
      const count = await forcePushLocalToSupabase();
      const updated = await fetchPropertiesRemote();
      if (updated && updated.length > 0) {
        setProperties(updated);
      }
      toast.success(count > 0 ? `${count} propriedade(s) sincronizada(s) com o Supabase!` : "Base de dados sincronizada com sucesso!");
    } catch (e) {
      toast.error("Erro ao sincronizar com o Supabase");
    } finally {
      setSyncing(false);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = properties
      .filter((p) => (typeFilter === "todos" ? true : p.type === typeFilter))
      .filter((p) => (statusFilter === "todos" ? true : p.status === statusFilter))
      .filter((p) => (provinceFilter === "todos" ? true : p.province === provinceFilter))
      .filter((p) => {
        if (!term) return true;
        return (
          p.name.toLowerCase().includes(term) ||
          p.zone.toLowerCase().includes(term) ||
          p.promoter.toLowerCase().includes(term)
        );
      });
    list.sort((a, b) => {
      const av = String(a[sort.key] ?? "");
      const bv = String(b[sort.key] ?? "");
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [properties, q, typeFilter, statusFilter, provinceFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(key: keyof Property) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  async function save(property: Property) {
    // cast to match the upsert signature which might use DbProperty internally
    const saved = await upsertProperty(property as any);
    setProperties((prev) => {
      const idx = prev.findIndex((p) => p.id === property.id);
      if (idx === -1) return [saved as unknown as Property, ...prev];
      const next = [...prev];
      next[idx] = saved as unknown as Property;
      return next;
    });
    toast.success("Condomínio/Residência salvo com sucesso");
  }

  async function remove(id: string) {
    await deleteProperty(id);
    setProperties((p) => p.filter((item) => item.id !== id));
    toast.success("Excluído com sucesso");
    setConfirmDel(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" /> Carregando propriedades...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Condomínios e Residências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "propriedade" : "propriedades"} cadastradas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-60"
            title="Enviar imóveis locais para o Supabase e atualizar"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin text-primary" : "text-muted-foreground"} />
            <span className="hidden sm:inline">{syncing ? "A sincronizar..." : "Sincronizar com Supabase"}</span>
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Nova propriedade</span><span className="sm:hidden">Nova</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Pesquisar por nome, zona ou promotor…"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as Property["type"] | "todos"); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"
        >
          <option value="todos">Todos os tipos</option>
          {Object.entries(PROPERTY_TYPES).map(([t, label]) => (
            <option key={t} value={t}>{label}</option>
          ))}
        </select>
        <select
          value={provinceFilter}
          onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"
        >
          <option value="todos">Todas as províncias</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as Property["status"] | "todos"); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"
        >
          <option value="todos">Todos os estados</option>
          {Object.entries(PROPERTY_STATUSES).map(([s, label]) => (
            <option key={s} value={s}>{label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building} title="Sem propriedades" description="Ajuste os filtros ou crie uma nova propriedade." action={
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus size={14} /> Nova propriedade
          </button>
        } />
      ) : (
        <>
          {/* Tabela Desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <SortableTH label="Nome" active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")} />
                    <SortableTH label="Localização" active={sort.key === "province"} dir={sort.dir} onClick={() => toggleSort("province")} />
                    <SortableTH label="Tipo" active={sort.key === "type"} dir={sort.dir} onClick={() => toggleSort("type")} />
                    <SortableTH label="Preço" active={sort.key === "price"} dir={sort.dir} onClick={() => toggleSort("price")} />
                    <SortableTH label="Estado" active={sort.key === "status"} dir={sort.dir} onClick={() => toggleSort("status")} />
                    <th className="px-4 py-3 text-right font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.promoter}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-foreground/80">{p.province}</div>
                        <div className="text-muted-foreground">{p.zone}</div>
                      </td>
                      <td className="px-4 py-3 capitalize"><Badge tone="primary">{p.type}</Badge></td>
                      <td className="px-4 py-3">
                        {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(p.price)}
                      </td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONES[p.status]}>{p.status.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction label="Editar" onClick={() => setEditing(p)}><Pencil size={14} /></IconAction>
                          <IconAction label="Eliminar" danger onClick={() => setConfirmDel(p)}><Trash2 size={14} /></IconAction>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden space-y-3">
            {pageItems.map((p) => (
              <article key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.province} - {p.zone}</div>
                  </div>
                  <Badge tone={STATUS_TONES[p.status]}>{p.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Tipo:</span> <span className="capitalize">{p.type}</span></div>
                  <div><span className="text-muted-foreground">Preço:</span> {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(p.price)}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <IconAction label="Editar" onClick={() => setEditing(p)}><Pencil size={14} /></IconAction>
                  <IconAction label="Eliminar" danger onClick={() => setConfirmDel(p)}><Trash2 size={14} /></IconAction>
                </div>
              </article>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>Página {page} de {totalPages}</div>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md border border-border bg-card px-3 py-1.5 disabled:opacity-40">Anterior</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-md border border-border bg-card px-3 py-1.5 disabled:opacity-40">Seguinte</button>
            </div>
          </div>
        </>
      )}

      {(editing || creating) && (
        <PropertyFormDrawer
          property={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(p) => { save(p); setEditing(null); setCreating(false); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onOpenChange={() => setConfirmDel(null)}
        title="Eliminar propriedade?"
        description={confirmDel ? `A propriedade "${confirmDel.name}" será removida permanentemente.` : ""}
        tone="danger"
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDel) remove(confirmDel.id); }}
      />
    </div>
  );
}

function SortableTH({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th className="px-4 py-3 font-semibold">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-primary">
        {label} {active && <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

function IconAction({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition ${danger ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-secondary hover:text-primary"}`}
    >
      {children}
    </button>
  );
}

function PropertyFormDrawer({ property, onClose, onSave }: { property: Property | null; onClose: () => void; onSave: (p: Property) => void }) {
  const isNew = !property;
  const [form, setForm] = useState<Property>(
    property ?? {
      id: `prop-${Math.random().toString(36).slice(2, 8)}`,
      name: "",
      type: "condominio",
      province: "Luanda",
      zone: "",
      status: "disponivel",
      description: "",
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      price: 0,
      amenities: [],
      images: [],
      financing: "",
      promoter: "",
      contact_info: "",
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [amenitiesStr, setAmenitiesStr] = useState(form.amenities.join(", "));
  const [images, setImages] = useState<string[]>(Array.isArray(form.images) ? form.images : []);
  const [uploading, setUploading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Nome deve possuir pelo menos 3 caracteres.";
    if (!form.zone.trim()) e.zone = "Zona obrigatória.";
    if (form.price < 0) e.price = "Preço inválido.";
    if (form.area < 0) e.area = "Área inválida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];
    let processed = 0;
    const fileList = Array.from(files);

    fileList.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`O ficheiro ${file.name} é muito pesado (máx. 5MB).`);
        processed++;
        if (processed === fileList.length) setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          newImages.push(result);
        }
        processed++;
        if (processed === fileList.length) {
          setImages((prev) => [...prev, ...newImages]);
          setUploading(false);
          toast.success(`${newImages.length} imagem(ns) carregada(s) com sucesso`);
        }
      };
      reader.onerror = () => {
        processed++;
        if (processed === fileList.length) setUploading(false);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Imagem removida");
  }

  function setAsCover(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
    toast.success("Definida como imagem principal");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Corrija os erros do formulário");
      return;
    }
    const finalForm = {
      ...form,
      amenities: amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean),
      images: images,
      updated_at: new Date().toISOString(),
    };
    onSave(finalForm);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden bg-card shadow-elegant">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-primary">
            {isNew ? "Nova Propriedade" : "Editar Propriedade"}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </header>
        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" error={errors.name} required>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls(errors.name)} />
            </Field>
            <Field label="Tipo">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Property["type"] })} className={inputCls()}>
                {Object.entries(PROPERTY_TYPES).map(([t, label]) => <option key={t} value={t}>{label}</option>)}
              </select>
            </Field>
            <Field label="Província">
              <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className={inputCls()}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Zona" error={errors.zone} required>
              <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className={inputCls(errors.zone)} />
            </Field>
            <Field label="Estado">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Property["status"] })} className={inputCls()}>
                {Object.entries(PROPERTY_STATUSES).map(([s, label]) => <option key={s} value={s}>{label}</option>)}
              </select>
            </Field>
            <Field label="Preço (AOA)" error={errors.price} required>
              <input type="number" min={0} step="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls(errors.price)} />
            </Field>
            <Field label="Área (m²)" error={errors.area}>
              <input type="number" min={0} step="0.01" value={form.area || ""} onChange={(e) => setForm({ ...form, area: Number(e.target.value) })} className={inputCls(errors.area)} />
            </Field>
            <Field label="Quartos">
              <input type="number" min={0} value={form.bedrooms || ""} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} className={inputCls()} />
            </Field>
            <Field label="Casas de Banho">
              <input type="number" min={0} value={form.bathrooms || ""} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} className={inputCls()} />
            </Field>
            <Field label="Promotor">
              <input value={form.promoter} onChange={(e) => setForm({ ...form, promoter: e.target.value })} className={inputCls()} />
            </Field>
            <Field label="Contacto (Promotor)">
              <input value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} className={inputCls()} />
            </Field>
          </div>

          <div className="grid gap-4">
            <Field label="Descrição">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls()} rows={3} />
            </Field>
            <Field label="Comodidades (separadas por vírgula)">
              <input value={amenitiesStr} onChange={(e) => setAmenitiesStr(e.target.value)} placeholder="Piscina, Ginásio, Segurança 24h, Gerador" className={inputCls()} />
            </Field>

            {/* UPLOAD DE IMAGENS */}
            <Field label="Imagens e Fotografias">
              <div className="space-y-3">
                <label
                  htmlFor="prop-images-upload"
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/60 rounded-xl cursor-pointer transition text-center group"
                >
                  <input
                    id="prop-images-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="p-3 bg-primary/10 text-primary rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {uploading ? "A processar ficheiros..." : "Clique para carregar ou arraste fotos"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    PNG, JPG, JPEG, WebP (Pode seleccionar várias imagens em simultâneo)
                  </span>
                </label>

                {/* Galeria de Fotos */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted shadow-sm"
                      >
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                            Capa
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsCover(idx)}
                              title="Definir como capa principal"
                              className="p-1.5 bg-card text-foreground hover:bg-card/90 rounded-full text-xs shadow"
                            >
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            title="Remover imagem"
                            className="p-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Condições de Financiamento">
              <textarea value={form.financing} onChange={(e) => setForm({ ...form, financing: e.target.value })} className={inputCls()} rows={2} placeholder="Ex.: Financiamento bancário até 25 anos com BAI/BFA." />
            </Field>
          </div>
          <div className="flex gap-6 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Destaque
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Activo
            </label>
          </div>
        </form>
        <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} type="button" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Cancelar</button>
          <button onClick={submit} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            {isNew ? "Criar Propriedade" : "Guardar Alterações"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input"}`;
}