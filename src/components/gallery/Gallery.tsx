"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { GridIcon, RowsIcon } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { composeGallery, flexFor, sizesFor, type GalleryRow } from "@/lib/gallery-layout";
import type { Photo } from "@/lib/types";
import { pad } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

export type GalleryItem = {
  photo: Photo;
  /** Titre affiché dans la visionneuse (ex. nom de la galerie). */
  title?: string;
  /** Contexte (ex. « FIH Pro League · Red Lions »). */
  context?: string;
};

export type GalleryView = "editorial" | "mosaic";

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
  /** Affiche la barre (nombre de photos + choix de la vue). */
  toolbar?: boolean;
  /** Bouton « Télécharger » dans la visionneuse. */
  allowDownload?: boolean;
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

export function Gallery({ id, items, label, priorityCount = 0, defaultView = "editorial", toolbar = false, allowDownload = false }: Props) {
  const stored = useSyncExternalStore(subscribeView, readView, () => null);
  const [localView, setLocalView] = useState<GalleryView | null>(null);
  const view = toolbar ? (localView ?? stored ?? defaultView) : defaultView;

  const rows = useMemo(() => composeGallery(items.map((item) => item.photo)), [items]);
  const [shown, setShown] = useState(BATCH);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hashPrefix = `#photo-${id}-`;
  // Tant que le lien d'arrivée n'a pas été lu, on ne touche pas à l'adresse.
  const hashRead = useRef(false);
  const visible = Math.min(shown, items.length);
  const remaining = items.length - visible;

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

  if (!items.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-14 text-center">
        <p className="t-mono text-ash">Galerie en préparation</p>
        <p className="mt-3 t-small text-taupe">Les photos arrivent bientôt.</p>
      </div>
    );
  }

  return (
    <>
      {toolbar ? (
        <div className="mb-8 flex items-center justify-between gap-4 border-y border-line py-3 md:mb-10">
          <p className="t-mono text-taupe">
            <span className="text-linen">{pad(items.length)}</span> photo{items.length > 1 ? "s" : ""}
          </p>
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
                  <span className="hidden sm:inline">{viewLabel}</span>
                  <span className="sr-only sm:hidden">{viewLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "mosaic" ? (
        <div className="mosaic" role="list" aria-label={label}>
          {items.slice(0, visible).map((item, index) => (
            <div key={item.photo.id} role="listitem" className="mosaic-item" style={{ "--r": (item.photo.width / item.photo.height).toFixed(4) } as CSSProperties}>
              <TileButton item={item} index={index} total={items.length} onOpen={setOpenIndex}>
                <PhotoImage
                  photo={item.photo}
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 40vw, 60vw"
                  priority={index < priorityCount}
                  className="rounded-[var(--radius-xs)]"
                />
              </TileButton>
            </div>
          ))}
        </div>
      ) : (
        <div className="gallery" role="list" aria-label={label}>
          {rows
            .filter((row) => row.items[0] < visible)
            .map((row, r) => (
              <Row key={`${r}-${row.items[0]}`} row={row} items={items} total={items.length} priorityCount={priorityCount} onOpen={setOpenIndex} />
            ))}
        </div>
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

      <Lightbox items={items} permalink={permalink} index={openIndex} onClose={() => setOpenIndex(null)} onChange={changeIndex} allowDownload={allowDownload} />
    </>
  );
}

function Row({ row, items, total, priorityCount, onOpen }: { row: GalleryRow; items: GalleryItem[]; total: number; priorityCount: number; onOpen: (index: number) => void }) {
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
        <TileButton item={item} index={index} total={total} onOpen={onOpen}>
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
            <span className="text-flamingo">{pad(row.items[0] + 1)}</span> / {pad(total)}
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

function TileButton({ item, index, total, onOpen, children }: { item: GalleryItem; index: number; total: number; onOpen: (index: number) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="photo-hover group relative block w-full rounded-[var(--radius-xs)] text-left"
      aria-label={`Agrandir la photo ${index + 1} sur ${total} : ${item.photo.alt}`}
      aria-haspopup="dialog"
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-ink/70 px-2 py-1 font-mono text-[0.625rem] tracking-[0.12em] text-linen opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {pad(index + 1)}
      </span>
    </button>
  );
}
