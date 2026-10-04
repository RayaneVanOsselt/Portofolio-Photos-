/**
 * Lignes d'un terrain (ligne médiane, rond central, surface) en traits très
 * fins : la signature graphique des reportages de football. Purement décoratif.
 */
export function PitchLines({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 600 400" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" className={className} preserveAspectRatio="xMidYMid slice">
      {/* Cadre */}
      <rect x="20" y="20" width="560" height="360" />
      {/* Ligne médiane + rond central */}
      <path d="M300 20v360" />
      <circle cx="300" cy="200" r="62" />
      <circle cx="300" cy="200" r="2.5" fill="currentColor" />
      {/* Surfaces de réparation */}
      <path d="M20 110h92v180H20M580 110h-92v180h92" />
      <path d="M20 160h34v80H20M580 160h-34v80h34" />
      {/* Arcs de surface */}
      <path d="M112 166a48 48 0 0 1 0 68M488 166a48 48 0 0 0 0 68" />
      {/* Points de penalty */}
      <circle cx="84" cy="200" r="2" fill="currentColor" />
      <circle cx="516" cy="200" r="2" fill="currentColor" />
      {/* Corners */}
      <path d="M20 30a10 10 0 0 0 10-10M570 20a10 10 0 0 0 10 10M580 370a10 10 0 0 0-10 10M30 380a10 10 0 0 0-10-10" />
    </svg>
  );
}
