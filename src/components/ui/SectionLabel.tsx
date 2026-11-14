import type { ReactNode } from "react";

/** Petit libellé « billet » : un « + » orange et des capitales mono espacées. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 t-mono text-taupe ${className}`}>
      <span aria-hidden className="text-[0.875rem] leading-none font-medium text-flamingo">
        +
      </span>
      <span>{children}</span>
    </p>
  );
}

/**
 * Tampon de section : la signature du système. Un filet, une ligne de contexte,
 * puis le titre en monospace très espacé, comme imprimé sur un billet.
 * Remplace les H2 classiques des grandes sections.
 */
export function SectionStamp({
  meta,
  id,
  children,
  as: Tag = "h2",
  className = "",
}: {
  meta?: ReactNode;
  id?: string;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={`border-t border-line pt-4 ${className}`}>
      {meta ? <p className="t-mono text-ash">{meta}</p> : null}
      <Tag id={id} className="t-stamp mt-6 break-words md:mt-8" data-reveal>
        {children}
      </Tag>
    </div>
  );
}
