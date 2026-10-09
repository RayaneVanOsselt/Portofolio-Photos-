import Link from "next/link";
import { photoCountLabel } from "@/components/albums/match-format";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight, socialIcons } from "@/components/ui/Icons";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, isDev, mainNav, photoAccess, secondaryNav, siteConfig } from "@/config/site";
import { getAlbums, getCategoryGroups } from "@/lib/albums";
import { formatDateShort } from "@/lib/utils";
import { LiveClock } from "./LiveClock";

/** Derniers matchs listés dans le pied de page. */
const LATEST_COUNT = 4;

const number = new Intl.NumberFormat("fr-BE");

/**
 * Pied de page : la signature et les derniers matchs mis en ligne (mis à jour
 * tout seuls à chaque album ajouté), puis le plan du site — albums groupés par
 * sport —, un grand nom et une ligne « tampon » (lieu, heure locale en direct),
 * comme au dos d'un billet.
 */
export function Footer() {
  const socials = getSocialLinks();
  const groups = getCategoryGroups();
  const published = getAlbums().filter((album) => album.photos.length);
  const latest = published.slice(0, LATEST_COUNT);
  const photoCount = published.reduce((sum, album) => sum + album.photos.length, 0);
  // Retrouver mes photos (bouton) et Contact (colonne dédiée) ne sont pas répétés.
  const siteLinks = [...mainNav, ...secondaryNav].filter((item) => item.href !== photoAccess.href && item.href !== "/contact");
  const { email, phone, location } = siteConfig.contact;
  const place = siteConfig.seo.area || location || "Belgique";
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-night">
      <div className="container-wide pt-[clamp(4rem,3rem+4vw,7rem)]">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-linen" aria-label={`${siteConfig.name} — accueil`}>
              <Logo variant="full" />
            </Link>
            <p className="mt-6 max-w-sm t-small text-taupe">{siteConfig.tagline}</p>
            {published.length ? (
              <p className="mt-6 t-mono text-ash">
                {number.format(published.length)} match{published.length > 1 ? "s" : ""} · {number.format(photoCount)} photo{photoCount > 1 ? "s" : ""}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href={photoAccess.href} variant="signal" size="md">
                Trouver mes photos
              </ButtonLink>
              <Link href="/contact" className="link-underline t-small text-linen/85 hover:text-linen">
                Demander un devis
              </Link>
            </div>
          </div>

          {latest.length ? (
            <section aria-labelledby="footer-latest" className="lg:col-span-7 lg:col-start-6">
              <div className="flex items-baseline justify-between gap-6">
                <h2 id="footer-latest" className="t-mono text-ash">
                  Derniers matchs
                </h2>
                <Link href="/matchs" className="link-underline t-mono text-taupe hover:text-linen">
                  Tous les matchs
                </Link>
              </div>
              <ul className="mt-5 border-t border-line">
                {latest.map((album) => (
                  <li key={album.href} className="border-b border-line">
                    <Link
                      href={album.href}
                      className="group grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 py-3.5 transition-colors duration-300 hover:bg-wash md:grid-cols-[5.5rem_1fr_7.5rem_auto] md:px-2"
                    >
                      <time dateTime={album.date} className="t-mono text-taupe">
                        {formatDateShort(album.date)}
                      </time>
                      <span className="min-w-0 t-small text-linen">
                        {album.match ? (
                          <>
                            {album.match.home}
                            <span className="mx-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-flamingo uppercase">vs</span>
                            {album.match.away}
                          </>
                        ) : (
                          album.title
                        )}
                      </span>
                      <span className="hidden text-right t-mono text-ash md:block">{photoCountLabel(album.photos.length)}</span>
                      <ArrowUpRight className="self-center text-ash transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45 group-hover:text-linen" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <nav aria-label="Plan du site" className="mt-16 grid grid-flow-row-dense grid-cols-2 gap-x-8 gap-y-12 border-t border-line pt-10 md:mt-20 md:grid-cols-4">
          <FooterColumn title="Le site">
            <ul className="space-y-2.5">
              {siteLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Albums" className="col-span-2">
            <div className="columns-2 gap-8">
              {groups.map((group) => (
                <div key={group.sport} className="mb-7 break-inside-avoid">
                  <p className="t-mono text-taupe">{group.label}</p>
                  <ul className="mt-3 space-y-2.5">
                    {group.categories.map((c) => (
                      <li key={c.href}>
                        <FooterLink href={c.href}>{c.title}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </FooterColumn>

          <FooterColumn title="Contact">
            <ul className="space-y-2.5">
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
                <FooterLink href="/contact">Me contacter</FooterLink>
              </li>
              <li>
                <FooterLink href={photoAccess.href}>Retrouver mes photos</FooterLink>
              </li>
            </ul>

            {socials.length || isDev ? (
              <>
                <h2 className="mt-10 t-mono text-ash">Réseaux</h2>
                <ul className="mt-5 space-y-2.5">
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
                </ul>
              </>
            ) : null}
          </FooterColumn>
        </nav>
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
            © {year} {siteConfig.name} — Tous droits réservés
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

function FooterColumn({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="t-mono text-ash">{title}</h2>
      <div className="mt-5">{children}</div>
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
