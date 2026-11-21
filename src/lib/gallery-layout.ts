/**
 * Composition éditoriale des galeries.
 *
 * Les photos sont regroupées en « rangées » de types variés. Dans une rangée,
 * chaque image reçoit une largeur proportionnelle à son ratio : toutes ont
 * donc la même hauteur, sans aucun recadrage (rangées justifiées).
 * L'alternance des types crée le rythme : paire, pleine largeur, trio,
 * image isolée décalée avec légende…
 */
import type { Photo } from "@/lib/types";

export type RowKind = "wide" | "pair" | "trio" | "solo";

export type GalleryRow = {
  kind: RowKind;
  /** Index des photos (dans la liste d'origine). */
  items: number[];
  /** Alignement des rangées « solo » et décalage des paires. */
  align: "start" | "end";
  /** Espace au-dessus de la rangée : serré ou respiration. */
  spacing: "tight" | "loose";
};

const ratio = (p: Photo) => p.width / p.height;
const isPortrait = (p: Photo) => ratio(p) < 0.95;

// Séquence de base, répétée. Ajustée selon l'orientation des images.
const RHYTHM: RowKind[] = ["pair", "wide", "trio", "solo", "pair", "solo"];

export function composeGallery(photos: Photo[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;
  let step = 0;
  let soloSide: "start" | "end" = "end";

  while (i < photos.length) {
    const remaining = photos.length - i;
    let kind = RHYTHM[step % RHYTHM.length];
    step += 1;

    // Une image portrait n'est jamais affichée en pleine largeur.
    if (kind === "wide" && isPortrait(photos[i])) kind = "solo";
    // Un trio avec deux portraits devient une paire + reste.
    if (kind === "trio" && remaining >= 3 && photos.slice(i, i + 3).filter(isPortrait).length >= 2) kind = "pair";

    let count = kind === "pair" ? 2 : kind === "trio" ? 3 : 1;
    if (count > remaining) {
      count = remaining;
      kind = remaining === 2 ? "pair" : remaining === 1 ? (isPortrait(photos[i]) ? "solo" : "wide") : kind;
    }

    const items = Array.from({ length: count }, (_, k) => i + k);
    const align = kind === "solo" ? soloSide : step % 2 ? "start" : "end";
    if (kind === "solo") soloSide = soloSide === "end" ? "start" : "end";

    rows.push({ kind, items, align, spacing: kind === "pair" && rows.at(-1)?.kind === "wide" ? "tight" : "loose" });
    i += count;
  }

  return rows;
}

/** Valeur CSS flex d'une image dans une rangée justifiée. */
export function flexFor(photo: Photo) {
  return `${ratio(photo).toFixed(4)} 1 0%`;
}

/**
 * Attribut `sizes` adapté à la part de largeur occupée par l'image.
 * Sur mobile, les rangées s'empilent (pleine largeur), sauf deux portraits côte à côte
 * et les images isolées, réduites à 86 % (voir .gallery-row dans globals.css).
 */
export function sizesFor(kind: RowKind, photo: Photo, row: Photo[]) {
  const total = row.reduce((sum, p) => sum + ratio(p), 0);
  const share = kind === "solo" ? (isPortrait(photo) ? 0.42 : 0.62) : ratio(photo) / total;
  const desktop = Math.round(Math.min(1680, 1680 * share));
  const sideBySide = row.length === 2 && row.every(isPortrait);
  const mobile = sideBySide ? `${Math.round(share * 100)}vw` : kind === "solo" ? "86vw" : "100vw";
  return `(min-width: 1776px) ${desktop}px, (min-width: 768px) ${Math.round(share * 100)}vw, ${mobile}`;
}

/** Hauteur des rangées de la planche (même valeurs que .mosaic dans globals.css). */
const MOSAIC_ROW = { base: 150, sm: 210, xl: 270 };
/** Une vignette s'élargit pour finir sa rangée : marge d'agrandissement prévue. */
const MOSAIC_GROW = 1.3;

/**
 * Attribut `sizes` d'une vignette de la planche : sa largeur réelle (hauteur de rangée × format),
 * et non une fraction de l'écran — le téléphone télécharge la version de la bonne taille.
 */
export function mosaicSizes(photo: Photo) {
  const width = (rowHeight: number) => `${Math.round(ratio(photo) * rowHeight * MOSAIC_GROW)}px`;
  return `(min-width: 1280px) ${width(MOSAIC_ROW.xl)}, (min-width: 640px) ${width(MOSAIC_ROW.sm)}, ${width(MOSAIC_ROW.base)}`;
}
