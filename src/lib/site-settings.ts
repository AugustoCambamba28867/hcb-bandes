import { readSettings, saveSettingsToSupabase } from "@/lib/supabase-data";

const KEY = "hcb_site_settings_v1";

export interface SiteSettings {
  empresa: string;
  tagline: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  bancosParceiros: string[];
  empresasParceiras: string[];
  promotoresParceiros: string[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  empresa: "HCB-BANDES",
  tagline: "Conectamos pessoas, empresas, bancos e imóveis",
  email: "geral@hcb-bandes.com",
  telefone: "+244 935 105 538",
  whatsapp: "+244 935 105 538",
  endereco: "Luanda, Angola",
  bancosParceiros: ["BAI", "BFA", "BIC", "Banco Sol"],
  empresasParceiras: ["Sonangol", "Endiama", "TAAG", "Unitel"],
  promotoresParceiros: ["Imogestin", "Vida Imobiliária", "Casa Plus"],
};

function isBrowser() {
  return typeof window !== "undefined";
}

export async function getSettingsAsync(): Promise<SiteSettings> {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const remote = await readSettings();
    if (remote) {
      window.localStorage.setItem(KEY, JSON.stringify(remote));
      return remote;
    }
  } catch {
    // fallback local
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getSettings(): SiteSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: SiteSettings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  try {
    await saveSettingsToSupabase(s);
  } catch {
    // ignore and keep local fallback
  }
  window.dispatchEvent(new Event("hcb_settings_changed"));
}

export function resetSettings() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("hcb_settings_changed"));
}
