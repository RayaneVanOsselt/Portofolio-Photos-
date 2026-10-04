"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Close, Download, Expand, Share, Shrink, ZoomIn, ZoomOut } from "@/components/ui/Icons";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import { pad } from "@/lib/utils";
import type { GalleryItem } from "./Gallery";

type Props = {
  items: GalleryItem[];
  /** Lien permanent de la photo affichée (partage, demande de photo). */
  permalink: (index: number) => string;
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
  allowDownload?: boolean;
};

const SWIPE_THRESHOLD = 50;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Fichier d'origine d'une photo (téléchargement). */
function originalUrl(src: string) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", "2400");
    url.searchParams.set("dl", "");
    return url.toString();
  }
  return src.startsWith("/") ? `${BASE_PATH}${src}` : src;
}

/**
 * Visionneuse plein écran : clavier (← → Échap), swipe (gauche/droite pour
 * naviguer, bas pour fermer), zoom au clic, plein écran, partage, lien
 * permanent, préchargement des voisines, demande de la photo en HD.
 */
export function Lightbox({ items, permalink, index, onClose, onChange, allowDownload = false }: Props) {
  const open = index !== null;
  const dialogRef = useAnimatedDialog(open, onClose, 400);
  // Garde la dernière image affichée pendant l'animation de fermeture.
  const [shownIndex, setShownIndex] = useState(index ?? 0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const pointerType = useRef("mouse");
  const swiped = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Plein écran : on suit l'état réel (la touche Échap du navigateur le quitte aussi).
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // La vignette active reste visible dans le bandeau.
  useEffect(() => {
    stripRef.current?.querySelector(`[data-thumb="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (index !== null && index !== shownIndex) {
    setDirection(index > shownIndex ? 1 : -1);
    setShownIndex(index);
    setZoom(null);
  }

  const count = items.length;
  const go = useCallback(
    (delta: 1 | -1) => {
      if (index === null) return;
      onChange((index + delta + count) % count);
    },
    [index, count, onChange],
  );

  const close = useCallback(() => {
    setZoom(null);
    if (document.fullscreenElement) void document.exitFullscreen();
    onClose();
  }, [onClose]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void dialogRef.current?.requestFullscreen?.().catch(() => {});
  };

  const share = async () => {
    const url = permalink(shownIndex);
    const title = items[shownIndex]?.title ?? document.title;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* partage annulé par l'utilisateur */
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const item = items[shownIndex];
  if (!item) return null;
  const { photo } = item;
  const exifLine = photo.exif ? [photo.exif.camera, photo.exif.lens, photo.exif.focal, photo.exif.aperture, photo.exif.shutter, photo.exif.iso].filter(Boolean).join("  ·  ") : "";
  const requestHref = `/contact/?photo=${encodeURIComponent(`n°${shownIndex + 1} — ${item.title ?? photo.alt}`)}&lien=${encodeURIComponent(open ? permalink(shownIndex) : "")}`;
  const neighbours = count > 1 ? [items[(shownIndex + 1) % count], items[(shownIndex - 1 + count) % count]] : [];
  // Sans propriété d'affichage : chaque bouton précise la sienne (grid, flex, hidden…).
  const iconButton = "size-11 place-items-center rounded-full text-linen/85 transition-colors duration-300 hover:bg-wash-strong hover:text-linen";

  const toggleZoom = (clientX?: number, clientY?: number) => {
    if (zoom) return setZoom(null);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || clientX === undefined || clientY === undefined) return setZoom({ x: 50, y: 50 });
    setZoom({ x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 });
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerType.current = event.pointerType;
    swiped.current = false;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    // Zoom : la zone agrandie suit le pointeur (souris).
    if (zoom && event.pointerType === "mouse" && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      setZoom({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
    }
  };
  const onPointerUp = (event: ReactPointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || zoom) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    } else if (dy > SWIPE_THRESHOLD * 2 && Math.abs(dy) > Math.abs(dx) * 1.5 && event.pointerType === "touch") {
      swiped.current = true;
      close();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Visionneuse de photos"
      aria-describedby="lightbox-caption"
      className="lightbox fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-linen"
    >
      <div className="lightbox-bg absolute inset-0 bg-night" onClick={close} aria-hidden />

      <div className="relative flex h-full flex-col">
        {/* Barre supérieure */}
        <div className="lightbox-chrome flex items-center justify-between gap-4 px-[var(--gutter)] py-3">
          <div className="flex min-w-0 items-center gap-4">
            <p className="t-mono text-linen" aria-live="polite">
              <span className="sr-only">Photo </span>
              <span className="text-flamingo">{pad(shownIndex + 1)}</span>
              <span className="text-ash"> / {pad(count)}</span>
            </p>
            {item.title ? <p className="hidden truncate t-small text-taupe md:block">{item.title}</p> : null}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={share} className={`${iconButton} flex w-auto items-center gap-2 px-3`} aria-label="Partager cette photo">
              {copied ? <Check size={18} className="text-flamingo" /> : <Share size={18} />}
              <span className="hidden text-[0.8125rem] sm:inline" aria-live="polite">
                {copied ? "Lien copié" : "Partager"}
              </span>
            </button>
            <button type="button" onClick={toggleFullscreen} className={`${iconButton} hidden md:grid`} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"} aria-pressed={fullscreen}>
              {fullscreen ? <Shrink size={19} /> : <Expand size={19} />}
            </button>
            <button type="button" onClick={() => toggleZoom()} className={`${iconButton} hidden sm:grid`} aria-label={zoom ? "Dézoomer" : "Zoomer"} aria-pressed={Boolean(zoom)}>
              {zoom ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
            </button>
            <button type="button" onClick={close} data-autofocus className={`${iconButton} ml-1 grid border border-line-strong`} aria-label="Fermer la visionneuse">
              <Close size={20} />
            </button>
          </div>
        </div>

        {/* Scène */}
        <div className="relative min-h-0 flex-1 px-[var(--gutter)] md:px-24">
          <div
            ref={stageRef}
            className={`lightbox-stage relative h-full w-full touch-pan-y touch-pinch-zoom select-none overflow-hidden ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
            // Souris : un clic zoome. Tactile : double-tap (le simple tap reste libre).
            onClick={(event) => {
              if (pointerType.current === "mouse" && !swiped.current) toggleZoom(event.clientX, event.clientY);
            }}
            onDoubleClick={(event) => {
              if (pointerType.current !== "mouse") toggleZoom(event.clientX, event.clientY);
            }}
          >
            <div
              key={photo.id}
              className="lightbox-image absolute inset-0"
              data-direction={direction}
              style={{ transform: zoom ? "scale(2.2)" : undefined, transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                quality={90}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                className="object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* Précharge les images voisines */}
          {open ? (
            <div aria-hidden className="pointer-events-none absolute size-px overflow-hidden opacity-0">
              {neighbours.map((n) => (
                <Image key={n.photo.id} src={n.photo.src} alt="" width={n.photo.width} height={n.photo.height} sizes="100vw" quality={90} loading="eager" />
              ))}
            </div>
          ) : null}

          {count > 1 ? (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          ) : null}
        </div>

        {/* Bandeau de vignettes */}
        {count > 1 ? (
          <div ref={stripRef} className="lightbox-chrome hidden gap-1.5 overflow-x-auto px-[var(--gutter)] pt-4 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden" aria-label="Toutes les photos de la galerie">
            {items.map((it, i) => (
              <button
                key={it.photo.id}
                type="button"
                data-thumb={i}
                onClick={() => onChange(i)}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-current={i === shownIndex}
                className={`relative h-14 shrink-0 overflow-hidden rounded-[var(--radius-xs)] outline-offset-2 transition-[opacity,outline-color] duration-300 ${
                  i === shownIndex ? "opacity-100 outline-2 outline-flamingo outline-solid" : "opacity-40 outline-transparent hover:opacity-90"
                }`}
                style={{ aspectRatio: `${it.photo.width} / ${it.photo.height}`, backgroundColor: it.photo.color }}
              >
                {open ? <Image src={it.photo.src} alt="" fill sizes="100px" className="object-cover" /> : null}
              </button>
            ))}
          </div>
        ) : null}

        {/* Légende + actions */}
        <div className="lightbox-chrome flex min-h-20 items-end justify-between gap-6 px-[var(--gutter)] pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div id="lightbox-caption" className="min-w-0">
            {item.title ? <p className="truncate text-[0.9375rem] font-medium text-linen md:hidden">{item.title}</p> : null}
            <p className="truncate t-small text-taupe">{item.context ?? photo.alt}</p>
            {exifLine ? <p className="mt-1.5 hidden truncate t-mono text-ash sm:block">{exifLine}</p> : null}
            {photo.credit ? (
              <p className="mt-1 t-mono text-ash">
                Photo temporaire —{" "}
                <a href={photo.credit.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {photo.credit.name}
                </a>{" "}
                / Unsplash
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {allowDownload ? (
              <a
                href={originalUrl(photo.src)}
                download
                className="grid size-12 place-items-center rounded-full bg-wash-strong text-linen transition-colors hover:bg-[rgb(231_231_216/0.16)] sm:flex sm:w-auto sm:gap-2.5 sm:px-5"
                aria-label="Télécharger cette photo"
              >
                <Download size={18} />
                <span className="hidden text-[0.9375rem] font-medium sm:inline">Télécharger</span>
              </a>
            ) : null}
            <Link
              href={requestHref}
              className="group grid size-12 place-items-center rounded-full bg-flamingo text-ink transition-colors hover:bg-tango sm:flex sm:w-auto sm:gap-2.5 sm:px-5"
              aria-label="Demander cette photo en haute définition"
            >
              <span className="hidden text-[0.9375rem] font-medium sm:inline">Demander cette photo</span>
              <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
            </Link>
            {count > 1 ? (
              <div className="flex shrink-0 gap-2 md:hidden">
                <button type="button" onClick={() => go(-1)} className="grid size-12 place-items-center rounded-full border border-line-strong text-linen" aria-label="Photo précédente">
                  <ArrowLeft size={20} />
                </button>
                <button type="button" onClick={() => go(1)} className="grid size-12 place-items-center rounded-full border border-line-strong text-linen" aria-label="Photo suivante">
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      className={`lightbox-nav group absolute top-1/2 hidden -translate-y-1/2 md:grid ${side === "left" ? "left-5" : "right-5"} size-14 place-items-center rounded-full border border-line-strong text-linen transition-colors duration-300 hover:border-flamingo hover:bg-flamingo hover:text-ink`}
    >
      <Icon size={22} className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${side === "left" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
    </button>
  );
}
