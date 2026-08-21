import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Landmark, Briefcase, Handshake, ExternalLink } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section";
import { usePartners, type PartnerCategory } from "@/lib/partners-store";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros - HCB-BANDES" },
      {
        name: "description",
        content: "Conheca o nosso ecossistema de parceiros estrategicos. Acordos de parceria com promotores, bancos e empresas.",
      },
      { property: "og:title", content: "Parceiros - HCB-BANDES" },
      { property: "og:url", content: "/parceiros" },
    ],
    links: [{ rel: "canonical", href: "/parceiros" }],
  }),
  component: ParceirosPage,
});

const CATEGORY_META: Record<PartnerCategory, {
  icon: typeof Building2;
  title: string;
  desc: string;
  color: string;
  bg: string;
}> = {
  promotor: {
    icon: Building2,
    title: "Promotores Imobiliarios",
    desc: "Construtoras e promotores com carteira de imoveis integrada no nosso ecossistema habitacional.",
    color: "text-gold-foreground",
    bg: "bg-gold",
  },
  banco: {
    icon: Landmark,
    title: "Bancos e Instituicoes Financeiras",
    desc: "Instituicoes financeiras que disponibilizam credito imobiliario em condicoes especiais para trabalhadores parceiros.",
    color: "text-primary-foreground",
    bg: "bg-primary",
  },
  empresa: {
    icon: Briefcase,
    title: "Empresas Empregadoras",
    desc: "Organizacoes publicas e privadas que oferecem habitacao como beneficio corporativo aos seus colaboradores.",
    color: "text-accent-foreground",
    bg: "bg-accent",
  },
};

function ParceirosPage() {
  const { partners, loading } = usePartners();

  const categorias = (Object.keys(CATEGORY_META) as PartnerCategory[]);

  return (
    <>
      <PageHero
        eyebrow="Os nossos Parceiros"
        title="Construimos parcerias estrategicas de confianca"
        subtitle="A HCB-BANDES opera num ecossistema de parceiros cuidadosamente seleccionados. Os acordos de parceria garantem que cada relacao se baseia em compromissos formais e beneficios mutuos."
      />

      <Section>
        <SectionHeader
          eyebrow="Ecossistema de parceiros"
          title="Tres pilares do nosso ecossistema"
          description="O modelo HCB-BANDES assenta em tres tipos de parceiros estrategicos que trabalham em conjunto para tornar a habitacao acessivel."
        />

        {loading ? (
          <div className="mt-10 flex items-center justify-center py-16 text-muted-foreground text-sm gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            A carregar parceiros...
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {categorias.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const list = partners
                .filter((p) => p.category === cat && p.is_active)
                .sort((a, b) => a.order_index - b.order_index);

              return (
                <div key={cat} className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary">{meta.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{meta.desc}</p>
                  </div>

                  {list.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-border space-y-3">
                      {list.map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          {p.logo_url ? (
                            <img
                              src={p.logo_url}
                              alt={p.name}
                              className="h-9 w-9 rounded-md border border-border object-contain bg-white p-0.5 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bg} ${meta.color}`}>
                              <Icon size={15} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                            {p.description && (
                              <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                            )}
                          </div>
                          {p.website && (
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-muted-foreground hover:text-primary transition"
                              title={`Visitar ${p.name}`}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {list.length === 0 && (
                    <div className="mt-auto pt-4 border-t border-border text-xs text-muted-foreground italic">
                      Parcerias em formalizacao.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-primary p-8 text-primary-foreground text-center">
          <Handshake size={32} className="mx-auto text-gold mb-4" />
          <h3 className="font-display text-xl font-bold">Quer ser nosso parceiro?</h3>
          <p className="mt-2 text-primary-foreground/80 text-sm max-w-xl mx-auto">
            Se a sua empresa, banco ou promotora imobiliaria esta interessada em integrar o ecossistema HCB-BANDES,
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
