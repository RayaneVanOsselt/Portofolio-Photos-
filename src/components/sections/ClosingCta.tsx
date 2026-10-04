import { ButtonLink } from "@/components/ui/Button";
import { Emphasis } from "@/components/ui/Emphasis";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";

type Props = {
  stamp?: string;
  title?: string;
  body?: string;
  cta?: { label: string; href: string };
};

/** Fin de page : tampon, grand titre étendu, une seule action. */
export function ClosingCta({
  stamp = "Contact",
  title = "Un projet ? *Parlons-en.*",
  body = "Un match, une saison, un événement ou des contenus pour votre club : décrivez votre besoin, je vous réponds rapidement.",
  cta = { label: "Me contacter", href: "/contact" },
}: Props) {
  const email = siteConfig.contact.email;
  return (
    <section aria-labelledby="closing-title" className="container-site pt-[var(--section-space-sm)] pb-[var(--section-space)]">
      <SectionStamp meta="Réponse rapide">{stamp}</SectionStamp>
      <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
        <h2 id="closing-title" className="t-h1 text-linen md:col-span-8" data-reveal>
          <Emphasis text={title} />
        </h2>
        <div className="flex flex-col items-start gap-6 md:col-span-4" data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          <p className="t-lead text-taupe">{body}</p>
          <ButtonLink href={cta.href} variant="signal" size="lg">
            {cta.label}
          </ButtonLink>
          {email ? (
            <a href={`mailto:${email}`} className="link-underline t-small text-taupe hover:text-linen">
              {email}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
