import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowUpRight, socialIcons } from "@/components/ui/Icons";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, mainNav, siteConfig } from "@/config/site";
import { getCategories } from "@/lib/portfolio";

export function Footer() {
  const socials = getSocialLinks();
  const categories = getCategories();
  const { email, phone, location } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-deep pt-[clamp(5rem,4rem+5vw,8rem)]">
      <div className="container-wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-platinum" aria-label={`${siteConfig.name} — accueil`}>
              <Logo />
            </Link>
            <p className="mt-6 max-w-xs t-small text-silver">{siteConfig.tagline}</p>
          </div>

          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn title="Navigation">
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

            <FooterColumn title="Réseaux">
              {socials.map((s) => {
                const Icon = socialIcons[s.key];
                return (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 t-small text-silver transition-colors hover:text-platinum">
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

            <FooterColumn title="Contact">
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="link-underline t-small break-all text-silver hover:text-platinum">
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
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline t-small text-silver hover:text-platinum">
                    {phone}
                  </a>
                </li>
              ) : null}
              {location ? <li className="t-small text-silver">{location}</li> : null}
              <li className="pt-2">
                <Link href="/contact" className="group inline-flex items-center gap-2 t-label text-platinum">
                  Demander un devis
                  <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
                </Link>
              </li>
            </FooterColumn>
          </nav>
        </div>
      </div>

      {/* Signature surdimensionnée — purement décorative */}
      <div aria-hidden className="pointer-events-none mt-20 select-none overflow-hidden">
        <p className="container-wide whitespace-nowrap text-[clamp(4rem,1rem+17vw,22rem)] leading-[0.78] font-medium tracking-[-0.06em] text-kelp">
          {siteConfig.logo.primary}
        </p>
      </div>

      <div className="relative border-t border-line">
        <div className="container-wide flex flex-col gap-4 py-6 t-caption text-silver sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="link-underline hover:text-platinum">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/legal" className="link-underline hover:text-platinum">
                Mentions légales
              </Link>
            </li>
            <li>
              <a href="#top" className="link-underline hover:text-platinum">
                Haut de page ↑
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="t-caption text-silver">{title}</h2>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-underline t-small text-mist/90 transition-colors hover:text-platinum">
      {children}
    </Link>
  );
}
