import type { CSSProperties, ReactNode } from "react";
import { Emphasis } from "@/components/ui/Emphasis";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

type Props = {
  crumbs: Crumb[];
  kicker: string;
  /** Les mots entre *astérisques* passent en ton secondaire. */
  title: string;
  intro?: ReactNode;
  /** Colonne de droite (champs du « billet » : chiffres, date…). */
  aside?: ReactNode;
  size?: "display" | "h1";
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** En-tête des pages intérieures : fil d'Ariane, grand titre étendu, introduction. */
export function PageIntro({ crumbs, kicker, title, intro, aside, size = "display" }: Props) {
  return (
    <header className="container-wide page-top pb-[clamp(2.5rem,5vw,4.5rem)]">
      <Breadcrumbs items={crumbs} />
      <div className="anim-rise mt-10 md:mt-14" style={delay(120)}>
        <SectionLabel>{kicker}</SectionLabel>
      </div>
      <h1 className={`${size === "display" ? "t-display" : "t-h1"} mt-6 text-linen`}>
        <span className="line-mask">
          <span style={delay(180)}>
            <Emphasis text={title} />
          </span>
        </span>
      </h1>
      {intro || aside ? (
        <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 md:grid-cols-12">
          {intro ? (
            <div className="anim-rise t-lead text-taupe md:col-span-6" style={delay(380)}>
              {intro}
            </div>
          ) : null}
          {aside ? (
            <div className="anim-rise md:col-span-5 md:col-start-8" style={delay(480)}>
              {aside}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

/** Champs « billet » : libellé mono + valeur légère — uniquement des données réelles. */
export function MetaList({ items, columns = 3 }: { items: { label: string; value: ReactNode }[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columns];
  return (
    <dl className={`grid gap-x-6 gap-y-6 ${cols}`}>
      {items.map((item) => (
        <div key={item.label} className="border-l border-line pl-4">
          <dt className="t-mono text-ash">{item.label}</dt>
          <dd className="mt-2 text-[clamp(1.5rem,1.1rem+1.4vw,2.5rem)] leading-none font-light tracking-[-0.04em] text-linen t-tabular">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
