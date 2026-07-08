import { createFileRoute } from "@tanstack/react-router";
import { Banknote, CheckCircle2, ClipboardList, Settings2 } from "lucide-react";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Servicos - HCB-BANDES" },
      {
        name: "description",
        content: "Gestao financeira, administrativa e operacional para condominios.",
      },
      { property: "og:title", content: "Servicos - HCB-BANDES" },
      {
        property: "og:description",
        content: "Servicos profissionais de gestao condominial HCB-BANDES.",
      },
      { property: "og:url", content: "/servicos" },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: ServicosPage,
});

const SERVICOS = [
  {
    icon: Banknote,
    image: "/legacy/gestao-financeira.jpg",
    title: "Gestao Financeira",
    desc: "Organizamos a saude financeira do condominio com cobranca, controlo de caixa, prestacao de contas e relatorios claros.",
    pontos: [
      "Orcamentos, quotas e controlo de inadimplencia",
      "Relatorios financeiros periodicos",
      "Transparencia nas receitas e despesas",
    ],
  },
  {
    icon: ClipboardList,
    image: "/legacy/gestao-administrativa.jpg",
    title: "Gestao Administrativa",
    desc: "Tratamos dos processos administrativos do condominio, documentacao, comunicacao com moradores e suporte a tomada de decisao.",
    pontos: [
      "Actas, contratos e organizacao documental",
      "Atendimento e comunicacao com moradores",
      "Apoio a direccao e assembleias",
    ],
  },
  {
    icon: Settings2,
    image: "/legacy/gestao-operacional.jpg",
    title: "Gestao Operacional",
    desc: "Coordenamos manutencao, limpeza, seguranca e fornecedores para garantir tranquilidade, conservacao e valorizacao do patrimonio.",
    pontos: [
      "Supervisao de manutencao e limpeza",
      "Coordenacao de seguranca e fornecedores",
      "Rotinas operacionais acompanhadas de perto",
    ],
  },
];

function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Os Nossos Servicos"
        title="Gestao condominial profissional para valorizar patrimonios."
        subtitle="A HCB-BANDES actua na administracao de condominios com foco em organizacao financeira, rigor administrativo e operacao diaria eficiente."
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
              <img src={s.image} alt={s.title} className="h-44 w-full object-cover" />
              <div className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground transition group-hover:bg-gold group-hover:text-gold-foreground">
                  <s.icon size={21} />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-primary">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.pontos.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
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
