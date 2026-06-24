import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Sparkles } from "lucide-react";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/missao-visao")({
  head: () => ({
    meta: [
      { title: "Missão & Visão — HCB-BANDES" },
      {
        name: "description",
        content: "Missão, visão, valores e compromissos institucionais da HCB-BANDES.",
      },
      { property: "og:title", content: "Missão & Visão — HCB-BANDES" },
      {
        property: "og:description",
        content: "Os princípios que orientam a actuação da HCB-BANDES em Angola.",
      },
    ],
  }),
  component: MissaoVisaoPage,
});

const VALORES = [
  "Transparência em todas as relações",
  "Proximidade humana e atendimento personalizado",
  "Inovação ao serviço das pessoas",
  "Responsabilidade social e impacto sustentável",
  "Excelência operacional e melhoria contínua",
  "Compromisso com o desenvolvimento de Angola",
];

function MissaoVisaoPage() {
  return (
    <>
      <PageHero
        eyebrow="Missão & Visão"
        title="Os princípios que orientam tudo o que fazemos."
        subtitle="A nossa razão de ser está em facilitar o acesso à habitação digna para os trabalhadores angolanos."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-primary p-10 text-primary-foreground shadow-elegant">
            <Target className="text-gold" size={28} />
            <h2 className="mt-5 font-display text-2xl font-bold">Missão</h2>
            <p className="mt-3 text-primary-foreground/85 leading-relaxed">
              Facilitar o acesso à habitação para trabalhadores angolanos através de soluções
              inovadoras, transparentes e sustentáveis, conectando empresas, bancos e
              promotores num único ecossistema de confiança.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-gold bg-card p-10">
            <Eye className="text-gold" size={28} />
            <h2 className="mt-5 font-display text-2xl font-bold text-primary">Visão</h2>
            <p className="mt-3 text-foreground/80 leading-relaxed">
              Ser a referência nacional em habitação corporativa em Angola, reconhecida pela
              qualidade do serviço, pela rede de parceiros e pelo impacto social que gera nas
              comunidades onde actua.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-10">
          <Sparkles className="text-gold" size={28} />
          <h2 className="mt-5 font-display text-2xl font-bold text-primary">Valores & Compromissos</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {VALORES.map((v) => (
              <li key={v} className="flex items-start gap-3 rounded-lg bg-card p-4 text-sm font-medium text-foreground/85 border border-border">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gold" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
