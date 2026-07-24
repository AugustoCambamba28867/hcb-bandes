import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from "@/lib/supabase-client";
import type { SiteSettings } from "@/lib/site-settings";
import type { Lead } from "@/lib/leads-store";
import type { AuditEvent, Order, ReportItem, User } from "@/lib/mock-data";

const TABLES = {
  settings: "site_settings",
  leads: "leads",
  services: "services",
  stages: "stages",
  content: "page_content",
  orders: "admin_orders",
  reports: "admin_reports",
  users: "admin_users",
  auditEvents: "admin_audit_events",
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
    telefone: typeof row.telefone === "string" ? row.telefone : "+244 952 300 277",
    whatsapp: typeof row.whatsapp === "string" ? row.whatsapp : "+244 952 300 277",
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
    canal: (typeof row.canal === "string" ? row.canal : "site") as Lead["canal"],
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

function normalizeOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    reference: typeof row.reference === "string" ? row.reference : "",
    client: typeof row.client === "string" ? row.client : "",
    email: typeof row.email === "string" ? row.email : "",
    service: typeof row.service === "string" ? row.service : "",
    amount: typeof row.amount === "number" ? row.amount : Number(row.amount ?? 0),
    status: (typeof row.status === "string" ? row.status : "pendente") as Order["status"],
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  };
}

function normalizeReport(row: Record<string, unknown>): ReportItem {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    title: typeof row.title === "string" ? row.title : "",
    category: (typeof row.category === "string" ? row.category : "financeiro") as ReportItem["category"],
    period: typeof row.period === "string" ? row.period : "",
    author: typeof row.author === "string" ? row.author : "",
    records: typeof row.records === "number" ? row.records : Number(row.records ?? 0),
    generatedAt: typeof row.generated_at === "string" ? row.generated_at : new Date().toISOString(),
    status: (typeof row.status === "string" ? row.status : "rascunho") as ReportItem["status"],
  };
}

function normalizeUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    firstName: typeof row.first_name === "string" ? row.first_name : "",
    lastName: typeof row.last_name === "string" ? row.last_name : "",
    email: typeof row.email === "string" ? row.email : "",
    phone: typeof row.phone === "string" ? row.phone : "",
    department: typeof row.department === "string" ? row.department : "",
    position: typeof row.position === "string" ? row.position : "",
    role: (typeof row.role === "string" ? row.role : "Operator") as User["role"],
    status: (typeof row.status === "string" ? row.status : "activo") as User["status"],
    avatar: typeof row.avatar === "string" ? row.avatar : undefined,
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    lastLogin: typeof row.last_login === "string" ? row.last_login : undefined,
    archived: typeof row.archived === "boolean" ? row.archived : false,
  };
}

function normalizeAuditEvent(row: Record<string, unknown>): AuditEvent {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    actor: typeof row.actor === "string" ? row.actor : "Sistema",
    action: typeof row.action === "string" ? row.action : "",
    target: typeof row.target === "string" ? row.target : "",
    details: typeof row.details === "string" ? row.details : "",
    at: typeof row.at === "string" ? row.at : new Date().toISOString(),
    type: (typeof row.type === "string" ? row.type : "info") as AuditEvent["type"],
  };
}

function setSupabaseSchemaStatus(status: { ok: boolean; error?: string; migration?: string }) {
  if (typeof window === "undefined") return;
  try {
    (window as any).__HCB_SUPABASE_SCHEMA_STATUS = status;
    window.dispatchEvent(new CustomEvent("hcb_supabase_schema_status_changed", { detail: status }));
  } catch {
    // Ignore if the browser does not support CustomEvent or window is read-only.
  }
}

export async function ensureSupabaseSchema() {
  if (!(await isSupabaseConfigured()) || !supabase) return false;

  // Check if the tables already exist (e.g. they were created manually or from a previous run)
  try {
    const { error: checkError } = await supabase.from("site_settings").select("id").limit(1);
    if (!checkError) {
      setSupabaseSchemaStatus({ ok: true });
      return true;
    }
  } catch (err) {
    // Ignore and proceed to bootstrap
  }

  // Migration SQL exported for manual execution if RPC is unavailable
  const migration = SUPABASE_MIGRATION_SQL;

  try {
    const { error } = await supabase.rpc("exec_sql", { sql: migration });
    if (error) {
      console.warn("Supabase schema bootstrap warning:", error.message);
      setSupabaseSchemaStatus({ ok: false, error: error.message, migration });
      return false;
    }
    setSupabaseSchemaStatus({ ok: true });
    return true;
  } catch (err) {
    console.warn("Supabase schema bootstrap failed:", err);
    setSupabaseSchemaStatus({ ok: false, error: String(err), migration });
    return false;
  }
}

// Export migration SQL so users can run it manually in Supabase SQL Editor if needed.
export const SUPABASE_MIGRATION_SQL = `
    -- Function to execute arbitrary SQL (used for bootstrapping/migrations)
    create or replace function public.exec_sql(sql text)
    returns void
    language plpgsql
    security definer
    as $$
    begin
      execute sql;
    end;
    $$;

    create table if not exists public.site_settings (
      id uuid primary key default gen_random_uuid(),
      empresa text not null default 'HCB-BANDES',
      tagline text not null default 'Conectamos pessoas, empresas, bancos e imóveis',
      email text not null default 'geral@hcb-bandes.com',
      telefone text not null default '+244 952 300 277',
      whatsapp text not null default '+244 952 300 277',
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
      canal text not null default 'site',
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

    create table if not exists public.admin_orders (
      id text primary key,
      reference text not null,
      client text not null,
      email text not null,
      service text not null,
      amount numeric not null default 0,
      status text not null default 'pendente',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists public.admin_reports (
      id text primary key,
      title text not null,
      category text not null,
      period text not null,
      author text not null,
      records integer not null default 0,
      generated_at timestamptz default now(),
      status text not null default 'rascunho'
    );

    create table if not exists public.admin_users (
      id text primary key,
      first_name text not null,
      last_name text not null,
      email text not null,
      phone text,
      department text,
      position text,
      role text not null,
      status text not null default 'activo',
      avatar text,
      created_at timestamptz default now(),
      last_login timestamptz,
      archived boolean default false
    );

    create table if not exists public.admin_audit_events (
      id text primary key,
      actor text not null,
      action text not null,
      target text not null,
      details text not null,
      at timestamptz default now(),
      type text not null default 'info'
    );

    insert into public.site_settings (empresa, tagline, email, telefone, whatsapp, endereco, banks_partners, companies_partners, promoters_partners)
    select 'HCB-BANDES', 'Conectamos pessoas, empresas, bancos e imóveis', 'geral@hcb-bandes.com', '+244 952 300 277', '+244 952 300 277', 'Luanda, Angola', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
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

function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function saveLeadToSupabase(lead: Omit<Lead, "createdAt" | "status"> & { id?: string; status?: Lead["status"] }) {
  if (!supabase) return false;
  const payload: any = {
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    empresa: lead.empresa,
    perfil: lead.perfil,
    mensagem: lead.mensagem,
    canal: lead.canal ?? "site",
    status: lead.status ?? "novo",
  };

  if (lead.id && isUuid(lead.id)) {
    payload.id = lead.id;
  }

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

export async function updateLeadStatusInSupabase(id: string, status: Lead["status"]): Promise<boolean> {
  if (!supabase || !isUuid(id)) return false;
  const { error } = await supabase
    .from(TABLES.leads)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.warn("Supabase lead status update warning:", error.message);
    return false;
  }
  return true;
}

export async function deleteLeadFromSupabase(id: string): Promise<boolean> {
  if (!supabase || !isUuid(id)) return false;
  const { error } = await supabase.from(TABLES.leads).delete().eq("id", id);
  if (error) {
    console.warn("Supabase lead delete warning:", error.message);
    return false;
  }
  return true;
}

export async function listOrdersFromSupabase(): Promise<Order[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.orders).select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("Supabase orders read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeOrder(row as Record<string, unknown>));
}

export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: order.id,
    reference: order.reference,
    client: order.client,
    email: order.email,
    service: order.service,
    amount: order.amount,
    status: order.status,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
  const { error } = await supabase.from(TABLES.orders).upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("Supabase order save warning:", error.message);
    return false;
  }
  return true;
}

export async function listReportsFromSupabase(): Promise<ReportItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.reports).select("*").order("generated_at", { ascending: false });
  if (error) {
    console.warn("Supabase reports read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeReport(row as Record<string, unknown>));
}

export async function saveReportToSupabase(report: ReportItem): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: report.id,
    title: report.title,
    category: report.category,
    period: report.period,
    author: report.author,
    records: report.records,
    generated_at: report.generatedAt,
    status: report.status,
  };
  const { error } = await supabase.from(TABLES.reports).upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("Supabase report save warning:", error.message);
    return false;
  }
  return true;
}

export async function listUsersFromSupabase(): Promise<User[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.users).select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("Supabase users read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeUser(row as Record<string, unknown>));
}

export async function saveUserToSupabase(user: User): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    position: user.position,
    role: user.role,
    status: user.status,
    avatar: user.avatar ?? null,
    created_at: user.createdAt,
    last_login: user.lastLogin ?? null,
    archived: user.archived ?? false,
  };
  const { error } = await supabase.from(TABLES.users).upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("Supabase user save warning:", error.message);
    return false;
  }
  return true;
}

export async function authenticateAdminFromSupabase(
  usernameOrEmail: string,
  password: string,
): Promise<{ success: boolean; user?: User }> {
  if (!supabase) return { success: false };
  try {
    const { data: listData, error } = await supabase.from(TABLES.users).select("*");
    if (error || !listData) return { success: false };

    const target = usernameOrEmail.trim().toLowerCase();
    const found = listData.find((row: any) => {
      const u = String(row.username ?? "").trim().toLowerCase();
      const e = String(row.email ?? "").trim().toLowerCase();
      const id = String(row.id ?? "").trim().toLowerCase();
      return u === target || e === target || id === target;
    });

    if (found) {
      const storedPass = typeof found.password_hash === "string" ? found.password_hash : null;
      const isPasswordValid = storedPass
        ? storedPass === password || storedPass.toLowerCase() === password.toLowerCase()
        : true;

      if (isPasswordValid && found.archived !== true && found.status !== "inactivo") {
        return { success: true, user: normalizeUser(found) };
      }
    }
  } catch (err) {
    console.warn("Supabase admin auth check warning:", err);
  }
  return { success: false };
}

export async function listAuditEventsFromSupabase(): Promise<AuditEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES.auditEvents).select("*").order("at", { ascending: false });
  if (error) {
    console.warn("Supabase audit events read warning:", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeAuditEvent(row as Record<string, unknown>));
}

export async function saveAuditEventToSupabase(event: AuditEvent): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: event.id,
    actor: event.actor,
    action: event.action,
    target: event.target,
    details: event.details,
    at: event.at,
    type: event.type,
  };
  const { error } = await supabase.from(TABLES.auditEvents).upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("Supabase audit event save warning:", error.message);
    return false;
  }
  return true;
}

export async function savePageContentToSupabase(content: DbPageContent): Promise<DbPageContent | null> {
  if (!supabase) return null;
  const payload = {
    page_key: content.page_key,
    title: content.title,
    description: content.description,
    hero: content.hero ?? null,
  };
  const { data, error } = await supabase.from(TABLES.content).upsert(payload, { onConflict: "page_key" }).select().single();
  if (error) {
    console.warn("Supabase content save warning:", error.message);
    return null;
  }
  return normalizePageContent(data as Record<string, unknown>);
}

export async function saveServiceToSupabase(service: DbService): Promise<DbService | null> {
  if (!supabase) return null;
  const payload = {
    slug: service.slug,
    title: service.title,
    description: service.description,
    points: service.points,
    order_index: service.order_index ?? 0,
    is_active: service.is_active ?? true,
  };
  const { data, error } = await supabase
    .from(TABLES.services)
    .upsert(payload, { onConflict: "slug" })
    .select()
    .single();
  if (error) {
    console.warn("Supabase service save warning:", error.message);
    return null;
  }
  return normalizeService(data as Record<string, unknown>);
}

export async function deleteServiceFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from(TABLES.services).delete().eq("id", id);
  if (error) {
    console.warn("Supabase service delete warning:", error.message);
    return false;
  }
  return true;
}
