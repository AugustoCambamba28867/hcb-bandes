import { createFileRoute } from "@tanstack/react-router";
import { Building, ClipboardList, Briefcase, Banknote, Home, Key, CheckCircle2 } from "lucide-react";
import { PageHero, Section } from "@/components/section";
import { usePageContent } from "@/lib/site-content";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços - HCB-BANDES" },
      {
        name: "description",
        content: "Conheça os serviços da HCB-BANDES, desde habitação corporativa até consultoria imobiliária.",
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

const SERVICOS = [
  {
    icon: Home,
    title: "Real Estate",
    desc: "Engloba a compra, venda, arrendamento de imóveis e gestão de condomínios.",
    pontos: [
      "Compra e venda de imóveis",
      "Arrendamento de imóveis",
      "Gestão de condomínios",
    ],
  },
  {
    icon: Building,
    title: "Habitação Corporativa",
    desc: "Alojamento temporário ou de longa duração para colaboradores em mobilidade profissional, executivos expatriados, consultores em projecto ou equipas em transição.",
    pontos: [
      "Alojamento temporário e de longa duração",
      "Executivos expatriados e equipas em transição",
    ],
  },
  {
    icon: Banknote,
    title: "Intermediação de Crédito Imobiliário",
    desc: "Soluções integradas de financiamento, desde a avaliação até à escritura do imóvel.",
    pontos: [
      "Análise de Perfil e Capacidade Financeira",
      "Comparação e Negociação de Propostas",
      "Montagem e Instrução do Dossier",
      "Acompanhamento até a Escritura",
    ],
  },
];

function ServicosPage() {
  const c = usePageContent("servicos");
  return (
    <>
      <PageHero
        eyebrow="Os Nossos Servicos"
        title={c.title}
        subtitle={c.hero || c.description}
      />


      <Section>
        <div className="mb-10 overflow-hidden rounded-lg border border-border bg-card">
          <img
            src="/legacy/capa.png"
            alt="HCB-BANDES gestao de condominios"
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {SERVICOS.map((s) => (
            <article
              key={s.title}
              className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-gold group-hover:text-gold-foreground">
                  <s.icon size={24} />
                </div>
                <h2 className="mt-6 font-display text-xl font-bold text-primary">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.desc}</p>
                <ul className="mt-6 space-y-2.5">
                  {s.pontos.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
