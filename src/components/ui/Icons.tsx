/**
 * Icônes maison : traits fins géométriques (1.25px), cohérents avec le
 * monogramme. Toutes décoratives (aria-hidden) — le libellé est porté
 * par le bouton ou le lien parent.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Base>
);
export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Base>
);
export const ArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </Base>
);
export const Close = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 5 14 14M19 5 5 19" />
  </Base>
);
export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Base>
);
export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v16M4 12h16" />
  </Base>
);
export const Minus = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h16" />
  </Base>
);
export const ZoomIn = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6" />
  </Base>
);
export const ZoomOut = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M7.5 10.5h6" />
  </Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Base>
);
export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

/* --- Réseaux sociaux --------------------------------------------------- */

export const Instagram = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.25" cy="6.75" r=".6" fill="currentColor" stroke="none" />
  </Base>
);
export const TikTok = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3.5v11.25a3.75 3.75 0 1 1-3.75-3.75M14 3.5c.4 2.6 2.3 4.4 5 4.6" />
  </Base>
);
export const LinkedIn = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M8 10.5V16M8 7.75v.5M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1.9 2.1 2.6V16" />
  </Base>
);
export const Facebook = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 20.5v-7.5h2.5l.4-3h-2.9V8.3c0-.9.3-1.5 1.5-1.5h1.5V4.1a19 19 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8V10H9v3h2.6v7.5" />
  </Base>
);
export const YouTube = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
    <path d="m10 9.25 5 2.75-5 2.75z" />
  </Base>
);

export const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  linkedin: LinkedIn,
  facebook: Facebook,
  youtube: YouTube,
} as const;
