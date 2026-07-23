import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

export function SiteFooter() {
  const settings = useSiteSettings();

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gold text-gold-foreground font-display text-xl font-bold">
              {settings.empresa ? settings.empresa.charAt(0) : "H"}
            </div>
            <div>
              <div className="font-display text-xl font-bold">{settings.empresa || "HCB-BANDES"}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-gold">Habitação Corporativa</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-primary-foreground/75 leading-relaxed">
            {settings.tagline || "Conectamos pessoas, empresas, bancos e imóveis. Soluções habitacionais para trabalhadores angolanos, com transparência, tecnologia e proximidade."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Navegação</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/quem-somos" className="hover:text-gold">Quem Somos</Link></li>
            <li><Link to="/modelo" className="hover:text-gold">O Nosso Modelo</Link></li>
            <li><Link to="/servicos" className="hover:text-gold">Serviços</Link></li>
            <li><Link to="/beneficios" className="hover:text-gold">Benefícios</Link></li>
            <li><Link to="/diferenciais" className="hover:text-gold">Diferenciais</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Contactos</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            {settings.endereco && (
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-gold shrink-0" /> {settings.endereco}</li>
            )}
            {settings.telefone && (
              <li className="flex items-start gap-2"><Phone size={16} className="mt-0.5 text-gold shrink-0" /> {settings.telefone}</li>
            )}
            {settings.whatsapp && settings.whatsapp !== settings.telefone && (
              <li className="flex items-start gap-2"><MessageCircle size={16} className="mt-0.5 text-gold shrink-0" /> {settings.whatsapp}</li>
            )}
            {settings.email && (
              <li className="flex items-start gap-2"><Mail size={16} className="mt-0.5 text-gold shrink-0" /> {settings.email}</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.empresa || "HCB-BANDES"} — Habitação Corporativa. Todos os direitos reservados.</p>
          <p>Bandes Comércio & Serviços</p>
        </div>
      </div>
    </footer>
  );
}

