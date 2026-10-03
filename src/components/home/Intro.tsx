import { ArrowLink } from "@/components/ui/Button";
import { Emphasis } from "@/components/ui/Emphasis";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = { label: string; statement: string; body: string };

export function Intro({ label, statement, body }: Props) {
  return (
    <section aria-labelledby="intro-title" className="section container-site">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SectionLabel index="01" className="lg:sticky lg:top-28">
            {label}
          </SectionLabel>
        </div>
        <div className="lg:col-span-9">
          <h2 id="intro-title" className="t-h2 max-w-[18ch] text-platinum" data-reveal>
            <Emphasis text={statement} />
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:mt-16">
            <p className="t-lead text-silver" data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              {body}
            </p>
            <div className="flex items-end md:justify-end" data-reveal style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
              <ArrowLink href="/about">Le photographe</ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
