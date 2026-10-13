"use client";

import { useCallback, useEffect, useState } from "react";
import type { Video } from "@/lib/types";
import VideoTheater from "./VideoTheater";

/**
 * Lecteur plein écran d'une liste de vidéos, relié à l'adresse : ouvrir une vidéo
 * écrit « #<slug> » (lien partageable), et une adresse /videos/#<slug> l'ouvre
 * à l'arrivée sur la page.
 *
 * Le lecteur est chargé avec la page (et non à la demande) : au clic, la vidéo
 * démarre dans le même geste — condition pour que l'iPhone autorise le son.
 */
export function useTheater(videos: Video[]) {
  const [open, setOpen] = useState<{ index: number; autoPlay: boolean } | null>(null);

  const show = useCallback(
    (index: number, autoPlay = true) => {
      setOpen({ index, autoPlay });
      history.replaceState(history.state, "", `#${videos[index].slug}`);
    },
    [videos],
  );

  const close = useCallback(() => {
    setOpen(null);
    if (location.hash) history.replaceState(history.state, "", `${location.pathname}${location.search}`);
  }, []);

  // Lien direct (/videos/#<slug>) : la vidéo s'ouvre, prête à être lancée.
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      const index = videos.findIndex((v) => v.slug === slug);
      if (index >= 0) setOpen({ index, autoPlay: false });
    };
    // Différé d'un tour (pas de mise à jour d'état pendant l'effet) ; setTimeout plutôt que
    // requestAnimationFrame, suspendu dans un onglet ouvert en arrière-plan.
    const timer = window.setTimeout(fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [videos]);

  const theater = (
    <VideoTheater videos={videos} index={open?.index ?? null} autoPlay={open?.autoPlay ?? false} onClose={close} onNavigate={(index) => show(index)} />
  );
  return { show, theater };
}
