import { useEffect, useState } from "react";
import { addAuditEvent } from "./audit-store";
import { isSupabaseConfigured, supabaseEnabled } from "./supabase-client";
import {
  ensureSupabaseSchema,
  listPropertiesFromSupabase,
  savePropertyToSupabase,
  deletePropertyFromSupabase,
} from "./supabase-data";

export interface Property {
  id: string;
  name: string; // nome do condomínio/residência
  type: "condominio" | "moradia" | "apartamento"; // tipo
  province: string; // província (Luanda, Benguela, Huíla, etc.)
  zone: string; // zona (Talatona, Kilamba, Camama, Viana, etc.)
  status: "disponivel" | "em_construcao" | "pronto_habitar" | "vendido";
  description: string; // descrição detalhada
  bedrooms: number; // número de quartos
  bathrooms: number; // número de casas de banho
  area: number; // área em m²
  price: number; // preço em AOA
  amenities: string[]; // comodidades (segurança 24h, piscina, gerador, etc.)
  images: string[]; // URLs das imagens
  financing: string; // condições de financiamento
  promoter: string; // promotor imobiliário
  contact_info: string; // informação de contacto
  is_featured: boolean; // destaque na homepage
  is_active: boolean; // visível no site
  created_at: string;
  updated_at: string;
}

export const PROPERTY_TYPES = {
  condominio: "Condomínio",
  moradia: "Moradia",
  apartamento: "Apartamento",
} as const;

export const PROPERTY_STATUSES = {
  disponivel: "Disponível",
  em_construcao: "Em Construção",
  pronto_habitar: "Pronto a Habitar",
  vendido: "Vendido",
} as const;

export const PROVINCES = [
  "Luanda",
  "Benguela",
  "Huambo",
  "Huíla",
  "Cabinda",
  "Malanje",
  "Namibe",
  "Uíge",
  "Bié",
  "Cunene",
  "Lunda Norte",
  "Lunda Sul",
  "Moxico",
  "Cuanza Norte",
  "Cuanza Sul",
  "Bengo",
  "Cuando Cubango",
  "Zaire",
] as const;

export type PropertyType = keyof typeof PROPERTY_TYPES;
export type PropertyStatus = keyof typeof PROPERTY_STATUSES;
export type Province = (typeof PROVINCES)[number];

const PROPERTIES_KEY = "hcb_properties_v1";
const PROPERTIES_EVENT = "hcb_properties_changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed == null) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(PROPERTIES_EVENT));
}

function getPropertiesSeed(): Property[] {
  // Empty seed: properties will be created by the admin
  return [];
}

function mergeProperties(local: Property[], remote: Property[]): Property[] {
  const map = new Map<string, Property>();
  if (Array.isArray(local)) {
    for (const item of local) {
      if (item && item.id) map.set(item.id, item);
    }
  }
  if (Array.isArray(remote)) {
    for (const item of remote) {
      if (item && item.id) map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

async function syncPropertiesFromSupabase(): Promise<void> {
  if (!(await isSupabaseConfigured())) return;
  try {
    await ensureSupabaseSchema();
    const local = readStorage<Property[]>(PROPERTIES_KEY, []);
    const remote = await listPropertiesFromSupabase();

    // Sincronizar automaticamente os imóveis locais que ainda não estão no Supabase
    if (local.length > 0) {
      const remoteIds = new Set((remote ?? []).map((r) => r.id));
      for (const p of local) {
        if (!remoteIds.has(p.id)) {
          await savePropertyToSupabase(p).catch((e) => console.warn("Auto-sync property to Supabase failed", e));
        }
      }
    }

    const updatedRemote = await listPropertiesFromSupabase();
    if (Array.isArray(updatedRemote) && updatedRemote.length > 0) {
      const merged = mergeProperties(local, updatedRemote);
      writeStorage(PROPERTIES_KEY, merged);
    }
  } catch (error) {
    console.warn("Failed to sync properties from Supabase", error);
  }
}

export async function forcePushLocalToSupabase(): Promise<number> {
  if (!(await isSupabaseConfigured())) return 0;
  try {
    await ensureSupabaseSchema();
    const local = readStorage<Property[]>(PROPERTIES_KEY, []);
    let count = 0;
    for (const p of local) {
      const res = await savePropertyToSupabase(p);
      if (res) count++;
    }
    await syncPropertiesFromSupabase();
    return count;
  } catch (e) {
    console.warn("Force push to Supabase failed", e);
    return 0;
  }
}

export function listProperties(): Property[] {
  const stored = readStorage<Property[]>(PROPERTIES_KEY, []);
  if (stored.length > 0) {
    return stored.map((property) => ({ ...property }));
  }

  const fallback = getPropertiesSeed();
  writeStorage(PROPERTIES_KEY, fallback);
  void syncPropertiesFromSupabase();
  return fallback;
}

export function listPropertiesPublic(): Property[] {
  return listProperties().filter((property) => property.is_active !== false && property.status !== "vendido");
}

export async function upsertProperty(property: Property): Promise<Property> {
  const current = listProperties();
  const next = [...current];
  const index = next.findIndex((entry) => entry.id === property.id);
  const now = new Date().toISOString();
  const saved: Property = {
    ...property,
    is_active: property.is_active !== false,
    updated_at: property.updated_at || now,
    created_at: property.created_at || now,
  };

  if (index < 0) {
    next.unshift(saved);
  } else {
    next[index] = saved;
  }

  writeStorage(PROPERTIES_KEY, next);

  if (await isSupabaseConfigured()) {
    try {
      await ensureSupabaseSchema();
      const remoteSaved = await savePropertyToSupabase(saved);
      if (remoteSaved) {
        return remoteSaved;
      }
    } catch (err) {
      console.warn("Failed to save property to Supabase", err);
    }
  }

  addAuditEvent({
    actor: "Administrador",
    action: index < 0 ? "criou imóvel" : "actualizou imóvel",
    target: saved.name,
    details: `${PROPERTY_TYPES[saved.type] || saved.type} em ${saved.zone || saved.province} (${PROPERTY_STATUSES[saved.status] || saved.status}).`,
    type: "info",
  });

  return saved;
}

export function deleteProperty(id: string): void {
  const current = listProperties();
  const target = current.find((entry) => entry.id === id);
  const next = current.filter((entry) => entry.id !== id);

  writeStorage(PROPERTIES_KEY, next);

  void (async () => {
    if (await isSupabaseConfigured()) {
      await deletePropertyFromSupabase(id).catch((err) => {
        console.warn("Failed to delete property from Supabase", err);
      });
    }
  })();

  if (target) {
    addAuditEvent({
      actor: "Administrador",
      action: "eliminou imóvel",
      target: target.name,
      details: `${PROPERTY_TYPES[target.type] || target.type} em ${target.zone || target.province} removido.`,
      type: "warning",
    });
  }
}

export const removeProperty = deleteProperty;

export async function fetchPropertiesRemote(): Promise<Property[] | null> {
  if (!(await isSupabaseConfigured())) return null;
  try {
    await ensureSupabaseSchema();
    const remote = await listPropertiesFromSupabase();
    if (Array.isArray(remote) && remote.length > 0) {
      const local = readStorage<Property[]>(PROPERTIES_KEY, []);
      const merged = mergeProperties(local, remote);
      writeStorage(PROPERTIES_KEY, merged);
      return merged;
    }
  } catch (error) {
    console.warn("Failed to fetch remote properties", error);
  }
  return null;
}

export async function listPropertiesDynamic(): Promise<Property[]> {
  const local = listProperties();
  if (await isSupabaseConfigured()) {
    const remote = await fetchPropertiesRemote();
    if (remote !== null && remote.length > 0) {
      return remote;
    }
  }
  return local;
}

export async function listPropertiesPublicDynamic(): Promise<Property[]> {
  const all = await listPropertiesDynamic();
  return all.filter((property) => property.is_active !== false && property.status !== "vendido");
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(() => listProperties());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPropertiesRemote().then((data) => {
      if (data !== null && data.length > 0) {
        setProperties(data);
      } else {
        setProperties(listProperties());
      }
      setLoading(false);
    });

    function handleChange() {
      setProperties(listProperties());
    }

    window.addEventListener(PROPERTIES_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(PROPERTIES_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return { properties, setProperties, loading };
}

export function usePublicProperties() {
  const [properties, setProperties] = useState<Property[]>(() => listPropertiesPublic());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listPropertiesPublicDynamic().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProperties(data);
      } else {
        setProperties(listPropertiesPublic());
      }
      setLoading(false);
    });

    function handleChange() {
      setProperties(listPropertiesPublic());
    }

    window.addEventListener(PROPERTIES_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(PROPERTIES_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return { properties, loading };
}

export function useAdminProperties() {
  return useProperties();
}
