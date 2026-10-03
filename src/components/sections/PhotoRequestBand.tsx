import { ButtonLink } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

const STEPS = ["Ouvrez la photo", "Cliquez sur « Demander cette photo »", "Je vous réponds avec les possibilités"];

/** Invite joueurs, parents et clubs à demander leurs photos (le public naturel d'un photographe sportif). */
export function PhotoRequestBand({ context }: { context?: string }) {
  return (
    <section aria-labelledby="photo-request-title" className="container-wide pb-[var(--section-space-sm)]">
      <div className="grid gap-10 rounded-[var(--radius-lg)] border border-line px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.5rem,5vw,4rem)] md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <SectionLabel>Joueurs, parents, clubs</SectionLabel>
          <h2 id="photo-request-title" className="t-h2 mt-5 text-platinum" data-reveal>
            Vous êtes sur <span className="t-serif text-phosphor">une photo ?</span>
          </h2>
          <p className="mt-5 max-w-md t-small text-silver">
            {context ? `Une image de ${context} vous plaît ? ` : ""}Vous pouvez la demander en haute définition, pour un usage personnel ou pour votre club.
          </p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4 t-small text-mist">
                <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-kelp t-caption t-tabular text-phosphor">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <ButtonLink href="/contact/?projet=demande-photo" variant="solid" className="mt-8">
            Faire une demande
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
