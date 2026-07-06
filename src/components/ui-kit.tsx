import { useEffect, type ReactNode } from "react";
import { AlertTriangle, Check, Inbox, Loader2, X } from "lucide-react";
import { evaluatePassword } from "@/lib/password-strength";

// -------------------- StatCard --------------------
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ size?: number }>;
  tone?: "primary" | "gold" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold",
    success: "bg-green-500/10 text-green-600",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      {Icon && (
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </div>
      )}
      <div className="mt-3 truncate font-display text-2xl font-bold text-primary tabular-nums sm:text-3xl">
        {value}
      </div>
      <div className="truncate text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

// -------------------- EmptyState --------------------
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number }>;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon size={22} />
      </div>
      <div>
        <div className="font-display text-base font-semibold text-primary">{title}</div>
        {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// -------------------- SkeletonLines --------------------
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-secondary/70" />
      ))}
    </div>
  );
}

// -------------------- ConfirmDialog --------------------
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  const cls =
    tone === "danger"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[60] grid place-items-center p-4"
    >
      <div className="absolute inset-0 bg-foreground/50" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="font-display text-lg font-bold text-primary">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${cls}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- PasswordStrength --------------------
export function PasswordStrength({ value }: { value: string }) {
  const r = evaluatePassword(value);
  const segments = [0, 1, 2, 3, 4];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {segments.map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= r.score ? r.color : "bg-secondary"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Força:</span>
        <span className="font-semibold text-foreground">{value ? r.level : "—"}</span>
      </div>
      <ul className="grid grid-cols-2 gap-1 text-[11px]">
        {[
          { ok: r.checks.length, label: "8+ caracteres" },
          { ok: r.checks.uppercase, label: "Maiúscula" },
          { ok: r.checks.lowercase, label: "Minúscula" },
          { ok: r.checks.number, label: "Número" },
          { ok: r.checks.symbol, label: "Símbolo" },
        ].map((c) => (
          <li key={c.label} className={`flex items-center gap-1 ${c.ok ? "text-green-600" : "text-muted-foreground"}`}>
            {c.ok ? <Check size={12} /> : <X size={12} />} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------- Badge --------------------
export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "gold" | "success" | "danger" | "muted";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    gold: "bg-gold/15 text-gold border-gold/30",
    success: "bg-green-500/10 text-green-700 border-green-500/30",
    danger: "bg-destructive/10 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
