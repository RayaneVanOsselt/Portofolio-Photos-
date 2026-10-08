"use client";

import { useRef, useState } from "react";
import { Check, Close, Download } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import type { Photo } from "@/lib/types";
import { formatBytes, publicPath } from "@/lib/utils";
import { buildZip, saveBlob, type ZipEntry } from "@/lib/zip";

type Props = {
  open: boolean;
  onClose: () => void;
  /** « Télécharger la galerie », « Télécharger ma sélection ». */
  title: string;
  /** Nom de l'archive et du dossier qu'elle contient (sans .zip). */
  archiveName: string;
  photos: Photo[];
  /** Date de l'événement (AAAA-MM-JJ) : date des fichiers dans l'archive. */
  date?: string;
};

type Phase = "confirm" | "working" | "done" | "error";

/**
 * Téléchargement de plusieurs photos en une archive ZIP : confirmation (nombre
 * de photos, taille estimée), progression réelle, annulation, message clair en
 * cas d'échec. Au-delà de la limite configurée, l'archive est refusée et le
 * visiteur est invité à choisir moins de photos plutôt que de saturer son appareil.
 */
export function ArchiveDialog({ open, onClose, title, archiveName, photos, date }: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [progress, setProgress] = useState(0);
  const controller = useRef<AbortController | null>(null);

  const files = photos.filter((p) => p.download);
  const total = files.reduce((n, p) => n + p.download!.bytes, 0);
  const tooLarge = total > siteConfig.downloads.maxArchiveBytes;

  const close = () => {
    controller.current?.abort();
    onClose();
  };
  const dialogRef = useAnimatedDialog(open, close, 380);

  // Nouvelle ouverture : on repart de l'étape de confirmation.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhase("confirm");
      setProgress(0);
    }
  }

  const start = async () => {
    const abort = new AbortController();
    controller.current = abort;
    setPhase("working");
    setProgress(0);
    const entries: ZipEntry[] = files.map((p) => ({ name: `${archiveName}/${p.download!.filename}`, url: publicPath(p.download!.url), bytes: p.download!.bytes }));
    try {
      const blob = await buildZip(entries, {
        signal: abort.signal,
        date: date ? new Date(`${date}T12:00:00`) : undefined,
        onProgress: (received, size) => setProgress(size ? received / size : 0),
      });
      saveBlob(blob, `${archiveName}.zip`);
      setPhase("done");
    } catch (error) {
      if (abort.signal.aborted) return;
      console.error(error);
      setPhase("error");
    } finally {
      controller.current = null;
    }
  };

  const percent = Math.round(progress * 100);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="archive-title"
      className="sheet-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-linen"
      onClick={(event) => {
        if (event.target === event.currentTarget && phase !== "working") close();
      }}
    >
      <div className="sheet-panel absolute inset-x-0 bottom-0 rounded-t-[var(--radius-card)] border-t border-line-strong bg-ink px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(30rem,calc(100%-2*var(--gutter)))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-card)] sm:border sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="t-mono text-flamingo">Téléchargement</p>
            <h2 id="archive-title" className="mt-3 text-[1.5rem] leading-tight font-light tracking-[-0.03em] text-linen">
              {title}
            </h2>
          </div>
          <button type="button" onClick={close} data-autofocus className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-wash-strong hover:text-linen" aria-label="Fermer">
            <Close size={20} />
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 border-y border-line">
          <div className="py-3">
            <dt className="t-mono text-ash">Photos</dt>
            <dd className="mt-1 text-lg text-linen">{files.length}</dd>
          </div>
          <div className="border-l border-line py-3 pl-4">
            <dt className="t-mono text-ash">Taille estimée</dt>
            <dd className="mt-1 text-lg text-linen">{formatBytes(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 t-small text-taupe">JPEG haute qualité, réunis dans une archive ZIP « {archiveName}.zip ».</p>

        <div className="mt-6" aria-live="polite">
          {phase === "confirm" && tooLarge ? (
            <p className="rounded-[var(--radius-sm)] border border-line-strong px-4 py-3 t-small text-linen">
              Cette sélection dépasse {formatBytes(siteConfig.downloads.maxArchiveBytes)}, la taille maximale d&apos;une archive préparée dans le navigateur. Sélectionnez moins de photos, ou téléchargez-les une à une depuis la visionneuse.
            </p>
          ) : null}

          {phase === "working" ? (
            <div>
              <div className="flex items-baseline justify-between t-small">
                <span className="text-linen">Préparation du téléchargement…</span>
                <span className="font-mono text-taupe">{percent} %</span>
              </div>
              <div role="progressbar" aria-label="Préparation de l'archive" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-3 h-1.5 overflow-hidden rounded-full bg-wash-strong">
                <div className="h-full rounded-full bg-flamingo transition-[width] duration-200" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ) : null}

          {phase === "done" ? (
            <p className="flex items-center gap-3 t-small text-linen">
              <Check size={18} className="text-flamingo" />
              Archive prête : le téléchargement a commencé.
            </p>
          ) : null}

          {phase === "error" ? (
            <p className="t-small text-linen">Le téléchargement a échoué — la connexion a peut-être été interrompue. Réessayez dans un instant.</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {phase === "working" ? (
            <button type="button" onClick={close} className="h-12 rounded-full border border-line-strong px-6 text-[0.9375rem] text-linen transition-colors hover:bg-wash-strong">
              Annuler
            </button>
          ) : phase === "done" ? (
            <button type="button" onClick={close} className="h-12 rounded-full bg-linen px-6 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-white">
              Terminé
            </button>
          ) : (
            <>
              <button type="button" onClick={close} className="h-12 rounded-full px-5 text-[0.9375rem] text-taupe transition-colors hover:text-linen">
                Annuler
              </button>
              <button
                type="button"
                onClick={start}
                disabled={tooLarge || !files.length}
                className="flex h-12 items-center gap-2.5 rounded-full bg-flamingo px-6 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-tango disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={18} />
                {phase === "error" ? "Réessayer" : "Télécharger (ZIP)"}
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
