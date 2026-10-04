import type { ReactNode } from "react";
import { getCategoryTrail } from "@/lib/portfolio";
import type { Project } from "@/lib/types";
import { formatDateShort, pad } from "@/lib/utils";

const SPORT = { hockey: "Hockey", rugby: "Rugby", football: "Football" } as const;

/**
 * Le « billet de match » : la signature visuelle du site. Une carte en verre
 * (angles 20px, filet de lin), un itinéraire « compétition → équipe », des
 * champs comme sur un billet et un code-barres décoratif propre à chaque galerie.
 */
export function MatchTicket({
  project,
  label = "Billet de galerie",
  actions,
  glass = false,
  className = "",
}: {
  project: Project;
  label?: string;
  actions?: ReactNode;
  glass?: boolean;
  className?: string;
}) {
  const trail = getCategoryTrail(project.category);
  const from = trail[0].title;
  const to = trail.length > 1 ? trail.at(-1)!.title : (project.teams?.find((t) => t !== from) ?? project.event ?? "Galerie");
  const fields = [
    { label: "Date", value: project.date ? formatDateShort(project.date) : "—" },
    { label: "Photos", value: pad(project.photos.length) },
    { label: "Type", value: project.event ?? "Reportage" },
    ...(project.location ? [{ label: "Lieu", value: project.location }] : []),
  ];

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] border border-line-strong ${glass ? "glass" : "bg-wash"} ${className}`}>
      <div className="flex items-center justify-between gap-4 px-6 pt-5 md:px-7">
        <p className="flex items-center gap-2.5 t-mono text-linen">
          <span aria-hidden className="text-sm leading-none text-flamingo">
            +
          </span>
          {label}
        </p>
        <p className="t-mono text-ash">{SPORT[project.category.sport]}</p>
      </div>

      {/* Itinéraire */}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 md:px-7">
        <div className="min-w-0">
          <p className="t-mono text-ash">Origine</p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-tight font-medium tracking-[0.04em] text-linen uppercase">{from}</p>
        </div>
        <span aria-hidden className="flex items-center gap-1.5 text-flamingo">
          <span className="h-px w-4 bg-line-strong md:w-6" />
          <span className="text-sm">→</span>
          <span className="h-px w-4 bg-line-strong md:w-6" />
        </span>
        <div className="min-w-0 text-right">
          <p className="t-mono text-ash">Destination</p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-tight font-medium tracking-[0.04em] text-linen uppercase">{to}</p>
        </div>
      </div>

      <p className="mt-6 px-6 text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] leading-[1.15] font-light tracking-[-0.03em] text-linen md:px-7">{project.title}</p>

      {/* Champs */}
      <dl className="mt-6 grid grid-cols-3 border-y border-dashed border-line-strong">
        {fields.slice(0, 3).map((field, i) => (
          <div key={field.label} className={`px-6 py-4 md:px-7 ${i ? "border-l border-dashed border-line-strong" : ""}`}>
            <dt className="t-mono text-ash">{field.label}</dt>
            <dd className="mt-1 truncate font-mono text-[0.875rem] text-linen">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-end justify-between gap-6 px-6 py-5 md:px-7">
        <div className="flex flex-wrap gap-2">{actions}</div>
        <Barcode seed={project.slug} />
      </div>
    </div>
  );
}

/** Code-barres décoratif, déterministe (même galerie → mêmes barres). */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261;
  const bars: number[] = [];
  for (let i = 0; i < 24; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    bars.push(1 + (h % 3));
  }
  let x = 0;
  return (
    <svg aria-hidden viewBox="0 0 80 36" className="h-9 w-20 shrink-0 text-linen/70" preserveAspectRatio="none">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="36" fill="currentColor" /> : null;
        x += w + 0.6;
        return rect;
      })}
    </svg>
  );
}
