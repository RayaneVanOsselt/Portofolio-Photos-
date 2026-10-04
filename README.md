# rayvo.captures0808 — Portfolio photographique

Portfolio de photographie sportive (hockey, rugby, football), publié comme **site statique sur GitHub Pages**. Le code est écrit avec Next.js 16, React 19, TypeScript et Tailwind CSS v4 ; une GitHub Action le compile et ne met en ligne que le site final (HTML, CSS, images).
Direction artistique « billet de match à minuit » : la charte de la marque (Heavy Metal, Satin Linen, Taupe Gray, orange Flamingo · Tango · Jaffa) appliquée au style de la référence *dope.security* — canevas presque noir, **une seule couleur signal** (l'orange) rationnée, titres de section « tamponnés » en monospace très espacé, carte « billet » en verre sur le hero, filets fins au lieu des ombres, boutons pilule.

> ⚠️ **Photos temporaires.** En attendant vos images, le site affiche des photos libres de droits issues d'Unsplash (signalées « Photo temporaire » dans la visionneuse). Elles disparaissent automatiquement dès que vos photos sont ajoutées (voir §4). **Ne mettez pas le site en ligne avec ces photos.**

---

## 1. Installation

Prérequis : **Node.js 20.9 ou plus récent**.

```bash
npm install
cp .env.example .env.local
```

## 2. Lancement local

```bash
npm run dev
```

Le site est disponible sur <http://localhost:3000>.

| Commande            | Rôle                                                          |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement                                      |
| `npm run build`     | Compile le site statique dans `out/` (indexe aussi les photos) |
| `npm run lint`      | ESLint                                                        |
| `npm run typecheck` | Vérification TypeScript                                       |
| `npm run photos`    | Indexe les photos de `public/images/` (dimensions, couleurs…) |

## 3. Variables d'environnement

En ligne, tout est fourni automatiquement par la GitHub Action. En local, dans `.env.local` (jamais commité) :

| Variable                           | Rôle                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | URL publique, sans `/` final — canonical, sitemap, partages                       |
| `NEXT_PUBLIC_BASE_PATH`            | Sous-dossier de publication (ex. `/Portofolio-Photos-`) — vide en local           |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Clé Web3Forms du formulaire de contact (voir §8)                                  |

Sans clé Web3Forms **en local**, le formulaire fonctionne mais le message est affiché dans la console du navigateur. **En ligne**, le visiteur voit un message l'invitant à vous écrire directement.

## 4. Ajouter des photographies

1. Déposez vos images dans le dossier de la rubrique concernée :

   ```
   public/images/portfolio/
   ├── dh-hommes/daring/
   ├── dh-hommes/leopold/
   ├── fih-pro-league/red-panthers/
   ├── fih-pro-league/red-lions/
   ├── fih-pro-league/pays-bas/
   ├── rugby/
   ├── rwdm/
   ├── national-2/wolvendael-h1/
   ├── national-2/woluwe-h1/
   ├── daring/messieurs-1/
   ├── daring/dames-1/
   └── daring/u19b1/
   public/images/site/about/      ← photos de la page À propos
   ```

2. Nommez proprement les fichiers — l'ordre d'affichage suit le nom : `01-red-lions-attaque.jpg`, `02-red-lions-celebration.jpg`…
   Formats : JPEG, PNG, WebP ou AVIF. Conseillé : **3000 px maximum** sur le grand côté, moins de 3 Mo.

3. Lancez :

   ```bash
   npm run photos
   ```

   Le script génère `src/data/photo-manifest.json` (dimensions, orientation, couleur dominante, aperçu flou). Le texte alternatif (`alt`) est déduit du nom de fichier : **modifiez-le dans le manifest** pour le rendre descriptif (accessibilité et SEO) ; il est conservé aux lancements suivants.

Le script crée aussi, pour chaque photo, des versions WebP légères (640 à 2400 px, dans `public/_photos/`, non commitées) : le navigateur charge la taille adaptée à l'écran, et les images hors écran sont chargées de façon différée. `npm run dev` et `npm run build` lancent ce script automatiquement. Un dossier rempli remplace aussitôt les photos temporaires correspondantes.

**Réglages de prise de vue** : le boîtier, l'objectif, la focale, l'ouverture, la vitesse et l'ISO sont lus automatiquement dans vos fichiers (EXIF) et affichés dans la visionneuse. La position GPS n'est jamais lue, et les versions mises en ligne ne contiennent aucune métadonnée. Exportez vos photos depuis Lightroom en conservant les métadonnées « Tout sauf les informations de localisation » pour en profiter.

**Nouvelle galerie (nouveau match)** : créez un sous-dossier, par ex. `public/images/portfolio/fih-pro-league/red-lions/2026-03-belgique-pays-bas/`, lancez `npm run photos`, puis ajoutez une entrée dans `src/data/projects.ts` avec `folder: "portfolio/fih-pro-league/red-lions/2026-03-belgique-pays-bas"`. La galerie est publiée à l'adresse `/galeries/<slug>`.

Pour que vos clients la retrouvent en quelques secondes (page **Galeries** et recherche), renseignez :

| Champ      | Exemple                                  | Effet                                                                 |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `date`     | `"2026-10-03"`                           | Affichée, triée (plus récentes d'abord), recherchable : « 3 octobre », « octobre 2026 », « 03/10/2026 »… |
| `event`    | `"Match"`, `"Tournoi"`, `"Portraits"`    | Affiché sur le billet et dans les listes                              |
| `teams`    | `["Union Saint-Gilloise", "U23"]`        | Recherchable (adversaire, catégorie d'âge, club…)                     |
| `location` | `"Stade Joseph Marien"`                  | Affiché et recherchable                                               |

Les galeries de plus de 24 photos s'ouvrent en vue **Planche** (mosaïque compacte, idéale pour retrouver ses photos) ; les autres en vue **Éditoriale**. Le visiteur peut changer de vue, son choix est mémorisé. Les photos se chargent par lots de 24 au défilement.

**Photo du hero, de la page À propos, des services** : indiquez l'identifiant de la photo dans `src/data/content.ts` et `src/data/services.ts`. L'identifiant d'une photo locale est `dossier/fichier`, par ex. `portfolio/rugby/01-melee.jpg`. Si un identifiant n'existe pas, une photo du portfolio est utilisée.

Une fois toutes les photos temporaires remplacées, vous pouvez supprimer `src/data/placeholder-photos.ts` (et son import dans `src/data/photos.ts`) ainsi que le cas Unsplash dans `src/lib/image-loader.ts`.

### Galeries privées (clients)

Une galerie peut être réservée à un client (séance, événement privé, club) :

```ts
{
  slug: "seance-club-xyz-k7p2",      // ajoutez un suffixe difficile à deviner
  // …
  private: true,
  accessCode: "XYZ-2026",            // à communiquer au client
  allowDownload: true,               // bouton « Télécharger » dans la visionneuse
}
```

Elle n'apparaît ni dans les listes, ni dans la recherche, ni dans le plan du site, et n'est pas indexée par Google. Le client la retrouve sur la page **Galeries** → « Vous avez reçu un code d'accès ? » (le code est insensible à la casse, aux espaces et aux tirets ; seule son empreinte est publiée, jamais le code). ⚠️ C'est de la **discrétion, pas une sécurité** : le site étant statique, les photos restent accessibles à qui connaît l'adresse exacte.

### Visionneuse et demandes de photos

Chaque photo possède un lien permanent (`…/galeries/<slug>/#photo-<slug>-<numéro>`) : il peut être partagé (bouton « Partager ») et rouvre directement la photo. Le bouton « Demander cette photo » ouvre le formulaire de contact pré-rempli (type « Demande d'une photo », numéro et lien de l'image) : pratique pour les joueurs, parents et clubs. Le bloc orange « Vous êtes sur les photos ? » rappelle cette possibilité sur l'accueil, les catégories et les galeries. Les anciennes adresses `/project/<slug>` redirigent automatiquement vers `/galeries/<slug>` (ancre comprise : un lien de photo déjà partagé reste valable).

## 4 bis. Football — reportages « Matchday »

Une galerie qui possède une fiche `match` (dans `src/data/projects.ts`) s'affiche comme un **reportage de match** : en-tête « MATCHDAY · 2026 / 10 / 04 », affiche des équipes, stade, photo principale, fiche de match, puis le récit en chapitres. Elle apparaît aussi dans **l'archive `/football`** (par année et par mois) et sur l'accueil.

```ts
{
  slug: "2026-10-04-union-sg-u23-rwdm",
  title: "Union SG U23 vs RWDM",
  category: "rwdm",
  folder: "portfolio/rwdm/2026-10-04-union-sg-u23-rwdm",
  date: "2026-10-04",
  location: "Stade Joseph Marien",          // le stade
  match: {
    home: "Union Saint-Gilloise U23", homeShort: "Union SG U23",
    away: "RWDM",
    score: [2, 1],                           // facultatif
    competition: "Championnat U23",          // facultatif
    round: "J8",                             // facultatif
  },
  chapters: { "avant-match": { text: "Arrivée au stade, échauffement." } }, // facultatif
}
```

**Raconter le match en chapitres** : rangez les photos dans des sous-dossiers numérotés du dossier de la galerie, puis lancez `npm run photos` :

```
public/images/portfolio/rwdm/2026-10-04-union-sg-u23-rwdm/
├── 01-avant-match/
├── 02-action/
├── 03-ambiance/
├── 04-supporters/
├── 05-coulisses/
└── 06-apres-match/
```

Les noms connus reçoivent un titre propre (« Avant-match », « Après-match », « Échauffement », « Célébrations »…) ; tout autre nom est repris tel quel. Les photos posées directement dans le dossier de la galerie ouvrent le récit (« Introduction »). La visionneuse reste continue d'un chapitre à l'autre.

**Sélection de photos** : dans une galerie, le visiteur ajoute des photos à sa sélection (cœur dans la visionneuse), puis clique sur « Demander ma sélection » : le formulaire de contact arrive pré-rempli avec les numéros des photos et le lien de la galerie. La sélection reste dans son navigateur, rien n'est envoyé avant sa demande.

Les informations sportives restent discrètes et n'apparaissent que si elles sont renseignées (jamais de score inventé).

## 5. Ajouter ou modifier des rubriques

Tout est dans **`src/data/categories.ts`** : une rubrique = un objet, ses équipes = `children`. L'ordre du fichier est celui des menus, des filtres et du plan du site. Les URL (`/portfolio/<rubrique>/<équipe>`), le méga-menu, le menu mobile, la recherche, le sitemap et les images de partage sont générés automatiquement.

Chaque rubrique ou équipe doit avoir au moins un projet dans `src/data/projects.ts` pour afficher des photos.

## 6. Modifier le nom du site

Dans **`src/config/site.ts`** : `name`, `logo.primary`, `logo.secondary`, `tagline`, `description`.
Le logo, les titres, les metadata, le footer, les e-mails et les images de partage se mettent à jour.
Le monogramme (bloc orange au coin coupé, initiales « RV » en réserve) se trouve dans `src/components/brand/Monogram.tsx` ; les fichiers de marque statiques (logo horizontal, compact, monogramme, filigrane — versions pour fond clair `-dark` et fond sombre `-light`) sont dans `public/brand/`.
Le pied de page affiche l'heure locale en direct (`timeZone`) et votre zone (`seo.area` ou `contact.location`).

## 7. Réseaux sociaux et coordonnées

Toujours dans `src/config/site.ts` → `contact` (e-mail public, téléphone, zone) et `socials` (URL complètes).
Une valeur vide masque l'élément en production ; en développement, une étiquette « À configurer » le signale. Même principe pour les chiffres clés et les références de la page À propos (`src/data/content.ts`) : rien n'est inventé, rien n'est affiché tant que ce n'est pas renseigné.

## 7 bis. Référencement (SEO)

Déjà en place automatiquement :
- titres et descriptions uniques par page, avec le mot-clé en premier (« Red Lions (FIH Pro League) — photos hockey ») ;
- un texte factuel par rubrique (nombre de photos, équipes, séries, sport) ;
- données structurées Google : site, activité de photographe et prestations, fil d'Ariane, galeries de photos ;
- **licence des images** : vos propres photos sont déclarées avec auteur, copyright et lien « Obtenir cette image » (vers le formulaire de demande) — Google Images peut afficher le badge « Licence » ;
- plan du site (`/sitemap.xml`) avec les images de chaque page, `robots.txt`, liens canoniques, images de partage ;
- texte alternatif des photos complété automatiquement avec l'équipe et la compétition.

À faire de votre côté (dans `src/config/site.ts` → `seo`) :
1. **`area`** : votre ville ou région (ex. `"Bruxelles"`). Elle est ajoutée aux titres et descriptions — c'est ce qui vous fait remonter sur « photographe sportif Bruxelles ».
2. **Google Search Console** (<https://search.google.com/search-console>) : ajoutez la propriété « Préfixe d'URL » avec l'adresse du site, choisissez la méthode « Balise HTML », copiez uniquement le code du `content="…"` dans `googleSiteVerification`, publiez, puis validez. Soumettez ensuite `sitemap.xml`.
3. Idem pour **Bing Webmaster Tools** avec `bingSiteVerification` (optionnel).
4. Donnez à vos photos des **noms de fichiers et textes alternatifs descriptifs** (« red-lions-but-van-aubel.jpg » plutôt que « IMG_1234.jpg »).
5. Renseignez dates et lieux de vos séries dans `src/data/projects.ts`, et écrivez de vraies descriptions : plus il y a de texte utile, mieux c'est.
6. Ajoutez vos réseaux (Instagram…) : ils sont reliés au site dans les données Google.

## 8. Configuration du formulaire de contact (Web3Forms)

Le site étant statique (sans serveur), les messages sont transmis par **Web3Forms**, un service gratuit conçu pour ce cas.

1. Allez sur <https://web3forms.com>, saisissez l'adresse qui doit recevoir les demandes : vous recevez une **clé d'accès** par e-mail.
2. Sur GitHub : **Settings → Secrets and variables → Actions → onglet Variables → New repository variable**
   - Nom : `WEB3FORMS_ACCESS_KEY`
   - Valeur : votre clé
3. Relancez la publication (**Actions → Publier le site → Run workflow**) ou poussez un commit.
4. Envoyez un message de test depuis la page Contact.

Cette clé est publique par conception : elle permet uniquement d'envoyer des messages vers **votre** adresse. L'adresse du visiteur est placée en réponse (`Reply-To`) : il suffit de répondre à l'e-mail reçu.

Protections : validation des champs dans le navigateur (`src/lib/contact/schema.ts`), nettoyage des saisies, champ piège (honeypot), délai minimal de remplissage, et filtrage anti-spam côté Web3Forms. Pour changer de service (Formspree…), seule `src/lib/contact/submit.ts` est à adapter.

## 9. Build

```bash
npm run lint
npm run build      # → dossier out/, le site prêt à publier
```

## 10. Déploiement (GitHub Pages)

**Une seule fois** : sur GitHub, **Settings → Pages → Build and deployment → Source : « GitHub Actions »** (et non « Deploy from a branch »).

Ensuite, chaque mise à jour de la branche `main` publie automatiquement le site (onglet **Actions**, workflow « Publier le site », 1 à 2 minutes). Adresse : `https://<utilisateur>.github.io/<nom-du-dépôt>/`.

**Domaine personnalisé** (ex. `raivocapture.be`) : renseignez-le dans Settings → Pages → Custom domain ; l'Action adapte automatiquement les adresses du site.

Après la mise en ligne :
- soumettez `…/sitemap.xml` dans Google Search Console ;
- testez le partage d'un lien (une image de partage est générée pour chaque rubrique, équipe et série) ;
- complétez les pages Confidentialité et Mentions légales (éléments entre crochets).

---

## Architecture

```
src/
├── app/                    Routes (App Router)
│   ├── page.tsx            Accueil
│   ├── portfolio/          Portfolio, catégories, équipes (+ images OG)
│   ├── galeries/           Accès aux photos (recherche) + galeries /galeries/[slug]
│   ├── project/[slug]/     Redirection des anciennes adresses
│   ├── about/ services/ contact/ search/ privacy/ legal/
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg …
│   └── globals.css         Design system (tokens, typographie, animations)
├── components/
│   ├── brand/              Logo, monogramme
│   ├── layout/             Header, méga-menu, menu mobile, footer, en-têtes
│   ├── home/               Sections de l'accueil
│   ├── portfolio/          Tuiles, vue catégorie, carte de galerie, billet de match
│   ├── galleries/          Recherche instantanée des galeries, code d'accès, partage
│   ├── gallery/            Galerie (vues éditoriale / planche) + visionneuse
│   ├── search/             Palette de recherche (⌘K ou /)
│   ├── sections/           Bloc orange d'accès aux photos, étapes, appel final
│   ├── contact/            Formulaire
│   ├── effects/            Révélations au scroll, parallaxe, retour en haut
│   └── ui/                 Boutons, icônes, image, libellés
├── config/site.ts          ← nom, coordonnées, réseaux, navigation
├── data/                   ← rubriques, projets, services, textes, photos
└── lib/                    Accès aux données, recherche, SEO, formulaire, images
scripts/photos.mjs          Indexation des photos + versions WebP
scripts/finalize-export.mjs Finalisation de l'export statique
.github/workflows/deploy.yml Publication automatique sur GitHub Pages
```

### Design system (extrait)

| Élément     | Valeurs                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Couleurs    | `ink #1D1E1C` (Heavy Metal, fond) · `night #131412` (puits) · `linen #E7E7D8` (texte) · `taupe #AFAC96` (secondaire) · `flamingo #EB642B` (signal) · `tango #ED762F` (survol) · `jaffa #F09235` (lueur) |
| Typographie | **Archivo** étendu 800 en capitales (`t-display`, `t-h1` : 2–3 grands moments par page) · **Poppins** (texte, `t-h2` léger, `t-h3`, `t-lead`, `t-label`) · **JetBrains Mono** très espacé (`t-stamp` : tampons de section, `t-mono` : métadonnées) |
| Rayons      | 4 px (vignettes) · 6 px (petites commandes) · 8 px (bouton bordé) · 20 px (cartes, grandes images) · pilule (actions principales)                         |
| Surfaces    | Plates : filets de lin à 14–30 % d'opacité et voiles translucides (`wash`, `glass`), aucune ombre                                                       |
| Mouvement   | `--ease-out-expo`, apparitions au scroll, masques de titres, tampons qui se resserrent — tout est désactivé avec « réduire les animations »               |

L'orange est **rationné** : une action principale par écran (bouton pilule `signal`) et un seul bloc orange par page (`PhotoAccessBand`, classe `theme-orange bloom`). Dans un titre, les mots entre `*astérisques*` passent en ton secondaire (Taupe).
