import { ArrowUpRight, Instagram } from "@/components/ui/Icons";

/** Une image du flux Behold : WebP hébergé par Behold (400, 700, 1000, 2000 px de côté max). */
type FeedSize = { mediaUrl?: string; width?: number; height?: number };

/** Un post tel que décrit par le flux JSON de Behold (https://behold.so/docs/json-feeds). */
export type FeedPost = {
  id: string;
  permalink: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  isReel?: boolean;
  /** Original Instagram (très lourd ; pour une vidéo, c'est le fichier vidéo) : jamais affiché. */
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: Partial<Record<"small" | "medium" | "large" | "full", FeedSize>>;
  caption?: string;
  prunedCaption?: string;
  altText?: string;
  timestamp?: string;
  colorPalette?: { dominant?: string };
};

/** Versions de l'image à proposer au navigateur (srcset), de la plus petite à la plus grande. */
function sources(post: FeedPost) {
  const list = (["small", "medium", "large"] as const)
    .map((key) => post.sizes?.[key])
    .filter((size): size is Required<FeedSize> => Boolean(size?.mediaUrl && size.width && size.height));
  const fallback = list[1]?.mediaUrl ?? list[0]?.mediaUrl ?? post.thumbnailUrl ?? (post.mediaType === "VIDEO" ? undefined : post.mediaUrl);
  return { src: fallback, srcSet: list.length ? list.map((s) => `${s.mediaUrl} ${s.width}w`).join(", ") : undefined };
}

/** Posts affichables : un lien et une image (les vidéos passent par leur image d'aperçu). */
export function usablePosts(posts: FeedPost[], count: number) {
  return posts.filter((post) => post.permalink && sources(post).src).slice(0, count);
}

/**
 * Les derniers posts Instagram, en grille. Rendu à la publication du site (voir
 * InstagramSection) : aucun appel au flux pendant les visites, les images sont
 * chargées directement depuis Behold.
 */
export function InstagramFeed({ posts, profileUrl, handle }: { posts: FeedPost[]; profileUrl: string; handle: string }) {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-14 lg:grid-cols-6 lg:gap-3">
      {posts.map((post) => {
        const caption = (post.prunedCaption ?? post.caption ?? "").trim();
        const { src, srcSet } = sources(post);
        const video = post.mediaType === "VIDEO";
        return (
          <li key={post.id}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-ink-soft"
              style={post.colorPalette?.dominant ? { backgroundColor: `rgb(${post.colorPalette.dominant})` } : undefined}
              aria-label={caption ? `Post Instagram : ${caption.slice(0, 120)}` : `Post Instagram de ${handle}`}
            >
              {/* Images servies par Behold (déjà optimisées) : simple <img> différée, pas de next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                srcSet={srcSet}
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                alt={post.altText ?? ""}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <span className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,transparent_40%,rgb(19_20_18/0.85))] p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="line-clamp-3 text-[0.8125rem] leading-snug text-linen">{caption || "Voir sur Instagram"}</span>
              </span>
              {video ? (
                <span aria-hidden className="absolute top-2 right-2 rounded-full bg-ink/60 px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.1em] text-linen uppercase backdrop-blur-md">
                  {post.isReel ? "Reel" : "Vidéo"}
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
