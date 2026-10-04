import type { CSSProperties } from "react";
import { pad } from "@/lib/utils";

export type RouteStep = { title: string; body: string };

/**
 * Étapes reliées comme un itinéraire : une ligne horizontale, des nœuds
 * circulaires, de grands numéros en filigrane. `tone="ink"` sur le bloc orange.
 */
export function RouteSteps({ steps, tone = "linen" }: { steps: RouteStep[]; tone?: "linen" | "ink" }) {
  const ink = tone === "ink";
  return (
    <ol className={`relative grid gap-8 sm:grid-cols-2 lg:gap-6 ${steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {/* Ligne de route (desktop) */}
      <span aria-hidden className={`absolute top-[7px] right-0 left-0 hidden h-px lg:block ${ink ? "bg-ink/30" : "bg-line-strong"}`} />
      {steps.map((step, i) => (
        <li key={step.title} className="relative" data-reveal style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties}>
          <span aria-hidden className={`relative z-10 block size-[15px] rounded-full border-[1.5px] ${ink ? "border-ink bg-flamingo" : "border-linen bg-ink"} ${i === 0 && !ink ? "border-flamingo bg-flamingo" : ""}`} />
          <span aria-hidden className={`pointer-events-none absolute top-4 right-0 font-display text-[4.5rem] leading-none font-extrabold [font-stretch:125%] ${ink ? "text-ink/10" : "text-linen/[0.05]"}`}>
            {pad(i + 1)}
          </span>
          <p className={`relative mt-6 t-mono ${ink ? "text-ink" : "text-ash"}`}>Étape {pad(i + 1)}</p>
          <h3 className={`relative mt-2 text-lg font-medium tracking-[-0.015em] ${ink ? "text-ink" : "text-linen"}`}>{step.title}</h3>
          <p className={`relative mt-1.5 t-small ${ink ? "text-ink" : "text-taupe"}`}>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
