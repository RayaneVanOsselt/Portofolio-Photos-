/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Numérotation éditoriale : 1 → « 01 ». */
export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
