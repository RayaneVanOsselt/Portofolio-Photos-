import Image from "next/image";
import type { CSSProperties } from "react";
import { Parallax } from "@/components/effects/Parallax";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import type { Photo } from "@/lib/types";

type Props = {
  photo: Photo;
  eyebrow: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Hero plein écran. Chorégraphie d'entrée (CSS, sans JS) :
 * image (fondu + léger dézoom) → titre en masque → signature → CTA.
 */
export function Hero({ photo, eyebrow, primaryCta, secondaryCta }: Props) {
  const video = siteConfig.heroVideo;
  // Fichiers de /public : le sous-dossier de publication doit être ajouté à la main.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const withBase = (src: string) => (src.startsWith("/") ? `${base}${src}` : src);
  const { primary, secondary } = siteConfig.logo;
  const [secondaryWord, ...secondaryRest] = secondary.split(" ");

  return (
    <section aria-labelledby="hero-title" className="grain relative isolate flex h-[100svh] min-h-[36rem] flex-col justify-end overflow-hidden bg-deep">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: photo.color }}>
        <Parallax strength={70} className="absolute inset-x-0 -top-20 -bottom-20">
          <div className="anim-hero-image absolute inset-0">
            {video ? (
              <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={withBase(photo.src)} aria-hidden>
                <source src={withBase(video.src)} type={video.type} />
              </video>
            ) : (
              <Image src={photo.src} alt={photo.alt} fill preload fetchPriority="high" sizes="100vw" className="object-cover" />
            )}
          </div>
        </Parallax>
      </div>

      {/* Voile : lisibilité du texte sans éteindre la photo */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(1_29_28/0.55)_0%,rgb(1_29_28/0)_28%,rgb(1_29_28/0)_45%,rgb(1_38_36/0.92)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_100%,rgb(1_29_28/0.6),transparent_60%)]" />

      <div className="container-wide pb-[clamp(2rem,1rem+4vh,4.5rem)]">
        <p className="anim-rise t-label text-mist" style={delay(700)}>
          {eyebrow}
        </p>

        <h1 id="hero-title" className="t-display mt-5 text-platinum">
          <span className="line-mask">
            <span style={delay(450)}>{primary}</span>
          </span>
          <span className="line-mask">
            <span style={delay(580)}>
              <span className="t-serif font-normal tracking-[-0.03em] text-phosphor">{secondaryWord}</span> {secondaryRest.join(" ")}
            </span>
          </span>
          <span className="sr-only"> — {siteConfig.tagline}</span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 border-t border-line-strong pt-6 md:mt-10 md:flex-row md:items-center md:justify-between">
          <p className="anim-rise t-label text-silver" style={delay(900)}>
            {siteConfig.tagline}
          </p>
          <div className="anim-rise flex flex-wrap gap-3" style={delay(1050)}>
            <ButtonLink href={primaryCta.href} variant="aurora" size="lg">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="outline" size="lg" icon={false} className="backdrop-blur-sm">
              {secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div aria-hidden className="anim-fade absolute top-1/2 right-[var(--gutter)] hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex" style={delay(1400)}>
        <span className="t-caption text-silver [writing-mode:vertical-rl]">Défiler</span>
        <span className="relative h-16 w-px overflow-hidden bg-line">
          <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-mist" />
        </span>
      </div>
    </section>
  );
}
