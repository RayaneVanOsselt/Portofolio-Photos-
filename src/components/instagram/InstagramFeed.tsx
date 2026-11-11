"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Instagram } from "@/components/ui/Icons";

/** Un post tel que décrit par le flux JSON de Behold (anciens et nouveaux formats). */
type FeedPost = {
  id: string;
  permalink: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  prunedCaption?: string;
  timestamp?: string;
  sizes?: Partial<Record<"small" | "medium" | "large" | "full", { mediaUrl?: string }>>;
};

type State = { kind: "loading" } | { kind: "ready"; posts: FeedPost[] } | { kind: "error" };

/** Image à afficher : la taille moyenne si le flux la fournit, sinon l'aperçu (vidéo) ou l'original. */
const imageOf = (post: FeedPost) =>
  post.sizes?.medium?.mediaUrl ?? post.sizes?.small?.mediaUrl ?? (post.mediaType === "VIDEO" ? post.thumbnailUrl : post.mediaUrl) ?? post.thumbnailUrl;

/**
 * Les derniers posts Instagram, lus dans le navigateur depuis un flux JSON public
 * (Behold : aucun mot de passe ni jeton Instagram dans le site). En attendant le
 * flux, ou s'il ne répond pas, rien ne casse : le bloc garde son lien « Suivre ».
 */
export function InstagramFeed({ feedUrl, profileUrl, handle, count = 6 }: { feedUrl: string; profileUrl: string; handle: string; count?: number }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(feedUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: FeedPost[] | { posts?: FeedPost[] }) => {
        const posts = (Array.isArray(data) ? data : (data.posts ?? [])).filter((post) => post.permalink && imageOf(post)).slice(0, count);
        setState(posts.length ? { kind: "ready", posts } : { kind: "error" });
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") setState({ kind: "error" });
      });
    return () => controller.abort();
  }, [feedUrl, count]);

  if (state.kind === "error") return null;

  return (
    <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-14 lg:grid-cols-6 lg:gap-3" aria-busy={state.kind === "loading"}>
      {state.kind === "loading"
        ? Array.from({ length: count }, (_, i) => <li key={i} className="aspect-square animate-pulse rounded-[var(--radius-sm)] bg-wash-strong" />)
        : state.posts.map((post) => {
            const caption = (post.prunedCaption ?? post.caption ?? "").trim();
            return (
              <li key={post.id}>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-ink-soft"
                  aria-label={caption ? `Post Instagram : ${caption.slice(0, 120)}` : `Post Instagram de ${handle}`}
                >
                  {/* Images servies par Instagram : pas d'optimisation possible, simple <img> différée. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageOf(post)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  <span className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,transparent_40%,rgb(19_20_18/0.85))] p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="line-clamp-3 text-[0.8125rem] leading-snug text-linen">{caption || "Voir sur Instagram"}</span>
                  </span>
                  {post.mediaType === "VIDEO" ? (
                    <span aria-hidden className="absolute top-2 right-2 rounded-full bg-ink/60 px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.1em] text-linen uppercase backdrop-blur-md">
                      Vidéo
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
      <li className="col-span-2 sm:col-span-3 lg:hidden">
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 t-mono text-taupe hover:text-linen">
          <Instagram size={15} /> Tous les posts sur Instagram <ArrowUpRight size={14} />
        </a>
      </li>
    </ul>
  );
}
