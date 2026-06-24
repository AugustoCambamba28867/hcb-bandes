import { createFileRoute } from "@tanstack/react-router";
import { Building2, Landmark, Home, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — HCB-BANDES" },
      {
        name: "description",
        content:
          "Habitação Corporativa, Crédito Imobiliário, Imobiliário e Gestão Condominial.",
      },
      { property: "og:title", content: "Serviços — HCB-BANDES" },
      {
        property: "og:description",
        content: "Quatro pilares de serviço para uma solução habitacional completa.",
      },
      { property: "og:url", content: "/servicos" },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: ServicosPage,
});

const SERVICOS = [
  {
    icon: Building2,
    title: "Habitação Corporativa",
    desc: "Desenhamos programas habitacionais à medida das empresas parceiras, integrando o benefício no pacote oferecido aos seus colaboradores.",
    pontos: [
      "Protocolos com condições preferenciais",
      "Comunicação interna e atendimento dedicado",
      "Reporting periódico para a Direcção e RH",
    ],
  },
  {
    icon: Landmark,
    title: "Crédito Imobiliário",
    desc: "Articulamos o cliente final com os bancos comerciais parceiros, garantindo processos pré-validados e ágeis.",
    pontos: [
      "Simulação prévia das condições",
      "Documentação preparada e organizada",
      "Acompanhamento até à aprovação",
    ],
  },
  {
    icon: Home,
    title: "Imobiliário",
    desc: "Carteira de imóveis e condomínios cuidadosamente seleccionados com promotores parceiros em todo o país.",
    pontos: [
      "Tipologias diversas e localizações estratégicas",
      "Visitas e acompanhamento personalizado",
      "Garantia de qualidade construtiva",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Gestão Condominial",
    desc: "Administração profissional de condomínios, com foco em transparência financeira e qualidade de vida dos moradores.",
    pontos: [
      "Gestão financeira e administrativa",
      "Manutenção e segurança permanentes",
      "Plataforma de comunicação com moradores",
    ],
  },
];

function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Os Nossos Serviços"
        title="Quatro pilares que cobrem toda a cadeia da habitação."
        subtitle="Da empresa parceira ao trabalhador beneficiário, integramos os serviços essenciais para que cada projecto habitacional aconteça com eficiência."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          {SERVICOS.map((s) => (
            <article
              key={s.title}
              className="group rounded-2xl border border-border bg-card p-8 transition hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:bg-gold group-hover:text-gold-foreground transition">
                <s.icon size={24} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-primary">{s.title}</h2>
              <p className="mt-3 text-foreground/75 leading-relaxed">{s.desc}</p>
              <ul className="mt-6 space-y-2">
                {s.pontos.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 size={16} className="mt-0.5 text-gold shrink-0" />
                    {p}
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
