-- ============================================================
-- SCRIPT DE CRIAÇÃO E INICIALIZAÇÃO DA BASE DE DADOS (SUPABASE)
-- Projeto: HCB-BANDES — Habitação Corporativa
-- Copie e cole este conteúdo no "SQL Editor" do seu novo Supabase e clique em "Run".
-- ============================================================

-- Extensão para geração de UUIDs e encriptação
create extension if not exists pgcrypto;

-- Função auxiliar para execução de SQL remoto
create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;

-- 1. Tabela de Definições Institucionais do Site
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

-- 2. Tabela de Leads / Mensagens de Contacto & Pedidos de Orçamento
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

-- 3. Tabela de Serviços
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

-- 4. Tabela de Etapas do Processo / Modelo
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

-- 5. Tabela de Conteúdo Editável das Páginas
create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text unique not null,
  title text not null,
  description text not null,
  hero text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Tabela de Encomendas / Pedidos do Painel Admin
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

-- 7. Tabela de Relatórios do Painel Admin
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

-- 8. Tabela de Utilizadores do Painel Admin
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

-- 9. Tabela de Eventos de Auditoria do Painel Admin
create table if not exists public.admin_audit_events (
  id text primary key,
  actor text not null,
  action text not null,
  target text not null,
  details text not null,
  at timestamptz default now(),
  type text not null default 'info'
);

-- ============================================================
-- DADOS INICIAIS (SEED DATA)
-- ============================================================

insert into public.site_settings (empresa, tagline, email, telefone, whatsapp, endereco, banks_partners, companies_partners, promoters_partners)
select 'HCB-BANDES', 'Conectamos pessoas, empresas, bancos e imóveis', 'geral@hcb-bandes.com', '+244 952 300 277', '+244 952 300 277', 'Luanda, Angola', '["BAI", "BFA", "BIC", "Banco Sol"]'::jsonb, '["Sonangol", "Endiama", "TAAG", "Unitel"]'::jsonb, '["Imogestin", "Vida Imobiliária", "Casa Plus"]'::jsonb
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

-- ============================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Permite leitura e escrita sem bloqueios de permissão
-- ============================================================

alter table public.site_settings enable row level security;
alter table public.leads enable row level security;
alter table public.services enable row level security;
alter table public.stages enable row level security;
alter table public.page_content enable row level security;
alter table public.admin_orders enable row level security;
alter table public.admin_reports enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_audit_events enable row level security;

drop policy if exists "site_settings_all" on public.site_settings;
create policy "site_settings_all" on public.site_settings for all using (true) with check (true);

drop policy if exists "leads_all" on public.leads;
create policy "leads_all" on public.leads for all using (true) with check (true);

drop policy if exists "services_all" on public.services;
create policy "services_all" on public.services for all using (true) with check (true);

drop policy if exists "stages_all" on public.stages;
create policy "stages_all" on public.stages for all using (true) with check (true);

drop policy if exists "page_content_all" on public.page_content;
create policy "page_content_all" on public.page_content for all using (true) with check (true);

drop policy if exists "admin_orders_all" on public.admin_orders;
create policy "admin_orders_all" on public.admin_orders for all using (true) with check (true);

drop policy if exists "admin_reports_all" on public.admin_reports;
create policy "admin_reports_all" on public.admin_reports for all using (true) with check (true);

drop policy if exists "admin_users_all" on public.admin_users;
create policy "admin_users_all" on public.admin_users for all using (true) with check (true);

drop policy if exists "admin_audit_events_all" on public.admin_audit_events;
create policy "admin_audit_events_all" on public.admin_audit_events for all using (true) with check (true);
