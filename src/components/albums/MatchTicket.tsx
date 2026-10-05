import type { ReactNode } from "react";
import { getCategoryTrail, SPORT_NAME } from "@/lib/albums";
import type { Album } from "@/lib/types";
import { formatDateShort, pad } from "@/lib/utils";

/**
 * Le « billet de match » : la signature visuelle du site. Une carte en verre
 * (angles 20px, filet de lin), un itinéraire « compétition → équipe », des
 * champs comme sur un billet et un code-barres décoratif propre à chaque album.
 */
export function MatchTicket({
  album,
  label = "Billet d'album",
  actions,
  glass = false,
  className = "",
}: {
  album: Album;
  label?: string;
  actions?: ReactNode;
  glass?: boolean;
  className?: string;
}) {
  const trail = getCategoryTrail(album.category);
  const match = album.match;
  // Match : les deux équipes face à face ; sinon « compétition → équipe ».
  const from = match ? (match.homeShort ?? match.home) : trail[0].title;
  const to = match ? (match.awayShort ?? match.away) : trail.length > 1 ? trail.at(-1)!.title : (album.teams?.find((t) => t !== from) ?? album.event);
  const fields = [
    { label: "Date", value: formatDateShort(album.date) },
    match?.score
      ? { label: "Score", value: `${match.score[0]}—${match.score[1]}` }
      : { label: "Photos", value: album.photos.length ? pad(album.photos.length) : "À venir" },
    { label: "Catégorie", value: trail.at(-1)!.title },
    ...(album.location ? [{ label: "Lieu", value: album.location }] : []),
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
        <p className="t-mono text-ash">{SPORT_NAME[album.category.sport]}</p>
      </div>

      {/* Itinéraire */}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 md:px-7">
        <div className="min-w-0">
          <p className="t-mono text-ash">{match ? "Équipe" : "Origine"}</p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-tight font-medium tracking-[0.04em] text-linen uppercase">{from}</p>
        </div>
        <span aria-hidden className="flex items-center gap-1.5 text-flamingo">
          <span className="h-px w-4 bg-line-strong md:w-6" />
          <span className={match ? "font-mono text-[0.6875rem] tracking-[0.18em] uppercase" : "text-sm"}>{match ? "vs" : "→"}</span>
          <span className="h-px w-4 bg-line-strong md:w-6" />
        </span>
        <div className="min-w-0 text-right">
          <p className="t-mono text-ash">{match ? "Équipe" : "Destination"}</p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-tight font-medium tracking-[0.04em] text-linen uppercase">{to}</p>
        </div>
      </div>

      <p className="mt-6 px-6 text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] leading-[1.15] font-light tracking-[-0.03em] text-linen md:px-7">{album.title}</p>

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
        <Barcode seed={album.slug} />
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
