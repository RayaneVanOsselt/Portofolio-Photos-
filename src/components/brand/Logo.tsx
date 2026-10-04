import { siteConfig } from "@/config/site";
import { Monogram } from "./Monogram";

type Props = {
  /** horizontal : monogramme + deux lignes ; compact : une ligne ; mark : monogramme seul. */
  variant?: "horizontal" | "compact" | "mark";
  className?: string;
};

/**
 * Logo construit à partir de siteConfig.logo : changer le nom dans la
 * configuration met à jour le logo partout. Monogramme orange (signal),
 * nom en `currentColor`.
 */
export function Logo({ variant = "horizontal", className = "" }: Props) {
  const { primary, secondary } = siteConfig.logo;
  // « rayvo. » → « RAYVO » + point orange
  const name = primary.replace(/\.$/, "");

  if (variant === "mark") {
    return <Monogram className={`size-9 text-flamingo ${className}`} title={siteConfig.name} />;
  }

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <Monogram className="size-7 shrink-0 text-flamingo" />
        <span className="font-display text-[0.9375rem] font-extrabold tracking-[0.02em] uppercase [font-stretch:125%]">
          {name}
          <span className="text-flamingo">.</span>
          <span className="sr-only"> {secondary}</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Monogram className="size-9 shrink-0 text-flamingo" />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className="font-display text-[1.0625rem] font-extrabold tracking-[0.02em] uppercase [font-stretch:125%]">
          {name}
          <span className="text-flamingo">.</span>
        </span>
        <span className="mt-1.5 font-mono text-[0.5625rem] tracking-[0.3em] uppercase opacity-70">{secondary}</span>
      </span>
    </span>
  );
}
