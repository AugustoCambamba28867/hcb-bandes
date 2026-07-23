import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/section";
import { contactSchema } from "@/lib/validation";
import { addLead, buildWhatsAppUrl, formatLeadWhatsAppText, type LeadCanal } from "@/lib/leads-store";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos — HCB-BANDES" },
      {
        name: "description",
        content: "Fale com a equipa HCB-BANDES — Luanda, Angola. Formulário, telefone e WhatsApp.",
      },
      { property: "og:title", content: "Contactos — HCB-BANDES" },
      {
        property: "og:description",
        content: "Entre em contacto connosco para iniciar uma parceria ou pedir informações.",
      },
      { property: "og:url", content: "/contactos" },
    ],
    links: [{ rel: "canonical", href: "/contactos" }],
  }),
  component: ContactosPage,
});

const PERFIS = [
  "Empresa empregadora",
  "Banco / Instituição financeira",
  "Promotor imobiliário",
  "Trabalhador / Cliente final",
  "Outro",
] as const;

type Errors = Partial<
  Record<"nome" | "empresa" | "email" | "telefone" | "perfil" | "mensagem", string>
>;

function ContactosPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [mensagemLen, setMensagemLen] = useState(0);
  const [canal, setCanal] = useState<LeadCanal>("whatsapp");
  const settings = useSiteSettings();

  const quickWhatsAppLink = buildWhatsAppUrl(
    "Olá HCB-BANDES, gostaria de solicitar um orçamento e saber como podemos avançar.",
    settings.whatsapp,
  );

  function validateField(name: string, value: string, all: Record<string, string>) {
    const result = contactSchema.safeParse({ ...all, [name]: value });
    if (result.success) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }
    const fieldError = result.error.issues.find((i) => i.path[0] === name);
    setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;

    const result = contactSchema.safeParse(raw);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Verifique o formulário", {
        description: "Existem campos por preencher ou inválidos.",
      });
      // foca o primeiro campo com erro
      const firstKey = Object.keys(next)[0];
      if (firstKey) (form.elements.namedItem(firstKey) as HTMLElement | null)?.focus();
      return;
    }

    setLoading(true);
    const selectedCanal = (raw.canal as LeadCanal | undefined) ?? canal;
    setCanal(selectedCanal);

    const lead = addLead({
      nome: result.data.nome,
      email: result.data.email,
      telefone: result.data.telefone || undefined,
      empresa: result.data.empresa || undefined,
      perfil: result.data.perfil,
      mensagem: result.data.mensagem,
      canal: selectedCanal,
    });

    const whatsappText = formatLeadWhatsAppText(lead);
    const whatsappUrl = buildWhatsAppUrl(whatsappText, settings.whatsapp);

    if (selectedCanal === "whatsapp") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    setLoading(false);
    setErrors({});
    setMensagemLen(0);
    form.reset();
    toast.success(selectedCanal === "whatsapp" ? "Pedido enviado com sucesso" : "Pedido recebido no site", {
      description:
        selectedCanal === "whatsapp"
          ? "A sua mensagem foi guardada e o WhatsApp será aberto com o seu pedido."
          : "O pedido foi guardado no painel admin e ficará disponível para acompanhamento.",
    });
  }

  return (
    <>
      <PageHero
        eyebrow="Contactos & Orçamento"
        title="Solicite o seu orçamento e abra um chat direto no WhatsApp."
        subtitle="A nossa equipa recebe o seu pedido imediatamente e prepara uma proposta com base nas suas necessidades."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="space-y-8 animate-appear">
            <div className="rounded-[2rem] border border-gold/20 bg-secondary/70 p-6 shadow-elegant">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Orçamento imediato
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary">
                Faça já o seu pedido e fale com a equipa pelo WhatsApp.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Guardamos o seu pedido no sistema de leads e abrimos automaticamente o chat com a
                mensagem preparada.
              </p>
              <div className="mt-6 space-y-3 text-sm text-foreground/90">
                <p>✔ Formulário simples com validação em tempo real.</p>
                <p>✔ Mensagem automática disponível no painel admin.</p>
                <p>✔ Conversa direta com o número da empresa.</p>
              </div>
              <a
                href={quickWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                <MessageCircle size={16} /> Enviar pedido pelo WhatsApp
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <h3 className="font-display text-xl font-semibold text-primary">Dados de contacto</h3>
              <div className="mt-6 space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: "Escritório",
                    value: settings.endereco || "Luanda, Angola",
                  },
                  {
                    icon: Phone,
                    label: "Telefone 1",
                    value: "+244 952 300 277",
                  },
                  {
                    icon: Phone,
                    label: "Telefone 2",
                    value: "+244 927 213 722",
                  },
                  { icon: Mail, label: "E-mail", value: settings.email || "geral@hcb-bandes.com" },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: settings.whatsapp || "+244 952 300 277",
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                      <c.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </div>
                      <div className="text-base font-medium text-foreground break-words">
                        {c.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-elegant"
          >
            <h2 className="font-display text-2xl font-bold text-primary">Enviar mensagem</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Responderemos no prazo de 1 dia útil.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                name="nome"
                label="Nome completo"
                required
                error={errors.nome}
                maxLength={100}
                onChange={(v, all) => validateField("nome", v, all)}
              />
              <Field
                name="empresa"
                label="Empresa"
                error={errors.empresa}
                maxLength={120}
                onChange={(v, all) => validateField("empresa", v, all)}
              />
              <Field
                name="email"
                label="E-mail"
                type="email"
                required
                error={errors.email}
                maxLength={255}
                onChange={(v, all) => validateField("email", v, all)}
              />
              <Field
                name="telefone"
                label="Telefone"
                type="tel"
                placeholder="+244 9XX XXX XXX"
                error={errors.telefone}
                maxLength={20}
                onChange={(v, all) => validateField("telefone", v, all)}
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="perfil"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Sou <span className="text-gold">*</span>
              </label>
              <select
                id="perfil"
                name="perfil"
                defaultValue=""
                aria-invalid={!!errors.perfil}
                aria-describedby={errors.perfil ? "perfil-error" : undefined}
                className={`mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.perfil ? "border-destructive" : "border-input"}`}
              >
                <option value="" disabled>
                  Seleccione uma opção…
                </option>
                {PERFIS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              {errors.perfil && <FieldError id="perfil-error" msg={errors.perfil} />}
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="mensagem"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Mensagem <span className="text-gold">*</span>
                </label>
                <span
                  className={`text-[11px] tabular-nums ${mensagemLen > 1000 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {mensagemLen}/1000
                </span>
              </div>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={5}
                maxLength={1000}
                aria-invalid={!!errors.mensagem}
                aria-describedby={errors.mensagem ? "mensagem-error" : undefined}
                onChange={(e) => {
                  setMensagemLen(e.target.value.length);
                  const fd = new FormData(e.target.form!);
                  const all = Object.fromEntries(fd.entries()) as Record<string, string>;
                  validateField("mensagem", e.target.value, all);
                }}
                className={`mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.mensagem ? "border-destructive" : "border-input"}`}
                placeholder="Conte-nos como podemos ajudar (mínimo 10 caracteres)…"
              />
              {errors.mensagem && <FieldError id="mensagem-error" msg={errors.mensagem} />}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Como prefere receber o pedido?
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition ${canal === "whatsapp" ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                  <input
                    type="radio"
                    name="canal"
                    value="whatsapp"
                    checked={canal === "whatsapp"}
                    onChange={() => setCanal("whatsapp")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-foreground">WhatsApp</span>
                    <span className="block text-xs text-muted-foreground">Abre o chat com a equipa imediatamente.</span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition ${canal === "site" ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                  <input
                    type="radio"
                    name="canal"
                    value="site"
                    checked={canal === "site"}
                    onChange={() => setCanal("site")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-foreground">Enviar pelo site</span>
                    <span className="block text-xs text-muted-foreground">O pedido fica registado no painel admin.</span>
                  </span>
                </label>
              </div>
              <input type="hidden" name="canal" value={canal} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition disabled:opacity-60"
            >
              {loading ? (
                "A enviar…"
              ) : (
                <>
                  <Send size={16} /> Solicitar orçamento
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Ao enviar, concorda em ser contactado pela equipa HCB-BANDES.
            </p>
          </form>
        </div>
      </Section>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  maxLength,
  error,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  onChange?: (value: string, all: Record<string, string>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => {
          if (!onChange) return;
          const fd = new FormData(e.target.form!);
          const all = Object.fromEntries(fd.entries()) as Record<string, string>;
          onChange(e.target.value, all);
        }}
        className={`mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}
      />
      {error && <FieldError id={`${name}-error`} msg={error} />}
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-destructive">
      <AlertCircle size={13} className="mt-0.5 shrink-0" /> {msg}
    </p>
  );
}
