import { siteConfig } from "@/config/site";

/**
 * « Merci de créditer @rayvo.captures0808 » : rappel discret placé près des
 * téléchargements (albums, sélection, retrouver mes photos). Le pseudo mène au
 * profil Instagram s'il est renseigné.
 */
export function CreditNote({ className = "", tone = "linen" }: { className?: string; tone?: "linen" | "ink" }) {
  const { handle } = siteConfig.credit;
  const href = siteConfig.socials.instagram;
  const ink = tone === "ink";
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 t-mono ${ink ? "text-ink/80" : "text-taupe"} ${className}`}>
      <span aria-hidden className={`text-sm leading-none ${ink ? "text-ink" : "text-flamingo"}`}>
        ©
      </span>
      <span>Vous partagez une photo ? Merci de créditer</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`link-underline ${ink ? "text-ink" : "text-linen"}`}>
          {handle}
        </a>
      ) : (
        <span className={ink ? "text-ink" : "text-linen"}>{handle}</span>
      )}
    </p>
  );
}
