import type { ReactNode } from "react";
import { pad } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";

export type LegalSection = { title: string; body: ReactNode };

/** Mise en page des pages juridiques : lecture confortable, sommaire numéroté. */
export function LegalPage({ title, path, updated, sections }: { title: string; path: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="container-site page-top pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: title, path }]} />
      <h1 className="t-h1 mt-10 max-w-[16ch] text-linen md:mt-14">{title}</h1>
      <p className="mt-6 t-mono text-ash">Dernière mise à jour : {updated}</p>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <nav aria-label="Sommaire" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28 space-y-3 t-small text-taupe">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#section-${i + 1}`} className="link-underline hover:text-linen">
                  <span className="mr-2 font-mono text-xs text-ash">{pad(i + 1)}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12 lg:col-span-8 lg:col-start-5">
          {sections.map((s, i) => (
            <section key={s.title} id={`section-${i + 1}`} aria-labelledby={`section-${i + 1}-title`} className="scroll-mt-28 border-t border-line pt-6">
              <h2 id={`section-${i + 1}-title`} className="t-h3 text-linen">
                <span className="mr-3 t-mono align-middle text-flamingo">{pad(i + 1)}</span>
                {s.title}
              </h2>
              <div className="mt-5 max-w-2xl space-y-4 text-taupe [&_a]:text-linen [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-linen [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
