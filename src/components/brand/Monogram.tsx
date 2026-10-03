/**
 * Monogramme : les initiales tracées en lignes fines dans les coins d'un viseur.
 * Le dessin est en traits (stroke) pour rester net de 16px (favicon) à l'affiche.
 * Le tracé est volontairement indépendant de toute police.
 */
type Props = { className?: string; title?: string; strokeWidth?: number };

export const MONOGRAM_PATHS = {
  frame: "M4 17V4h13M47 4h13v13M60 47v13H47M17 60H4V47",
  letters: "M19.5 44V20h7a6 6 0 0 1 0 12h-7M25.5 32 31 44M34 20l5.5 24L45 20",
};

export function Monogram({ className, title, strokeWidth = 2.5 }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={MONOGRAM_PATHS.frame} />
      <path d={MONOGRAM_PATHS.letters} strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  );
}
