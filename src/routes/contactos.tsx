import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/section";
import { contactSchema } from "@/lib/validation";
import { addLead } from "@/lib/leads-store";

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

type Errors = Partial<Record<"nome" | "empresa" | "email" | "telefone" | "perfil" | "mensagem", string>>;

function ContactosPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [mensagemLen, setMensagemLen] = useState(0);

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
    setTimeout(() => {
      addLead({
        nome: result.data.nome,
        email: result.data.email,
        telefone: result.data.telefone || undefined,
        empresa: result.data.empresa || undefined,
        perfil: result.data.perfil,
        mensagem: result.data.mensagem,
      });
      setLoading(false);
      setErrors({});
      setMensagemLen(0);
      form.reset();
      toast.success("Mensagem enviada com sucesso", {
        description: "A nossa equipa entrará em contacto em breve.",
      });
    }, 500);
  }

  return (
    <>
      <PageHero
        eyebrow="Contactos"
        title="Vamos conversar sobre o seu projecto habitacional."
        subtitle="Preencha o formulário, envie um e-mail ou fale connosco directamente pelo WhatsApp."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary">Falar connosco</h2>
            <p className="mt-3 text-muted-foreground">
              Estamos disponíveis para reuniões presenciais ou videoconferência.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { icon: MapPin, label: "Escritório", value: "Luanda, Angola" },
                { icon: Phone, label: "Telefone", value: "+244 935 105 538" },
                { icon: Mail, label: "E-mail", value: "geral@hcb-bandes.com" },
                { icon: MessageCircle, label: "WhatsApp", value: "+244 935 105 538" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <c.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className="text-base font-medium text-foreground break-words">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/244935105538"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              <MessageCircle size={16} /> Abrir WhatsApp
            </a>
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
              <label htmlFor="perfil" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                <option value="" disabled>Seleccione uma opção…</option>
                {PERFIS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {errors.perfil && <FieldError id="perfil-error" msg={errors.perfil} />}
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <label htmlFor="mensagem" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mensagem <span className="text-gold">*</span>
                </label>
                <span className={`text-[11px] tabular-nums ${mensagemLen > 1000 ? "text-destructive" : "text-muted-foreground"}`}>
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

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition disabled:opacity-60"
            >
              {loading ? "A enviar…" : (<><Send size={16} /> Enviar mensagem</>)}
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
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
