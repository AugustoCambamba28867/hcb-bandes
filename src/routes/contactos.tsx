import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/section";

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
    ],
  }),
  component: ContactosPage,
});

function ContactosPage() {
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Sem backend ainda — apenas simula o envio.
    setTimeout(() => {
      setLoading(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Mensagem enviada", {
        description: "Obrigado pelo seu contacto. A nossa equipa responderá em breve.",
      });
    }, 700);
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
          {/* Info */}
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
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className="text-base font-medium text-foreground">{c.value}</div>
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

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card p-8 shadow-elegant"
          >
            <h2 className="font-display text-2xl font-bold text-primary">Enviar mensagem</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Responderemos no prazo de 1 dia útil.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field name="nome" label="Nome" required />
              <Field name="empresa" label="Empresa" />
              <Field name="email" label="E-mail" type="email" required />
              <Field name="telefone" label="Telefone" type="tel" />
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sou
              </label>
              <select
                name="perfil"
                required
                defaultValue=""
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Seleccione uma opção…</option>
                <option>Empresa empregadora</option>
                <option>Banco / Instituição financeira</option>
                <option>Promotor imobiliário</option>
                <option>Trabalhador / Cliente final</option>
                <option>Outro</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mensagem
              </label>
              <textarea
                name="mensagem"
                required
                rows={5}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Conte-nos como podemos ajudar…"
              />
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
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
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
        required={required}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
