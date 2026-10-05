"use client";

import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { Camera, Clock, Images, PageIcon } from "@/components/ui/Icons";
import { matchRanges, type SearchItem } from "@/lib/search";
import { publicPath } from "@/lib/utils";

/** Éléments partagés par la palette de recherche et la page /search. */

export function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = matchRanges(text, query);
  if (!ranges.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) parts.push(<Fragment key={`t${i}`}>{text.slice(cursor, start)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="bg-transparent text-flamingo underline decoration-flamingo/50 underline-offset-[3px]">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>);
  return <>{parts}</>;
}

export function Thumb({ item, recent, size = "size-14", sizes = "64px" }: { item: SearchItem; recent?: boolean; size?: string; sizes?: string }) {
  if (item.thumb?.logo) {
    return (
      <span className={`grid ${size} shrink-0 place-items-center rounded-[var(--radius-sm)] bg-wash-strong`}>
        <span className="grid size-[78%] place-items-center rounded-full bg-white">
          <Image src={publicPath(item.thumb.src)} alt="" width={48} height={48} unoptimized className="h-[68%] w-[68%] object-contain" />
        </span>
      </span>
    );
  }
  if (item.thumb) {
    return (
      <span className={`relative ${size} shrink-0 overflow-hidden rounded-[var(--radius-sm)]`} style={{ backgroundColor: item.thumb.color }}>
        <Image src={item.thumb.src} alt="" fill sizes={sizes} className="object-cover" />
      </span>
    );
  }
  const Icon = recent ? Clock : item.type === "Service" ? Camera : item.type === "Album" ? Images : PageIcon;
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-[var(--radius-sm)] bg-wash-strong text-linen`}>
      <Icon size={20} />
    </span>
  );
}

/** Ligne de métadonnées d'un résultat : contexte · date · nombre de photos. */
export function ResultMeta({ item, query }: { item: SearchItem; query: string }) {
  return (
    <>
      <Highlight text={item.context} query={query} />
      {item.date ? (
        <>
          {" · "}
          <Highlight text={item.date} query={query} />
        </>
      ) : null}
      {item.count ? ` · ${item.count} photos` : item.type === "Album" ? " · photos à venir" : null}
    </>
  );
}
