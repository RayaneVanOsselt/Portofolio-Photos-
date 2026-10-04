/**
 * Icônes maison : glyphes linéaires fins (1.5px), angles nets.
 * Toutes décoratives (aria-hidden) — le libellé est porté par le bouton
 * ou le lien parent.
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
      strokeWidth={1.5}
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
export const ArrowUp = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20V4M6 10l6-6 6 6" />
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
export const Camera = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 7.5h4l1.5-2.5h6l1.5 2.5h4v11h-17z" />
    <circle cx="12" cy="13" r="3.5" />
  </Base>
);
export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);
export const PageIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5h8l4 4v13H6z" />
    <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
  </Base>
);
export const Share = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v8h14v-8" />
  </Base>
);
export const Download = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </Base>
);
export const Expand = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </Base>
);
export const Shrink = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
  </Base>
);
/** Vue planche (mosaïque) */
export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 4.5h7v6h-7zM13.5 4.5h7v6h-7zM3.5 13.5h7v6h-7zM13.5 13.5h7v6h-7z" />
  </Base>
);
/** Vue éditoriale */
export const RowsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 4h17v9h-17zM3.5 16h7.5v4H3.5zM14 16h6.5v4H14z" />
  </Base>
);
export const Key = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l1.5 1.5" />
  </Base>
);
export const Calendar = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16v14H4zM4 10.5h16M8.5 3.5V8M15.5 3.5V8" />
  </Base>
);
export const Pin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20.5s6.5-5.6 6.5-10.5a6.5 6.5 0 0 0-13 0c0 4.9 6.5 10.5 6.5 10.5z" />
    <circle cx="12" cy="10" r="2.25" />
  </Base>
);
export const Images = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 7.5h13v12h-13zM7.5 4.5h13v12" />
    <path d="m3.5 16 4-4 3.5 3.5 2-2 3.5 3.5" />
  </Base>
);

export const Heart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z" fill={filled ? "currentColor" : "none"} />
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
