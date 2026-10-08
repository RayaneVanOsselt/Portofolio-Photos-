"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Check, Download, GridIcon, Heart, RowsIcon } from "@/components/ui/Icons";
import { useFavorites } from "@/hooks/useFavorites";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { composeGallery, flexFor, sizesFor, type GalleryRow } from "@/lib/gallery-layout";
import type { Photo } from "@/lib/types";
import { pad } from "@/lib/utils";
import { ArchiveDialog } from "./ArchiveDialog";
import { Lightbox } from "./Lightbox";

export type GalleryItem = {
  photo: Photo;
  /** Titre affiché dans la visionneuse (ex. nom de la galerie). */
  title?: string;
  /** Contexte (ex. « FIH Pro League · Red Lions »). */
  context?: string;
};

export type GalleryView = "editorial" | "mosaic";

/** Découpage en chapitres : un en-tête avant chaque tranche de photos [start, end[. */
export type GallerySection = { id: string; start: number; end: number; header: ReactNode };

type Props = {
  /** Identifiant unique sur la page : sert aux liens permanents (#photo-<id>-<n>). */
  id: string;
  items: GalleryItem[];
  /** Libellé accessible de la galerie. */
  label: string;
  /** Les premières images sont prioritaires (galerie en haut de page). */
  priorityCount?: number;
  /** Vue par défaut, tant que le visiteur n'en a pas choisi une. */
  defaultView?: GalleryView;
  /** Affiche la barre (nombre de photos, sélection, téléchargement, choix de la vue). */
  toolbar?: boolean;
  /**
   * Galerie téléchargeable : « Télécharger la galerie » et « Télécharger ma sélection »
   * (archive ZIP nommée `archiveName`). Chaque photo garde son bouton dans la visionneuse.
   */
  download?: { archiveName: string; date?: string };
  /** Chapitres (reportage de match) : la visionneuse reste continue d'un chapitre à l'autre. */
  sections?: GallerySection[];
};

/** Photos affichées d'emblée, puis par lots au défilement : une galerie de 400 photos reste légère. */
const BATCH = 24;

// --- Préférence de vue (stockage local, partagée entre les galeries) --------
const VIEW_KEY = "rayvo:vue-galerie";
const VIEW_EVENT = "rayvo:vue-galerie";
function readView(): GalleryView | null {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === "editorial" || v === "mosaic" ? v : null;
  } catch {
    return null;
  }
}
function subscribeView(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(VIEW_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(VIEW_EVENT, callback);
  };
}
function saveView(view: GalleryView) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    /* stockage indisponible : la vue change quand même pour cette page */
  }
  window.dispatchEvent(new Event(VIEW_EVENT));
}

const pill = "flex h-10 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-medium transition-colors duration-300";

export function Gallery({ id, items, label, priorityCount = 0, defaultView = "editorial", toolbar = false, download, sections }: Props) {
  const stored = useSyncExternalStore(subscribeView, readView, () => null);
  const [localView, setLocalView] = useState<GalleryView | null>(null);
  const view = toolbar ? (localView ?? stored ?? defaultView) : defaultView;

  // Une composition par chapitre (ou une seule pour toute la galerie), indices globaux.
  const groups = useMemo(() => {
    const parts = sections?.length ? sections : [{ id: "all", start: 0, end: items.length, header: null }];
    return parts.map((part) => ({
      ...part,
      rows: composeGallery(items.slice(part.start, part.end).map((item) => item.photo)).map((row) => ({
        ...row,
        items: row.items.map((i) => i + part.start),
      })),
    }));
  }, [items, sections]);
  const [shown, setShown] = useState(BATCH);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [archive, setArchive] = useState<"gallery" | "selection" | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fav = useFavorites(id);
  const selection = fav.favorites.filter((i) => i < items.length);
  const hashPrefix = `#photo-${id}-`;
  // Tant que le lien d'arrivée n'a pas été lu, on ne touche pas à l'adresse.
  const hashRead = useRef(false);
  const visible = Math.min(shown, items.length);
  const remaining = items.length - visible;
  const downloadable = Boolean(download) && items.some((item) => item.photo.download);

  // Lien permanent : /page/#photo-<id>-3 ouvre directement la 3e photo.
  useEffect(() => {
    const fromHash = () => {
      hashRead.current = true;
      if (!location.hash.startsWith(hashPrefix)) return;
      const n = Number(location.hash.slice(hashPrefix.length));
      if (Number.isInteger(n) && n >= 1 && n <= items.length) {
        setShown((s) => Math.max(s, n));
        setOpenIndex(n - 1);
      }
    };
    const timer = window.setTimeout(fromHash, 0);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [hashPrefix, items.length]);

  // L'adresse suit la photo affichée, sans créer d'entrée d'historique.
  useEffect(() => {
    if (!hashRead.current) return;
    const url = `${location.pathname}${location.search}`;
    if (openIndex !== null) history.replaceState(history.state, "", `${url}${hashPrefix}${openIndex + 1}`);
    else if (location.hash.startsWith(hashPrefix)) history.replaceState(history.state, "", url);
  }, [openIndex, hashPrefix]);

  // Lot suivant quand on approche du bas de la galerie.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || remaining <= 0) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setShown((s) => s + BATCH), { rootMargin: "1200px 0px" });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [remaining, view]);

  const permalink = useCallback((index: number) => `${location.origin}${location.pathname}${location.search}${hashPrefix}${index + 1}`, [hashPrefix]);

  // La visionneuse parcourt toute la galerie : la grille suit la photo affichée.
  const changeIndex = useCallback((index: number) => {
    setShown((s) => Math.max(s, index + 1));
    setOpenIndex(index);
  }, []);

  // Mode sélection : un toucher coche la photo au lieu de l'ouvrir.
  const activate = selecting ? fav.toggle : setOpenIndex;

  if (!items.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-14 text-center">
        <p className="t-mono text-ash">Galerie en préparation</p>
        <p className="mt-3 t-small text-taupe">Les photos arrivent bientôt.</p>
      </div>
    );
  }

  const tile = { total: items.length, onActivate: activate, selecting, isSelected: fav.has };

  return (
    <>
      {toolbar ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-y border-line py-3 md:mb-10">
          <p className="t-mono text-taupe">
            <span className="text-linen">{pad(items.length)}</span> photo{items.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelecting((s) => !s)}
              aria-pressed={selecting}
              className={`${pill} ${selecting ? "bg-linen text-ink" : "border border-line-strong text-linen hover:bg-wash-strong"}`}
            >
              {selecting ? <Check size={15} /> : <Heart size={15} />}
              {selecting ? "Terminer" : "Sélectionner"}
            </button>
            {downloadable ? (
              <button
                type="button"
                onClick={() => setArchive("gallery")}
                className={`${pill} border border-line-strong text-linen hover:bg-wash-strong`}
                aria-haspopup="dialog"
                aria-label="Télécharger la galerie"
              >
                <Download size={15} />
                <span aria-hidden className="sm:hidden">
                  Galerie
                </span>
                <span aria-hidden className="hidden sm:inline">
                  Télécharger la galerie
                </span>
              </button>
            ) : null}
            <div role="radiogroup" aria-label="Affichage des photos" className="flex items-center gap-1 rounded-full bg-wash p-1">
              {(
                [
                  { value: "editorial", label: "Éditorial", Icon: RowsIcon },
                  { value: "mosaic", label: "Planche", Icon: GridIcon },
                ] as const
              ).map(({ value, label: viewLabel, Icon }) => {
                const checked = view === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => {
                      setLocalView(value);
                      saveView(value);
                    }}
                    className={`flex h-9 items-center gap-2 rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 ${
                      checked ? "bg-linen text-ink" : "text-taupe hover:text-linen"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden lg:inline">{viewLabel}</span>
                    <span className="sr-only lg:hidden">{viewLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {selecting ? (
            <p className="w-full t-small text-taupe" role="status">
              Touchez les photos pour les ajouter à votre sélection{downloadable ? ", puis téléchargez-les en une fois." : "."}
            </p>
          ) : null}
        </div>
      ) : null}

      {groups.map((group) =>
        group.start < visible ? (
          <Fragment key={group.id}>
            {group.header}
            {view === "mosaic" ? (
              <div className="mosaic" role="list" aria-label={label}>
                {items.slice(group.start, Math.min(group.end, visible)).map((item, k) => {
                  const index = group.start + k;
                  return (
                    <div key={item.photo.id} role="listitem" className="mosaic-item" style={{ "--r": (item.photo.width / item.photo.height).toFixed(4) } as CSSProperties}>
                      <TileButton item={item} index={index} {...tile}>
                        <PhotoImage
                          photo={item.photo}
                          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 40vw, 60vw"
                          priority={index < priorityCount}
                          className="rounded-[var(--radius-xs)]"
                        />
                      </TileButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="gallery" role="list" aria-label={label}>
                {group.rows
                  .filter((row) => row.items[0] < visible)
                  .map((row) => (
                    <Row key={`${group.id}-${row.items[0]}`} row={row} items={items} priorityCount={priorityCount} tile={tile} />
                  ))}
              </div>
            )}
          </Fragment>
        ) : null,
      )}

      {remaining > 0 ? (
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((s) => s + BATCH)}
            className="flex h-12 items-center gap-3 rounded-full border border-line-strong px-6 text-[0.9375rem] text-linen transition-colors hover:bg-wash-strong"
          >
            Afficher plus de photos
            <span className="t-mono text-ash">+{remaining}</span>
          </button>
        </div>
      ) : null}

      {selection.length ? (
        <div role="region" aria-label="Ma sélection" className="selection-bar sticky bottom-4 z-30 mx-auto mt-10 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-[1.75rem] border border-line-strong bg-night/90 p-2 pl-5 backdrop-blur-xl">
          <span className="flex items-center gap-2 text-[0.875rem] text-linen">
            <Heart size={16} filled className="text-flamingo" />
            <span>
              <span className="font-mono">{pad(selection.length)}</span> photo{selection.length > 1 ? "s" : ""} sélectionnée{selection.length > 1 ? "s" : ""}
            </span>
          </span>
          <button type="button" onClick={fav.clear} className="h-10 rounded-full px-3 text-[0.8125rem] text-taupe transition-colors hover:text-linen">
            Vider
          </button>
          {selection.length < items.length ? (
            <button type="button" onClick={() => fav.set(items.map((_, i) => i))} className="h-10 rounded-full px-3 text-[0.8125rem] text-taupe transition-colors hover:text-linen">
              Tout
            </button>
          ) : null}
          {downloadable ? (
            <button type="button" onClick={() => setArchive("selection")} aria-haspopup="dialog" className="flex h-10 items-center gap-2 rounded-full bg-flamingo px-5 text-[0.875rem] font-medium text-ink transition-colors hover:bg-tango">
              <Download size={16} />
              Télécharger
            </button>
          ) : null}
          <Link
            href={`/contact/?photo=${encodeURIComponent(`n° ${selection.map((i) => i + 1).join(", ")} — ${items[0]?.title ?? label}`)}&lien=${encodeURIComponent(typeof window === "undefined" ? "" : `${location.origin}${location.pathname}`)}`}
            className={`flex h-10 items-center rounded-full px-5 text-[0.875rem] font-medium transition-colors ${downloadable ? "border border-line-strong text-linen hover:bg-wash-strong" : "bg-flamingo text-ink hover:bg-tango"}`}
          >
            {downloadable ? "Demander en HD" : "Demander ma sélection"}
          </Link>
        </div>
      ) : null}

      <Lightbox items={items} favorite={{ has: fav.has, toggle: fav.toggle }} permalink={permalink} index={openIndex} onClose={() => setOpenIndex(null)} onChange={changeIndex} />

      {downloadable && download ? (
        <ArchiveDialog
          open={archive !== null}
          onClose={() => setArchive(null)}
          title={archive === "selection" ? "Télécharger ma sélection" : "Télécharger la galerie"}
          archiveName={archive === "selection" ? `${download.archiveName}-selection` : download.archiveName}
          photos={archive === "selection" ? selection.map((i) => items[i].photo) : items.map((item) => item.photo)}
          date={download.date}
        />
      ) : null}
    </>
  );
}

type TileProps = { total: number; onActivate: (index: number) => void; selecting: boolean; isSelected: (index: number) => boolean };

function Row({ row, items, priorityCount, tile }: { row: GalleryRow; items: GalleryItem[]; priorityCount: number; tile: TileProps }) {
  const rowPhotos = row.items.map((i) => items[i].photo);
  const portraits = rowPhotos.filter((p) => p.width < p.height).length;

  const tiles = row.items.map((index, k) => {
    const item = items[index];
    const priority = index < priorityCount;
    return (
      <div
        key={item.photo.id}
        role="listitem"
        className="gallery-tile"
        style={{ "--flex": flexFor(item.photo), "--ratio": `${item.photo.width / item.photo.height}` } as CSSProperties}
      >
        <TileButton item={item} index={index} {...tile}>
          <div data-reveal={priority ? undefined : "image"} style={{ "--reveal-delay": `${k * 90}ms` } as CSSProperties}>
            <PhotoImage photo={item.photo} sizes={sizesFor(row.kind, item.photo, rowPhotos)} priority={priority} className="rounded-[var(--radius-xs)]" />
          </div>
        </TileButton>
      </div>
    );
  });

  if (row.kind === "solo") {
    const item = items[row.items[0]];
    const portrait = item.photo.width < item.photo.height;
    return (
      <div className="gallery-row gallery-row--solo" data-align={row.align} data-spacing={row.spacing} data-portrait={portrait}>
        {tiles}
        <div className="gallery-aside" data-reveal style={{ "--reveal-delay": "180ms" } as CSSProperties}>
          <p className="t-mono text-ash">
            <span className="text-flamingo">{pad(row.items[0] + 1)}</span> / {pad(tile.total)}
          </p>
          {item.title ? <p className="mt-3 text-lg font-medium tracking-[-0.015em] text-linen">{item.title}</p> : null}
          {item.context ? <p className="mt-1 t-small text-taupe">{item.context}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`gallery-row gallery-row--${row.kind}`} data-align={row.align} data-spacing={row.spacing} data-portraits={portraits}>
      {tiles}
    </div>
  );
}

function TileButton({ item, index, total, onActivate, selecting, isSelected, children }: TileProps & { item: GalleryItem; index: number; children: React.ReactNode }) {
  const selected = isSelected(index);
  return (
    <button
      type="button"
      onClick={() => onActivate(index)}
      className={`photo-hover group relative block w-full rounded-[var(--radius-xs)] text-left ${selecting && selected ? "outline-2 outline-offset-2 outline-flamingo outline-solid" : ""}`}
      aria-label={
        selecting
          ? `${selected ? "Retirer de" : "Ajouter à"} ma sélection la photo ${index + 1} sur ${total} : ${item.photo.alt}`
          : `Agrandir la photo ${index + 1} sur ${total}${selected ? " (dans ma sélection)" : ""} : ${item.photo.alt}`
      }
      aria-pressed={selecting ? selected : undefined}
      aria-haspopup={selecting ? undefined : "dialog"}
    >
      {children}
      {selected || selecting ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute top-2 left-2 grid size-8 place-items-center rounded-full transition-colors duration-200 ${
            selected ? "bg-flamingo text-ink" : "border-2 border-linen/90 bg-ink/40 backdrop-blur-sm"
          }`}
        >
          {selected ? selecting ? <Check size={15} /> : <Heart size={15} filled /> : null}
        </span>
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-ink/70 px-2 py-1 font-mono text-[0.625rem] tracking-[0.12em] text-linen opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {pad(index + 1)}
      </span>
    </button>
  );
}
