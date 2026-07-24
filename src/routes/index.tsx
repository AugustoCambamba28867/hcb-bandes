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
  Target,
  Handshake,
  Search,
  Banknote,
  FileText,
} from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-building.jpg";
import familyImg from "@/assets/family-keys.jpg";
import partnershipImg from "@/assets/partnership.jpg";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "@/components/section";
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
    description: "Mapeamos empresas públicas e privadas com potencial para oferecer habitação como benefício corporativo.",
  },
  {
    icon: Handshake,
    title: "Parceria Corporativa",
    description: "Formalizamos protocolos de parceria que definem condições especiais para os colaboradores.",
  },
  {
    icon: Search,
    title: "Levantamento de Necessidades",
    description: "Avaliamos o perfil habitacional dos trabalhadores: tipologia, localização e capacidade financeira.",
  },
  {
    icon: Home,
    title: "Seleção de Imóveis",
    description: "Apresentamos uma carteira curada de imóveis e condomínios adequados a cada perfil.",
  },
  {
    icon: Banknote,
    title: "Articulação com Bancos",
    description: "Conectamos o trabalhador às instituições financeiras parceiras para análise de crédito.",
  },
  {
    icon: FileText,
    title: "Aquisição",
    description: "Acompanhamos toda a documentação, escritura e entrega das chaves.",
  },
  {
    icon: ShieldCheck,
    title: "Pós‑Venda",
    description: "Continuamos presentes com suporte, gestão condominial e atendimento permanente.",
  },
];

function HomePage() {
  const settings = useSiteSettings();


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
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/60 animate-gradient" />
          <div className="absolute inset-0 bg-grid-primary opacity-40" />
          {/* animated blobs */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gold/25 blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
        </div>

        <div className="container-page relative py-24 md:py-32">
          <div className="grid gap-12">
            <div className="max-w-2xl text-primary-foreground animate-slide-in-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-primary/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold backdrop-blur animate-glow-pulse">
                <Sparkles size={12} /> {settings.empresa}
              </div>
              <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05] animate-slide-up delay-100">
                Conectamos <span className="text-gradient-gold">empresas, bancos</span> e trabalhadores a
                imóveis de valor.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/85 leading-relaxed animate-slide-up delay-200">
                {settings.tagline}. Criamos jornadas habitacionais com clareza, parceria e execução.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-slide-up delay-300">
                <Link
                  to="/contactos"
                  className="group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-300"
                >
                  Solicitar orçamento
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20 hover:border-gold/60 transition-all duration-300"
                >
                  Ver serviços
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* STATS */}
      <section className="border-b border-border bg-gradient-to-r from-secondary/60 via-background to-secondary/60">
        <div className="container-page grid gap-8 py-14 md:grid-cols-4">
          {[
            { k: "4", v: "Actores conectados" },
            { k: "7", v: "Etapas do nosso modelo" },
            { k: "100%", v: "Transparência no processo" },
            { k: "AO", v: "Cobertura nacional" },
          ].map((s, i) => (
            <div
              key={s.v}
              className="text-center md:text-left animate-slide-up hover-lift rounded-xl px-2 py-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-primary tabular-nums">
                {s.k}
              </div>
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
          {SERVICOS.map((s, i) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift hover:border-gold/60 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/0 blur-2xl transition-all duration-500 group-hover:bg-gold/25" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-gold group-hover:text-gold-foreground group-hover:rotate-6 group-hover:scale-110">
                <s.icon size={22} />
              </div>
              <h3 className="relative mt-5 font-display text-lg font-semibold text-primary">{s.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
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
      <Section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_oklch(0.86_0.19_120/0.15),_transparent_45%),_radial-gradient(circle_at_bottom_right,_oklch(0.55_0.19_145/0.12),_transparent_50%)]">
        <div className="absolute inset-0 bg-grid-primary opacity-30 pointer-events-none" />
        <div className="relative">
          <SectionHeader title="Como funciona" />
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-border bg-card/90 p-6 shadow-elegant">
            <div className="relative">
              <div className="hidden md:block absolute left-12 top-10 bottom-10 w-px bg-muted-foreground/15" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PROCESSO.map((item, index) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-[1.8rem] border border-border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-2xl"
                  >
                    <div className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/30">
                      <item.icon size={20} />
                    </div>
                    <div className="ml-20">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                          Etapa {index + 1}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold font-semibold ring-1 ring-gold/30">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-xl font-semibold text-primary">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>


      {/* ECOSSISTEMA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.09_145)] text-primary-foreground animate-gradient">
        <div className="absolute inset-0 bg-grid-primary opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-24 h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
        <div className="container-page relative grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div className="animate-slide-in-left">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              O Ecossistema
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
              Um modelo que une quatro actores num só <span className="text-gradient-gold">propósito</span>.
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
              ].map((t, i) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm text-primary-foreground/90 animate-slide-up"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <CheckCircle2 size={18} className="mt-0.5 text-gold shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative animate-slide-in-right">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-gold/40 via-transparent to-accent/40 blur-2xl opacity-70" />
            <img
              src={partnershipImg}
              alt="Parceria corporativa"
              loading="lazy"
              width={1280}
              height={960}
              className="relative rounded-xl shadow-elegant border border-gold/30 transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute -bottom-6 -left-6 hidden md:block rounded-lg bg-gold p-5 text-gold-foreground shadow-gold max-w-[220px] animate-float-slow">
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
          ].map((b, i) => (
            <div
              key={b.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-7 hover-lift hover:border-gold/60 animate-slide-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-accent to-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-accent/20 text-primary transition-all duration-300 group-hover:from-gold group-hover:to-gold group-hover:text-gold-foreground group-hover:rotate-6">
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
          className="absolute inset-0 -z-10 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/70 animate-gradient" />
        <div className="absolute inset-0 -z-10 bg-grid-primary opacity-25" />
        <div className="container-page py-24 text-primary-foreground">
          <div className="max-w-2xl animate-slide-up">
            <TrendingUp className="text-gold animate-float-slow" />
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Pronto para transformar habitação num <span className="text-gradient-gold">benefício real</span>?
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              Marque uma reunião com a nossa equipa e descubra como integrar a HCB-BANDES no pacote
              de benefícios da sua empresa.
            </p>
            <Link
              to="/contactos"
              className="group mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-300 animate-glow-pulse"
            >
              Falar com a equipa
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
