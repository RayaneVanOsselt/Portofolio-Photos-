import type { ReactNode } from "react";

/** Libellé « instrument » au-dessus d'un titre, avec index optionnel (01, 02…). */
export function SectionLabel({ index, children, className = "" }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 t-label text-silver ${className}`}>
      {index ? <span className="t-tabular text-phosphor">{index}</span> : null}
      {index ? <span aria-hidden className="h-px w-8 bg-line-strong" /> : null}
      <span>{children}</span>
    </p>
  );
}
