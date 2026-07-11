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
  TrendingUp,
} from "lucide-react";
import heroImg from "@/assets/hero-building.jpg";
import familyImg from "@/assets/family-keys.jpg";
import partnershipImg from "@/assets/partnership.jpg";
import { Section, SectionHeader } from "@/components/section";
import { getSettings } from "@/lib/site-settings";

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
    title: "Diagnóstico rápido",
    description: "Mapeamos o seu perfil, a empresa e os requisitos do crédito habitacional.",
  },
  {
    title: "Conexão com parceiros",
    description: "Articulamos empresas, bancos e promotores para encontrar a solução ideal.",
  },
  {
    title: "Proposta transparente",
    description: "Apresentamos uma oferta clara, com custos e cronograma definidos.",
  },
  {
    title: "Acompanhamento contínuo",
    description: "Acompanhamos cada etapa até à entrega das chaves.",
  },
];

function HomePage() {
  const settings = getSettings();
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Edifício residencial moderno em Luanda"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>

        <div className="container-page relative py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl text-primary-foreground animate-appear">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-primary/40 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold backdrop-blur">
                <Sparkles size={12} /> {settings.empresa}
              </div>
              <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
                Conectamos <span className="text-gold">empresas, bancos</span> e trabalhadores a
                imóveis de valor.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/85 leading-relaxed">
                {settings.tagline}. Criamos jornadas habitacionais com clareza, parceria e execução.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contactos"
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition"
                >
                  Solicitar orçamento <ArrowRight size={16} />
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/15 transition"
                >
                  Ver serviços
                </Link>
              </div>
            </div>

            <div className="relative animate-appear">
              <div className="absolute -right-12 top-0 hidden h-40 w-40 rounded-full bg-gold/20 blur-3xl lg:block" />
              <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-primary/10 p-6 shadow-elegant backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                  Como funciona
                </div>
                <div className="mt-6 space-y-4">
                  {PROCESSO.map((item, index) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-border bg-background/90 p-4 transition hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-primary">{item.title}</span>
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page grid gap-8 py-12 md:grid-cols-4">
          {[
            { k: "4", v: "Actores conectados" },
            { k: "7", v: "Etapas do nosso modelo" },
            { k: "100%", v: "Transparência no processo" },
            { k: "AO", v: "Cobertura nacional" },
          ].map((s) => (
            <div key={s.v} className="text-center md:text-left">
              <div className="font-display text-4xl font-bold text-primary">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
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
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICOS.map((s) => (
            <div
              key={s.title}
              className="group rounded-xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-gold group-hover:text-gold-foreground transition">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            to="/servicos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold"
          >
            Ver todos os serviços <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      {/* PROCESSO */}
      <Section className="bg-[radial-gradient(circle_at_top_left,_rgba(201,162,39,0.12),_transparent_40%),_rgba(255,255,255,0.5)]">
        <SectionHeader
          eyebrow="Passo a passo"
          title="Um processo claro para empresas, bancos e trabalhadores"
          description="Cada etapa é pensada para reduzir riscos, acelerar decisões e garantir a melhor proposta habitacional."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PROCESSO.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1 hover:border-gold/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold font-semibold">
                  {index + 1}
                </div>
                <div className="text-right text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Etapa {index + 1}
                </div>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-primary">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ECOSSISTEMA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              O Ecossistema
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
              Um modelo que une quatro actores num só propósito.
            </h2>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              Promotores, empresas empregadoras, bancos e trabalhadores: cada peça encaixa para que
              a habitação deixe de ser um sonho distante e se torne uma realidade sustentável.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Promotores imobiliários — disponibilizam imóveis e condomínios",
                "Empresas empregadoras — oferecem o benefício habitacional",
                "Bancos comerciais — financiam o crédito imobiliário",
                "Trabalhadores — beneficiários finais da solução",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-primary-foreground/90">
                  <CheckCircle2 size={18} className="mt-0.5 text-gold shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src={partnershipImg}
              alt="Parceria corporativa"
              loading="lazy"
              width={1280}
              height={960}
              className="rounded-xl shadow-elegant border border-gold/20"
            />
            <div className="absolute -bottom-6 -left-6 hidden md:block rounded-lg bg-gold p-5 text-gold-foreground shadow-gold max-w-[220px]">
              <div className="font-display text-2xl font-bold">+250</div>
              <div className="text-xs">trabalhadores impactados anualmente</div>
            </div>
          </div>
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
          ].map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <b.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-primary">{b.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {b.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 size={16} className="mt-0.5 text-gold shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <img
          src={familyImg}
          alt="Família com chaves de casa nova"
          loading="lazy"
          width={1280}
          height={960}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 to-primary/70" />
        <div className="container-page py-24 text-primary-foreground">
          <div className="max-w-2xl">
            <TrendingUp className="text-gold" />
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight">
              Pronto para transformar habitação num benefício real?
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              Marque uma reunião com a nossa equipa e descubra como integrar a HCB-BANDES no pacote
              de benefícios da sua empresa.
            </p>
            <Link
              to="/contactos"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition"
            >
              Falar com a equipa <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
