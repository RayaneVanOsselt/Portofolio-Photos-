import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "./Icons";

/**
 * Boutons du système — deux formes seulement :
 * - pilule (999px) : actions principales — `signal` (orange, une par écran),
 *   `ghost` (voile translucide) et `ink` (sur le bloc orange) ;
 * - rectangle 8px : `outline`, l'action discrète bordée de lin.
 */
type Variant = "signal" | "ghost" | "ink" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap select-none font-medium tracking-[-0.005em] " +
  "transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  signal: "rounded-full bg-flamingo text-ink hover:bg-tango",
  ghost: "rounded-full bg-wash-strong text-linen hover:bg-[rgb(231_231_216/0.16)]",
  ink: "rounded-full bg-ink text-linen hover:bg-iron",
  outline: "rounded-[var(--radius-btn)] border border-linen/80 text-linen hover:border-linen hover:bg-wash-strong",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  children: ReactNode;
  className?: string;
};

function Inner({ children, icon }: { children: ReactNode; icon?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {icon ? (
        <span className="relative -mr-1 inline-flex size-4 overflow-hidden" aria-hidden>
          <ArrowUpRight className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-full group-hover/btn:-translate-y-full" />
          <ArrowUpRight className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
        </span>
      ) : null}
    </>
  );
}

export function buttonClass(variant: Variant = "outline", size: Size = "md", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function ButtonLink({
  variant = "outline",
  size = "md",
  icon = true,
  className = "",
  children,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  );
}

export function Button({
  variant = "outline",
  size = "md",
  icon = false,
  className = "",
  children,
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}

/** Lien texte avec flèche — pour les invitations secondaires (« Voir la galerie → »). */
export function ArrowLink({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={`group/al inline-flex items-center gap-3 text-[0.9375rem] font-medium text-linen ${className}`} {...props}>
      <span className="link-underline">{children}</span>
      <span className="inline-grid size-8 place-items-center rounded-full border border-line-strong transition-[background-color,border-color,color] duration-300 group-hover/al:border-flamingo group-hover/al:bg-flamingo group-hover/al:text-ink">
        <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/al:rotate-45" />
      </span>
    </Link>
  );
}
