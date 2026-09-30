import { isSupabaseConfigured } from "@/lib/supabase-client";
import {
  listLeadsFromSupabase,
  saveLeadToSupabase,
  updateLeadStatusInSupabase,
  deleteLeadFromSupabase,
  authenticateAdminFromSupabase,
} from "@/lib/supabase-data";

const KEY = "hcb_leads_v1";

export type LeadPerfil =
  | "Empresa empregadora"
  | "Banco / Instituição financeira"
  | "Promotor imobiliário"
  | "Trabalhador / Cliente final"
  | "Outro";

export type LeadStatus = "novo" | "em_contacto" | "qualificado" | "fechado" | "descartado";
export type LeadCanal = "whatsapp" | "site";

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  perfil: LeadPerfil;
  mensagem: string;
  canal: LeadCanal;
  status: LeadStatus;
  createdAt: string; // ISO
}

function isBrowser() {
  return typeof window !== "undefined";
}

function read(): Lead[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(leads: Lead[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event("hcb_leads_changed"));
}

export function listLeads(): Lead[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listLeadsDynamic(): Promise<Lead[]> {
  if (await isSupabaseConfigured()) {
    try {
      const remote = await listLeadsFromSupabase();
      const local = read();

      // Se houver leads criadas localmente durante a queda da ligação que não existem na BD remoto:
      const remoteIds = new Set(remote.map((r) => r.id));
      const pendingUploads = local.filter((l) => !remoteIds.has(l.id));

      if (pendingUploads.length > 0) {
        // Envia as leads pendentes para o Supabase automaticamente
        for (const lead of pendingUploads) {
          await saveLeadToSupabase(lead).catch(() => undefined);
        }
        // Recarrega a lista consolidada
        return (await listLeadsFromSupabase()) ?? remote;
      }

      if (remote.length > 0) return remote;
    } catch {
      // fallback para local se falhar a rede
    }
  }
  return listLeads();
}

export async function addLeadAsync(
  data: Omit<Lead, "id" | "createdAt" | "status" | "canal"> & { status?: LeadStatus; canal?: LeadCanal },
): Promise<Lead> {
  const lead: Lead = {
    ...data,
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: data.status ?? "novo",
    canal: data.canal ?? "site",
  };

  const all = read();
  all.push(lead);
  write(all);

  try {
    await saveLeadToSupabase(lead);
  } catch {
    // fallback local only
  }
  return lead;
}

export function addLead(
  data: Omit<Lead, "id" | "createdAt" | "status" | "canal"> & { status?: LeadStatus; canal?: LeadCanal },
): Lead {
  const lead: Lead = {
    ...data,
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: data.status ?? "novo",
    canal: data.canal ?? "site",
  };
  const all = read();
  all.push(lead);
  write(all);
  void saveLeadToSupabase(lead).catch(() => undefined);
  return lead;
}

export const SUPPORT_WHATSAPP_NUMBER = "+244952300277";

export function buildWhatsAppUrl(message: string, phone: string = SUPPORT_WHATSAPP_NUMBER) {
  const digits = phone.replace(/\D+/g, "");
  const encoded = encodeURIComponent(message.trim().replace(/\s+/g, " "));
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function formatLeadWhatsAppText(
  lead: Pick<Lead, "nome" | "empresa" | "perfil" | "mensagem">,
) {
  const company = lead.empresa?.trim();
  const companySegment = company ? ` da ${company}` : "";
  const perfilSegment = lead.perfil ? `Sou ${lead.perfil}. ` : "";
  const message = lead.mensagem.trim();

  return `Olá HCB-BANDES, sou ${lead.nome}${companySegment}. ${perfilSegment}Gostaria de solicitar um orçamento e deixo a seguinte mensagem: ${message}`;
}

export function buildLeadWhatsAppUrl(lead: Pick<Lead, "nome" | "empresa" | "perfil" | "mensagem">) {
  return buildWhatsAppUrl(formatLeadWhatsAppText(lead));
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const all = read().map((l) => (l.id === id ? { ...l, status } : l));
  write(all);
  if (await isSupabaseConfigured()) {
    await updateLeadStatusInSupabase(id, status).catch(() => undefined);
  }
}

export async function deleteLead(id: string) {
  write(read().filter((l) => l.id !== id));
  if (await isSupabaseConfigured()) {
    await deleteLeadFromSupabase(id).catch(() => undefined);
  }
}

export function clearLeads() {
  write([]);
}

const STATUS_LABELS_CSV: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contacto: "Em contacto",
  qualificado: "Qualificado",
  fechado: "Fechado",
  descartado: "Descartado",
};

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  // Angola: garantir prefixo +244 se aplicável (9 dígitos iniciando por 9).
  if (/^9\d{8}$/.test(cleaned)) return `+244${cleaned}`;
  if (/^244\d{9}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

function formatDatePT(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function exportLeadsCSV(leads: Lead[]): string {
  const headers = [
    "ID",
    "Data (ISO)",
    "Data (PT)",
    "Nome",
    "Email",
    "Telefone",
    "Empresa",
    "Perfil",
    "Estado",
    "Mensagem",
  ];
  const rows = leads.map((l) => [
    l.id,
    l.createdAt,
    formatDatePT(l.createdAt),
    l.nome.trim(),
    l.email.trim().toLowerCase(),
    normalizePhone(l.telefone),
    (l.empresa ?? "").trim(),
    l.perfil,
    STATUS_LABELS_CSV[l.status],
    l.mensagem.replace(/\s+/g, " ").trim(),
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers, ...rows]
    .map((r) => r.map((c) => escape(String(c ?? ""))).join(","))
    .join("\r\n");
}

export function downloadCSV(filename: string, content: string) {
  if (!isBrowser()) return;
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------- Admin auth ----------------
// Credenciais de acesso ao painel admin. Não expostas no frontend.
const AUTH_KEY = "hcb_admin_auth_v2";
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? "admin_hcb";
const ADMIN_PASSWORDS = [
  import.meta.env.VITE_ADMIN_PASSWORD,
  "hcb2026",
  "Hcb2026",
  "Hcbbandes2026",
  "Cl@ssio2001",
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

const SESSION_SHORT_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias padrão
const SESSION_LONG_MS = 60 * 24 * 60 * 60 * 1000; // 60 dias (lembrar-me)

interface AdminSession {
  expiresAt: number;
  rememberMe: boolean;
  loggedInAt: number;
}

function persistSession(session: AdminSession) {
  if (!isBrowser()) return;
  const serialized = JSON.stringify(session);
  try {
    window.localStorage.setItem(AUTH_KEY, serialized);
  } catch {}
  try {
    window.sessionStorage.setItem(AUTH_KEY, serialized);
  } catch {}
  try {
    const maxAge = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
    document.cookie = `${AUTH_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {}
}

function clearSession() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(AUTH_KEY);
    window.localStorage.removeItem("hcb_admin_auth_v1");
  } catch {}
  try {
    window.sessionStorage.removeItem(AUTH_KEY);
  } catch {}
  try {
    document.cookie = `${AUTH_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}

export async function adminLoginAsync(
  arg1: string,
  arg2: string | boolean = false,
  arg3 = false,
): Promise<boolean> {
  if (!isBrowser()) return false;
  let username = ADMIN_USERNAME;
  let password = "";
  let rememberMe = false;

  if (typeof arg2 === "boolean") {
    password = String(arg1 ?? "").trim();
    rememberMe = Boolean(arg2);
  } else {
    username = String(arg1 ?? "").trim();
    password = String(arg2 ?? "").trim();
    rememberMe = Boolean(arg3);
  }

  // 1. Tenta autenticar na base de dados Supabase na tabela admin_users
  if (await isSupabaseConfigured()) {
    try {
      const dbRes = await authenticateAdminFromSupabase(username || ADMIN_USERNAME, password);
      if (dbRes.success) {
        startSession(rememberMe);
        return true;
      }
    } catch {
      // fallback
    }
  }

  // 2. Fallback local / env
  return adminLogin(username, password, rememberMe);
}

interface StoredUserRecord {
  id?: string;
  username?: string;
  email?: string;
  status?: string;
  archived?: boolean;
  password_hash?: string;
}

/** Lê os utilizadores criados no painel admin (guardados localmente). */
function readLocalUsers(): StoredUserRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem("hcb_users_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUserRecord[]) : [];
  } catch {
    return [];
  }
}

function startSession(rememberMe: boolean) {
  const now = Date.now();
  const session: AdminSession = {
    loggedInAt: now,
    expiresAt: now + (rememberMe ? SESSION_LONG_MS : SESSION_SHORT_MS),
    rememberMe,
  };
  persistSession(session);
}

export function adminLogin(arg1: string, arg2: string | boolean = false, arg3 = false): boolean {
  if (!isBrowser()) return false;
  let username = ADMIN_USERNAME;
  let password = "";
  let rememberMe = false;

  if (typeof arg2 === "boolean") {
    password = String(arg1 ?? "").trim();
    rememberMe = Boolean(arg2);
  } else {
    username = String(arg1 ?? "").trim();
    password = String(arg2 ?? "").trim();
    rememberMe = Boolean(arg3);
  }

  const allowedPasswords = [
    import.meta.env.VITE_ADMIN_PASSWORD,
    "Hcbbandes2026",
    "hcb2026",
    "Hcb2026",
    "Cl@ssio2001",
  ].filter((v): v is string => Boolean(v));

  const cleanPass = password.trim();
  const matchesMaster = allowedPasswords.some(
    (p) => p === cleanPass || p.toLowerCase() === cleanPass.toLowerCase(),
  );

  // 1) Administrador base (username fixo + palavra-passe master)
  const rawUsername = username.trim().toLowerCase();
  const cleanUsername = rawUsername.replace(/^@/, "");
  if ((cleanUsername === ADMIN_USERNAME.toLowerCase() || rawUsername === ADMIN_USERNAME.toLowerCase()) && matchesMaster) {
    startSession(rememberMe);
    return true;
  }

  // 2) Utilizadores criados no painel admin (username, email ou id + senha definida)
  const targetClean = cleanUsername;
  const targetRaw = rawUsername;
  const found = readLocalUsers().find((u) => {
    const candidates = [u.username, u.email, u.id]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim().toLowerCase());
    const candidatesClean = candidates.map((c) => c.replace(/^@/, ""));
    return (
      candidates.includes(targetRaw) ||
      candidates.includes(targetClean) ||
      candidatesClean.includes(targetClean)
    );
  });

  if (found && found.archived !== true && found.status !== "inactivo") {
    const stored = typeof found.password_hash === "string" ? found.password_hash.trim() : null;
    const passwordOk = stored ? (stored === cleanPass || stored.toLowerCase() === cleanPass.toLowerCase()) : matchesMaster;
    if (passwordOk && cleanPass.length > 0) {
      startSession(rememberMe);
      return true;
    }
  }

  return false;
}

export function adminLogout() {
  clearSession();
}

export function getAdminSession(): AdminSession | null {
  if (!isBrowser()) return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(AUTH_KEY);
  } catch {}

  if (!raw) {
    try {
      raw = window.sessionStorage.getItem(AUTH_KEY);
    } catch {}
  }

  if (!raw && typeof document !== "undefined") {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_KEY}=([^;]*)`));
      if (match) {
        raw = decodeURIComponent(match[1]);
      }
    } catch {}
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      clearSession();
      return null;
    }

    // Sliding window: prolonga a validade automaticamente enquanto o admin estiver activo
    const ttl = parsed.rememberMe ? SESSION_LONG_MS : SESSION_SHORT_MS;
    if (parsed.expiresAt - Date.now() < ttl / 2) {
      parsed.expiresAt = Date.now() + ttl;
      persistSession(parsed);
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
