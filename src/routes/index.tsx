import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Landmark,
  Home,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Target,
  Handshake,
  Search,
  Banknote,
  FileText,
} from "lucide-react";
import heroImg from "@/assets/hero-family.jpg";
import familyImg from "@/assets/hero-building.jpg";
import partnershipImg from "@/assets/partnership.jpg";
import { Section, SectionHeader, Reveal, StatNumber } from "@/components/section";
import { useSiteSettings } from "@/lib/site-settings";
import { usePageContent } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HCB-BANDES — Habitação Corporativa em Angola" },
      {
        name: "description",
        content:
          "Soluções habitacionais para trabalhadores angolanos. Conectamos empresas, bancos, promotores e clientes finais.",
      },
      { property: "og:title", content: "HCB-BANDES — Habitação Corporativa" },
      {
        property: "og:description",
        content:
          "Soluções habitacionais para trabalhadores angolanos. Transparência, tecnologia e proximidade.",
      },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const SERVICOS = [
  {
    icon: Building2,
    title: "Habitação Corporativa",
    desc: "Programas habitacionais desenhados para colaboradores de empresas parceiras.",
  },
  {
    icon: Landmark,
    title: "Crédito Imobiliário",
    desc: "Ligação directa a bancos comerciais para financiamento ágil e transparente.",
  },
  {
    icon: Home,
    title: "Imobiliário",
    desc: "Carteira de imóveis e condomínios seleccionados em todo o território angolano.",
  },
  {
    icon: ShieldCheck,
    title: "Gestão Condominial",
    desc: "Administração profissional de condomínios com foco em qualidade de vida.",
  },
];

const PROCESSO = [
  {
    icon: Target,
    title: "Identificação de Empresas",
    description:
      "Mapeamos empresas públicas e privadas com potencial para oferecer habitação como benefício corporativo.",
  },
  {
    icon: Handshake,
    title: "Parceria Corporativa",
    description:
      "Formalizamos protocolos de parceria que definem condições especiais para os colaboradores.",
  },
  {
    icon: Search,
    title: "Levantamento de Necessidades",
    description:
      "Avaliamos o perfil habitacional dos trabalhadores: tipologia, localização e capacidade financeira.",
  },
  {
    icon: Home,
    title: "Seleção de Imóveis",
    description: "Apresentamos uma carteira curada de imóveis e condomínios adequados a cada perfil.",
  },
  {
    icon: Banknote,
    title: "Articulação com Bancos",
    description:
      "Conectamos o trabalhador às instituições financeiras parceiras para análise de crédito.",
  },
  {
    icon: FileText,
    title: "Aquisição",
    description: "Acompanhamos toda a documentação, escritura e entrega das chaves.",
  },
  {
    icon: ShieldCheck,
    title: "Pós‑Venda",
    description:
      "Continuamos presentes com suporte, gestão condominial e atendimento permanente.",
  },
];

const STATS = [
  { k: "4", v: "Actores conectados" },
  { k: "7", v: "Etapas do nosso modelo" },
  { k: "100%", v: "Transparência no processo" },
  { k: "AO", v: "Cobertura nacional" },
];

function HomePage() {
  const settings = useSiteSettings();
  const home = usePageContent("home");

  const credibilidade = [
    ...settings.empresasParceiras,
    ...settings.bancosParceiros,
    ...settings.promotoresParceiros,
  ].slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Família a receber as chaves da nova casa"
            width={1920}
            height={1280}
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/85 via-primary/60 md:via-primary/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container-page relative py-20 md:py-32 lg:py-36">
          <div className="max-w-2xl text-primary-foreground animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-pill border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 type-eyebrow backdrop-blur">
              <Sparkles size={12} /> {settings.empresa}
            </div>
            <h1 className="mt-6 type-display animate-slide-up delay-100">{home.title}</h1>
            <p className="mt-6 max-w-xl type-lead text-primary-foreground/85 animate-slide-up delay-200">
              {home.hero || settings.tagline}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 animate-slide-up delay-300">
              <Link
                to="/contactos"
                className="group inline-flex items-center gap-2 rounded-control bg-primary-foreground px-6 py-3.5 text-sm font-semibold text-primary shadow-raised transition-all duration-300 hover:bg-primary-foreground/90"
              >
                Solicitar proposta
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 rounded-control border border-primary-foreground/35 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10"
              >
                Ver serviços
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAIXA DE CREDIBILIDADE */}
      {credibilidade.length > 0 && (
        <section className="border-b border-border bg-surface">
          <div className="container-page py-8">
            <Reveal className="flex flex-col gap-5 md:flex-row md:items-center md:gap-10">
              <span className="type-eyebrow shrink-0 text-muted-foreground">
                Ecossistema de parceiros
              </span>
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {credibilidade.map((name) => (
                  <li
                    key={name}
                    className="font-display text-base font-semibold text-primary/45 transition-colors duration-300 hover:text-primary"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* STATS */}
      <section className="border-b border-border bg-background">
        <div className="container-page grid gap-8 py-14 sm:grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.v} delay={i * 90} className="text-center md:text-left">
              <StatNumber
                value={s.k}
                className="font-display text-4xl md:text-5xl font-bold text-primary"
              />
              <div className="mt-1 type-body text-muted-foreground">{s.v}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVIÇOS */}
      <Section>
        <SectionHeader
          eyebrow="Os nossos serviços"
          title="Quatro pilares para uma solução habitacional completa"
          description="Integramos toda a cadeia de valor habitacional num ecossistema único."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICOS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <article className="group card-surface relative h-full overflow-hidden p-6 hover-lift">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 blur-2xl transition-all duration-500 group-hover:bg-accent/10" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-control bg-surface text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon size={22} />
                </div>
                <h3 className="relative mt-5 type-h3 text-primary">{s.title}</h3>
                <p className="relative mt-2 type-body text-muted-foreground">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-10">
          <Link
            to="/servicos"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            Ver todos os serviços
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </Section>

      {/* PROCESSO */}
      <Section className="bg-surface">
        <SectionHeader
          eyebrow="O nosso modelo"
          title="Como funciona"
          description="Sete etapas que ligam a empresa, o banco, o promotor e o trabalhador."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESSO.map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) * 90}>
              <article className="group card-surface relative h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-raised">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-control bg-surface text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon size={20} />
                  </div>
                  <span className="type-eyebrow text-muted-foreground">
                    Etapa {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 type-h3 text-primary">{item.title}</h3>
                <p className="mt-3 type-body text-muted-foreground">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ECOSSISTEMA */}
      <section className="bg-bg-medium">
        <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="type-eyebrow text-accent">O Ecossistema</div>
            <h2 className="mt-3 type-h2 text-primary">
              Um modelo que une quatro actores num só propósito.
            </h2>
            <p className="mt-4 type-lead text-foreground/75">
              Promotores, empresas empregadoras, bancos e trabalhadores: cada peça encaixa para que a
              habitação deixe de ser um sonho distante e se torne uma realidade sustentável.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Promotores imobiliários — disponibilizam imóveis e condomínios",
                "Empresas empregadoras — oferecem o benefício habitacional",
                "Bancos comerciais — financiam o crédito imobiliário",
                "Trabalhadores — beneficiários finais da solução",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 type-body text-foreground/85">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="relative">
            <img
              src={partnershipImg}
              alt="Reunião de parceria corporativa"
              loading="lazy"
              width={1280}
              height={960}
              className="relative rounded-card border border-border shadow-overlay transition-transform duration-700 hover:scale-[1.01]"
            />
            <div className="absolute -bottom-6 -left-6 hidden md:block max-w-[220px] rounded-card bg-primary p-5 text-primary-foreground shadow-overlay">
              <div className="font-display text-2xl font-bold">+250</div>
              <div className="mt-1 text-xs text-primary-foreground/80">
                trabalhadores impactados anualmente
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BENEFÍCIOS PARA */}
      <Section>
        <SectionHeader
          eyebrow="Para quem trabalhamos"
          title="Benefícios reais para cada parceiro do ecossistema"
          centered
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Para Empresas",
              points: [
                "Retenção e motivação de talento",
                "Programa habitacional sem custo directo",
                "Imagem corporativa fortalecida",
              ],
            },
            {
              icon: Landmark,
              title: "Para Bancos",
              points: [
                "Carteira qualificada de clientes",
                "Processos pré-validados",
                "Redução do risco de crédito",
              ],
            },
            {
              icon: Home,
              title: "Para Trabalhadores",
              points: [
                "Acesso facilitado à casa própria",
                "Condições negociadas e transparentes",
                "Acompanhamento em todas as fases",
              ],
            },
          ].map((b, i) => (
            <Reveal key={b.title} delay={i * 100}>
              <article className="group card-surface relative h-full overflow-hidden p-7 hover-lift">
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex h-12 w-12 items-center justify-center rounded-control bg-surface text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <b.icon size={20} />
                </div>
                <h3 className="mt-5 type-h3 text-primary">{b.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {b.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 type-body text-foreground/80">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PARCEIROS */}
      {settings.empresasParceiras.length +
        settings.bancosParceiros.length +
        settings.promotoresParceiros.length >
        0 && (
        <Section className="bg-surface">
          <SectionHeader
            eyebrow="Ecossistema"
            title="Parceiros que confiam na HCB-BANDES"
            description="Empresas, bancos e promotores que integram o nosso ecossistema habitacional."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { label: "Empresas", items: settings.empresasParceiras },
              { label: "Bancos", items: settings.bancosParceiros },
              { label: "Promotores", items: settings.promotoresParceiros },
            ].map((group, i) => (
              <Reveal key={group.label} delay={i * 90}>
                <div className="card-surface h-full p-6 hover-lift">
                  <div className="type-eyebrow text-muted-foreground">{group.label}</div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.length === 0 ? (
                      <li className="type-body text-muted-foreground">—</li>
                    ) : (
                      group.items.map((name) => (
                        <li
                          key={name}
                          className="rounded-pill border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {name}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <img
          src={familyImg}
          alt="Família com as chaves da casa nova"
          loading="lazy"
          width={1280}
          height={960}
          className="absolute inset-0 -z-10 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-primary-dark/90" />
        <div className="absolute inset-0 -z-10 bg-grid-primary opacity-15" />
        <div className="container-page py-20 md:py-28 text-primary-foreground">
          <Reveal className="max-w-2xl">
            <div className="type-eyebrow text-primary-foreground/60">Vamos falar</div>
            <h2 className="mt-4 type-h2">
              Pronto para transformar habitação num benefício real?
            </h2>
            <p className="mt-4 type-lead text-primary-foreground/80">
              Marque uma reunião com a nossa equipa e descubra como integrar a HCB-BANDES no pacote
              de benefícios da sua empresa.
            </p>
            <Link
              to="/contactos"
              className="group mt-8 inline-flex items-center gap-2 rounded-control bg-primary-foreground px-7 py-3.5 text-sm font-semibold text-primary shadow-raised transition-all duration-300 hover:bg-primary-foreground/90"
            >
              Falar com a equipa
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
