import { ButtonLink } from "@/components/ui/Button";
import { QuickSearchForm } from "./QuickSearchForm";
import { RouteSteps } from "./RouteSteps";

const STEPS = [
  { title: "Trouvez votre galerie", body: "Tapez une équipe, un adversaire ou une date." },
  { title: "Ouvrez vos photos", body: "Plein écran, navigation au clavier ou au doigt." },
  { title: "Récupérez-les", body: "Demandez la haute définition en un clic." },
];

/**
 * Le bloc signal (orange, une fois par page) : l'accès aux photos pour
 * les joueurs, parents et clubs. Avec ou sans champ de recherche.
 */
export function PhotoAccessBand({ context, withSearch = true }: { context?: string; withSearch?: boolean }) {
  return (
    <section aria-labelledby="photo-access-title" className="container-wide pb-[var(--section-space-sm)]">
      <div className="theme-orange bloom relative overflow-hidden rounded-[var(--radius-card)] px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.5rem,5vw,4.5rem)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="t-mono text-ink">+ Joueurs, parents, clubs</p>
            <h2 id="photo-access-title" className="t-h1 mt-5 text-[clamp(2rem,0.9rem+4.2vw,5rem)] text-ink" data-reveal>
              Vous êtes sur les photos ?
            </h2>
            <p className="mt-5 max-w-xl text-lg font-normal text-ink">
              {context ? `Une image de ${context} vous plaît ? ` : "Retrouvez votre match en quelques secondes. "}
              Chaque photo peut être demandée en haute définition, pour vous ou pour votre club.
            </p>
          </div>
          <div className="lg:col-span-4">
            {withSearch ? (
              <QuickSearchForm />
            ) : (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <ButtonLink href="/contact/?projet=demande-photo" variant="ink" size="lg">
                  Demander mes photos
                </ButtonLink>
                <ButtonLink href="/galeries" variant="outline" size="lg" icon={false} className="border-ink/60! text-ink! hover:bg-ink/10!">
                  Toutes les galeries
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 border-t border-ink/20 pt-10 md:mt-16">
          <RouteSteps steps={STEPS} tone="ink" />
        </div>
      </div>
    </section>
  );
}
