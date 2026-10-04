/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isActivePath(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? clean === "/" : clean === href || clean.startsWith(`${href}/`);
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
