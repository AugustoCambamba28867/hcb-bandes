import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, Archive, Copy, ArchiveRestore, X, Users2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLES, type Role, type User } from "@/lib/mock-data";
import { listUsers, upsertUser, fetchUsersRemote } from "@/lib/admin-dynamic-store";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { Badge, ConfirmDialog, EmptyState, PasswordStrength } from "@/components/ui-kit";
import { maskPhoneAO } from "@/lib/masks";
import { evaluatePassword } from "@/lib/password-strength";

export const Route = createFileRoute("/admin/utilizadores")({
  component: UsersPage,
});

const STATUS_TONES: Record<User["status"], "success" | "muted" | "danger"> = {
  activo: "success",
  inactivo: "muted",
  suspenso: "danger",
};

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<User["status"] | "todos">("todos");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof User; dir: "asc" | "desc" }>({ key: "firstName", dir: "asc" });
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState<User | null>(null);

  const perPage = 8;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (await isSupabaseConfigured()) {
        const remote = await fetchUsersRemote();
        if (remote && remote.length > 0) {
          setUsers(remote);
          setLoading(false);
          return;
        }
      }
      setUsers(listUsers());
      setLoading(false);
    }

    load();
    const sync = () => setUsers(listUsers());
    window.addEventListener("hcb_admin_data_changed", sync);
    return () => window.removeEventListener("hcb_admin_data_changed", sync);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = users
      .filter((u) => (showArchived ? u.archived : !u.archived))
      .filter((u) => (roleFilter === "todos" ? true : u.role === roleFilter))
      .filter((u) => (statusFilter === "todos" ? true : u.status === statusFilter))
      .filter((u) => {
        if (!term) return true;
        return (
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.department.toLowerCase().includes(term)
        );
      });
    list.sort((a, b) => {
      const av = String(a[sort.key] ?? "");
      const bv = String(b[sort.key] ?? "");
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [users, q, roleFilter, statusFilter, showArchived, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(key: keyof User) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function save(user: User) {
    const saved = upsertUser(user);
    setUsers((prev) => {
      const idx = prev.findIndex((p) => p.id === user.id);
      if (idx === -1) return [saved, ...prev];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    toast.success("Utilizador guardado");
  }

  function duplicate(u: User) {
    const copy: User = {
      ...u,
      id: `usr-${Math.random().toString(36).slice(2, 8)}`,
      email: `copia.${u.email}`,
      firstName: `${u.firstName} (cópia)`,
      createdAt: new Date().toISOString(),
    };
    setUsers((p) => [copy, ...p]);
    toast.success("Utilizador duplicado");
  }

  function archive(id: string) {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, archived: true } : u)));
    toast.success("Utilizador arquivado");
  }

  function restore(id: string) {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, archived: false } : u)));
    toast.success("Utilizador restaurado");
  }

  function remove(id: string) {
    setUsers((p) => p.filter((u) => u.id !== id));
    toast.success("Utilizador eliminado");
    setConfirmDel(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" /> Carregando utilizadores...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Utilizadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "utilizador" : "utilizadores"} · dados simulados.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} /> <span className="hidden sm:inline">Novo utilizador</span><span className="sm:hidden">Novo</span>
        </button>
      </header>

      {/* filtros */}
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Pesquisar por nome, e-mail, departamento…"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as Role | "todos"); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"
        >
          <option value="todos">Todos os papéis</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as User["status"] | "todos"); setPage(1); }}
          className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"
        >
          <option value="todos">Todos os estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="suspenso">Suspenso</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2.5 text-sm">
          <input type="checkbox" checked={showArchived} onChange={(e) => { setShowArchived(e.target.checked); setPage(1); }} />
          Arquivados
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users2} title="Sem utilizadores" description="Ajuste os filtros ou crie um novo utilizador." action={
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus size={14} /> Novo utilizador
          </button>
        } />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <SortableTH label="Nome" active={sort.key === "firstName"} dir={sort.dir} onClick={() => toggleSort("firstName")} />
                    <SortableTH label="Departamento" active={sort.key === "department"} dir={sort.dir} onClick={() => toggleSort("department")} />
                    <SortableTH label="Papel" active={sort.key === "role"} dir={sort.dir} onClick={() => toggleSort("role")} />
                    <SortableTH label="Estado" active={sort.key === "status"} dir={sort.dir} onClick={() => toggleSort("status")} />
                    <th className="px-4 py-3 text-right font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{u.firstName} {u.lastName}</div>
                            <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-foreground/80">{u.department}</div>
                        <div className="text-muted-foreground">{u.position}</div>
                      </td>
                      <td className="px-4 py-3"><Badge tone="primary">{u.role}</Badge></td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONES[u.status]}>{u.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction label="Editar" onClick={() => setEditing(u)}><Pencil size={14} /></IconAction>
                          <IconAction label="Duplicar" onClick={() => duplicate(u)}><Copy size={14} /></IconAction>
                          {u.archived ? (
                            <IconAction label="Restaurar" onClick={() => restore(u.id)}><ArchiveRestore size={14} /></IconAction>
                          ) : (
                            <IconAction label="Arquivar" onClick={() => archive(u.id)}><Archive size={14} /></IconAction>
                          )}
                          <IconAction label="Eliminar" danger onClick={() => setConfirmDel(u)}><Trash2 size={14} /></IconAction>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {pageItems.map((u) => (
              <article key={u.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.firstName} {u.lastName}</div>
                      <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONES[u.status]}>{u.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Papel:</span> {u.role}</div>
                  <div><span className="text-muted-foreground">Dept:</span> {u.department}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <IconAction label="Editar" onClick={() => setEditing(u)}><Pencil size={14} /></IconAction>
                  <IconAction label="Duplicar" onClick={() => duplicate(u)}><Copy size={14} /></IconAction>
                  {u.archived ? (
                    <IconAction label="Restaurar" onClick={() => restore(u.id)}><ArchiveRestore size={14} /></IconAction>
                  ) : (
                    <IconAction label="Arquivar" onClick={() => archive(u.id)}><Archive size={14} /></IconAction>
                  )}
                  <IconAction label="Eliminar" danger onClick={() => setConfirmDel(u)}><Trash2 size={14} /></IconAction>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
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
        <UserFormDrawer
          user={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(u) => { save(u); setEditing(null); setCreating(false); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onOpenChange={() => setConfirmDel(null)}
        title="Eliminar utilizador?"
        description={confirmDel ? `${confirmDel.firstName} ${confirmDel.lastName} será removido permanentemente.` : ""}
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

function UserFormDrawer({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: (u: User) => void }) {
  const isNew = !user;
  const [form, setForm] = useState<User>(
    user ?? {
      id: `usr-${Math.random().toString(36).slice(2, 8)}`,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      role: "Operator",
      status: "activo",
      createdAt: new Date().toISOString(),
    },
  );
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.firstName.trim().length < 3) e.firstName = "Nome deve possuir pelo menos 3 caracteres.";
    if (form.lastName.trim().length < 2) e.lastName = "Apelido obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 9) e.phone = "Telefone inválido.";
    if (!form.department.trim()) e.department = "Campo obrigatório.";
    if (!form.position.trim()) e.position = "Campo obrigatório.";
    if (isNew) {
      const s = evaluatePassword(password);
      if (s.score < 2) e.password = "Senha muito fraca.";
      if (password !== confirmPw) e.confirmPw = "As senhas não coincidem.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Corrija os erros do formulário");
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden bg-card shadow-elegant">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-primary">
            {isNew ? "Novo utilizador" : "Editar utilizador"}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </header>
        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Primeiro nome" error={errors.firstName} required>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls(errors.firstName)} />
            </Field>
            <Field label="Apelido" error={errors.lastName} required>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls(errors.lastName)} />
            </Field>
            <Field label="Email" error={errors.email} required>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls(errors.email)} />
            </Field>
            <Field label="Telefone" error={errors.phone}>
              <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhoneAO(e.target.value) })} placeholder="+244 9XX XXX XXX" className={inputCls(errors.phone)} />
            </Field>
            <Field label="Departamento" error={errors.department} required>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls(errors.department)} />
            </Field>
            <Field label="Cargo" error={errors.position} required>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputCls(errors.position)} />
            </Field>
            <Field label="Papel">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={inputCls()}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as User["status"] })} className={inputCls()}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </Field>
          </div>

          {isNew && (
            <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <Field label="Senha" error={errors.password} required>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls(errors.password)} />
                {password && <div className="mt-2"><PasswordStrength value={password} /></div>}
              </Field>
              <Field label="Confirmar senha" error={errors.confirmPw} required>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls(errors.confirmPw)} />
              </Field>
            </div>
          )}
        </form>
        <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} type="button" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Cancelar</button>
          <button onClick={submit} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            {isNew ? "Criar utilizador" : "Guardar alterações"}
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
