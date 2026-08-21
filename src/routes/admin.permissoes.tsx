import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Plus, Save, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ROLES, type PermissionModule, type Role } from "@/lib/mock-data";
import { Badge } from "@/components/ui-kit";
import {
  fetchPermissionsFromSupabase,
  savePermissionsToSupabaseDirect,
  getStoredPermissions,
} from "@/lib/admin-permissions";
import { saveRolePermissionsToSupabase } from "@/lib/supabase-data";

export const Route = createFileRoute("/admin/permissoes")({
  component: PermissionsPage,
});

function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>("Super Administrator");
  const [matrix, setMatrix] = useState<Record<Role | string, Partial<Record<PermissionModule, string[]>>>>(() => getStoredPermissions());
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function loadData() {
    try {
      const data = await fetchPermissionsFromSupabase();
      setMatrix(data);
      const storedRoles = Object.keys(data) as Role[];
      const allRoles = [...new Set([...ROLES, ...storedRoles])];
      setRoles(allRoles);
      if (!allRoles.includes(selectedRole)) {
        setSelectedRole("Super Administrator");
      }
    } catch (err) {
      console.warn("Error loading permissions", err);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      await loadData();
      toast.success("Permissões sincronizadas do Supabase");
    } catch {
      toast.error("Erro ao sincronizar permissões");
    } finally {
      setSyncing(false);
    }
  }

  function toggle(module: PermissionModule, action: string) {
    setMatrix((prev) => {
      const current = new Set(prev[selectedRole]?.[module] ?? []);
      if (current.has(action)) current.delete(action);
      else current.add(action);
      return {
        ...prev,
        [selectedRole]: { ...prev[selectedRole], [module]: Array.from(current) },
      };
    });
  }

  function selectAll(module: PermissionModule, on: boolean) {
    setMatrix((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: on ? [...PERMISSION_MODULES[module]] : [],
      },
    }));
  }

  async function addRole() {
    const name = newRole.trim();
    if (!name) return;
    if (roles.includes(name as Role)) {
      toast.error("Já existe um papel com esse nome");
      return;
    }
    const custom = name as Role;
    const initialPerms = { Dashboard: ["View"] };
    const updatedMatrix = { ...matrix, [custom]: initialPerms };
    setRoles((r) => [...r, custom]);
    setMatrix(updatedMatrix);
    setSelectedRole(custom);
    setNewRole("");
    toast.success("Papel criado");

    // Guardar imediatamente no Supabase
    await saveRolePermissionsToSupabase(custom, initialPerms);
    await savePermissionsToSupabaseDirect(updatedMatrix);
  }

  async function save() {
    setSaving(true);
    try {
      // 1. Guardar o papel específico no Supabase
      const currentPerms = matrix[selectedRole] ?? {};
      await saveRolePermissionsToSupabase(selectedRole, currentPerms);

      // 2. Guardar a matriz completa no Supabase
      const ok = await savePermissionsToSupabaseDirect(matrix);

      if (ok) {
        toast.success(`Permissões do papel "${selectedRole}" salvas no Supabase com sucesso!`);
      } else {
        toast.success("Permissões salvas no Supabase!");
      }
    } catch {
      toast.error("Erro ao guardar permissões no Supabase");
    } finally {
      setSaving(false);
    }
  }

  const modules = Object.keys(PERMISSION_MODULES) as PermissionModule[];
  const current = matrix[selectedRole] ?? {};

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Papéis & Permissões</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure e salve no Supabase o acesso de cada papel aos módulos do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin text-primary" : "text-muted-foreground"} />
            <span className="hidden sm:inline">{syncing ? "A sincronizar..." : "Sincronizar"}</span>
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">{saving ? "A guardar no Supabase..." : "Guardar no Supabase"}</span>
            <span className="sm:hidden">Guardar</span>
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Roles list */}
        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Papeis</div>
            <ul className="mt-3 space-y-1">
              {roles.map((r) => (
                <li key={r}>
                  <button
                    onClick={() => setSelectedRole(r)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition ${
                      selectedRole === r ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 truncate"><Shield size={14} /> {r}</span>
                    <span className={`text-[10px] ${selectedRole === r ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {Object.values(matrix[r] ?? {}).reduce((n, arr) => n + (arr?.length ?? 0), 0)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-card p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Novo papel</label>
            <div className="mt-2 flex gap-2">
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRole()}
                placeholder="Ex.: Auditor"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={addRole} aria-label="Adicionar" className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-gold-foreground hover:brightness-95">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Matrix */}
        <section className="min-w-0 rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Editar permissoes</div>
              <div className="font-display text-lg font-bold text-primary">{selectedRole}</div>
            </div>
            <Badge tone="gold">{Object.values(current).reduce((n, arr) => n + (arr?.length ?? 0), 0)} accoes</Badge>
          </header>
          <div className="divide-y divide-border">
            {modules.map((mod) => {
              const actions = PERMISSION_MODULES[mod];
              const active = current[mod] ?? [];
              const allOn = active.length === actions.length;
              return (
                <div key={mod} className="grid gap-3 p-5 sm:grid-cols-[220px_1fr] sm:items-start">
                  <div>
                    <div className="font-semibold text-foreground">{mod}</div>
                    <button onClick={() => selectAll(mod, !allOn)} className="mt-1 text-xs text-primary hover:text-gold">
                      {allOn ? "Desactivar todas" : "Activar todas"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((a) => {
                      const on = active.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => toggle(mod, a)}
                          aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-primary-foreground" : "bg-muted-foreground/40"}`} />
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
