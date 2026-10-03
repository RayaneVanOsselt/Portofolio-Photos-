import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ContactFormSection } from "@/components/contact/ContactFormSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Emphasis } from "@/components/ui/Emphasis";
import { ArrowUpRight, socialIcons } from "@/components/ui/Icons";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, siteConfig } from "@/config/site";
import { contactContent } from "@/data/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Une demande de devis, un match, une saison ou un événement à couvrir ? Envoyez votre demande, je vous réponds rapidement.",
  path: "/contact",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function ContactPage() {
  const { email, phone, location } = siteConfig.contact;
  const socials = getSocialLinks();

  return (
    <div className="container-wide pt-[calc(var(--header-height)+clamp(2.5rem,6vw,6rem))] pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />

      <div className="mt-10 grid gap-14 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="anim-rise t-label text-silver" style={delay(150)}>
            Contact
          </p>
          <h1 className="t-h1 mt-5 text-platinum">
            <span className="line-mask">
              <span style={delay(200)}>
                <Emphasis text={contactContent.title} />
              </span>
            </span>
          </h1>
          <p className="anim-rise mt-8 max-w-md t-lead text-silver" style={delay(400)}>
            {contactContent.intro}
          </p>

          <dl className="anim-rise mt-12 divide-y divide-line border-y border-line" style={delay(500)}>
            <ContactRow label="E-mail">
              {email ? (
                <a href={`mailto:${email}`} className="group inline-flex items-center gap-2 break-all text-platinum">
                  <span className="link-underline">{email}</span>
                  <ArrowUpRight className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
                </a>
              ) : (
                <Todo>E-mail public (config/site.ts)</Todo>
              )}
            </ContactRow>
            {phone ? (
              <ContactRow label="Téléphone">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline text-platinum">
                  {phone}
                </a>
              </ContactRow>
            ) : null}
            {location ? <ContactRow label="Zone">{location}</ContactRow> : null}
            <ContactRow label="Réseaux">
              {socials.length ? (
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {socials.map((s) => {
                    const Icon = socialIcons[s.key];
                    return (
                      <li key={s.key}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-platinum">
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
          </dl>
        </div>

        <div className="anim-rise lg:col-span-7" style={delay(350)}>
          <div className="relative rounded-[var(--radius-lg)] bg-deep p-[clamp(1.25rem,4vw,3rem)]">
            <h2 className="mb-10 t-label text-silver">Demande de devis</h2>
            <ContactFormSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 py-5">
      <dt className="t-caption text-silver">{label}</dt>
      <dd className="t-small text-mist">{children}</dd>
    </div>
  );
}
