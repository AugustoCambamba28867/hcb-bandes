import { createFileRoute } from "@tanstack/react-router";
import { Award, Network, Eye, Cpu, Handshake, Building2 } from "lucide-react";
import { PageHero, Section } from "@/components/section";

export const Route = createFileRoute("/diferenciais")({
  head: () => ({
    meta: [
      { title: "Diferenciais — HCB-BANDES" },
      {
        name: "description",
        content:
          "Porque escolher a HCB-BANDES: experiência, rede, transparência e tecnologia.",
      },
      { property: "og:title", content: "Diferenciais — HCB-BANDES" },
      {
        property: "og:description",
        content:
          "Os diferenciais competitivos que tornam a HCB-BANDES uma escolha de confiança.",
      },
    ],
  }),
  component: DiferenciaisPage,
});

const ITEMS = [
  { icon: Award, title: "Experiência", text: "Equipa multidisciplinar com conhecimento profundo do mercado angolano." },
  { icon: Network, title: "Rede de Parceiros", text: "Promotores, bancos e empresas integrados num único ecossistema." },
  { icon: Eye, title: "Transparência", text: "Processos claros, comunicação directa e prestação de contas em todas as fases." },
  { icon: Cpu, title: "Tecnologia", text: "Plataformas digitais para acompanhamento, simulação e comunicação contínua." },
  { icon: Handshake, title: "Proximidade", text: "Atendimento humano e personalizado em todas as interacções." },
  { icon: Building2, title: "Cobertura Nacional", text: "Capacidade de operar em todas as províncias com qualidade consistente." },
];

function DiferenciaisPage() {
  return (
    <>
      <PageHero
        eyebrow="Diferenciais"
        title="Porque é que empresas, bancos e trabalhadores escolhem a HCB-BANDES."
        subtitle="Combinamos experiência, rede, transparência e tecnologia num modelo único de habitação corporativa."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
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
