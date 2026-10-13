"use client";

import { useState } from "react";
import { Check, Share } from "@/components/ui/Icons";

/**
 * Partage du lien direct d'une vidéo (/videos/#<slug> : la page s'ouvre sur cette vidéo).
 * Feuille de partage sur mobile, copie du lien ailleurs.
 */
export function ShareVideoButton({ href, title }: { href: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${href}`;
        try {
          if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2200);
        } catch {
          /* partage annulé */
        }
      }}
      className="inline-flex h-11 items-center gap-2.5 rounded-full bg-wash-strong px-5 text-[0.9375rem] font-medium text-linen transition-colors hover:bg-[rgb(231_231_216/0.16)]"
    >
      {copied ? <Check size={18} className="text-flamingo" /> : <Share size={18} />}
      <span aria-live="polite">{copied ? "Lien copié" : "Partager"}</span>
    </button>
  );
}
