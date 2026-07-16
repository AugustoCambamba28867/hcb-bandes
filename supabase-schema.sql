create extension if not exists pgcrypto;

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

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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

insert into public.admin_users (username, password_hash)
select 'admin_hcb', crypt('Hcbbandes2026', gen_salt('bf'))
where not exists (select 1 from public.admin_users where username = 'admin_hcb');

alter table public.site_settings enable row level security;
alter table public.leads enable row level security;
alter table public.services enable row level security;
alter table public.stages enable row level security;
alter table public.page_content enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings for select using (true);

drop policy if exists "site_settings_insert_public" on public.site_settings;
create policy "site_settings_insert_public" on public.site_settings for insert with check (true);

drop policy if exists "site_settings_update_public" on public.site_settings;
create policy "site_settings_update_public" on public.site_settings for update using (true) with check (true);

drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public" on public.leads for insert with check (true);

drop policy if exists "services_select_public" on public.services;
create policy "services_select_public" on public.services for select using (true);

drop policy if exists "stages_select_public" on public.stages;
create policy "stages_select_public" on public.stages for select using (true);

drop policy if exists "page_content_select_public" on public.page_content;
create policy "page_content_select_public" on public.page_content for select using (true);
