import { useEffect, useState } from "react";

export interface PageContent {
  title: string;
  description: string;
  hero?: string;
}

export const CONTENT_KEY = "hcb_content_v1";
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

export function saveContent(data: Record<string, PageContent>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(CONTENT_EVENT));
}

export function usePageContent(key: string): PageContent {
  const [state, setState] = useState<PageContent>(() => getContent()[key] ?? DEFAULT_CONTENT[key] ?? { title: "", description: "" });

  useEffect(() => {
    function update() {
      const all = getContent();
      setState(all[key] ?? DEFAULT_CONTENT[key] ?? { title: "", description: "" });
    }
    update();
    window.addEventListener(CONTENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CONTENT_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [key]);

  return state;
}
