"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download } from "@/components/ui/Icons";
import { formatBytes } from "@/lib/utils";

type Props = {
  src: string;
  filename: string;
  title: string;
  bytes?: number;
  /** `signal` : bouton orange (action principale de l'écran) ; `ghost` : voile discret. */
  variant?: "signal" | "ghost";
};

type State =
  | { step: "idle" }
  | { step: "loading"; received: number; total: number }
  /** iPhone : fichier prêt, un second toucher ouvre « Enregistrer la vidéo » (Safari exige un geste récent). */
  | { step: "ready"; file: File }
  | { step: "done"; saved: "photos" | "file" }
  | { step: "error" };

/** iPhone / iPad (iPadOS se présente comme un Mac tactile). */
const isAppleMobile = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const mimeOf = (filename: string) => (filename.endsWith(".mov") ? "video/quicktime" : filename.endsWith(".webm") ? "video/webm" : "video/mp4");

/**
 * Télécharge une vidéo jusque dans la galerie du téléphone :
 * - iPhone / iPad : le fichier est préparé puis remis à la feuille de partage,
 *   qui propose « Enregistrer la vidéo » → app Photos ;
 * - Android et ordinateur : téléchargement classique, au nom propre — sur Android
 *   il apparaît dans la galerie / Google Photos (album « Download »).
 * Si l'hébergeur refuse la lecture (CORS), la vidéo s'ouvre dans un onglet.
 */
export function VideoDownloadButton({ src, filename, title, bytes, variant = "signal" }: Props) {
  const [state, setState] = useState<State>({ step: "idle" });
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  async function share(file: File) {
    try {
      await navigator.share({ files: [file], title });
      setState({ step: "done", saved: "photos" });
    } catch {
      // Geste trop ancien (le téléchargement a pris du temps) ou partage annulé :
      // le fichier reste prêt, un toucher sur « Enregistrer dans Photos » suffit.
      setState({ step: "ready", file });
    }
  }

  function saveFile(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setState({ step: "done", saved: "file" });
  }

  async function start() {
    const controller = new AbortController();
    abort.current = controller;
    setState({ step: "loading", received: 0, total: bytes ?? 0 });
    try {
      const response = await fetch(src, { signal: controller.signal, mode: "cors" });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      const total = Number(response.headers.get("content-length")) || bytes || 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setState({ step: "loading", received, total });
      }
      const type = response.headers.get("content-type")?.startsWith("video/") ? response.headers.get("content-type")! : mimeOf(filename);
      const file = new File(chunks, filename, { type });
      if (isAppleMobile() && navigator.canShare?.({ files: [file] })) await share(file);
      else saveFile(file);
    } catch (error) {
      if (controller.signal.aborted) return setState({ step: "idle" });
      console.warn("[vidéo] téléchargement direct impossible, ouverture du fichier", error);
      setState({ step: "error" });
      window.open(src, "_blank", "noopener");
    }
  }

  const base =
    "inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-[0.9375rem] font-medium transition-[background-color,color] duration-300 active:scale-[0.98]";
  const tone = variant === "signal" ? "bg-flamingo text-ink hover:bg-tango" : "bg-wash-strong text-linen hover:bg-[rgb(231_231_216/0.16)]";

  if (state.step === "loading") {
    const percent = state.total ? Math.min(100, Math.round((state.received / state.total) * 100)) : null;
    return (
      <div className="flex items-center gap-3">
        <span role="status" className={`${base} relative overflow-hidden bg-wash-strong text-linen`}>
          <span aria-hidden className="absolute inset-y-0 left-0 bg-flamingo/30 transition-[width] duration-300" style={{ width: `${percent ?? 0}%` }} />
          <Download size={18} className="relative animate-pulse" />
          <span className="relative t-tabular">{percent !== null ? `Préparation… ${percent} %` : `Préparation… ${formatBytes(state.received)}`}</span>
        </span>
        <button type="button" onClick={() => abort.current?.abort()} className="t-label text-taupe underline underline-offset-4 hover:text-linen">
          Annuler
        </button>
      </div>
    );
  }

  if (state.step === "ready") {
    return (
      <button type="button" onClick={() => share(state.file)} className={`${base} bg-flamingo text-ink hover:bg-tango`}>
        <Download size={18} />
        Enregistrer dans Photos
      </button>
    );
  }

  if (state.step === "done") {
    return (
      <button type="button" onClick={start} className={`${base} bg-wash-strong text-linen`}>
        <Check size={18} />
        {state.saved === "photos" ? "Enregistrée" : "Téléchargement lancé"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      className={`${base} ${tone}`}
      aria-label={`Télécharger la vidéo « ${title} »${bytes ? ` (${formatBytes(bytes)})` : ""}`}
    >
      <Download size={18} />
      {state.step === "error" ? "Réessayer" : "Télécharger"}
      {bytes ? <span className="font-mono text-[0.6875rem] tracking-[0.08em] opacity-70">{formatBytes(bytes)}</span> : null}
    </button>
  );
}
