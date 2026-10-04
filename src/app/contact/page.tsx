import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ContactFormSection } from "@/components/contact/ContactFormSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Emphasis } from "@/components/ui/Emphasis";
import { ArrowUpRight, socialIcons } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, isDev, siteConfig } from "@/config/site";
import { contactContent } from "@/data/content";
import { inArea, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Contact & devis — photographe sportif${inArea}`,
  description: "Une demande de devis, un match, une saison ou un événement à couvrir, ou une photo à récupérer ? Envoyez votre demande, je vous réponds rapidement.",
  path: "/contact",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function ContactPage() {
  const { email, phone, location } = siteConfig.contact;
  const socials = getSocialLinks();

  return (
    <div className="container-wide page-top pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />

      <div className="mt-10 grid gap-14 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="anim-rise" style={delay(120)}>
            <SectionLabel>Contact</SectionLabel>
          </div>
          <h1 className="t-h1 mt-6 text-[clamp(2.1rem,0.8rem+3.6vw,4.75rem)] break-words text-linen">
            <span className="line-mask">
              <span style={delay(180)}>
                <Emphasis text={contactContent.title} />
              </span>
            </span>
          </h1>
          <p className="anim-rise mt-8 max-w-md t-lead text-taupe" style={delay(380)}>
            {contactContent.intro}
          </p>

          <dl className="anim-rise mt-12 border-t border-line" style={delay(480)}>
            {email || isDev ? (
              <ContactRow label="E-mail">
                {email ? (
                  <a href={`mailto:${email}`} className="group inline-flex items-center gap-2 break-all text-linen">
                    <span className="link-underline">{email}</span>
                    <ArrowUpRight className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
                  </a>
                ) : (
                  <Todo>E-mail public (config/site.ts)</Todo>
                )}
              </ContactRow>
            ) : null}
            {phone ? (
              <ContactRow label="Téléphone">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline text-linen">
                  {phone}
                </a>
              </ContactRow>
            ) : null}
            {location ? <ContactRow label="Zone">{location}</ContactRow> : null}
            {socials.length || isDev ? (
              <ContactRow label="Réseaux">
                {socials.length ? (
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {socials.map((s) => {
                      const Icon = socialIcons[s.key];
                      return (
                        <li key={s.key}>
                          <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-linen">
                            <Icon size={16} />
                            <span className="link-underline">{s.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Todo>Réseaux sociaux (config/site.ts)</Todo>
                )}
              </ContactRow>
            ) : null}
            <ContactRow label="Vos photos">
              <Link href="/galeries" className="link-underline text-linen">
                Chercher dans les galeries
              </Link>
            </ContactRow>
          </dl>
        </div>

        <div className="anim-rise lg:col-span-7" style={delay(320)}>
          <div className="rounded-[var(--radius-card)] border border-line bg-wash p-[clamp(1.25rem,4vw,3rem)]">
            <h2 className="mb-10 flex items-center justify-between gap-4 t-mono text-ash">
              <span>+ Formulaire</span>
              <span>Réponse rapide</span>
            </h2>
            <ContactFormSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-line py-5">
      <dt className="t-mono text-ash">{label}</dt>
      <dd className="t-small text-linen/90">{children}</dd>
    </div>
  );
}
