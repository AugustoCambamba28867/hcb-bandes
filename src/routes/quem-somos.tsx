import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart, Award, Network, Cpu, Handshake, Building2, Sparkles } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section";
import { usePageContent } from "@/lib/site-content";
import condoImg from "@/assets/quem-somos-bg.jpg";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem Somos — HCB-BANDES" },
      {
        name: "description",
        content:
          "Conheça a HCB-BANDES: história, missão, visão, valores e diferenciais competitivos da unidade de Habitação Corporativa.",
      },
      { property: "og:title", content: "Quem Somos — HCB-BANDES" },
      {
        property: "og:description",
        content: "História, missão, visão, valores e diferenciais da HCB-BANDES.",
      },
      { property: "og:url", content: "/quem-somos" },
    ],
    links: [{ rel: "canonical", href: "/quem-somos" }],
  }),
  component: QuemSomos,
});

const DIFERENCIAIS = [
  { icon: Award, title: "Experiência", text: "Equipa multidisciplinar com conhecimento profundo do mercado angolano." },
  { icon: Network, title: "Rede de Parceiros", text: "Promotores, bancos e empresas integrados num único ecossistema." },
  { icon: Eye, title: "Transparência", text: "Processos claros, comunicação directa e prestação de contas em todas as fases." },
  { icon: Cpu, title: "Tecnologia", text: "Plataformas digitais para acompanhamento, simulação e comunicação contínua." },
  { icon: Handshake, title: "Proximidade", text: "Atendimento humano e personalizado em todas as interacções." },
  { icon: Building2, title: "Cobertura Nacional", text: "Capacidade de operar em todas as províncias com qualidade consistente." },
];

const VALORES = [
  "Transparência em todas as relações",
  "Proximidade humana e atendimento personalizado",
  "Inovação ao serviço das pessoas",
  "Responsabilidade social e impacto sustentável",
  "Excelência operacional e melhoria contínua",
  "Compromisso com o desenvolvimento de Angola",
];

function QuemSomos() {
  const c = usePageContent("quemSomos");
  return (
    <>
      <PageHero
        eyebrow="Quem Somos"
        title={c.title}
        subtitle={c.hero || c.description}
      />

      {/* História */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader eyebrow="A nossa história" title="Nascemos para resolver um problema real." />
            <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Em Angola, o acesso à habitação digna continua a ser um dos maiores desafios das
                famílias trabalhadoras. A HCB-BANDES foi criada para responder a esse desafio,
                articulando os actores certos do mercado imobiliário num único ecossistema.
              </p>
              <p>
                Operamos a partir de Luanda e construímos uma rede sólida de promotores
                imobiliários, instituições financeiras e empresas empregadoras que partilham a
                nossa visão de uma habitação acessível, transparente e sustentável.
              </p>
            </div>
          </div>
          <img
            src={condoImg}
            alt="Condomínio residencial"
            loading="lazy"
            width={1280}
            height={960}
            className="rounded-xl border border-border shadow-elegant"
          />
        </div>
      </Section>

      {/* Pilares Institucionais */}
      <Section className="bg-surface">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, title: "Missão", text: "Facilitar o acesso à habitação para trabalhadores angolanos." },
            { icon: Eye, title: "Visão", text: "Ser a referência nacional em habitação corporativa." },
            { icon: Heart, title: "Valores", text: "Transparência, proximidade, inovação e responsabilidade." },
            { icon: Award, title: "Compromisso", text: "Soluções sustentáveis com impacto social mensurável." },
          ].map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <b.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-primary">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Missão & Visão */}
      <Section id="missao-visao">
        <SectionHeader eyebrow="Missão & Visão" title="Os princípios que orientam tudo o que fazemos." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
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

        {/* Valores */}
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

      {/* Diferenciais */}
      <Section id="diferenciais" className="bg-surface">
        <SectionHeader
          eyebrow="Diferenciais"
          title="Porque é que empresas, bancos e trabalhadores escolhem a HCB-BANDES."
          description="Combinamos experiência, rede, transparência e tecnologia num modelo único de habitação corporativa."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DIFERENCIAIS.map((it) => (
            <div
              key={it.title}
              className="rounded-xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <it.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-primary">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
