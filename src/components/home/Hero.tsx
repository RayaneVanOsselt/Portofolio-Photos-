import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MatchTicket } from "@/components/portfolio/MatchTicket";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { categoryContext } from "@/lib/portfolio";
import { inArea } from "@/lib/seo";
import type { Photo, Project } from "@/lib/types";

type Props = {
  photo: Photo;
  /** Galerie mise en avant dans le billet (la plus récente). */
  latest?: Project;
  eyebrow: string;
  title: [string, string];
  lead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** Légende de la photo (galerie dont elle provient). */
  caption?: { label: string; href: string };
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Hero plein écran : une photo forte, le texte posé directement dessus,
 * et à droite le « billet » en verre de la dernière galerie.
 * Chorégraphie d'entrée en CSS (aucune attente de JavaScript).
 */
export function Hero({ photo, latest, eyebrow, title, lead, primaryCta, secondaryCta, caption }: Props) {
  const video = siteConfig.heroVideo;
  // Fichiers de /public : le sous-dossier de publication doit être ajouté à la main.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const withBase = (src: string) => (src.startsWith("/") ? `${base}${src}` : src);

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: photo.color }}>
        <div className="anim-hero-image absolute inset-0">
          {video ? (
            <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={withBase(photo.src)} aria-hidden>
              <source src={withBase(video.src)} type={video.type} />
            </video>
          ) : (
            <Image src={photo.src} alt={photo.alt} fill preload fetchPriority="high" sizes="100vw" className="object-cover" />
          )}
        </div>
      </div>
      {/* Voiles de lisibilité : le texte se pose sur la photo sans l'éteindre */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(19_20_18/0.82)_0%,rgb(19_20_18/0.45)_45%,rgb(19_20_18/0.1)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(19_20_18/0.55)_0%,transparent_22%,transparent_60%,rgb(19_20_18/0.9)_100%)]" />

      <div className="container-wide flex flex-1 flex-col justify-end pt-[calc(var(--header-height)+3rem)] pb-[clamp(1.5rem,4vh,3rem)]">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <p className="anim-rise flex items-center gap-2.5 t-mono text-linen" style={delay(500)}>
              <span aria-hidden className="text-sm leading-none text-flamingo">
                +
              </span>
              {eyebrow}
            </p>
            <h1 id="hero-title" className="t-display mt-6 text-linen">
              <span className="line-mask">
                <span style={delay(300)}>{title[0]}</span>
              </span>
              <span className="line-mask">
                <span style={delay(420)}>{title[1]}</span>
              </span>
              <span className="sr-only"> — Photographe sportif{inArea} : hockey, rugby et football</span>
            </h1>
            <p className="anim-rise mt-7 max-w-xl text-[clamp(1.0625rem,0.95rem+0.55vw,1.375rem)] leading-[1.5] font-light text-linen/85" style={delay(700)}>
              {lead}
            </p>
            <div className="anim-rise mt-9 flex flex-wrap gap-3" style={delay(850)}>
              <ButtonLink href={primaryCta.href} variant="signal" size="lg">
                {primaryCta.label}
              </ButtonLink>
              <ButtonLink href={secondaryCta.href} variant="ghost" size="lg" icon={false} className="backdrop-blur-md">
                {secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          {latest ? (
            <div className="anim-rise hidden lg:col-span-5 lg:block xl:col-span-4" style={delay(1000)}>
              <MatchTicket
                project={latest}
                label="Dernière galerie"
                glass
                actions={
                  <Link href={latest.href} className="group flex h-9 items-center gap-2 rounded-full bg-wash-strong px-4 text-[0.8125rem] font-medium text-linen transition-colors hover:bg-[rgb(231_231_216/0.18)]">
                    Ouvrir la galerie
                    <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:rotate-45" />
                  </Link>
                }
              />
              <p className="mt-3 text-right t-mono text-linen/60">{categoryContext(latest.category)}</p>
            </div>
          ) : null}
        </div>

        <div className="anim-fade mt-[clamp(2.5rem,6vh,4.5rem)] flex items-center justify-between gap-6 border-t border-line pt-4 t-mono text-linen/70" style={delay(1200)}>
          <span className="flex items-center gap-3">
            <span aria-hidden className="relative h-6 w-px overflow-hidden bg-line-strong">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-flamingo" />
            </span>
            Défiler
          </span>
          {caption ? (
            <Link href={caption.href} className="link-underline truncate hover:text-linen">
              Photo — {caption.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
