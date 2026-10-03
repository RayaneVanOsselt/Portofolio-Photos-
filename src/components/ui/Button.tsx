import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "./Icons";

type Variant = "aurora" | "solid" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 rounded-[var(--radius-sm)] t-label whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // CTA principal : le dégradé aurora, réservé à une action par écran.
  aurora: "text-ink bg-[image:var(--gradient-aurora)] bg-[length:200%_100%] bg-left hover:bg-right [transition-property:background-position,transform] duration-700",
  solid: "bg-kelp text-platinum hover:bg-[#0a4743]",
  outline: "border border-line-strong text-platinum hover:border-mist hover:bg-[rgb(237_255_254/0.06)]",
  ghost: "text-platinum hover:text-phosphor",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5",
  lg: "h-14 px-7",
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

export function ButtonLink({
  variant = "outline",
  size = "md",
  icon = true,
  className = "",
  children,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} data-cursor="follow" {...props}>
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
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}

/** Lien texte avec flèche qui glisse — pour les invitations secondaires. */
export function ArrowLink({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={`group/al inline-flex items-center gap-3 t-label text-platinum ${className}`} data-cursor="follow" {...props}>
      <span className="link-underline">{children}</span>
      <span className="inline-grid size-8 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft transition-colors duration-300 group-hover/al:bg-kelp">
        <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/al:rotate-45" />
      </span>
    </Link>
  );
}
