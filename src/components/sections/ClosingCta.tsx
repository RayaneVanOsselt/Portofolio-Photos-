import { ButtonLink } from "@/components/ui/Button";
import { Emphasis } from "@/components/ui/Emphasis";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";

type Props = {
  label?: string;
  title?: string;
  body?: string;
  cta?: { label: string; href: string };
};

/** Appel à l'action final : un « puits » en retrait, le seul dégradé de la section. */
export function ClosingCta({
  label = "Travaillons ensemble",
  title = "Créons quelque *chose*.",
  body = "Un match, une saison, un événement ou un projet de club : parlons-en.",
  cta = { label: "Demander un devis", href: "/contact" },
}: Props) {
  const email = siteConfig.contact.email;
  return (
    <section aria-labelledby="closing-title" className="container-wide pb-[var(--section-space-sm)]">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-deep px-[clamp(1.25rem,5vw,6rem)] py-[clamp(4.5rem,9vw,8.5rem)]">
        <div aria-hidden className="pointer-events-none absolute -top-1/2 left-1/2 h-[120%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_130_124/0.22),transparent)]" />
        <div className="relative">
          <SectionLabel>{label}</SectionLabel>
          <h2 id="closing-title" className="t-display mt-8 text-platinum" data-reveal>
            <Emphasis text={title} />
          </h2>
          <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md t-lead text-silver" data-reveal>
              {body}
            </p>
            <div className="flex flex-col items-start gap-4 md:items-end" data-reveal>
              <ButtonLink href={cta.href} variant="aurora" size="lg">
                {cta.label}
              </ButtonLink>
              {email ? (
                <a href={`mailto:${email}`} className="link-underline t-small text-silver hover:text-platinum">
                  {email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
