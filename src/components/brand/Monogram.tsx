/**
 * Monogramme : un bloc plein au coin coupé (le langage de la charte),
 * initiales « RV » en réserve. Un seul tracé, rempli en `currentColor` :
 * les lettres sont des trous (fill-rule evenodd), donc le fond transparaît
 * — lisible de 16px (favicon) à l'affiche, sur n'importe quel fond.
 */
type Props = { className?: string; title?: string };

export const MONOGRAM_PATH =
  // Bloc 52×52, coin inférieur droit coupé
  "M6 6h52v40L46 58H6z" +
  // R
  "M14.7 16h12.5a7.6 7.6 0 0 1 2.6 14.74L34.2 44h-6l-3.9-12.4h-3.7V44h-5.9zM20.6 21.2v5.6h6.3a2.8 2.8 0 0 0 0-5.6z" +
  // V
  "M33.7 16h5.8l3.7 18 3.8-18h5.8l-6.9 28h-5.3z";

export function Monogram({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={MONOGRAM_PATH} fillRule="evenodd" />
    </svg>
  );
}
