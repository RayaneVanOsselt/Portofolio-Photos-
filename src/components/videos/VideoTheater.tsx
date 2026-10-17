"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { ArrowLeft, ArrowRight, Close, Images, Play } from "@/components/ui/Icons";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import type { Video } from "@/lib/types";
import { formatDate, formatDuration, pad } from "@/lib/utils";
import { ShareVideoButton } from "./ShareVideoButton";
import { VideoDownloadButton } from "./VideoDownloadButton";
import { VideoPlayer } from "./VideoPlayer";
import { posterBackdrop, VideoPoster } from "./VideoPoster";

type Props = {
  videos: Video[];
  /** Vidéo ouverte (index dans `videos`), ou null : lecteur fermé. */
  index: number | null;
  /** Lecture immédiate à l'ouverture (clic) ; pas pour un lien direct /videos/#… (le son serait refusé). */
  autoPlay: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/**
 * Lecteur plein écran (« salle de projection ») : la vidéo au centre, sa fiche à côté
 * (logos, date, téléchargement, photos du match), les autres vidéos à la suite.
 * Échap ferme ; N / P : vidéo suivante / précédente.
 */
export default function VideoTheater({ videos, index, autoPlay, onClose, onNavigate }: Props) {
  // La dernière vidéo reste affichée pendant l'animation de fermeture.
  const [shown, setShown] = useState(index);
  if (index !== null && index !== shown) setShown(index);
  const dialogRef = useAnimatedDialog(index !== null, onClose, 420);

  // Fermeture : le son s'arrête tout de suite, sans attendre la fin de l'animation.
  useEffect(() => {
    if (index === null) dialogRef.current?.querySelector("video")?.pause();
  }, [index, dialogRef]);

  const video = shown !== null ? videos[shown] : null;
  const count = videos.length;
  const go = (step: number) => shown !== null && onNavigate((shown + step + count) % count);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || count < 2) return;
    const key = event.key.toLowerCase();
    if (key === "n" || (event.shiftKey && event.key === "ArrowRight")) go(1);
    else if (key === "p" || (event.shiftKey && event.key === "ArrowLeft")) go(-1);
    else return;
    event.preventDefault();
  }

  const nav = "grid size-11 place-items-center rounded-full border border-line-strong text-linen transition-colors hover:border-linen hover:bg-wash-strong";

  return (
    <dialog
      ref={dialogRef}
      className="theater fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-linen"
      aria-label={video ? `Vidéo — ${video.title}` : "Vidéo"}
      onKeyDown={onKeyDown}
    >
      <div aria-hidden className="theater-bg absolute inset-0 bg-night" />
      {video ? (
        <div className="relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:grid-rows-[auto_minmax(0,1fr)]">
          {/* ------------------------------------------------------ en-tête */}
          <header className="theater-chrome flex h-16 items-center justify-between gap-4 px-[var(--gutter)] lg:col-span-2 lg:h-20">
            <p className="t-mono text-ash">
              Vidéo <span className="text-linen">{pad(shown! + 1)}</span> / {pad(count)}
            </p>
            <div className="flex items-center gap-2">
              {count > 1 ? (
                <>
                  <button type="button" onClick={() => go(-1)} className={nav} aria-label="Vidéo précédente">
                    <ArrowLeft size={18} />
                  </button>
                  <button type="button" onClick={() => go(1)} className={nav} aria-label="Vidéo suivante">
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : null}
              <button type="button" onClick={onClose} className="ml-2 grid size-11 place-items-center rounded-full bg-linen text-ink transition-colors hover:bg-flamingo" aria-label="Fermer la vidéo">
                <Close size={18} />
              </button>
            </div>
          </header>

          {/* ------------------------------------------------------- vidéo */}
          <div className="theater-stage relative flex min-h-0 items-center justify-center px-[var(--gutter)] pb-4 [container-type:size] lg:pr-6 lg:pb-[var(--gutter)]">
            <VideoPlayer
              key={video.slug}
              video={video}
              autoPlay={autoPlay}
              autoFocus
              sizes={video.vertical ? "(min-width: 1024px) 40vh, 100vw" : "(min-width: 1024px) 70vw, 100vw"}
              className="w-[min(100cqw,calc(100cqh*var(--ratio)))] rounded-[var(--radius-card)]"
              style={{ "--ratio": `${video.width / video.height}` } as CSSProperties}
              next={count > 1 ? { title: videos[(shown! + 1) % count].title, onPlay: () => go(1) } : undefined}
            />
          </div>

          {/* ------------------------------------------------------- fiche */}
          <aside className="theater-info overflow-y-auto border-t border-line px-[var(--gutter)] pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:border-t-0 lg:border-l lg:px-8 lg:pt-2 lg:pb-10">
            <div key={video.slug} className="theater-sheet">
              <div className="flex items-center gap-3">
                {video.crests.map((crest) => (
                  <ClubCrest key={crest.id} crest={crest} size={36} />
                ))}
                <p className="t-mono text-ash">
                  <time dateTime={video.date}>{formatDate(video.date)}</time>
                  {video.sport ? ` · ${video.sport}` : ""}
                </p>
              </div>
              <h2 className="mt-3 text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] leading-[1.05] font-light tracking-[-0.035em] text-linen lg:mt-6">{video.title}</h2>
              {video.description ? <p className="mt-3 hidden t-small text-taupe sm:block">{video.description}</p> : null}
              <p className="mt-3 hidden t-mono text-ash lg:block">
                {formatDuration(video.duration)} · {video.vertical ? "Format vertical" : "Format horizontal"} · HD 720p
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-8">
                {video.download ? <VideoDownloadButton {...video.download} title={video.title} /> : null}
                <ShareVideoButton href={video.href} title={video.title} />
              </div>
              {video.album ? (
                <Link
                  href={video.album.href}
                  onClick={onClose}
                  className="group mt-4 flex items-center gap-4 rounded-[var(--radius-btn)] border border-line p-3 transition-colors hover:border-line-strong hover:bg-wash lg:mt-8"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-wash-strong text-flamingo">
                    <Images size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block t-mono text-ash">{video.album.photoCount ? `${video.album.photoCount} photos du match` : "Album du match"}</span>
                    <span className="mt-1 block truncate text-[0.9375rem] text-linen">
                      <span className="link-underline">{video.album.title}</span>
                    </span>
                  </span>
                  <ArrowRight size={18} className="ml-auto shrink-0 text-taupe transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : null}
            </div>

            {count > 1 ? (
              <nav aria-label="Autres vidéos" className="mt-10 hidden lg:block">
                <p className="t-mono text-ash">À suivre</p>
                <ol className="mt-4 grid gap-2">
                  {videos.map((other, i) =>
                    i === shown ? null : (
                      <li key={other.slug}>
                        <button type="button" onClick={() => onNavigate(i)} className="group flex w-full items-center gap-4 rounded-[var(--radius-btn)] p-2 text-left transition-colors hover:bg-wash">
                          <span className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-[var(--radius-xs)]" style={posterBackdrop(other)}>
                            <VideoPoster video={other} sizes="56px" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <span className="absolute inset-0 grid place-items-center bg-night/30 opacity-0 transition-opacity group-hover:opacity-100">
                              <Play size={14} />
                            </span>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[0.9375rem] text-linen">{other.title}</span>
                            <span className="mt-0.5 block t-mono text-ash">
                              {formatDuration(other.duration)} · {formatDate(other.date)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ),
                  )}
                </ol>
              </nav>
            ) : null}
          </aside>
        </div>
      ) : null}
    </dialog>
  );
}
