import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from "@/lib/supabase-client";
import type { SiteSettings } from "@/lib/site-settings";
import type { Lead } from "@/lib/leads-store";

const TABLES = {
  settings: "site_settings",
  leads: "leads",
  services: "services",
  stages: "stages",
  content: "page_content",
};

export interface DbService {
  id: string;
  slug: string;
  title: string;
  description: string;
  points: string[];
  order_index: number;
  is_active?: boolean;
}

export interface DbStage {
  id: string;
  slug: string;
  title: string;
  description: string;
  step_number: number;
  is_active?: boolean;
}

export interface DbPageContent {
  id?: string;
  page_key: string;
  title: string;
  description: string;
  hero?: string | null;
  updated_at?: string;
}

function normalizeSettings(row: Record<string, unknown>): SiteSettings {
  const banks = Array.isArray(row.banks_partners) ? row.banks_partners : [];
  const companies = Array.isArray(row.companies_partners) ? row.companies_partners : [];
  const promoters = Array.isArray(row.promoters_partners) ? row.promoters_partners : [];

  return {
    empresa: typeof row.empresa === "string" ? row.empresa : "HCB-BANDES",
    tagline: typeof row.tagline === "string" ? row.tagline : "Conectamos pessoas, empresas, bancos e imóveis",
    email: typeof row.email === "string" ? row.email : "geral@hcb-bandes.com",
    telefone: typeof row.telefone === "string" ? row.telefone : "+244 935 105 538",
    whatsapp: typeof row.whatsapp === "string" ? row.whatsapp : "+244 935 105 538",
    endereco: typeof row.endereco === "string" ? row.endereco : "Luanda, Angola",
    bancosParceiros: banks.filter((value): value is string => typeof value === "string"),
    empresasParceiras: companies.filter((value): value is string => typeof value === "string"),
    promotoresParceiros: promoters.filter((value): value is string => typeof value === "string"),
  };
}

function normalizeLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    nome: typeof row.nome === "string" ? row.nome : "",
    email: typeof row.email === "string" ? row.email : "",
    telefone: typeof row.telefone === "string" ? row.telefone : undefined,
    empresa: typeof row.empresa === "string" ? row.empresa : undefined,
    perfil: (typeof row.perfil === "string" ? row.perfil : "Outro") as Lead["perfil"],
    mensagem: typeof row.mensagem === "string" ? row.mensagem : "",
    status: (typeof row.status === "string" ? row.status : "novo") as Lead["status"],
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
  };
}

function normalizeService(row: Record<string, unknown>): DbService {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    slug: typeof row.slug === "string" ? row.slug : "",
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    points: Array.isArray(row.points) ? row.points.filter((value): value is string => typeof value === "string") : [],
    order_index: typeof row.order_index === "number" ? row.order_index : 0,
    is_active: typeof row.is_active === "boolean" ? row.is_active : true,
  };
}

function normalizeStage(row: Record<string, unknown>): DbStage {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    slug: typeof row.slug === "string" ? row.slug : "",
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    step_number: typeof row.step_number === "number" ? row.step_number : 0,
    is_active: typeof row.is_active === "boolean" ? row.is_active : true,
  };
}

function normalizePageContent(row: Record<string, unknown>): DbPageContent {
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    page_key: typeof row.page_key === "string" ? row.page_key : "",
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    hero: typeof row.hero === "string" ? row.hero : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function ensureSupabaseSchema() {
  if (!(await isSupabaseConfigured()) || !supabase) return false;

  const migration = `
    create table if not exists public.site_settings (
      id uuid primary key default gen_random_uuid(),
      empresa text not null default 'HCB-BANDES',
      tagline text not null default 'Conectamos pessoas, empresas, bancos e imóveis',
      email text not null default 'geral@hcb-bandes.com',
      telefone text not null default '+244 935 105 538',
      whatsapp text not null default '+244 935 105 538',
      endereco text not null default 'Luanda, Angola',
      banks_partners jsonb default '[]'::jsonb,
      companies_partners jsonb default '[]'::jsonb,
      promoters_partners jsonb default '[]'::jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists public.leads (
      id uuid primary key default gen_random_uuid(),
      nome text not null,
      email text not null,
      telefone text,
      empresa text,
      perfil text not null default 'Outro',
      mensagem text not null default '',
      status text not null default 'novo',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists public.services (
      id uuid primary key default gen_random_uuid(),
      slug text unique not null,
      title text not null,
      description text not null,
      points jsonb default '[]'::jsonb,
      order_index integer default 0,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists public.stages (
      id uuid primary key default gen_random_uuid(),
      slug text unique not null,
      title text not null,
      description text not null,
      step_number integer default 0,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists public.page_content (
      id uuid primary key default gen_random_uuid(),
      page_key text unique not null,
      title text not null,
      description text not null,
      hero text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    insert into public.site_settings (empresa, tagline, email, telefone, whatsapp, endereco, banks_partners, companies_partners, promoters_partners)
    select 'HCB-BANDES', 'Conectamos pessoas, empresas, bancos e imóveis', 'geral@hcb-bandes.com', '+244 935 105 538', '+244 935 105 538', 'Luanda, Angola', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
    where not exists (select 1 from public.site_settings limit 1);

    insert into public.services (slug, title, description, points, order_index)
    values
      ('habitacao-corporativa', 'Habitação Corporativa', 'Programas habitacionais desenhados para colaboradores de empresas parceiras.', '["Benefício habitacional para colaboradores","Parcerias com empresas","Acompanhamento do processo"]'::jsonb, 1),
      ('credito-imobiliario', 'Crédito Imobiliário', 'Ligação directa a bancos comerciais para financiamento ágil e transparente.', '["Financiamento transparente","Parcerias com bancos","Acompanhamento do processo"]'::jsonb, 2),
      ('imobiliario', 'Imobiliário', 'Carteira de imóveis e condomínios seleccionados em todo o território angolano.', '["Seleção de imóveis","Condomínios selecionados","Consultoria especializada"]'::jsonb, 3),
      ('gestao-condominial', 'Gestão Condominial', 'Administração profissional de condomínios com foco em qualidade de vida.', '["Gestão financeira e administrativa","Operação diária eficiente","Melhoria de qualidade de vida"]'::jsonb, 4)
    on conflict (slug) do nothing;

    insert into public.stages (slug, title, description, step_number)
    values
      ('diagnostico', 'Diagnóstico rápido', 'Mapeamos o seu perfil, a empresa e os requisitos do crédito habitacional.', 1),
      ('parcerias', 'Conexão com parceiros', 'Articulamos empresas, bancos e promotores para encontrar a solução ideal.', 2),
      ('proposta', 'Proposta transparente', 'Apresentamos uma oferta clara, com custos e cronograma definidos.', 3),
      ('acompanhamento', 'Acompanhamento contínuo', 'Acompanhamos cada etapa até à entrega das chaves.', 4),
      ('documentacao', 'Documentação', 'Validamos a documentação necessária para avançar com segurança.', 5),
      ('assinatura', 'Assinatura', 'Formalizamos o processo com acompanhamento jurídico e financeiro.', 6),
      ('entrega', 'Entrega', 'Concluímos a operação e entregamos o imóvel ou o processo finalizado.', 7)
    on conflict (slug) do nothing;

    insert into public.page_content (page_key, title, description, hero)
    values
      ('home', 'Conectamos pessoas, empresas, bancos e imóveis.', 'Soluções habitacionais para trabalhadores angolanos.', 'A HCB-BANDES facilita o acesso à habitação através de parcerias com empresas, bancos e promotores.'),
      ('quemSomos', 'Uma unidade de negócios dedicada à habitação corporativa.', 'História, missão, visão e valores.', null),
      ('servicos', 'Quatro pilares para uma solução habitacional completa.', 'Habitação Corporativa, Crédito, Imobiliário, Gestão Condominial.', null),
      ('beneficios', 'Vantagens concretas para cada parceiro do ecossistema.', 'Empresas, bancos e trabalhadores.', null)
    on conflict (page_key) do nothing;
  `;

  const { error } = await supabase.rpc("exec_sql", { sql: migration });
  if (error) {
    console.warn("Supabase schema bootstrap warning:", error.message);
    return false;
  }

  return true;
}

export async function readSettings() {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLES.settings).select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) {
    console.warn("Supabase settings read warning:", error.message);
    return null;
  }
  return data ? normalizeSettings(data as Record<string, unknown>) : null;
}

export async function saveSettingsToSupabase(settings: SiteSettings) {
  if (!supabase) return false;
  const payload = {
    empresa: settings.empresa,
    tagline: settings.tagline,
    email: settings.email,
    telefone: settings.telefone,
    whatsapp: settings.whatsapp,
    endereco: settings.endereco,
    banks_partners: settings.bancosParceiros,
    companies_partners: settings.empresasParceiras,
    promoters_partners: settings.promotoresParceiros,
  };

  const { error } = await supabase.from(TABLES.settings).insert(payload).select().single();
  if (error) {
    console.warn("Supabase settings save warning:", await getSupabaseErrorMessage(error));
    return false;
  }
  return true;
}

export async function listServicesFromSupabase(): Promise<DbService[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.services).select("*").eq("is_active", true).order("order_index", { ascending: true });
  if (error) {
    console.warn("Supabase services read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeService(row as Record<string, unknown>));
}

export async function listStagesFromSupabase(): Promise<DbStage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.stages).select("*").eq("is_active", true).order("step_number", { ascending: true });
  if (error) {
    console.warn("Supabase stages read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeStage(row as Record<string, unknown>));
}

export async function listPageContentFromSupabase(): Promise<DbPageContent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.content).select("*").order("updated_at", { ascending: false });
  if (error) {
    console.warn("Supabase content read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizePageContent(row as Record<string, unknown>));
}

export async function saveLeadToSupabase(lead: Omit<Lead, "id" | "createdAt" | "status"> & { status?: Lead["status"] }) {
  if (!supabase) return false;
  const payload = {
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    empresa: lead.empresa,
    perfil: lead.perfil,
    mensagem: lead.mensagem,
    status: lead.status ?? "novo",
  };

  const { error } = await supabase.from(TABLES.leads).insert(payload);
  if (error) {
    console.warn("Supabase lead save warning:", await getSupabaseErrorMessage(error));
    return false;
  }
  return true;
}

export async function listLeadsFromSupabase(): Promise<Lead[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.leads).select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("Supabase leads read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeLead(row as Record<string, unknown>));
}
