import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { getCategories } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  const cover = getCategories()[0]?.cover;
  return (
    <section className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-deep">
      {cover ? (
        <div aria-hidden className="absolute inset-0 -z-10 opacity-35 grayscale">
          <PhotoImage photo={{ ...cover, alt: "" }} fill sizes="100vw" className="h-full rounded-none" />
        </div>
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(1_29_28/0.4),rgb(1_29_28/0.95))]" />
      <div className="container-wide pb-[clamp(3rem,8vh,6rem)]">
        <p className="anim-rise t-label text-phosphor" style={{ "--delay": "100ms" } as React.CSSProperties}>
          Erreur 404
        </p>
        <h1 className="t-display mt-5 text-platinum">
          <span className="line-mask">
            <span style={{ "--delay": "150ms" } as React.CSSProperties}>Ce cadre</span>
          </span>
          <span className="line-mask">
            <span style={{ "--delay": "260ms" } as React.CSSProperties}>
              <span className="t-serif text-phosphor">n&apos;existe</span> pas.
            </span>
          </span>
        </h1>
        <p className="anim-rise mt-8 max-w-md t-lead text-silver" style={{ "--delay": "450ms" } as React.CSSProperties}>
          La page demandée a été déplacée ou n&apos;a jamais été prise. Repartons d&apos;un bon angle.
        </p>
        <div className="anim-rise mt-10 flex flex-wrap gap-3" style={{ "--delay": "600ms" } as React.CSSProperties}>
          <ButtonLink href="/" variant="aurora" size="lg">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/portfolio" variant="outline" size="lg" icon={false}>
            Voir le portfolio
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
