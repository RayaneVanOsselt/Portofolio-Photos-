import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales du site ${siteConfig.name} : éditeur, hébergement, propriété intellectuelle des photographies et données personnelles.`,
  path: "/legal",
});

/** Mentions légales — les éléments entre crochets sont à compléter. */
export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Mentions légales"
      path="/legal"
      updated="[DATE DE MISE À JOUR]"
      sections={[
        {
          title: "Éditeur du site",
          body: (
            <ul>
              <li>
                <strong>{siteConfig.name}</strong> — [NOM ET PRÉNOM / RAISON SOCIALE]
              </li>
              <li>Adresse : [ADRESSE]</li>
              <li>Numéro d&apos;entreprise (BCE) / TVA : [NUMÉRO]</li>
              <li>Contact : {siteConfig.contact.email || "[ADRESSE E-MAIL]"}</li>
            </ul>
          ),
        },
        {
          title: "Hébergement",
          body: <p>Le site est hébergé par GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>,
        },
        {
          title: "Propriété intellectuelle",
          body: (
            <>
              <p>
                L&apos;ensemble des photographies, textes, logos et éléments graphiques présents sur ce site sont protégés par le droit d&apos;auteur. Sauf mention contraire, les photographies sont la propriété exclusive de {siteConfig.name}.
              </p>
              <p>Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
              <p>
                Pour une demande d&apos;utilisation d&apos;image ou de licence, <Link href="/contact">contactez-moi</Link>.
              </p>
            </>
          ),
        },
        {
          title: "Responsabilité",
          body: <p>Les informations publiées sur ce site sont fournies à titre indicatif et peuvent être modifiées à tout moment.</p>,
        },
        {
          title: "Données personnelles",
          body: (
            <p>
              Le traitement des données envoyées via le formulaire de contact est décrit dans la <Link href="/privacy">politique de confidentialité</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
