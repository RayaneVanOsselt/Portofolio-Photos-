"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ArrowRight, Key } from "@/components/ui/Icons";

type Props = {
  /** Empreintes SHA-256 des codes (jamais les codes eux-mêmes) → adresse de la galerie. */
  codes: { hash: string; href: string }[];
};

/** Même normalisation qu'au build (lib/gallery-index.ts). */
const normalize = (code: string) => code.normalize("NFKC").toUpperCase().replace(/[\s\-_.]/g, "");

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** « Vous avez reçu un code ? » — ouvre une galerie privée. */
export function AccessCodeForm({ codes }: Props) {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "unknown" | "found">("idle");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const value = normalize(code);
        if (!value) return;
        setStatus("checking");
        try {
          const hash = await sha256(value);
          const match = codes.find((c) => c.hash === hash);
          if (match) {
            setStatus("found");
            router.push(match.href);
          } else {
            setStatus("unknown");
          }
        } catch {
          setStatus("unknown");
        }
      }}
      className="rounded-[var(--radius-card)] border border-line p-6 md:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-wash-strong text-linen">
          <Key size={18} />
        </span>
        <div>
          <label htmlFor={id} className="block text-lg font-medium tracking-[-0.015em] text-linen">
            Vous avez reçu un code d&apos;accès ?
          </label>
          <p className="t-small text-taupe">Pour les galeries privées (séances, événements, clubs).</p>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <input
          id={id}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (status === "unknown") setStatus("idle");
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          placeholder="EX. RL-2026"
          aria-invalid={status === "unknown"}
          aria-describedby={`${id}-status`}
          className="h-12 w-full min-w-0 rounded-[var(--radius-btn)] border border-line-strong bg-transparent px-4 font-mono text-[0.9375rem] tracking-[0.2em] text-linen uppercase outline-none transition-colors placeholder:text-ash focus:border-linen aria-[invalid=true]:border-danger"
        />
        <button
          type="submit"
          disabled={status === "checking" || !code.trim()}
          className="flex h-12 shrink-0 items-center gap-2 rounded-[var(--radius-btn)] border border-linen/80 px-5 text-[0.9375rem] font-medium text-linen transition-colors hover:bg-wash-strong disabled:opacity-50"
        >
          Ouvrir
          <ArrowRight size={16} />
        </button>
      </div>
      <p id={`${id}-status`} aria-live="polite" className="mt-3 min-h-5 t-small">
        {status === "unknown" ? <span className="text-danger">Ce code ne correspond à aucune galerie. Vérifiez-le ou contactez-moi.</span> : null}
        {status === "found" ? <span className="text-taupe">Ouverture de la galerie…</span> : null}
      </p>
    </form>
  );
}
