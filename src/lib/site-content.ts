import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { listPageContentFromSupabase, savePageContentToSupabase } from "@/lib/supabase-data";

export interface PageContent {
  title: string;
  description: string;
  hero?: string;
}

export const CONTENT_KEY = "hcb_content_v2";
export const CONTENT_EVENT = "hcb_content_changed";

export const DEFAULT_CONTENT: Record<string, PageContent> = {
  home: {
    title: "Conectamos empresas, bancos e trabalhadores a imóveis de valor.",
    description: "Soluções habitacionais para trabalhadores angolanos.",
    hero: "Criamos jornadas habitacionais com clareza, parceria e execução.",
  },
  quemSomos: {
    title: "Uma unidade de negócios dedicada à habitação corporativa em Angola.",
    description: "História, missão, visão e valores.",
    hero: "A HCB-BANDES nasce dentro da Bandes Comércio & Serviços com a missão de facilitar o acesso à habitação a trabalhadores de empresas públicas e privadas angolanas.",
  },
  servicos: {
    title: "Quatro pilares para uma solução habitacional completa.",
    description: "Habitação Corporativa, Crédito, Imobiliário, Gestão Condominial.",
    hero: "A HCB-BANDES integra toda a cadeia de valor habitacional num ecossistema único.",
  },
  beneficios: {
    title: "Vantagens concretas para cada parceiro do ecossistema.",
    description: "Empresas, bancos e trabalhadores.",
    hero: "A nossa estrutura foi pensada para gerar ganhos reais e mensuráveis para empresas, bancos e clientes finais.",
  },
  condominios: {
    title: "Condomínios e Residências Seleccionados.",
    description: "Empreendimentos residenciais de referência com crédito corporativo facilitado.",
    hero: "Explore a nossa carteira de condomínios fechados, moradias e apartamentos de qualidade com apoio bancário.",
  },
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getContent(): Record<string, PageContent> {
  if (!isBrowser()) return DEFAULT_CONTENT;
  try {
    const raw = window.localStorage.getItem(CONTENT_KEY);
    if (!raw) return DEFAULT_CONTENT;
    return { ...DEFAULT_CONTENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function getContentAsync(): Promise<Record<string, PageContent>> {
  if (!isBrowser()) return DEFAULT_CONTENT;
  const local = getContent();
  if (await isSupabaseConfigured()) {
    try {
      const rows = await listPageContentFromSupabase();
      if (rows && rows.length > 0) {
        const loaded: Record<string, PageContent> = { ...DEFAULT_CONTENT, ...local };
        rows.forEach((row) => {
          if (row.page_key) {
            loaded[row.page_key] = {
              title: row.title,
              description: row.description,
              hero: row.hero ?? undefined,
            };
          }
        });
        window.localStorage.setItem(CONTENT_KEY, JSON.stringify(loaded));
        return loaded;
      }
    } catch (err) {
      console.warn("Failed to fetch page content from Supabase", err);
    }
  }
  return local;
}

export async function saveContent(data: Record<string, PageContent>): Promise<boolean> {
  if (!isBrowser()) return false;
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(CONTENT_EVENT));

  if (await isSupabaseConfigured()) {
    try {
      const rows = Object.entries(data).map(([page_key, value]) => ({
        page_key,
        title: value.title,
        description: value.description,
        hero: value.hero ?? null,
      }));
      await Promise.all(rows.map((row) => savePageContentToSupabase(row)));
      return true;
    } catch (err) {
      console.warn("Failed to save content to Supabase", err);
      return false;
    }
  }
  return true;
}

export function usePageContent(key: string): PageContent {
  const [state, setState] = useState<PageContent>(() => getContent()[key] ?? DEFAULT_CONTENT[key] ?? { title: "", description: "" });

  useEffect(() => {
    let mounted = true;
    getContentAsync().then((all) => {
      if (mounted && all[key]) {
        setState(all[key]);
      }
    });

    function update() {
      if (mounted) {
        const all = getContent();
        setState(all[key] ?? DEFAULT_CONTENT[key] ?? { title: "", description: "" });
      }
    }

    window.addEventListener(CONTENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [key]);

  return state;
}

