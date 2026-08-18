import { createFileRoute } from "@tanstack/react-router";
import { Building2, Home, Banknote, CheckCircle2, Users, FileText, Search, ClipboardCheck } from "lucide-react";
import { PageHero, Section } from "@/components/section";
import { usePageContent } from "@/lib/site-content";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços - HCB-BANDES" },
      {
        name: "description",
        content: "Conheça os serviços da HCB-BANDES: Real State, Habitação Corporativa e Intermediação de Crédito Imobiliário.",
      },
      { property: "og:title", content: "Serviços - HCB-BANDES" },
      {
        property: "og:description",
        content: "Serviços profissionais imobiliários e de habitação HCB-BANDES.",
      },
      { property: "og:url", content: "/servicos" },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: ServicosPage,
});

const CREDITO_ETAPAS = [
  {
    icon: Search,
    letra: "a",
    title: "Análise de Perfil e Capacidade Financeira",
    desc: "Avaliação do rendimento do cliente, cálculo da taxa de esforço e determinação do valor máximo de financiamento viável.",
  },
  {
    icon: Banknote,
    letra: "b",
    title: "Comparação e Negociação de Propostas",
    desc: "Mapeamento das ofertas bancárias no mercado para obter as melhores condições de taxas de juro, prazos e custos de seguros associados (vida e multi-riscos).",
  },
  {
    icon: FileText,
    letra: "c",
    title: "Montagem e Instrução do Dossier",
    desc: "Recolha, validação e organização de toda a documentação pessoal, financeira e do imóvel para submissão aos bancos.",
  },
  {
    icon: ClipboardCheck,
    letra: "d",
    title: "Acompanhamento até a Escritura",
    desc: "Monitorização da avaliação do imóvel, emissão da aprovação bancária e coordenação da formalização do contrato de crédito.",
  },
];

function ServicosPage() {
  const c = usePageContent("servicos");
  return (
    <>
      <PageHero
        eyebrow="HCB – BANDES – Comércio e Prestação de Serviços"
        title="Nossos Serviços"
        subtitle="Soluções completas para o mercado imobiliário angolano."
      />

      {/* SERVIÇO 1 — Real State */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-bg-medium px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Home size={14} /> Serviço 01
            </div>
            <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary">
              Real State
            </h2>
            <p className="mt-4 text-foreground/80 leading-relaxed text-lg">
              Engloba a compra, venda, arrendamento de imóveis e gestão de condomínios.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Compra e venda de imóveis",
                "Arrendamento mensal e diário",
                "Gestão profissional de condomínios",
                "Acompanhamento jurídico completo",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-bg-medium blur-2xl opacity-60 -z-10" />
            <div className="rounded-2xl overflow-hidden border border-border bg-white p-8 shadow-elegant">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Home, label: "Venda de Imóveis" },
                  { icon: Building2, label: "Arrendamento" },
                  { icon: Users, label: "Gestão Condominial" },
                  { icon: FileText, label: "Apoio Jurídico" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-3 rounded-xl border border-bg-medium bg-bg-medium/50 p-5 text-center transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white">
                      <item.icon size={22} />
                    </div>
                    <span className="text-sm font-semibold text-primary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SERVIÇO 2 — Habitação Corporativa */}
      <Section className="bg-bg-medium">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-border bg-white p-8 shadow-elegant">
              <div className="flex flex-col gap-4">
                {[
                  { emoji: "🏢", text: "Colaboradores em mobilidade profissional" },
                  { emoji: "🌍", text: "Executivos expatriados" },
                  { emoji: "📋", text: "Consultores em projecto" },
                  { emoji: "👥", text: "Equipas em transição" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4 rounded-xl border border-bg-medium bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-sm font-medium text-foreground/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Building2 size={14} /> Serviço 02
            </div>
            <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary">
              Habitação Corporativa
            </h2>
            <p className="mt-4 text-foreground/80 leading-relaxed text-lg">
              Alojamento temporário ou de longa duração para colaboradores em mobilidade profissional, executivos expatriados, consultores em projecto ou equipas em transição.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Alojamento temporário e de longa duração",
                "Soluções personalizadas por perfil",
                "Parcerias estratégicas com empregadores",
                "Processos simplificados e ágeis",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* SERVIÇO 3 — Intermediação de Crédito Imobiliário */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-medium px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Banknote size={14} /> Serviço 03
          </div>
          <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-primary">
            Intermediação de Crédito Imobiliário
          </h2>
          <p className="mt-4 text-foreground/80 leading-relaxed text-lg">
            Facilitamos todo o processo de financiamento junto da nossa rede de bancos parceiros, acompanhando o cliente desde a análise do perfil até à escritura.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {CREDITO_ETAPAS.map((etapa, i) => (
            <article
              key={etapa.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-7 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-medium text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:ring-accent/30">
                  <etapa.icon size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {etapa.letra})
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-primary">{etapa.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">{etapa.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
