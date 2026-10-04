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
 * Tampon de section : la signature du système. Un filet, une ligne de repères
 * (numéro, contexte), puis le titre en monospace très espacé, comme imprimé
 * sur un billet. Remplace les H2 classiques des grandes sections.
 */
export function SectionStamp({
  index,
  meta,
  id,
  children,
  as: Tag = "h2",
  className = "",
}: {
  index?: string;
  meta?: ReactNode;
  id?: string;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={`border-t border-line pt-4 ${className}`}>
      <div className="flex items-center justify-between gap-6 t-mono text-ash">
        <span>{index ? `(${index})` : null}</span>
        {meta ? <span className="text-right">{meta}</span> : null}
      </div>
      <Tag id={id} className="t-stamp mt-6 break-words md:mt-8" data-reveal>
        {children}
      </Tag>
    </div>
  );
}
