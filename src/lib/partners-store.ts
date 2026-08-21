import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "./supabase-client";
import {
  listPartnersFromSupabase,
  savePartnerToSupabase,
  deletePartnerFromSupabase,
  type DbPartner,
} from "./supabase-data";

export type { DbPartner as Partner };

export type PartnerCategory = "empresa" | "banco" | "promotor";

export const PARTNER_CATEGORIES: Record<PartnerCategory, string> = {
  empresa: "Empresa Parceira",
  banco: "Banco Parceiro",
  promotor: "Promotor Imobiliario",
};

const PARTNERS_KEY = "hcb_partners_v1";
const PARTNERS_EVENT = "hcb_partners_changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): DbPartner[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PARTNERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(partners: DbPartner[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  window.dispatchEvent(new Event(PARTNERS_EVENT));
}

export function listPartners(): DbPartner[] {
  return readStorage();
}

export function listPartnersActive(): DbPartner[] {
  return readStorage().filter((p) => p.is_active);
}

export function listPartnersByCategory(category: PartnerCategory): DbPartner[] {
  return listPartnersActive()
    .filter((p) => p.category === category)
    .sort((a, b) => a.order_index - b.order_index);
}

export async function refreshPartnersFromSupabase(): Promise<DbPartner[]> {
  if (!(await isSupabaseConfigured())) return readStorage();
  try {
    const remote = await listPartnersFromSupabase();
    if (Array.isArray(remote)) {
      writeStorage(remote);
      return remote;
    }
  } catch (e) {
    console.warn("Failed to refresh partners from Supabase", e);
  }
  return readStorage();
}

export async function upsertPartner(partner: DbPartner): Promise<DbPartner> {
  const current = readStorage();
  const now = new Date().toISOString();
  const saved: DbPartner = { ...partner, created_at: partner.created_at || now, updated_at: now };
  const idx = current.findIndex((p) => p.id === saved.id);
  const next = [...current];
  if (idx < 0) { next.push(saved); } else { next[idx] = saved; }
  writeStorage(next);
  if (await isSupabaseConfigured()) {
    try {
      const remoteSaved = await savePartnerToSupabase(saved);
      if (remoteSaved) return remoteSaved;
    } catch (err) {
      console.warn("Failed to save partner to Supabase", err);
    }
  }
  return saved;
}

export async function removePartner(id: string): Promise<void> {
  const current = readStorage();
  writeStorage(current.filter((p) => p.id !== id));
  if (await isSupabaseConfigured()) {
    await deletePartnerFromSupabase(id).catch((err) =>
      console.warn("Failed to delete partner from Supabase", err)
    );
  }
}

export function usePartners() {
  const [partners, setPartners] = useState<DbPartner[]>(() => readStorage());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    refreshPartnersFromSupabase().then((data) => {
      if (mounted) { setPartners(data); setLoading(false); }
    });
    function handleChange() {
      if (mounted) setPartners(readStorage());
    }
    window.addEventListener(PARTNERS_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      mounted = false;
      window.removeEventListener(PARTNERS_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return { partners, loading };
}

export function useAdminPartners() {
  return usePartners();
}
