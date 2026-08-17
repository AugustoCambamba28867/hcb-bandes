import { createFileRoute } from "@tanstack/react-router";
import { Building2, Landmark, Briefcase } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — HCB-BANDES" },
      {
        name: "description",
        content: "Conheça os nossos parceiros estratégicos que tornam a nossa visão possível.",
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

  return (
    <>
      <PageHero
        eyebrow="Os nossos Parceiros"
        title="Juntos construímos o futuro da habitação corporativa"
        subtitle="Uma rede de parceiros de excelência que garantem qualidade, segurança e eficiência em todo o processo."
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-3">
          
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Building2 size={24} />
            </div>
            <h3 className="mb-4 font-display text-xl font-bold text-primary">Promotores Imobiliários</h3>
            <ul className="space-y-3">
              {settings.promotoresParceiros.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-foreground/80 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Landmark size={24} />
            </div>
            <h3 className="mb-4 font-display text-xl font-bold text-primary">Bancos</h3>
            <ul className="space-y-3">
              {settings.bancosParceiros.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-foreground/80 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Briefcase size={24} />
            </div>
            <h3 className="mb-4 font-display text-xl font-bold text-primary">Empresas</h3>
            <ul className="space-y-3">
              {settings.empresasParceiras.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-foreground/80 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
                  {p}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </Section>
    </>
  );
}
