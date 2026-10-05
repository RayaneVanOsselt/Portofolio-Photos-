import type { Album } from "@/lib/types";

/** « 2 — 1 » ou null si le score n'est pas renseigné. */
export function scoreLine(album: Album) {
  const score = album.match?.score;
  return score ? `${score[0]} — ${score[1]}` : null;
}

/** Ligne discrète, uniquement avec ce qui est renseigné : « Stade Joseph Marien · Championnat · J8 ». */
export function matchContext(album: Album) {
  return [album.location, album.match?.competition, album.match?.round].filter(Boolean).join("  ·  ");
}

/** « 24 photos », « 1 photo » ou « Photos à venir ». */
export function photoCountLabel(count: number) {
  return count ? `${count} photo${count > 1 ? "s" : ""}` : "Photos à venir";
}
