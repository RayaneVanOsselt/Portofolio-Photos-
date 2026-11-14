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

/** Mentions légales : éditeur, hébergement, droits sur les photos, crédit demandé. */
export default function LegalNoticePage() {
  const { email, phone } = siteConfig.contact;
  const instagram = siteConfig.socials.instagram;
  return (
    <LegalPage
      title="Mentions légales"
      path="/legal"
      updated="11 novembre 2026"
      sections={[
        {
          title: "Éditeur du site",
          body: (
            <ul>
              <li>
                <strong>
                  {siteConfig.owner.lastName} {siteConfig.owner.firstName}
                </strong>{" "}
                — photographe sportif, exerçant sous le nom {siteConfig.name}
              </li>
              <li>
                E-mail : <a href={`mailto:${email}`}>{email}</a>
              </li>
              {phone ? (
                <li>
                  Téléphone : <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </li>
              ) : null}
              {instagram ? (
                <li>
                  Instagram :{" "}
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    {siteConfig.credit.handle}
                  </a>
                </li>
              ) : null}
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
                L&apos;ensemble des photographies, vidéos, textes, logos et éléments graphiques présents sur ce site sont protégés par le droit d&apos;auteur. Sauf mention contraire, les photographies sont la propriété exclusive de {siteConfig.owner.firstName} {siteConfig.owner.lastName} ({siteConfig.name}).
              </p>
              <p>Toute reproduction, représentation, modification ou diffusion à des fins commerciales, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
              <p>
                Pour une demande d&apos;utilisation d&apos;image ou de licence, <Link href="/contact">contactez-moi</Link>.
              </p>
            </>
          ),
        },
        {
          title: "Crédit photo",
          body: (
            <>
              <p>
                Joueurs, clubs et supporters peuvent télécharger leurs photos et les partager librement sur leurs réseaux, à une condition : <strong>merci de créditer {siteConfig.credit.handle}</strong> (mention dans la publication ou identification du compte Instagram).
              </p>
              <p>Ne pas recadrer la photo pour en retirer une signature, ni la retoucher au point d&apos;en changer le sens.</p>
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
