# 🏢 HCB-BANDES — Plataforma de Habitação Corporativa em Angola

![Version](https://img.shields.io/badge/version-1.0.0-gold.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.0-orange.svg)
![Vitest](https://img.shields.io/badge/Tests-36_Passed-brightgreen.svg)
![License](https://img.shields.io/badge/license-Proprietary-gold.svg)

A **HCB-BANDES (Habitação Corporativa Bandes)** é uma plataforma digital corporativa desenvolvida para conectar empresas empregadoras, instituições bancárias, promotores imobiliários e trabalhadores angolanos num ecossistema integrado de habitação corporativa e acesso à casa própria em Angola.

---

## 📌 Índice

1. [Visão Geral & Modelo de Negócio](#-visão-geral--modelo-de-negócio)
2. [Arquitetura & Stack Tecnológica](#-arquitetura--stack-tecnológica)
3. [Principais Funcionalidades](#-principais-funcionalidades)
   - [Portal Público (Front-End)](#1-portal-público-front-end)
   - [Painel Administrativo (/admin)](#2-painel-administrativo-admin)
   - [Mecanismo de Resiliência & Auto-Sync Offline](#3-mecanismo-de-resiliência--auto-sync-offline)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Instalação & Configuração Local](#-instalação--configuração-local)
6. [Configuração do Supabase (SQL Script)](#-configuração-do-supabase-sql-script)
7. [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
8. [Testes Automatizados](#-testes-automatizados)
9. [Publicação & Deploy](#-publicação--deploy)
10. [Licença & Créditos](#-licença--créditos)

---

## 🚀 Visão Geral & Modelo de Negócio

A HCB-BANDES atua como um facilitador estratégico entre quatro atores fundamentais da economia habitacional angolana:

| Actor | Papel no Ecossistema | Benefício Oferecido |
| :--- | :--- | :--- |
| **🏢 Empresas Empregadoras** | Oferecem a solução como benefício corporativo | Retenção e valorização de quadros talentosos |
| **🏛️ Bancos Comerciais** | Financiam o crédito imobiliário | Carteira pré-qualificada e menor risco de crédito |
| **🏗️ Promotores Imobiliários** | Disponibilizam imóveis e condomínios | Canal direto de escoamento e vendas estruturadas |
| **👤 Trabalhadores / Clientes** | Beneficiários finais | Acesso facilitado e transparente à habitação |

---

## 🛠️ Arquitetura & Stack Tecnológica

O projeto foi construído utilizando as tecnologias web mais modernas para garantir desempenho, segurança, responsividade e resiliência total de dados.

- **Core & Runtime**: [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/)
- **Roteamento**: [TanStack Router](https://tanstack.com/router) (Roteamento baseado no sistema de ficheiros)
- **Estilização & Design**: TailwindCSS, CSS Variables, Glassmorphism, Micro-animações nativas CSS
- **Iconografia & Notificações**: [Lucide React](https://lucide.dev/), [Sonner Toasts](https://sonner.emilkowal.ski/)
- **Base de Dados & Backend**: [Supabase](https://supabase.com/) (PostgreSQL relacional com Row Level Security - RLS)
- **Validação de Formulários**: [Zod](https://zod.dev/)
- **Testes Automatizados**: [Vitest](https://vitest.dev/), Testing Library React

---

## ⚙️ Principais Funcionalidades

### 1. Portal Público (Front-End)
- **Design Institucional de Alto Padrão**: Layout moderno em tons corporativos e dourado, 100% responsivo para mobile, tablet e desktop.
- **Páginas Principais**:
  - ` / `: Home interativa com resumo de serviços, etapas do processo e estatísticas.
  - ` /quem-somos `: Missão, visão, valores e modelo de governança da empresa.
  - ` /modelo `: As 7 etapas detalhadas da jornada habitacional.
  - ` /servicos `: Os 4 pilares de atuação (Habitação Corporativa, Crédito Imobiliário, Imobiliário, Gestão Condominial).
  - ` /beneficios `: Vantagens por perfil de ator.
  - ` /diferenciais `: Proposta de valor única da HCB-BANDES.
  - ` /contactos `: Formulário inteligente de orçamento e pedido de informação.
- **Formulário de Contacto & Orçamento Integrado**:
  - Validação rigorosa em tempo real via Zod (nome, e-mail, telefone angolano, perfil e mensagem).
  - Envio direto para o **WhatsApp oficial da empresa** com mensagem pré-formatada.
  - Gravação automática da lead na base de dados (Supabase / local).
- **Rodapé & WhatsApp Flutuante Reativos**:
  - Escutam as definições guardadas no painel admin em tempo real (`useSiteSettings`).

### 2. Painel Administrativo (`/admin`)
- **Autenticação Segura**: Protegido por palavra-passe com controlo de sessão persistente (`hcb_admin_auth_v2`) e opção "Manter sessão iniciada".
- **Dashboard Executivo (`/admin/index`)**:
  - Indicadores em tempo real (Total de Leads, Pedidos Pendentes, Valor Acumulado, Utilizadores Ativos).
  - Monitor de estado da conexão Supabase (Online / Local Fallback).
- **Gestão de Leads (`/admin/leads`)**:
  - Filtro por estado (*Novo, Em Contacto, Qualificado, Fechado, Descartado*) e por perfil.
  - Modal com vista detalhada de cada lead.
  - Exportação completa em formatos **CSV** e **JSON**.
- **Gestão de Encomendas (`/admin/pedidos`)**: Registo e acompanhamento de propostas.
- **Gestão de Conteúdos (`/admin/conteudos`)**: Edição dos textos, títulos e heros das páginas do site sem alterar código.
- **Gestão de Parceiros (`/admin/parceiros`)**: Gestão de listas de bancos, empresas e promotores parceiros.
- **Definições (`/admin/definicoes`)**: Edição dos contactos institucionais (empresa, e-mail, telefones, morada) com atualização instantânea no site público.

### 3. Mecanismo de Resiliência & Auto-Sync Offline
- **Zero Downtime**: Se a ligação à internet falhar ou se o Supabase estiver em manutenção, a aplicação guarda os pedidos e definições localmente (`localStorage`).
- **Sincronização Automática**: Assim que a conexão com o Supabase é restabelecida, a aplicação deteta os registos pendentes no dispositivo do utilizador e envia-os automaticamente para a nuvem.

---

## 📁 Estrutura do Projeto

```
hcb-bandes/
├── docs/
│   └── supabase-schema.sql    # Script SQL oficial de criação das tabelas e RLS
├── src/
│   ├── assets/                # Imagens e recursos gráficos
│   ├── components/            # Componentes reutilizáveis (SiteHeader, SiteFooter, etc.)
│   ├── lib/                   # Módulos de dados, utilitários, Zod schemas e hooks
│   │   ├── leads-store.ts     # Gestão e armazenamento de leads
│   │   ├── site-settings.ts   # Definções institucionais e hook reativo useSiteSettings
│   │   ├── supabase-client.ts # Inicialização do cliente Supabase
│   │   └── supabase-data.ts   # Funções CRUD de integração com Supabase PostgreSQL
│   ├── routes/                # Rotas da aplicação (TanStack Router)
│   │   ├── __root.tsx         # Layout raiz do site
│   │   ├── index.tsx          # Página Inicial
│   │   ├── contactos.tsx      # Formulário de contactos e orçamento
│   │   ├── admin.tsx          # Layout e verificação de auth do Admin
│   │   ├── admin.index.tsx    # Dashboard Admin
│   │   ├── admin.leads.tsx    # Gestão de Leads no Admin
│   │   ├── admin.definicoes.tsx # Gestão de Definições no Admin
│   │   └── -admin.test.tsx    # Testes da rota Admin (ignorados no router)
│   ├── styles.css             # Design System & utilitários CSS
│   └── main.tsx               # Ponto de entrada da aplicação
├── supabase-schema.sql        # Script SQL completo de inicialização para o Supabase
├── vite.config.ts             # Configuração do Vite e TanStack Router
├── vitest.config.ts           # Configuração de testes automatizados
└── package.json               # Dependências e scripts npm
```

---

## 💻 Instalação & Configuração Local

### Pré-requisitos
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior

### Passos de Instalação

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/AugustoCambamba28867/hcb-bandes.git
   cd hcb-bandes
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Crie um ficheiro `.env` na raiz do projeto baseado no `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   VITE_ADMIN_USERNAME=admin_hcb
   VITE_ADMIN_PASSWORD=Hcbbandes2026
   ```

4. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Aceda a `http://localhost:8080` no seu navegador.

---

## 🗄️ Configuração do Supabase (SQL Script)

Para preparar uma nova base de dados no Supabase para o projeto:

1. Aceda ao painel do seu projeto no **[Supabase](https://supabase.com)**.
2. Vá a **SQL Editor** > **New Query**.
3. Copie o conteúdo do ficheiro [`supabase-schema.sql`](./supabase-schema.sql) e cole no editor.
4. Clique em **Run**.

Este script criará as **9 tabelas relacionais**, dados pré-definidos para serviços e etapas, além de ativar as **políticas de acesso (RLS)**.

---

## 🧪 Testes Automatizados

O projeto inclui 36 testes automatizados utilizando **Vitest** e **Testing Library**:

```bash
# Executar todos os testes uma vez
npm test -- --run

# Executar os testes em modo watch (desenvolvimento)
npm test
```

---

## 🚀 Publicação & Deploy

### Vercel / Netlify / Cloudflare / Lovable

1. Conecte o repositório GitHub à plataforma de alojamento.
2. Defina o comando de build: `npm run build`.
3. Defina a pasta de saída (*Publish directory*): `dist`.
4. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel de definições da plataforma.

---

## 📜 Licença & Créditos

Desenvolvido exclusivamente para a **HCB-BANDES — Habitação Corporativa em Angola** (Unidade de negócios da Bandes Comércio & Serviços).  
Todos os direitos reservados © 2026.
