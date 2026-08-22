import type { ReactNode } from "react";
import { useReveal, useCountUp } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/** Envolve conteúdo e revela-o suavemente quando entra no viewport. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** atraso em ms */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", visible && "reveal-visible", className)}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Número-chave com contagem animada ao entrar em vista. */
export function StatNumber({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const numeric = Number(value.replace(/[^\d]/g, ""));
  const isNumeric = /\d/.test(value) && !Number.isNaN(numeric);
  const counted = useCountUp(isNumeric ? numeric : 0, visible);
  const prefix = value.match(/^\D+/)?.[0] ?? "";
  const suffix = value.match(/\D+$/)?.[0] ?? "";

  return (
    <div ref={ref} className={cn("tabular-nums", className)}>
      {isNumeric ? `${prefix}${counted}${suffix}` : value}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  imageSrc,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageSrc?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground">
      {imageSrc && (
        <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-primary/60" />
        </>
      )}
      <div className="absolute inset-0 -z-10 bg-grid-primary opacity-[0.12]" />
      <div className="container-page py-16 md:py-24 lg:py-28">
        {eyebrow && (
          <Reveal className="mb-4 type-eyebrow text-primary-foreground/70">{eyebrow}</Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="type-display max-w-3xl">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl type-lead text-primary-foreground/80">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("container-page py-16 md:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <div className="mb-3 type-eyebrow text-accent">{eyebrow}</div>}
      <h2 className="type-h2 text-primary">{title}</h2>
      {description && <p className="mt-4 type-lead text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
