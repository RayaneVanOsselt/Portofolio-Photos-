import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { socialIcons } from "@/components/ui/Icons";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, isDev, mainNav, photoAccess, siteConfig } from "@/config/site";
import { getCategories } from "@/lib/portfolio";
import { LiveClock } from "./LiveClock";

/**
 * Pied de page : navigation complète, puis la signature — un grand nom
 * et une ligne « tampon » (lieu, heure locale en direct), comme au dos d'un billet.
 */
export function Footer() {
  const socials = getSocialLinks();
  const categories = getCategories();
  const { email, phone, location } = siteConfig.contact;
  const place = siteConfig.seo.area || location || "Belgique";
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-night">
      <div className="container-wide pt-[clamp(4rem,3rem+4vw,7rem)]">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-linen" aria-label={`${siteConfig.name} — accueil`}>
              <Logo />
            </Link>
            <p className="mt-6 max-w-xs t-small text-taupe">{siteConfig.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={photoAccess.href} variant="signal" size="md">
                Trouver mes photos
              </ButtonLink>
            </div>
          </div>

          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn title="Navigation">
              <li>
                <FooterLink href="/">Accueil</FooterLink>
              </li>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Portfolio">
              {categories.map((c) => (
                <li key={c.href}>
                  <FooterLink href={c.href}>{c.title}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            {socials.length || isDev ? (
              <FooterColumn title="Réseaux">
                {socials.map((s) => {
                  const Icon = socialIcons[s.key];
                  return (
                    <li key={s.key}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 t-small text-linen/85 transition-colors hover:text-linen">
                        <Icon size={16} />
                        <span className="link-underline">{s.label}</span>
                      </a>
                    </li>
                  );
                })}
                {socials.length === 0 ? (
                  <li>
                    <Todo>Réseaux sociaux</Todo>
                  </li>
                ) : null}
              </FooterColumn>
            ) : null}

            <FooterColumn title="Contact">
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="link-underline t-small break-all text-linen/85 hover:text-linen">
                    {email}
                  </a>
                </li>
              ) : (
                <li>
                  <Todo>E-mail public</Todo>
                </li>
              )}
              {phone ? (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline t-small text-linen/85 hover:text-linen">
                    {phone}
                  </a>
                </li>
              ) : null}
              {location ? <li className="t-small text-taupe">{location}</li> : null}
              <li>
                <FooterLink href="/contact">Demander un devis</FooterLink>
              </li>
            </FooterColumn>
          </nav>
        </div>
      </div>

      {/* Signature surdimensionnée — purement décorative */}
      <div aria-hidden className="pointer-events-none mt-[clamp(3.5rem,6vw,6rem)] select-none overflow-hidden">
        <p className="container-wide font-display text-[clamp(4.5rem,0.5rem+19vw,24rem)] leading-[0.74] font-extrabold tracking-[-0.03em] whitespace-nowrap text-ink-soft uppercase [font-stretch:125%]">
          {siteConfig.logo.primary.replace(/\.$/, "")}
          <span className="text-flamingo/80">.</span>
        </p>
      </div>

      {/* Ligne « tampon » */}
      <div className="relative border-t border-line">
        <div className="container-wide flex flex-col gap-4 pt-5 pb-20 t-mono text-ash md:flex-row md:items-center md:justify-between md:pr-[calc(var(--gutter)+3.5rem)] md:pb-5">
          <p className="flex items-center gap-2.5">
            <span aria-hidden className="text-sm leading-none text-flamingo">
              +
            </span>
            © {year} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="link-underline hover:text-linen">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/legal" className="link-underline hover:text-linen">
                Mentions légales
              </Link>
            </li>
          </ul>
          <p className="flex items-center gap-2.5">
            <span aria-hidden className="live-dot size-1.5 rounded-full bg-flamingo" />
            {place} — <LiveClock timeZone={siteConfig.timeZone} />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="t-mono text-ash">{title}</h2>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-underline t-small text-linen/85 transition-colors hover:text-linen">
      {children}
    </Link>
  );
}
