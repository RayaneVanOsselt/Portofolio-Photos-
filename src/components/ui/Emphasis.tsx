import { Fragment } from "react";

/** Met en serif italique les mots entourés d'astérisques : « l'instant où tout *bascule* ». */
export function Emphasis({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className="t-serif text-phosphor">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
