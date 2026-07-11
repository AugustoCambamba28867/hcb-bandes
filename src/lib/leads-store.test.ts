import { describe, it, expect, beforeEach } from "vitest";
import {
  adminLogin,
  adminLogout,
  isAdminAuthenticated,
  getAdminSession,
  addLead,
  listLeads,
  updateLeadStatus,
  deleteLead,
  clearLeads,
  exportLeadsCSV,
  buildWhatsAppUrl,
  formatLeadWhatsAppText,
} from "@/lib/leads-store";

beforeEach(() => {
  window.localStorage.clear();
});

describe("admin auth", () => {
  it("rejeita palavra-passe incorrecta", () => {
    expect(adminLogin("errada")).toBe(false);
    expect(isAdminAuthenticated()).toBe(false);
  });

  it("aceita palavra-passe correcta e persiste sessão", () => {
    expect(adminLogin("hcb2026")).toBe(true);
    expect(isAdminAuthenticated()).toBe(true);
    const s = getAdminSession();
    expect(s).not.toBeNull();
    expect(s!.rememberMe).toBe(false);
  });

  it("sessão com lembrar-me tem expiração longa", () => {
    adminLogin("hcb2026", true);
    const s = getAdminSession()!;
    const days = (s.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThan(29);
    expect(s.rememberMe).toBe(true);
  });

  it("logout limpa a sessão", () => {
    adminLogin("hcb2026");
    adminLogout();
    expect(isAdminAuthenticated()).toBe(false);
    expect(getAdminSession()).toBeNull();
  });

  it("sessão expirada é rejeitada", () => {
    adminLogin("hcb2026");
    const raw = window.localStorage.getItem("hcb_admin_auth_v2");
    const parsed = JSON.parse(raw!);
    parsed.expiresAt = Date.now() - 1000;
    window.localStorage.setItem("hcb_admin_auth_v2", JSON.stringify(parsed));
    expect(isAdminAuthenticated()).toBe(false);
  });
});

describe("leads store", () => {
  const sample = {
    nome: "Ana Silva",
    email: "ana@example.com",
    telefone: "935105538",
    empresa: "HCB",
    perfil: "Empresa empregadora" as const,
    mensagem: "Mensagem de teste com detalhes suficientes.",
  };

  it("adiciona e lista leads", () => {
    addLead(sample);
    const all = listLeads();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe("novo");
    expect(all[0].id).toBeTruthy();
  });

  it("actualiza estado do lead", () => {
    const lead = addLead(sample);
    updateLeadStatus(lead.id, "qualificado");
    expect(listLeads()[0].status).toBe("qualificado");
  });

  it("elimina lead", () => {
    const lead = addLead(sample);
    deleteLead(lead.id);
    expect(listLeads()).toHaveLength(0);
  });

  it("limpa todos os leads", () => {
    addLead(sample);
    addLead({ ...sample, email: "b@example.com" });
    clearLeads();
    expect(listLeads()).toHaveLength(0);
  });

  it("exporta CSV com cabeçalhos e normalizações", () => {
    addLead(sample);
    const csv = exportLeadsCSV(listLeads());
    const [header, row] = csv.split("\r\n");
    expect(header).toContain("ID");
    expect(header).toContain("Data (ISO)");
    expect(header).toContain("Data (PT)");
    expect(header).toContain("Estado");
    // Telefone normalizado com prefixo +244
    expect(row).toContain("+244935105538");
    // Email normalizado (minúsculas)
    expect(row).toContain("ana@example.com");
    // Estado com label legível
    expect(row).toContain("Novo");
  });

  it("CSV escapa aspas correctamente", () => {
    addLead({ ...sample, mensagem: 'Ele disse "olá" hoje.' });
    const csv = exportLeadsCSV(listLeads());
    expect(csv).toContain('""olá""');
  });

  it("builds a WhatsApp URL with encoded lead message", () => {
    const lead = addLead(sample);
    const text = formatLeadWhatsAppText(lead);
    const url = buildWhatsAppUrl(text, "+244952300277");
    expect(url).toContain("https://wa.me/244952300277?text=");
    expect(decodeURIComponent(url.split("?text=")[1])).toContain("Olá HCB-BANDES");
    expect(decodeURIComponent(url.split("?text=")[1])).toContain("Mensagem de teste");
  });
});
