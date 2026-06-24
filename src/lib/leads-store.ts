// Cliente-side lead storage usando localStorage.
// Quando a base de dados for ligada, substituir as funções abaixo
// por chamadas ao backend (mesma interface pública).

const KEY = "hcb_leads_v1";

export type LeadPerfil =
  | "Empresa empregadora"
  | "Banco / Instituição financeira"
  | "Promotor imobiliário"
  | "Trabalhador / Cliente final"
  | "Outro";

export type LeadStatus = "novo" | "em_contacto" | "qualificado" | "fechado" | "descartado";

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  perfil: LeadPerfil;
  mensagem: string;
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

export function addLead(data: Omit<Lead, "id" | "createdAt" | "status"> & { status?: LeadStatus }): Lead {
  const lead: Lead = {
    ...data,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: data.status ?? "novo",
  };
  const all = read();
  all.push(lead);
  write(all);
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  const all = read().map((l) => (l.id === id ? { ...l, status } : l));
  write(all);
}

export function deleteLead(id: string) {
  write(read().filter((l) => l.id !== id));
}

export function clearLeads() {
  write([]);
}

export function exportLeadsCSV(leads: Lead[]): string {
  const headers = ["Data", "Nome", "Email", "Telefone", "Empresa", "Perfil", "Estado", "Mensagem"];
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString("pt-PT"),
    l.nome,
    l.email,
    l.telefone ?? "",
    l.empresa ?? "",
    l.perfil,
    l.status,
    l.mensagem.replace(/\s+/g, " "),
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map((c) => escape(String(c))).join(",")).join("\n");
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

// ---------------- Admin auth (DEMO sem backend) ----------------
// Quando a base de dados estiver ligada, substituir por autenticação real.
const AUTH_KEY = "hcb_admin_auth_v1";
const DEMO_PASSWORD = "hcb2026"; // Credencial de demonstração — alterar ao integrar backend.

export function adminLogin(password: string): boolean {
  if (!isBrowser()) return false;
  if (password === DEMO_PASSWORD) {
    window.localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}
