import Link from "next/link";
import { ArrowLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Service } from "@/lib/types";
import { pad } from "@/lib/utils";

/** Aperçu des prestations : lignes « instrument », sans cartes. */
export function ServicesTeaser({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-teaser-title" className="section-sm container-site">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionLabel index="06">Services</SectionLabel>
          <h2 id="services-teaser-title" className="t-h2 mt-6 text-platinum" data-reveal>
            Ce que je <span className="t-serif text-phosphor">propose</span>
          </h2>
          <div className="mt-10 hidden lg:block">
            <ArrowLink href="/services">Toutes les prestations</ArrowLink>
          </div>
        </div>
        <ul className="border-t border-line lg:col-span-8">
          {services.map((service, i) => (
            <li key={service.slug} className="border-b border-line" data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
              <Link href={`/services#${service.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-7 md:grid-cols-[3rem_1fr_10rem_auto] md:py-9" data-cursor="follow">
                <span className="t-caption t-tabular pt-2 text-phosphor">{pad(i + 1)}</span>
                <span>
                  <span className="t-h3 block text-platinum transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{service.title}</span>
                  <span className="mt-3 block max-w-md t-small text-silver">{service.description}</span>
                </span>
                <span className="hidden pt-2 t-caption text-silver md:block">{service.format}</span>
                <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors duration-300 group-hover:bg-kelp">
                  <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="lg:hidden">
          <ArrowLink href="/services">Toutes les prestations</ArrowLink>
        </div>
      </div>
    </section>
  );
}
