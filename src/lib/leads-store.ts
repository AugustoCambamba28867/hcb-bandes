import { isSupabaseConfigured } from "@/lib/supabase-client";
import {
  listLeadsFromSupabase,
  saveLeadToSupabase,
  updateLeadStatusInSupabase,
  deleteLeadFromSupabase,
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
    const remote = await listLeadsFromSupabase();
    if (remote.length > 0) return remote;
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
  import.meta.env.VITE_ADMIN_PASSWORD ?? "Hcbbandes2026",
  "hcb2026",
  "Hcb2026",
].filter((value, index, array) => value && array.indexOf(value) === index);

const SESSION_SHORT_MS = 24 * 60 * 60 * 1000; // 24 horas
const SESSION_LONG_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias (lembrar-me)

interface AdminSession {
  expiresAt: number;
  rememberMe: boolean;
  loggedInAt: number;
}

export function adminLogin(arg1: string, arg2: string | boolean = false, arg3 = false): boolean {
  // Backwards compatible: adminLogin(password, remember?) or adminLogin(username, password, remember?)
  if (!isBrowser()) return false;
  let username = ADMIN_USERNAME;
  let password = "";
  let rememberMe = false;

  if (typeof arg2 === "boolean") {
    // signature: (password, remember?)
    password = String(arg1 ?? "").trim();
    rememberMe = Boolean(arg2);
  } else {
    // signature: (username, password, remember?)
    username = String(arg1 ?? "").trim();
    password = String(arg2 ?? "").trim();
    rememberMe = Boolean(arg3);
  }

  if (username !== ADMIN_USERNAME) return false;
  if (!ADMIN_PASSWORDS.includes(password)) return false;

  const now = Date.now();
  const session: AdminSession = {
    loggedInAt: now,
    expiresAt: now + (rememberMe ? SESSION_LONG_MS : SESSION_SHORT_MS),
    rememberMe,
  };
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return true;
}

export function adminLogout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_KEY);
  // Limpar chave antiga também.
  window.localStorage.removeItem("hcb_admin_auth_v1");
}

export function getAdminSession(): AdminSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
