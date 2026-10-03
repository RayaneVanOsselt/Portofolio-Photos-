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
      <p className="t-label text-phosphor">Erreur</p>
      <h1 className="t-h1 mt-5 max-w-[16ch] text-platinum">Quelque chose s&apos;est mal passé.</h1>
      <p className="mt-6 max-w-md t-lead text-silver">Réessayez dans un instant ou revenez à l&apos;accueil.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="aurora" size="lg" onClick={reset}>
          Réessayer
        </Button>
        <Link href="/" className="inline-flex h-14 items-center px-6 t-label text-silver hover:text-platinum">
          Accueil
        </Link>
      </div>
    </section>
  );
}
