import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Comment ${siteConfig.name} traite les données envoyées via le formulaire de contact.`,
  path: "/privacy",
});

/**
 * Base de politique de confidentialité (RGPD) décrivant le fonctionnement
 * réel du site. Les éléments entre crochets sont à compléter.
 * À faire relire si votre activité collecte d'autres données.
 */
export default function PrivacyPage() {
  const email = siteConfig.contact.email || "[ADRESSE E-MAIL DE CONTACT]";
  return (
    <LegalPage
      title="Politique de confidentialité"
      path="/privacy"
      updated="[DATE DE MISE À JOUR]"
      sections={[
        {
          title: "Responsable du traitement",
          body: (
            <p>
              Le responsable du traitement des données est <strong>[NOM ET PRÉNOM / RAISON SOCIALE]</strong>, exerçant sous le nom {siteConfig.name}, [ADRESSE]. Contact : {email}.
            </p>
          ),
        },
        {
          title: "Données collectées",
          body: (
            <>
              <p>Le site ne collecte des données personnelles que lorsque vous utilisez le formulaire de contact :</p>
              <ul>
                <li>nom, prénom et adresse e-mail ;</li>
                <li>téléphone, date et budget du projet (facultatifs) ;</li>
                <li>type de projet et contenu de votre message.</li>
              </ul>
              <p>Aucun compte utilisateur, aucun outil de mesure d&apos;audience et aucun cookie publicitaire ne sont utilisés.</p>
            </>
          ),
        },
        {
          title: "Finalité et base légale",
          body: (
            <p>
              Ces données servent uniquement à répondre à votre demande et, le cas échéant, à établir un devis. Le traitement repose sur votre consentement, exprimé en cochant la case prévue avant l&apos;envoi du formulaire, et sur les mesures précontractuelles prises à votre demande.
            </p>
          ),
        },
        {
          title: "Destinataires",
          body: (
            <p>
              Votre message est transmis par e-mail au photographe via le service de formulaires <strong>Web3Forms</strong>. Vos données ne sont ni vendues, ni louées, ni cédées à des tiers.
            </p>
          ),
        },
        {
          title: "Durée de conservation",
          body: <p>Les échanges sont conservés [DURÉE — ex. 3 ans après le dernier contact], puis supprimés.</p>,
        },
        {
          title: "Vos droits",
          body: (
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité, ainsi que du droit de retirer votre consentement à tout moment. Pour les exercer : {email}. Vous pouvez également introduire une réclamation auprès de l&apos;
              <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">
                Autorité de protection des données
              </a>
              .
            </p>
          ),
        },
        {
          title: "Cookies et ressources",
          body: (
            <p>
              Le site n&apos;utilise pas de cookies de suivi. Les polices de caractères sont servies depuis le site lui-même. Pour toute question, rendez-vous sur la page <Link href="/contact">contact</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
