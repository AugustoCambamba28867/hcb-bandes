import { createFileRoute } from "@tanstack/react-router";
import { Users, Landmark, Home, CheckCircle2 } from "lucide-react";
import { PageHero, Section } from "@/components/section";
import { usePageContent } from "@/lib/site-content";

export const Route = createFileRoute("/beneficios")({
  head: () => ({
    meta: [
      { title: "Benefícios — HCB-BANDES" },
      {
        name: "description",
        content:
          "Benefícios para empresas, bancos e trabalhadores parceiros da HCB-BANDES.",
      },
      { property: "og:title", content: "Benefícios — HCB-BANDES" },
      {
        property: "og:description",
        content:
          "Vantagens concretas para cada actor do ecossistema HCB-BANDES.",
      },
      { property: "og:url", content: "/beneficios" },
    ],
    links: [{ rel: "canonical", href: "/beneficios" }],
  }),
  component: BeneficiosPage,
});

const BLOCKS = [
  {
    icon: Users,
    title: "Para Empresas Empregadoras",
    intro: "Reforce a sua proposta de valor enquanto empregador.",
    items: [
      "Retenção e motivação de talento qualificado",
      "Programa habitacional sem custo directo para a empresa",
      "Diferenciação no mercado e fortalecimento da marca empregadora",
      "Reporting periódico e ponto de contacto dedicado",
      "Cumprimento de responsabilidade social corporativa",
    ],
  },
  {
    icon: Landmark,
    title: "Para Bancos Parceiros",
    intro: "Acesso a uma carteira qualificada de clientes.",
    items: [
      "Leads pré-qualificados com vínculo empregatício",
      "Documentação organizada antes da submissão",
      "Redução do risco de crédito e da taxa de inadimplência",
      "Maior eficiência operacional na originação",
      "Relacionamento de longo prazo com empresas parceiras",
    ],
  },
  {
    icon: Home,
    title: "Para Trabalhadores",
    intro: "O caminho mais simples para a casa própria.",
    items: [
      "Condições negociadas com promotores e bancos",
      "Acompanhamento em todas as fases do processo",
      "Transparência total nos custos e prazos",
      "Suporte pós-venda contínuo",
      "Acesso a imóveis em condomínios geridos profissionalmente",
    ],
  },
];

function BeneficiosPage() {
  const c = usePageContent("beneficios");
  return (
    <>
      <PageHero
        eyebrow="Benefícios"
        title={c.title}
        subtitle={c.hero || c.description}
      />


      <Section>
        <div className="space-y-10">
          {BLOCKS.map((b) => (
            <article
              key={b.title}
              className="grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-[280px_1fr] md:gap-10"
            >
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold text-gold-foreground">
                  <b.icon size={24} />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-primary">{b.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{b.intro}</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 self-center">
                {b.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-foreground/85">
                    <CheckCircle2 size={16} className="mt-0.5 text-gold shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
