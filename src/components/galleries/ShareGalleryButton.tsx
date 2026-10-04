"use client";

import { useState } from "react";
import { Check, Share } from "@/components/ui/Icons";

/** Partage du lien de la galerie (feuille de partage sur mobile, copie sinon). */
export function ShareGalleryButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${location.origin}${location.pathname}`;
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
      className="flex h-9 items-center gap-2 rounded-full bg-wash-strong px-4 text-[0.8125rem] font-medium text-linen transition-colors hover:bg-[rgb(231_231_216/0.16)]"
    >
      {copied ? <Check size={15} className="text-flamingo" /> : <Share size={15} />}
      <span aria-live="polite">{copied ? "Lien copié" : "Partager"}</span>
    </button>
  );
}
