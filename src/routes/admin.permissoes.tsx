import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ROLES, type PermissionModule, type Role } from "@/lib/mock-data";
import { Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/permissoes")({
  component: PermissionsPage,
});

function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>("Administrator");
  const [matrix, setMatrix] = useState<Record<Role, Partial<Record<PermissionModule, string[]>>>>({
    ...DEFAULT_ROLE_PERMISSIONS,
  });
  const [newRole, setNewRole] = useState("");

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

  function addRole() {
    const name = newRole.trim();
    if (!name) return;
    if (roles.includes(name as Role)) {
      toast.error("Já existe um papel com esse nome");
      return;
    }
    const custom = name as Role;
    setRoles((r) => [...r, custom]);
    setMatrix((m) => ({ ...m, [custom]: { Dashboard: ["View"] } }));
    setSelectedRole(custom);
    setNewRole("");
    toast.success("Papel criado");
  }

  function save() {
    toast.success("Permissões guardadas (mock)");
  }

  const modules = Object.keys(PERMISSION_MODULES) as PermissionModule[];
  const current = matrix[selectedRole] ?? {};

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Papéis & Permissões</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure o acesso de cada papel aos módulos do sistema.</p>
        </div>
        <button onClick={save} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Save size={14} /> <span className="hidden sm:inline">Guardar alterações</span><span className="sm:hidden">Guardar</span>
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Roles list */}
        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Papéis</div>
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
                      {Object.keys(matrix[r] ?? {}).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-card p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Novo papel</label>
            <div className="mt-2 flex gap-2">
              <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Ex.: Auditor" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <button onClick={addRole} aria-label="Adicionar" className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-gold-foreground"><Plus size={14} /></button>
            </div>
          </div>
        </aside>

        {/* Matrix */}
        <section className="min-w-0 rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Editar permissões</div>
              <div className="font-display text-lg font-bold text-primary">{selectedRole}</div>
            </div>
            <Badge tone="gold">{Object.values(current).reduce((n, arr) => n + (arr?.length ?? 0), 0)} acções</Badge>
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
                    <button
                      onClick={() => selectAll(mod, !allOn)}
                      className="mt-1 text-xs text-primary hover:text-gold"
                    >
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
