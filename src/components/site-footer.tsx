import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

const NAV = [
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/condominios-residencias", label: "Condomínios & Residências" },
  { to: "/modelo", label: "O Nosso Modelo" },
  { to: "/servicos", label: "Serviços" },
  { to: "/beneficios", label: "Benefícios" },
  { to: "/parceiros", label: "Parceiros" },
] as const;

export function SiteFooter() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-primary-dark text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-control bg-primary-foreground/10 font-display text-xl font-bold text-primary-foreground ring-1 ring-primary-foreground/20">
              {settings.empresa ? settings.empresa.charAt(0) : "H"}
            </div>
            <div>
              <div className="font-display text-xl font-bold">
                {settings.empresa || "HCB-BANDES"}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                Habitação Corporativa
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md type-body text-primary-foreground/70">
            {settings.tagline ||
              "Conectamos pessoas, empresas, bancos e imóveis. Soluções habitacionais para trabalhadores angolanos, com transparência, tecnologia e proximidade."}
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="type-eyebrow text-primary-foreground/60">Navegação</h4>
          <ul className="mt-4 space-y-2.5 type-body text-primary-foreground/80">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition-colors hover:text-primary-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="type-eyebrow text-primary-foreground/60">Contactos</h4>
          <ul className="mt-4 space-y-3 type-body text-primary-foreground/80">
            {settings.endereco && (
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-1 shrink-0 text-primary-foreground/50" />
                {settings.endereco}
              </li>
            )}
            {settings.telefone && (
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-1 shrink-0 text-primary-foreground/50" />
                {settings.telefone}
              </li>
            )}
            {settings.whatsapp && settings.whatsapp !== settings.telefone && (
              <li className="flex items-start gap-2.5">
                <MessageCircle size={16} className="mt-1 shrink-0 text-primary-foreground/50" />
                {settings.whatsapp}
              </li>
            )}
            {settings.email && (
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-1 shrink-0 text-primary-foreground/50" />
                {settings.email}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.empresa || "HCB-BANDES"} — Habitação Corporativa.
            Todos os direitos reservados.
          </p>
          <p>Bandes Comércio &amp; Serviços</p>
        </div>
      </div>
    </footer>
  );
}
