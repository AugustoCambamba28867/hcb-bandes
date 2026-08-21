import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/modelo", label: "O Nosso Modelo" },
  { to: "/servicos", label: "Serviços" },
  { to: "/beneficios", label: "Benefícios" },
  { to: "/diferenciais", label: "Diferenciais" },
  { to: "/missao-visao", label: "Missão & Visão" },
  { to: "/parceiros", label: "Parceiros" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300 supports-[backdrop-filter]:backdrop-blur",
        scrolled
          ? "border-border bg-background/90 shadow-card"
          : "border-transparent bg-background/70",
      )}
    >
      <div
        className={cn(
          "container-page flex items-center justify-between transition-all duration-300",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-control bg-primary font-display text-lg font-bold text-primary-foreground shadow-card transition-transform duration-300 group-hover:scale-105">
            {settings.empresa ? settings.empresa.charAt(0) : "H"}
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary">
              {settings.empresa || "HCB-BANDES"}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Habitação Corporativa
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative rounded-control px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              activeProps={{
                className:
                  "relative rounded-control px-3 py-2 text-sm font-semibold text-primary bg-surface",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contactos"
            className="hidden sm:inline-flex items-center rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary-dark"
          >
            Contactar
          </Link>
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-control border border-border text-foreground transition-colors hover:bg-surface"
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
                className="rounded-control px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface"
                activeProps={{
                  className:
                    "rounded-control px-3 py-3 text-sm font-semibold text-primary bg-surface",
                }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contactos"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-control bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Contactar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
