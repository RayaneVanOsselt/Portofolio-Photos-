import { Fragment } from "react";

/**
 * Les mots entourés d'astérisques passent en ton secondaire (Taupe) :
 * « Parlons de votre *projet*. » — l'accent reste achromatique,
 * l'orange est réservé aux actions.
 */
export function Emphasis({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className="text-taupe">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
