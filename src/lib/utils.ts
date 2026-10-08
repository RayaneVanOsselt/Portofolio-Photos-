/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isActivePath(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? clean === "/" : clean === href || clean.startsWith(`${href}/`);
}

/**
 * Fichier de /public servi tel quel (logos…) : ajoute le sous-dossier de
 * publication (GitHub Pages), que Next.js n'ajoute pas aux images `unoptimized`.
 */
export function publicPath(src: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}

/** Numérotation éditoriale : 1 → « 01 ». */
export function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Dates ISO (AAAA-MM-JJ) lues en UTC : pas de décalage d'un jour selon le fuseau.
const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`);
const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-BE", { timeZone: "UTC", ...options });

/** « 3 octobre 2026 » */
export function formatDate(iso: string) {
  return fmt({ day: "numeric", month: "long", year: "numeric" }).format(toDate(iso));
}

/** « 3 oct. 2026 » — listes chronologiques. */
export function formatDateMedium(iso: string) {
  return fmt({ day: "numeric", month: "short", year: "numeric" }).format(toDate(iso));
}

/** « 03.10.26 » — format compact des listes. */
export function formatDateShort(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y.slice(2)}`;
}

/**
 * Toutes les façons dont quelqu'un peut taper une date dans la recherche :
 * « 3 octobre 2026 », « 03 octobre », « octobre 2026 », « 03/10/2026 », « 3.10 », « 2026 »…
 */
export function dateKeywords(iso: string | null) {
  if (!iso) return "";
  const date = toDate(iso);
  const [y, m, d] = iso.slice(0, 10).split("-");
  const day = String(Number(d));
  const month = fmt({ month: "long" }).format(date);
  const weekday = fmt({ weekday: "long" }).format(date);
  return [
    `${weekday} ${day} ${month} ${y}`,
    `${d} ${month}`,
    `${month} ${y}`,
    `${d}/${m}/${y}`,
    `${day}/${Number(m)}/${y}`,
    `${d}.${m}.${y}`,
    `${d}-${m}-${y}`,
    `${d}${m}${y}`,
    iso,
  ].join(" ");
}

/** Taille lisible : 512 000 → « 500 Ko », 1 800 000 000 → « 1,7 Go ». */
export function formatBytes(bytes: number) {
  const units = ["octets", "Ko", "Mo", "Go"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit >= 2 && value < 10 ? 1 : 0;
  return `${new Intl.NumberFormat("fr-BE", { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}
