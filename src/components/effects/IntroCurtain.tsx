import { Monogram } from "@/components/brand/Monogram";
import { siteConfig } from "@/config/site";

/**
 * Animation d'entrée : rideau à l'identité de la marque, joué une seule fois
 * par visite (première page ouverte), en CSS pur — voir `.intro` dans globals.css.
 *
 * Le script de <head> (layout) pose `data-intro` sur <html> avant le premier
 * affichage, seulement si l'animation n'a pas encore été vue pendant la visite
 * et si le visiteur n'a pas demandé à réduire les animations. Sans cet
 * attribut (ou sans JavaScript), le rideau n'est jamais affiché.
 */
export function IntroCurtain() {
  const { primary, secondary } = siteConfig.logo;
  return (
    <div className="intro" aria-hidden>
      <div className="intro-content">
        <div className="intro-brand">
          <Monogram className="intro-mark" />
          <div>
            <span className="intro-line">
              <span className="intro-name">
                {primary.replace(/\.$/, "")}
                <span className="text-flamingo">.</span>
              </span>
            </span>
            <span className="intro-sub">{secondary}</span>
          </div>
        </div>
        <p className="intro-meta">{siteConfig.tagline}</p>
      </div>
      <span className="intro-bar" />
    </div>
  );
}

/** Script de <head> : décide, avant le premier affichage, si le rideau est joué. */
export const INTRO_SCRIPT = `try{var d=document.documentElement;if(!sessionStorage.getItem("rayvo:intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","");sessionStorage.setItem("rayvo:intro","1");setTimeout(function(){d.removeAttribute("data-intro")},4200)}}catch(e){}`;
