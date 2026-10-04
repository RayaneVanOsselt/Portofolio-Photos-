import type { Project } from "@/lib/types";

/** « 2026 / 10 / 04 » — la date stylisée des matchdays. */
export function matchdayDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${y} / ${m} / ${d}`;
}

/** « 2 — 1 » ou null si le score n'est pas renseigné. */
export function scoreLine(project: Project) {
  const score = project.match?.score;
  return score ? `${score[0]} — ${score[1]}` : null;
}

/** Ligne discrète : « Stade Joseph Marien · Championnat U23 · J8 ». */
export function matchContext(project: Project) {
  return [project.location, project.match?.competition, project.match?.round].filter(Boolean).join("  ·  ");
}
