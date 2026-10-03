import { isDev } from "@/config/site";

/**
 * Signale une information manquante (e-mail, réseau, chiffre…).
 * Visible uniquement en développement : en production, rien n'est rendu,
 * pour ne jamais publier de faux contenu ni de lien mort.
 */
export function Todo({ children }: { children: string }) {
  if (!isDev) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-phosphor/50 px-2 py-1 t-caption text-phosphor">
      À configurer · {children}
    </span>
  );
}
