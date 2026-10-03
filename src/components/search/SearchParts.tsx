"use client";

import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { Camera, Clock, PageIcon } from "@/components/ui/Icons";
import { matchRanges, type SearchItem } from "@/lib/search";

/** Éléments partagés par la palette de recherche et la page /search. */

export function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = matchRanges(text, query);
  if (!ranges.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) parts.push(<Fragment key={`t${i}`}>{text.slice(cursor, start)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="rounded-[2px] bg-phosphor/15 text-phosphor">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>);
  return <>{parts}</>;
}

export function Thumb({ item, recent, size = "size-12", sizes = "64px" }: { item: SearchItem; recent?: boolean; size?: string; sizes?: string }) {
  if (item.thumb) {
    return (
      <span className={`relative ${size} shrink-0 overflow-hidden rounded-[var(--radius-sm)]`} style={{ backgroundColor: item.thumb.color }}>
        <Image src={item.thumb.src} alt="" fill sizes={sizes} className="object-cover" />
      </span>
    );
  }
  const Icon = recent ? Clock : item.type === "Service" ? Camera : PageIcon;
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-[var(--radius-sm)] bg-kelp text-mist`}>
      <Icon size={20} />
    </span>
  );
}

