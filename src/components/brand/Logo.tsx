import Image from "next/image";
import { siteConfig } from "@/config/site";
import brand from "@/data/brand-manifest.json";
import { publicPath } from "@/lib/utils";

type Props = {
  /**
   * horizontal : emblème + nom sur une ligne (en-tête) ;
   * full : logo complet avec la signature (pied de page) ;
   * mark : emblème seul.
   */
  variant?: "horizontal" | "full" | "mark";
  /** Logo visible dès l'arrivée sur la page (en-tête) : chargé sans attendre. */
  eager?: boolean;
  /** horizontal : emblème seul entre lg et xl (en-tête, à côté de la navigation centrée). */
  compactOnLaptop?: boolean;
  className?: string;
};

type Asset = (typeof brand)[keyof typeof brand];

function BrandImage({ asset, alt, eager, className }: { asset: Asset; alt: string; eager: boolean; className: string }) {
  return (
    <Image
      src={publicPath(asset.src)}
      alt={alt}
      width={asset.width}
      height={asset.height}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

/**
 * Logo du site, décliné par `npm run brand` à partir de
 * assets/brand/logo-rayvo-captures0808.png (voir scripts/brand.mjs).
 * Logo clair, conçu pour les fonds sombres du site.
 */
export function Logo({ variant = "horizontal", eager = false, compactOnLaptop = false, className = "" }: Props) {
  if (variant === "mark") {
    return <BrandImage asset={brand.mark} alt={siteConfig.name} eager={eager} className={`h-9 ${className}`} />;
  }

  if (variant === "full") {
    return <BrandImage asset={brand.logo} alt={siteConfig.name} eager={eager} className={`h-auto w-full max-w-[17rem] ${className}`} />;
  }

  // Entre lg et xl, la navigation centrée occupe la place : l'emblème seul (`compactOnLaptop`).
  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <BrandImage asset={brand.mark} alt={compactOnLaptop ? siteConfig.name : ""} eager={eager} className={`h-8 shrink-0 sm:h-9 ${compactOnLaptop ? "lg:max-xl:h-10" : ""}`} />
      <BrandImage
        asset={brand.wordmark}
        alt={compactOnLaptop ? "" : siteConfig.name}
        eager={eager}
        className={`h-[9px] min-[400px]:h-[10px] sm:h-3 ${compactOnLaptop ? "lg:max-xl:hidden" : ""}`}
      />
    </span>
  );
}
