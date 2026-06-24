import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Users2,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { adminLogin, adminLogout, isAdminAuthenticated } from "@/lib/leads-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — HCB-BANDES" },
      { name: "description", content: "Painel de administração HCB-BANDES." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

type NavItem = {
  to: "/admin" | "/admin/leads" | "/admin/conteudos" | "/admin/parceiros" | "/admin/definicoes";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/conteudos", label: "Conteúdos", icon: FileText },
  { to: "/admin/parceiros", label: "Parceiros", icon: Users2 },
  { to: "/admin/definicoes", label: "Definições", icon: Settings },
];

function AdminLayout() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setAuth(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  if (auth === null) {
    return <div className="min-h-screen bg-secondary/30" />;
  }

  if (!auth) {
    return <LoginScreen onSuccess={() => setAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* topbar mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">H</div>
          <span className="font-display font-bold text-primary">Admin</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside
          className={`${open ? "block" : "hidden"} lg:block fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0 border-r border-border bg-card`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-5 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-base font-bold">H</div>
              <div className="min-w-0">
                <div className="font-display text-base font-bold text-primary truncate">HCB-BANDES</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Painel Admin</div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact ?? false }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/75 hover:bg-secondary hover:text-primary transition"
                  activeProps={{
                    className: "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold bg-primary text-primary-foreground",
                  }}
                >
                  <n.icon size={16} />
                  <span>{n.label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-border p-3 space-y-2">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink size={14} /> Ver site público
              </Link>
              <button
                onClick={() => {
                  adminLogout();
                  toast.success("Sessão terminada");
                  setAuth(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut size={14} /> Terminar sessão
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (password.length < 4) {
      setError("Indique a palavra-passe.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(password);
      setLoading(false);
      if (ok) {
        toast.success("Bem-vindo ao painel");
        onSuccess();
      } else {
        setError("Palavra-passe incorrecta.");
      }
    }, 400);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary to-[oklch(0.22_0.05_142)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-elegant">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Lock size={22} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-primary">Painel Admin</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Acesso restrito à equipa HCB-BANDES.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Palavra-passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition disabled:opacity-60"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 rounded-md border border-dashed border-border bg-secondary/50 p-3 text-[11px] text-muted-foreground">
          <strong className="text-foreground">Demo:</strong> palavra-passe{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono">hcb2026</code>.
          Será substituída por autenticação real quando a base de dados for ligada.
        </div>

        <Link
          to="/"
          className="mt-5 inline-block text-xs text-muted-foreground hover:text-primary"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
