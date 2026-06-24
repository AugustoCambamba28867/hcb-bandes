import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/modelo")({
  head: () => ({
    meta: [
      { title: "O Nosso Modelo — HCB-BANDES" },
      {
        name: "description",
        content:
          "As 7 etapas do modelo HCB-BANDES — da identificação de empresas à pós-venda.",
      },
      { property: "og:title", content: "O Nosso Modelo — HCB-BANDES" },
      {
        property: "og:description",
        content: "Um processo estruturado em 7 etapas, transparente do início ao fim.",
      },
    ],
  }),
  component: ModeloPage,
});

const ETAPAS = [
  {
    title: "Identificação de Empresas",
    desc: "Mapeamos empresas públicas e privadas com potencial para oferecer habitação como benefício corporativo.",
  },
  {
    title: "Parceria Corporativa",
    desc: "Formalizamos protocolos de parceria que definem condições especiais para os colaboradores.",
  },
  {
    title: "Levantamento de Necessidades",
    desc: "Avaliamos o perfil habitacional dos trabalhadores: tipologia, localização e capacidade financeira.",
  },
  {
    title: "Selecção de Imóveis",
    desc: "Apresentamos uma carteira curada de imóveis e condomínios adequados a cada perfil.",
  },
  {
    title: "Articulação com Bancos",
    desc: "Conectamos o trabalhador às instituições financeiras parceiras para análise de crédito.",
  },
  {
    title: "Aquisição",
    desc: "Acompanhamos toda a documentação, escritura e entrega das chaves.",
  },
  {
    title: "Pós-Venda",
    desc: "Continuamos presentes com suporte, gestão condominial e atendimento permanente.",
  },
];

function ModeloPage() {
  return (
    <>
      <PageHero
        eyebrow="O Nosso Modelo"
        title="Sete etapas. Um processo transparente do início ao fim."
        subtitle="Cada fase do nosso modelo foi desenhada para garantir confiança, eficiência e impacto real em toda a cadeia."
      />

      <Section>
        <ol className="relative space-y-6 md:space-y-8 md:before:absolute md:before:left-[27px] md:before:top-4 md:before:bottom-4 md:before:w-px md:before:bg-gold/30">
          {ETAPAS.map((e, i) => (
            <li key={e.title} className="relative flex gap-5 md:gap-8">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-gold shadow-elegant ring-4 ring-background">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 rounded-xl border border-border bg-card p-6 transition hover:border-gold/60">
                <h3 className="font-display text-xl font-semibold text-primary">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
