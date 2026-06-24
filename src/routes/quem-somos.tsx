import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart, Award } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section";
import condoImg from "@/assets/condominium.jpg";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem Somos — HCB-BANDES" },
      {
        name: "description",
        content:
          "Conheça a HCB-BANDES, unidade de Habitação Corporativa da Bandes Comércio & Serviços.",
      },
      { property: "og:title", content: "Quem Somos — HCB-BANDES" },
      {
        property: "og:description",
        content: "História, missão, visão e valores da HCB-BANDES.",
      },
      { property: "og:url", content: "/quem-somos" },
    ],
    links: [{ rel: "canonical", href: "/quem-somos" }],
  }),
  component: QuemSomos,
});

function QuemSomos() {
  return (
    <>
      <PageHero
        eyebrow="Quem Somos"
        title="Uma unidade de negócios dedicada à habitação corporativa em Angola."
        subtitle="A HCB-BANDES nasce dentro da Bandes Comércio & Serviços com a missão de facilitar o acesso à habitação a trabalhadores de empresas públicas e privadas angolanas."
      />

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

      <Section className="!pt-0">
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
    </>
  );
}
