import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Landmark, Briefcase, Handshake, Info } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — HCB-BANDES" },
      {
        name: "description",
        content: "Conheça o nosso ecossistema de parceiros estratégicos. Acordos de parceria com promotores, bancos e empresas em fase de formalização.",
      },
      { property: "og:title", content: "Parceiros — HCB-BANDES" },
      { property: "og:url", content: "/parceiros" },
    ],
    links: [{ rel: "canonical", href: "/parceiros" }],
  }),
  component: ParceirosPage,
});

function ParceirosPage() {
  const settings = useSiteSettings();

  const CATEGORIAS = [
    {
      icon: Building2,
      title: "Promotores Imobiliários",
      desc: "Construtoras e promotores com carteira de imóveis integrada no nosso ecossistema habitacional.",
      color: "bg-gold text-gold-foreground",
      partners: settings.promotoresParceiros,
    },
    {
      icon: Landmark,
      title: "Bancos & Instituições Financeiras",
      desc: "Instituições financeiras que disponibilizam crédito imobiliário em condições especiais para trabalhadores parceiros.",
      color: "bg-primary text-primary-foreground",
      partners: settings.bancosParceiros,
    },
    {
      icon: Briefcase,
      title: "Empresas Empregadoras",
      desc: "Organizações públicas e privadas que oferecem habitação como benefício corporativo aos seus colaboradores.",
      color: "bg-accent text-accent-foreground",
      partners: settings.empresasParceiras,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Os nossos Parceiros"
        title="Construímos parcerias estratégicas de confiança"
        subtitle="A HCB-BANDES opera num ecossistema de parceiros cuidadosamente seleccionados. Os acordos de parceria garantem que cada relação se baseia em compromissos formais e benefícios mútuos."
      />

      <Section>
        {/* Categorias de parceiros */}
        <SectionHeader
          eyebrow="Ecossistema de parceiros"
          title="Três pilares do nosso ecossistema"
          description="O modelo HCB-BANDES assenta em três tipos de parceiros estratégicos que trabalham em conjunto para tornar a habitação acessível."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CATEGORIAS.map((cat) => (
            <div key={cat.title} className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}>
                <cat.icon size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-primary">{cat.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
              </div>
              {cat.partners && cat.partners.length > 0 && (
                <div className="mt-auto pt-4 border-t border-border">
                  <ul className="flex flex-wrap gap-2">
                    {cat.partners.map((p) => (
                      <li key={p} className="rounded bg-secondary px-2 py-1 text-xs font-medium text-foreground">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-primary p-8 text-primary-foreground text-center">
          <Handshake size={32} className="mx-auto text-gold mb-4" />
          <h3 className="font-display text-xl font-bold">Quer ser nosso parceiro?</h3>
          <p className="mt-2 text-primary-foreground/80 text-sm max-w-xl mx-auto">
            Se a sua empresa, banco ou promotora imobiliária está interessada em integrar o ecossistema HCB-BANDES, 
            contacte-nos para iniciar o processo de parceria.
          </p>
          <Link
            to="/contactos"
            className="mt-5 inline-flex items-center gap-2 rounded-control bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary hover:bg-primary-foreground/90 transition"
          >
            Entrar em contacto
          </Link>
        </div>
      </Section>
    </>
  );
}