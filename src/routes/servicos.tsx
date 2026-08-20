import { createFileRoute } from "@tanstack/react-router";
import { Home, Building2, Banknote, CheckCircle2, Search, FileText, ClipboardCheck, Scale, Briefcase, Globe2, Users } from "lucide-react";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços - HCB-BANDES" },
      {
        name: "description",
        content: "Serviços Imobiliários, Habitação Corporativa e Intermediação de Crédito Imobiliário — HCB-BANDES.",
      },
      { property: "og:title", content: "Serviços - HCB-BANDES" },
      { property: "og:description", content: "Soluções completas para o mercado imobiliário angolano." },
      { property: "og:url", content: "/servicos" },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: ServicosPage,
});

const REAL_ESTATE = [
  "Compra e venda de imóveis",
  "Arrendamento residencial e corporativo",
  "Angariação e promoção de imóveis",
  "Apoio na negociação e formalização dos contratos",
  "Gestão profissional de condomínios",
  "Acompanhamento pós-venda e pós-arrendamento",
];

const HABITACAO_CORP = [
  "Alojamento temporário ou de longa duração",
  "Habitação para trabalhadores em mobilidade profissional",
  "Alojamento de executivos, expatriados e consultores",
  "Soluções residenciais para equipas em projetos ou em transição",
  "Programas empresariais de acesso à habitação própria",
  "Negociação de condições especiais com bancos, promotores e proprietários",
  "Gestão dos imóveis e dos serviços associados à permanência dos colaboradores",
];

const CREDITO_ETAPAS = [
  {
    icon: Search,
    letra: "a",
    title: "Análise do perfil e da capacidade financeira",
    items: [
      "Avaliação dos rendimentos e encargos financeiros",
      "Cálculo da taxa de esforço",
      "Estimativa da prestação mensal",
      "Determinação do valor de financiamento potencialmente adequado",
      "Identificação inicial dos requisitos de elegibilidade bancária",
    ],
  },
  {
    icon: Banknote,
    letra: "b",
    title: "Comparação e negociação de propostas",
    items: [
      "Mapeamento das soluções de crédito disponíveis nos bancos parceiros",
      "Comparação das taxas de juro, prazos, prestações e comissões",
      "Análise dos custos dos seguros de vida e multirriscos",
      "Apoio na identificação da proposta mais adequada ao perfil do cliente",
      "Negociação institucional de condições para grupos de trabalhadores",
    ],
  },
  {
    icon: FileText,
    letra: "c",
    title: "Preparação e instrução do processo",
    items: [
      "Recolha e verificação da documentação pessoal e financeira",
      "Organização dos documentos jurídicos e técnicos do imóvel",
      "Identificação de documentos em falta ou não conformes",
      "Constituição do processo de candidatura",
      "Submissão e acompanhamento junto das instituições bancárias",
    ],
  },
  {
    icon: ClipboardCheck,
    letra: "d",
    title: "Acompanhamento até à escritura",
    items: [
      "Monitorização da análise bancária",
      "Acompanhamento da avaliação do imóvel",
      "Apoio no cumprimento das condições exigidas para aprovação",
      "Articulação entre cliente, banco, vendedor e demais intervenientes",
      "Coordenação da formalização do contrato de crédito",
      "Acompanhamento até à assinatura da escritura e entrega do imóvel",
    ],
  },
];

function ServiceBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-bg-medium px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">{number}</span>
      {label}
    </div>
  );
}

function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="HCB – BANDES – Comércio e Prestação de Serviços"
        title="Nossos Serviços"
        subtitle="Soluções integradas para o mercado imobiliário angolano — do arrendamento ao crédito, da empresa ao trabalhador."
      />

      {/* ── SERVIÇO 1 ── Real Estate ─────────────────────────────── */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Texto */}
          <div>
            <ServiceBadge number="1" label="Serviço" />
            <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Serviços Imobiliários<br />
              <span className="text-accent">Real Estate</span>
            </h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Prestamos soluções integradas para o mercado imobiliário, incluindo:
            </p>
            <ul className="mt-6 space-y-3">
              {REAL_ESTATE.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Card visual */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Home, label: "Compra & Venda" },
              { icon: Building2, label: "Arrendamento" },
              { icon: Scale, label: "Formalização" },
              { icon: ClipboardCheck, label: "Gestão Condominial" },
            ].map((item) => (
              <div
                key={item.label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bg-medium text-primary ring-1 ring-primary/10 transition-all group-hover:bg-accent group-hover:text-white group-hover:ring-accent/30">
                  <item.icon size={24} />
                </div>
                <span className="text-sm font-semibold text-primary">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── SERVIÇO 2 ── Habitação Corporativa ───────────────────── */}
      <Section className="bg-bg-medium">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Card visual */}
          <div className="flex flex-col gap-3 order-2 lg:order-1">
            {[
              { icon: Building2, text: "Alojamento temporário ou de longa duração" },
              { icon: Briefcase, text: "Trabalhadores em mobilidade profissional" },
              { icon: Globe2, text: "Executivos, expatriados e consultores" },
              { icon: Users, text: "Equipas em projetos ou em transição" },
              { icon: Home, text: "Programas de acesso à habitação própria" },
            ].map((item) => (
              <div
                key={item.text}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-medium text-accent ring-1 ring-primary/10 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <item.icon size={18} />
                </span>
                <span className="text-sm font-medium text-foreground/90">{item.text}</span>
              </div>
            ))}
          </div>


          {/* Texto */}
          <div className="order-1 lg:order-2">
            <ServiceBadge number="2" label="Serviço" />
            <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Habitação Corporativa
            </h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Desenvolvemos soluções habitacionais destinadas às empresas e aos seus colaboradores, incluindo:
            </p>
            <ul className="mt-6 space-y-3">
              {HABITACAO_CORP.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── SERVIÇO 3 ── Intermediação de Crédito ────────────────── */}
      <Section>
        {/* Cabeçalho */}
        <div className="mx-auto max-w-3xl text-center">
          <ServiceBadge number="3" label="Serviço" />
          <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary">
            Intermediação e Facilitação de Crédito Imobiliário
          </h2>
          <p className="mt-4 text-foreground/75 leading-relaxed">
            Apoiamos os clientes durante todo o processo de preparação, solicitação e acompanhamento do crédito imobiliário.
          </p>
        </div>

        {/* 4 etapas */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {CREDITO_ETAPAS.map((etapa) => (
            <article
              key={etapa.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
            >
              {/* Top accent bar on hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-accent scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-t-2xl" />

              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-medium text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:ring-accent/30">
                  <etapa.icon size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    {etapa.letra})
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-primary">{etapa.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {etapa.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/75">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
