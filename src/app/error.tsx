"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** Erreur inattendue dans une page : message clair et moyen de réessayer. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-wide flex min-h-[80svh] flex-col justify-center pt-[var(--header-height)]">
      <p className="t-mono text-flamingo">+ Erreur</p>
      <h1 className="t-h1 mt-6 max-w-[16ch] text-linen">Quelque chose s&apos;est mal passé.</h1>
      <p className="mt-6 max-w-md t-lead text-taupe">Réessayez dans un instant ou revenez à l&apos;accueil.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="signal" size="lg" onClick={reset}>
          Réessayer
        </Button>
        <Link href="/" className="inline-flex h-14 items-center rounded-full px-6 text-base text-taupe hover:text-linen">
          Accueil
        </Link>
      </div>
    </section>
  );
}
