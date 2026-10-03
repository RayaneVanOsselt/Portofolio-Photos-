"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { composeGallery, flexFor, sizesFor, type GalleryRow } from "@/lib/gallery-layout";
import type { Photo } from "@/lib/types";
import { pad } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

export type GalleryItem = {
  photo: Photo;
  /** Titre affiché dans la lightbox (ex. nom de la série). */
  title?: string;
  /** Contexte (ex. « FIH Pro League · Red Lions »). */
  context?: string;
};

type Props = {
  items: GalleryItem[];
  /** Libellé accessible de la galerie. */
  label: string;
  /** Les premières images sont prioritaires (galerie en haut de page). */
  priorityCount?: number;
};

export function Gallery({ items, label, priorityCount = 0 }: Props) {
  const rows = useMemo(() => composeGallery(items.map((item) => item.photo)), [items]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) {
    return <p className="t-small text-silver">Les photos de cette série arrivent bientôt.</p>;
  }

  return (
    <>
      <div className="gallery" role="list" aria-label={label}>
        {rows.map((row, r) => (
          <Row key={`${r}-${row.items[0]}`} row={row} items={items} total={items.length} priorityCount={priorityCount} onOpen={setOpenIndex} />
        ))}
      </div>
      <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
    </>
  );
}

function Row({
  row,
  items,
  total,
  priorityCount,
  onOpen,
}: {
  row: GalleryRow;
  items: GalleryItem[];
  total: number;
  priorityCount: number;
  onOpen: (index: number) => void;
}) {
  const rowPhotos = row.items.map((i) => items[i].photo);
  const portraits = rowPhotos.filter((p) => p.width < p.height).length;

  const tiles = row.items.map((index, k) => (
    <Tile
      key={items[index].photo.id}
      item={items[index]}
      index={index}
      total={total}
      sizes={sizesFor(row.kind, items[index].photo, rowPhotos)}
      priority={index < priorityCount}
      delay={k * 90}
      style={{ "--flex": flexFor(items[index].photo) } as CSSProperties}
      onOpen={onOpen}
    />
  ));

  if (row.kind === "solo") {
    const item = items[row.items[0]];
    const portrait = item.photo.width < item.photo.height;
    return (
      <div className="gallery-row gallery-row--solo" data-align={row.align} data-spacing={row.spacing} data-portrait={portrait}>
        {tiles}
        <div className="gallery-aside" data-reveal style={{ "--reveal-delay": "180ms" } as CSSProperties}>
          <p className="t-caption t-tabular text-phosphor">
            {pad(row.items[0] + 1)} <span className="text-silver">/ {pad(total)}</span>
          </p>
          {item.title ? <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-platinum">{item.title}</p> : null}
          {item.context ? <p className="mt-1 t-small text-silver">{item.context}</p> : null}
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

function Tile({
  item,
  index,
  total,
  sizes,
  priority,
  delay,
  style,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  sizes: string;
  priority: boolean;
  delay: number;
  style: CSSProperties;
  onOpen: (index: number) => void;
}) {
  const { photo } = item;
  return (
    <div role="listitem" className="gallery-tile" style={{ ...style, "--ratio": `${photo.width / photo.height}` } as CSSProperties}>
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="photo-hover group block w-full text-left"
        data-cursor="view"
        aria-label={`Agrandir la photo ${index + 1} sur ${total} : ${photo.alt}`}
        aria-haspopup="dialog"
      >
        <div data-reveal={priority ? undefined : "image"} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
          <PhotoImage photo={photo} sizes={sizes} priority={priority} />
        </div>
      </button>
    </div>
  );
}
