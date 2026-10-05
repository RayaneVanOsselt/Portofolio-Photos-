import type { Metadata } from "next";
import { QuickSearchForm } from "@/components/sections/QuickSearchForm";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { getAlbums } from "@/lib/albums";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  const cover = getAlbums().find((a) => a.cover)?.cover;
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-night">
      {cover ? (
        <div aria-hidden className="absolute inset-0 -z-10 opacity-30 grayscale">
          <PhotoImage photo={{ ...cover, alt: "" }} fill sizes="100vw" className="h-full" />
        </div>
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(19_20_18/0.4),rgb(19_20_18/0.96))]" />
      <div className="container-wide pt-[calc(var(--header-height)+3rem)] pb-[clamp(3rem,8vh,6rem)]">
        <p className="anim-rise t-mono text-flamingo" style={{ "--delay": "100ms" } as React.CSSProperties}>
          + Erreur 404 — hors cadre
        </p>
        <h1 className="t-display mt-6 text-linen">
          <span className="line-mask">
            <span style={{ "--delay": "150ms" } as React.CSSProperties}>Hors</span>
          </span>
          <span className="line-mask">
            <span style={{ "--delay": "260ms" } as React.CSSProperties} className="text-taupe">
              champ.
            </span>
          </span>
        </h1>
        <p className="anim-rise mt-8 max-w-md t-lead text-taupe" style={{ "--delay": "450ms" } as React.CSSProperties}>
          Cette page a été déplacée ou n&apos;a jamais été prise. Vous cherchiez des photos ?
        </p>
        <div className="anim-rise mt-8 max-w-xl" style={{ "--delay": "550ms" } as React.CSSProperties}>
          <QuickSearchForm tone="linen" />
        </div>
        <div className="anim-rise mt-8 flex flex-wrap gap-3" style={{ "--delay": "650ms" } as React.CSSProperties}>
          <ButtonLink href="/" variant="ghost" size="lg" icon={false}>
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/albums" variant="outline" size="lg">
            Voir les albums
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
