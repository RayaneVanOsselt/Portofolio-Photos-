import type { CSSProperties, ReactNode } from "react";
import { Emphasis } from "@/components/ui/Emphasis";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

type Props = {
  crumbs: Crumb[];
  kicker: string;
  /** Les mots entre *astérisques* passent en serif italique. */
  title: string;
  intro?: ReactNode;
  /** Colonne de droite (métadonnées, chiffres…). */
  aside?: ReactNode;
  size?: "display" | "h1";
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** En-tête des pages intérieures : fil d'Ariane, titre surdimensionné, introduction. */
export function PageIntro({ crumbs, kicker, title, intro, aside, size = "display" }: Props) {
  return (
    <header className="container-wide pt-[calc(var(--header-height)+clamp(2.5rem,6vw,6rem))] pb-[clamp(2.5rem,5vw,5rem)]">
      <Breadcrumbs items={crumbs} />
      <p className="anim-rise mt-10 t-label text-silver md:mt-14" style={delay(150)}>
        {kicker}
      </p>
      <h1 className={`${size === "display" ? "t-display" : "t-h1"} mt-5 text-platinum`}>
        <span className="line-mask">
          <span style={delay(200)}>
            <Emphasis text={title} />
          </span>
        </span>
      </h1>
      {intro || aside ? (
        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:mt-14 md:grid-cols-12">
          {intro ? (
            <div className="anim-rise t-lead text-silver md:col-span-6" style={delay(420)}>
              {intro}
            </div>
          ) : null}
          {aside ? (
            <div className="anim-rise md:col-span-5 md:col-start-8" style={delay(520)}>
              {aside}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

/** Petits chiffres « instrument » (nombre de photos, de séries…) — uniquement des données réelles. */
export function MetaList({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="t-caption text-silver">{item.label}</dt>
          <dd className="mt-2 text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] leading-none font-medium tracking-[-0.04em] text-phosphor t-tabular">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
