import { siteConfig } from "@/config/site";
import { Monogram } from "./Monogram";

type Props = {
  /** horizontal : monogramme + deux lignes ; compact : une ligne ; mark : monogramme seul. */
  variant?: "horizontal" | "compact" | "mark";
  className?: string;
};

/**
 * Logo construit à partir de siteConfig.logo : changer le nom dans la
 * configuration met à jour le logo partout. Hérite de `currentColor`,
 * donc fonctionne sur fond clair, sombre ou photo.
 */
export function Logo({ variant = "horizontal", className = "" }: Props) {
  const { primary, secondary } = siteConfig.logo;

  if (variant === "mark") {
    return <Monogram className={`size-9 ${className}`} title={siteConfig.name} />;
  }

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <Monogram className="size-7 shrink-0" />
        <span className="text-[0.9375rem] font-medium tracking-[-0.01em]">
          {primary}
          <span className="sr-only"> {secondary}</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Monogram className="size-9 shrink-0" />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className="text-[1.0625rem] font-medium tracking-[-0.01em]">{primary}</span>
        <span className="mt-1.5 text-[0.625rem] uppercase tracking-[0.32em] opacity-70">{secondary}</span>
      </span>
    </span>
  );
}
