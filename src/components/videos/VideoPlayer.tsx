"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { Expand, Pause, Play, Replay, Shrink, Volume } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import type { Video } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { posterBackdrop, VideoPoster } from "./VideoPoster";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type Props = {
  video: Video;
  /** Lecture dès l'affichage (ouverture du lecteur plein écran). Muette si le navigateur refuse le son. */
  autoPlay?: boolean;
  /** Reçoit le focus à l'ouverture (raccourcis clavier immédiatement actifs). */
  autoFocus?: boolean;
  /** Image d'aperçu prioritaire (lecteur visible dès l'arrivée sur la page). */
  priority?: boolean;
  /** Largeur affichée du lecteur (srcset de l'image d'aperçu). */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** Vidéo suivante, proposée à la fin de la lecture. */
  next?: { title: string; onPlay: () => void };
};

/**
 * Lecteur vidéo du site. Rien n'est téléchargé avant « Lecture » (image d'aperçu
 * seulement) ; la vidéo démarre ensuite dès les premiers octets (MP4 « faststart »).
 *
 * - Barre de lecture avec aperçu des images au survol, mémoire tampon visible.
 * - Clavier : Espace / K lecture, ← → ±5 s, J / L ±10 s, M son, F plein écran.
 * - Commandes masquées pendant la lecture, réaffichées au moindre mouvement.
 */
export function VideoPlayer({ video, autoPlay = false, autoFocus = false, priority = false, sizes, className = "", style, next }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const pendingSeek = useRef<number | null>(null);
  const idleTimer = useRef(0);
  const bezelId = useRef(0);

  const [requested, setRequested] = useState(autoPlay);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(video.duration);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [forcedMute, setForcedMute] = useState(false);
  const [idle, setIdle] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number; width: number } | null>(null);
  const [bezel, setBezel] = useState<{ id: number; playing: boolean } | null>(null);

  /** Branche le fichier (au premier « Lecture ») ; `at` : reprise à cette seconde une fois le fichier ouvert. */
  const attach = useCallback(
    (at = 0) => {
      const v = videoRef.current;
      if (!v) return;
      pendingSeek.current = at > 0.25 ? at : null;
      v.src = video.file.src;
    },
    [video],
  );

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.getAttribute("src")) attach();
    v.play().catch((error: DOMException) => {
      if (error.name !== "NotAllowedError") return;
      // Son refusé sans geste du visiteur : lecture muette, avec un bouton « Activer le son ».
      v.muted = true;
      setForcedMute(true);
      v.play().catch(() => {});
    });
  }, [attach]);

  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  }, []);

  // Lecteur plein écran : la lecture démarre à l'ouverture.
  useEffect(() => {
    if (autoPlay) play();
  }, [autoPlay, play]);

  // Fermeture ou changement de vidéo : on arrête aussi le téléchargement en cours.
  useEffect(() => {
    const v = videoRef.current;
    const timer = idleTimer;
    return () => {
      window.clearTimeout(timer.current);
      if (!v) return;
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Barre de progression fluide (60 i/s) pendant la lecture, sans re-rendu React.
  useEffect(() => {
    if (paused) return;
    let frame = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v?.duration) rootRef.current?.style.setProperty("--progress", String(v.currentTime / v.duration));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  // ------------------------------------------------------------- actions

  function flash(playing: boolean) {
    bezelId.current += 1;
    setBezel({ id: bezelId.current, playing });
  }

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      setRequested(true);
      setEnded(false);
      play();
      if (started) flash(true);
    } else {
      v.pause();
      flash(false);
    }
  }

  function seekTo(seconds: number, fast = false) {
    const v = videoRef.current;
    if (!v || !started) return;
    const t = clamp(seconds, 0, duration);
    if (fast && "fastSeek" in v) v.fastSeek(t);
    else v.currentTime = t;
    rootRef.current?.style.setProperty("--progress", String(t / duration));
    setTime(t);
    if (t < duration) setEnded(false);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 1;
    setForcedMute(false);
  }

  function toggleFullscreen() {
    const root = rootRef.current;
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!root || !v) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    // iPhone : plein écran du lecteur natif.
    else v.webkitEnterFullscreen?.();
  }

  // ------------------------------------------------------------ événements

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onButton = target !== rootRef.current && Boolean(target.closest("button, a"));
    const onSlider = Boolean(target.closest("input, [role=slider]"));
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    switch (key) {
      case " ":
      case "k":
        if (key === " " && (onButton || onSlider)) return;
        toggle();
        break;
      case "ArrowLeft":
      case "ArrowRight":
        if (onSlider) return;
        seekTo(time + (key === "ArrowLeft" ? -5 : 5));
        break;
      case "j":
      case "l":
        seekTo(time + (key === "j" ? -10 : 10));
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      default:
        return;
    }
    event.preventDefault();
    wake();
  }

  /** Clic sur l'image : lecture / pause à la souris ; au doigt, le premier toucher réaffiche les commandes. */
  function onSurface(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (event.pointerType !== "mouse" && idle && !paused) return wake();
    toggle();
    wake();
  }

  const timeAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return { x: ratio * rect.width, t: ratio * duration, width: rect.width };
  };

  function onTrackDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setScrubbing(true);
    const point = timeAt(event.clientX);
    setHover(point);
    seekTo(point.t, true);
  }

  function onTrackMove(event: PointerEvent<HTMLDivElement>) {
    if (!scrubbing && event.pointerType !== "mouse") return;
    const point = timeAt(event.clientX);
    setHover(point);
    if (scrubbing) seekTo(point.t, true);
  }

  function onTrackUp(event: PointerEvent<HTMLDivElement>) {
    if (!scrubbing) return;
    setScrubbing(false);
    seekTo(timeAt(event.clientX).t);
    if (event.pointerType !== "mouse") setHover(null);
  }

  function onTrackKey(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -duration / 10, PageUp: duration / 10 };
    if (event.key in steps) seekTo(time + steps[event.key]);
    else if (event.key === "Home") seekTo(0);
    else if (event.key === "End") seekTo(duration - 0.1);
    else return;
    event.preventDefault();
    event.stopPropagation();
    wake();
  }

  function onPlay() {
    setPaused(false);
    setEnded(false);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: video.title,
        artist: siteConfig.name,
        artwork: [{ src: video.poster.src, sizes: `${video.poster.width}x${video.poster.height}`, type: "image/webp" }],
      });
    }
  }

  function onLoadedMetadata() {
    const v = videoRef.current!;
    if (Number.isFinite(v.duration)) setDuration(v.duration);
    if (pendingSeek.current !== null) {
      v.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
  }

  function onProgress() {
    const v = videoRef.current!;
    let end = 0;
    for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime + 0.5) end = Math.max(end, v.buffered.end(i));
    setBuffered(end);
  }

  function onTimeUpdate() {
    const v = videoRef.current!;
    setTime(v.currentTime);
    if (v.duration) rootRef.current?.style.setProperty("--progress", String(v.currentTime / v.duration));
  }

  // ------------------------------------------------------------------ rendu

  const controls = started && (paused || !idle || scrubbing || ended);
  const loading = requested && !failed && !ended && (waiting || !started);
  const board = video.storyboard;
  const frame = hover ? Math.min(board.count - 1, Math.round(hover.t / board.interval)) : 0;
  const button = "grid size-10 place-items-center rounded-full text-linen transition-colors hover:bg-linen/15 focus-visible:bg-linen/15";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={`Lecteur vidéo — ${video.title}`}
      tabIndex={-1}
      data-autofocus={autoFocus ? "" : undefined}
      data-controls={controls ? "shown" : "hidden"}
      data-idle={started && !paused && idle && !scrubbing ? "true" : undefined}
      className={`player relative isolate overflow-hidden outline-none select-none ${className}`}
      style={{ ...posterBackdrop(video), aspectRatio: `${video.width} / ${video.height}`, ...style }}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-contain"
        playsInline
        preload="none"
        onPlay={onPlay}
        onPause={() => setPaused(true)}
        onPlaying={() => {
          setStarted(true);
          setWaiting(false);
          setFailed(false);
        }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onEnded={() => {
          setEnded(true);
          setPaused(true);
        }}
        onLoadedMetadata={onLoadedMetadata}
        onProgress={onProgress}
        onTimeUpdate={onTimeUpdate}
        onVolumeChange={() => {
          setMuted(videoRef.current!.muted);
          setVolume(videoRef.current!.volume);
        }}
        onError={() => {
          if (videoRef.current?.getAttribute("src")) setFailed(true);
        }}
      />

      {/* Image d'aperçu (AVIF, plusieurs largeurs) jusqu'à la première image de la vidéo */}
      <VideoPoster video={video} sizes={sizes} priority={priority} className={`player-poster absolute inset-0 size-full object-contain ${started ? "opacity-0" : ""}`} />

      {/* Surface : clic = lecture / pause, double-clic = plein écran */}
      {started ? <div aria-hidden className="absolute inset-0 z-[1]" onPointerUp={onSurface} onDoubleClick={toggleFullscreen} /> : null}

      {!started && !loading && !failed ? (
        <button type="button" onClick={toggle} className="player-start absolute inset-0 z-10 grid place-items-center" aria-label={`Lire la vidéo « ${video.title} »`}>
          <span className="player-start-button relative grid size-20 place-items-center rounded-full bg-flamingo text-ink md:size-24">
            <Play size={30} className="translate-x-0.5" />
          </span>
        </button>
      ) : null}

      {loading ? <span aria-hidden className="player-spinner absolute top-1/2 left-1/2 z-10 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full" /> : null}
      {loading ? <span className="sr-only" role="status">Chargement de la vidéo…</span> : null}

      {bezel ? (
        <span key={bezel.id} aria-hidden className="player-bezel pointer-events-none absolute top-1/2 left-1/2 z-10 grid size-20 place-items-center rounded-full bg-night/55 text-linen">
          {bezel.playing ? <Play size={28} className="translate-x-0.5" /> : <Pause size={28} />}
        </span>
      ) : null}

      {forcedMute && muted ? (
        <button type="button" onClick={toggleMute} className="absolute top-4 left-4 z-20 inline-flex h-10 items-center gap-2 rounded-full bg-linen px-4 text-[0.8125rem] font-medium text-ink shadow-lg">
          <Volume size={16} muted />
          Activer le son
        </button>
      ) : null}

      {failed ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-night/80 p-6 text-center">
          <div>
            <p className="t-mono text-flamingo">Lecture impossible</p>
            <p className="mt-3 max-w-[28ch] t-small text-taupe">La vidéo ne répond pas pour le moment. Réessayez dans un instant.</p>
            <button type="button" onClick={() => (setFailed(false), attach(time), play())} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-wash-strong px-5 text-[0.875rem] text-linen hover:bg-linen/20">
              <Replay size={16} />
              Réessayer
            </button>
          </div>
        </div>
      ) : null}

      {ended ? (
        <div className="player-end absolute inset-0 z-20 grid place-items-center bg-night/70 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <button type="button" onClick={toggle} className="inline-flex h-12 items-center gap-2.5 rounded-full bg-wash-strong px-6 text-[0.9375rem] font-medium text-linen hover:bg-linen/20">
              <Replay size={18} />
              Revoir
            </button>
            {next ? (
              <button type="button" onClick={next.onPlay} className="inline-flex min-h-12 max-w-full items-center gap-2.5 rounded-full bg-flamingo px-6 py-2 text-left text-[0.9375rem] font-medium text-ink hover:bg-tango">
                <Play size={16} />
                <span className="min-w-0">
                  <span className="block font-mono text-[0.625rem] tracking-[0.16em] uppercase opacity-70">Vidéo suivante</span>
                  <span className="block truncate">{next.title}</span>
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* -------------------------------------------------------- commandes */}
      {started ? (
        <div className="player-controls absolute inset-x-0 bottom-0 z-20 px-2 pt-12 pb-1.5 md:px-4 md:pb-3">
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Position dans la vidéo"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatDuration(time)} sur ${formatDuration(duration)}`}
            className="player-track group/track relative mx-2 h-6 cursor-pointer touch-none"
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onPointerUp={onTrackUp}
            onPointerCancel={() => setScrubbing(false)}
            onPointerLeave={() => !scrubbing && setHover(null)}
            onKeyDown={onTrackKey}
          >
            <span className="player-rail absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-linen/25">
              <span className="absolute inset-y-0 left-0 bg-linen/35 transition-[width] duration-300" style={{ width: `${Math.min(100, (buffered / duration) * 100)}%` }} />
              <span className="player-played absolute inset-0 origin-left bg-flamingo" />
            </span>
            <span aria-hidden className="player-thumb absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flamingo" />

            {hover ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2"
                style={{ left: clamp(hover.x, board.width / 2, hover.width - board.width / 2) }}
              >
                <span
                  className="block rounded-md bg-night ring-1 ring-linen/40"
                  style={{
                    width: board.width,
                    height: board.height,
                    backgroundImage: `url("${board.src}")`,
                    backgroundPosition: `-${(frame % board.columns) * board.width}px -${Math.floor(frame / board.columns) * board.height}px`,
                  }}
                />
                <span className="mt-1.5 block text-center font-mono text-[0.6875rem] tracking-[0.08em] text-linen">{formatDuration(hover.t)}</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-0.5 md:gap-1">
            <button type="button" onClick={toggle} className={button} aria-label={paused ? "Lecture" : "Pause"}>
              {paused ? <Play size={20} className="translate-x-px" /> : <Pause size={20} />}
            </button>
            <div className="group/volume flex items-center">
              <button type="button" onClick={toggleMute} className={button} aria-label={muted || volume === 0 ? "Activer le son" : "Couper le son"}>
                <Volume size={20} muted={muted || volume === 0} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => {
                  const v = videoRef.current!;
                  v.volume = Number(event.target.value);
                  v.muted = v.volume === 0;
                  setForcedMute(false);
                }}
                aria-label="Volume"
                className="player-volume h-1 w-0 cursor-pointer accent-flamingo opacity-0 transition-[width,opacity,margin] duration-300 group-hover/volume:mr-2 group-hover/volume:w-20 group-hover/volume:opacity-100 focus-visible:mr-2 focus-visible:w-20 focus-visible:opacity-100"
              />
            </div>
            <p className="ml-1 font-mono text-[0.75rem] tracking-[0.04em] whitespace-nowrap text-linen t-tabular">
              {formatDuration(time)}
              <span className="text-linen/55"> / {formatDuration(duration)}</span>
            </p>
            <span className="flex-1" />
            <button type="button" onClick={toggleFullscreen} className={button} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}>
              {fullscreen ? <Shrink size={18} /> : <Expand size={18} />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
