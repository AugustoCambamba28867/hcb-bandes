import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/modelo", label: "O Nosso Modelo" },
  { to: "/servicos", label: "Serviços" },
  { to: "/beneficios", label: "Benefícios" },
  { to: "/diferenciais", label: "Diferenciais" },
  { to: "/missao-visao", label: "Missão & Visão" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-lg font-bold shadow-elegant transition-transform group-hover:scale-105">
            {settings.empresa ? settings.empresa.charAt(0) : "H"}
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary">{settings.empresa || "HCB-BANDES"}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Habitação Corporativa</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-foreground/75 hover:text-primary transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-semibold text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contactos"
            className="hidden sm:inline-flex items-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-95 transition"
          >
            Contactar
          </Link>
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
                activeProps={{ className: "rounded-md px-3 py-3 text-sm font-semibold text-primary bg-muted" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contactos"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground"
            >
              Contactar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
