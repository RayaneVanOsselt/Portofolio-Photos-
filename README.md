# rayvo.captures0808 — Portfolio photographique

Portfolio de photographie sportive (hockey, rugby, football), publié comme **site statique sur GitHub Pages**. Le code est écrit avec Next.js 16, React 19, TypeScript et Tailwind CSS v4 ; une GitHub Action le compile et ne met en ligne que le site final (HTML, CSS, images).
Direction artistique « billet de match à minuit » : la charte de la marque (Heavy Metal, Satin Linen, Taupe Gray, orange Flamingo · Tango · Jaffa) appliquée au style de la référence *dope.security* — canevas presque noir, **une seule couleur signal** (l'orange) rationnée, titres de section « tamponnés » en monospace très espacé, carte « billet » en verre sur le hero, filets fins au lieu des ombres, boutons pilule.

> ⚠️ **Photo temporaire.** L'accueil, les Services et la grande photo de la page À propos utilisent vos photos de match. Seul le **portrait** de la page À propos est encore une photo libre de droits (Unsplash, signalée « Photo temporaire ») : remplacez-le par votre portrait via `public/images/site/about/` (voir §4 ter). Les albums de matchs n'utilisent jamais de photo temporaire.

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
| `npm run photos`    | Pipeline photo : versions AVIF/WebP, fichiers à télécharger, manifest |
| `npm run logos`     | Optimise les logos de `assets/logos/` (WebP + PNG de partage) |

## 3. Variables d'environnement

En ligne, tout est fourni automatiquement par la GitHub Action. En local, dans `.env.local` (jamais commité) :

| Variable                           | Rôle                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | URL publique, sans `/` final — canonical, sitemap, partages                       |
| `NEXT_PUBLIC_BASE_PATH`            | Sous-dossier de publication (ex. `/Portofolio-Photos-`) — vide en local           |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Clé Web3Forms du formulaire de contact (voir §8)                                  |

Sans clé Web3Forms **en local**, le formulaire fonctionne mais le message est affiché dans la console du navigateur. **En ligne**, le visiteur voit un message l'invitant à vous écrire directement.

## 4. Albums : Club / Compétition → Match → Photos

Toute la section Albums est décrite dans **un seul fichier : `src/data/albums.ts`**. Menu, pages, adresses, recherche, plan du site, images de partage et données Google en sont générés automatiquement.

```
Albums                                   /albums
├── Daring H1                            /albums/daring-h1
│   ├── 20/09/2026 — Daring H1 vs Leo H1 /albums/daring-h1/20-09-2026-daring-h1-leo-h1
│   └── …
├── FIH Pro League                       /albums/fih-pro-league
│   ├── Hommes                           /albums/fih-pro-league/hommes
│   └── Femmes                           /albums/fih-pro-league/femmes
└── …
```

Les matchs sont **triés automatiquement par date**, du plus récent au plus ancien, partout sur le site : l'ordre d'écriture dans le fichier n'a aucune importance.

### Ajouter un match

1. **Déposez les photos** dans `Dossier photos/`, rangées comme vous le souhaitez — un dossier par match :

   ```
   Dossier photos/DARING /Messieurs 1 /Daring - Orée 18:10:2026/
   ```

   Exportez-les en JPEG (2048 px sur le grand côté suffit : c'est la taille des fichiers à télécharger). Les sous-dossiers deviennent des **chapitres** (ex. `Belgique/`, `Pays Bas/`, ou `01-avant-match/`, `02-action/`…). Les vidéos ne sont jamais envoyées sur GitHub (voir « Vidéos » ci-dessous).

2. **Une entrée** dans les `albums` de la bonne catégorie, dans `src/data/albums.ts`, avec le chemin de ce dossier copié tel quel (espaces compris) :

   ```ts
   {
     slug: "18-10-2026-daring-h1-oree-h1",
     date: "2026-10-18",
     match: { home: "Daring H1", away: "Orée H1" },
     source: "DARING /Messieurs 1 /Daring - Orée 18:10:2026",
   },
   ```

   - `date` : AAAA-MM-JJ — affichée « 18 octobre 2026 » ;
   - `slug` : commence par la date en JJ-MM-AAAA, puis les équipes, en minuscules sans accents. C'est l'adresse de la page. Une date et un slug incohérents, ou deux fois le même slug, **bloquent le build** avec un message clair ;
   - le titre « Daring H1 vs Orée H1 » est déduit des équipes (ou `title: "Rugby Final D1"` pour un album sans affiche).

   Facultatif — rien n'est affiché tant que ce n'est pas renseigné : `location` (lieu), `description`, `match.score`, `match.competition`, `match.round`, `cover: "IMG_1234.jpg"` (photo de couverture, sinon la première ; `"belgique/IMG_1234.jpg"` dans un chapitre), `featured: true` (mise en avant sur l'accueil), `downloadEnabled: false` (consultation seule).

3. **`npm run dev`** ou **`npm run build`** (ou `npm run photos`) — ou simplement un push sur `main` : la galerie apparaît toute seule. Tant qu'un album n'a pas de photo, sa page affiche « Photos à venir », n'est pas indexée par Google et ne figure pas dans le plan du site ; tout cela bascule automatiquement dès l'ajout des photos. Un dossier de `Dossier photos/` relié à aucun album est signalé.

**Pipeline photo** (`scripts/photos.mjs`) — les originaux ne sont jamais modifiés ni publiés tels quels. Pour chaque photo, dans `public/_photos/` (généré, non commité) :

| Usage | Fichiers | Détail |
| --- | --- | --- |
| Affichage | AVIF 320 · 640 · 1080 · 1600 · 2048 px | qualité croissante avec la taille (50 → 58) ; ~30 % plus léger que le WebP |
| Repli | WebP 320 · 640 · 1080 px | navigateurs anciens, vignettes de recherche, partage, Google |
| Téléchargement | JPEG 2048 px, qualité 90, sRGB | nom propre : `rayvo-captures0808-2026-10-18-daring-h1-oree-h1-07.jpg` ; auteur et copyright inscrits |

Aucune métadonnée privée n'est publiée (ni GPS, ni numéro de série du boîtier) ; les réglages de prise de vue (boîtier, objectif, focale, ouverture, vitesse, ISO) sont affichés dans la visionneuse. Le traitement est **incrémental** : une photo dont le contenu n'a pas changé n'est jamais réencodée (y compris sur GitHub, grâce au cache de la publication), et les fichiers générés d'une photo retirée sont supprimés. Le script signale aussi les fichiers illisibles, les formats non pris en charge (RAW, HEIC : exportez en JPEG) et les doublons.

L'ordre d'affichage suit le nom de fichier. Le texte alternatif est déduit du nom de fichier (modifiable dans `src/data/photo-manifest.json`, conservé ensuite) et complété par le match : « Célébration du but — Daring H1 vs Leo H1 ». Pour un nom d'appareil (`IMG_1234.jpg`), il devient « Daring H1 vs Leo H1 — photo 12 (hockey sur gazon, 20 septembre 2026) ».

**Galerie** — vues « Éditorial » et « Planche », photos affichées par lots de 24 au défilement (une galerie de 500 photos reste instantanée), images différées hors écran, dimensions réservées (aucun décalage de mise en page), mini-aperçu flou pendant le chargement.

### Ajouter une catégorie (club, équipe, compétition, saison)

Un objet dans `albumTree` :

```ts
{ slug: "oree-h1", title: "Orée H1", sport: "hockey", club: "oree", albums: [ … ] },
```

Des sous-catégories (`children`) peuvent être imbriquées sur autant de niveaux que nécessaire — comme FIH Pro League → Hommes / Femmes, ou plus tard Club → Saison → Compétition → Match. L'ordre du fichier est celui du menu.

### Logos des clubs

1. Une ligne dans `src/data/clubs.ts` : `oree: { name: "Orée" }` (`aliases` pour d'autres écritures, ex. `["Leopold"]`).
2. Le logo dans `assets/logos/oree.png` (même identifiant ; PNG, JPEG ou WebP, fond blanc, transparent ou uni).
3. `npm run logos` (automatique avec `dev` et `build`) : fond uni retiré, marges rognées, WebP de quelques Ko dans `public/logos/` et PNG pour les images de partage.

Le logo s'affiche alors **automatiquement** à côté de chaque équipe dont le nom commence par le nom du club (« Orée H1 », « Orée D1 »…), sur les pages, dans le menu et sur les images de partage — toujours sur une pastille blanche de taille constante, proportions préservées. Un club sans fichier logo s'affiche simplement sans logo. Pour forcer ou retirer un logo sur un match : `match: { …, homeClub: "oree" }` ou `awayClub: null`.

### Albums privés (clients)

Un album peut être réservé à un client (séance, événement privé, club) :

```ts
{
  slug: "12-10-2026-seance-club-xyz-k7p2",   // ajoutez un suffixe difficile à deviner
  date: "2026-10-12",
  title: "Séance Club XYZ",
  private: true,
  accessCode: "XYZ-2026",                   // à communiquer au client
  downloadEnabled: true,                    // téléchargement autorisé pour ce client
}
```

Il n'apparaît ni dans les listes, ni dans la recherche, ni dans le plan du site, et n'est pas indexé par Google. Le client le retrouve sur la page **Retrouver mes photos** (`/galeries`) → « Vous avez reçu un code d'accès ? » (seule l'empreinte du code est publiée). ⚠️ C'est de la **discrétion, pas une sécurité** : le site étant statique, les photos restent accessibles à qui connaît l'adresse exacte.

### Visionneuse, partage et demandes de photos

Clavier (← → Échap), swipe sur mobile (gauche/droite pour naviguer, vers le bas pour fermer), zoom (clic ou double-tap), plein écran, photos voisines préchargées. Chaque photo possède un lien permanent (`…/#photo-<slug>-<numéro>`) ; « Partager » utilise le partage natif du téléphone, ou copie le lien sur ordinateur. « Demander en HD » ouvre le formulaire de contact pré-rempli. L'ancienne adresse `/portfolio` redirige vers `/albums`.

### Téléchargement des photos

Réglage global dans `src/config/site.ts` → `downloads.photos` (activé). Une catégorie ou un album peut le changer avec `downloadEnabled: false` (consultation seule) ou `true` — la règle la plus précise l'emporte (album → catégorie → réglage global). Une galerie en consultation seule n'expose aucun fichier à télécharger.

Quand c'est autorisé :
- **une photo** : bouton « Télécharger » dans la visionneuse — le JPEG haute qualité au nom propre, jamais la vignette ;
- **plusieurs photos** : « Sélectionner » dans la barre de la galerie (ou le cœur dans la visionneuse), puis « Télécharger » : une archive ZIP `…-selection.zip` ;
- **toute la galerie** : « Télécharger la galerie » — confirmation avec le nombre de photos et la taille estimée, progression réelle, annulation possible.

Le site étant statique (GitHub Pages, sans serveur), l'archive est préparée dans le navigateur, sans dépendance : les JPEG sont rangés tels quels (aucune recompression), fichier par fichier. Elle est plafonnée à 400 Mo (`downloads.maxArchiveBytes`) : au-delà, le visiteur est invité à choisir moins de photos plutôt que de saturer son téléphone. Les fichiers ont des noms propres, regroupés dans un dossier au nom de l'événement.

### Vidéos

Les vidéos ne sont **jamais** envoyées sur GitHub (qui refuse les fichiers de plus de 100 Mo) : `.gitignore` les exclut (`.mp4`, `.mov`, `.webm`, `.avi`, `.mkv`…, majuscules comprises). Un garde-fou local refuse en plus tout commit contenant une vidéo ou un fichier de plus de 95 Mo, y compris depuis GitHub Desktop. Pour l'installer sur un nouvel ordinateur :

```bash
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

### Calendrier des matchs

La page **Matchs** (`/matchs`) présente tous les matchs par année puis par mois — couverture, date, catégorie, nombre de photos — avec un accès direct à chaque mois. Elle est générée depuis `src/data/albums.ts`, comme le reste.

## 4 ter. Photos des pages (accueil, À propos, Services)

Chaque photo de page est désignée par son identifiant dans `src/data/content.ts` (hero, À propos) et `src/data/services.ts` (une par prestation) : une photo de match (`albums/fih-pro-league/hommes/27-06-2026-belgique-pays-bas-men/belgique/IMG_3563.jpg` — dossier de l'adresse + nom du fichier) ou une image déposée dans `public/images/site/home/`, `site/about/` ou `site/services/` (`site/about/portrait.jpg`).

## 6. Modifier le nom du site

Dans **`src/config/site.ts`** : `name`, `logo.primary`, `logo.secondary`, `tagline`, `description`.
Le logo, les titres, les metadata, le footer, les e-mails et les images de partage se mettent à jour.
Le monogramme (bloc orange au coin coupé, initiales « RV » en réserve) se trouve dans `src/components/brand/Monogram.tsx` ; les fichiers de marque statiques (logo horizontal, compact, monogramme, filigrane — versions pour fond clair `-dark` et fond sombre `-light`) sont dans `public/brand/`.
Le pied de page se met à jour tout seul : les 4 derniers matchs publiés, le nombre de matchs et de photos, les albums groupés par sport, vos coordonnées et réseaux dès qu'ils sont renseignés (§7), l'heure locale en direct (`timeZone`) et votre zone (`seo.area` ou `contact.location`).

## 7. Réseaux sociaux et coordonnées

Toujours dans `src/config/site.ts` → `contact` (e-mail public, téléphone, zone) et `socials` (URL complètes).
Une valeur vide masque l'élément en production ; en développement, une étiquette « À configurer » le signale. Même principe pour les chiffres clés et les références de la page À propos (`src/data/content.ts`) : rien n'est inventé, rien n'est affiché tant que ce n'est pas renseigné.

## 7 bis. Référencement (SEO)

Déjà en place automatiquement :
- titres et descriptions uniques par page, avec le mot-clé en premier (« Daring H1 vs Leo H1 — Photos du match », « Daring H1 — albums photo hockey ») ;
- un texte factuel par catégorie (nombre de matchs, sport, sous-catégories) — jamais d'information inventée ;
- données structurées Google : site, activité de photographe et prestations, fil d'Ariane, liste des albums par catégorie, galerie de photos et match (SportsEvent : équipes, date, compétition, lieu) ;
- une image de partage par catégorie et par album (équipes, date, logos des clubs, photo de couverture dès qu'elle existe) ;
- les albums sans photo ne sont ni indexés ni dans le plan du site, jusqu'à l'ajout de leurs photos ;
- **licence des images** : vos propres photos sont déclarées avec auteur, copyright et lien « Obtenir cette image » (vers le formulaire de demande) — Google Images peut afficher le badge « Licence » ;
- plan du site (`/sitemap.xml`) avec les images de chaque page, `robots.txt`, liens canoniques, images de partage ;
- texte alternatif des photos complété automatiquement avec l'équipe et la compétition.

À faire de votre côté (dans `src/config/site.ts` → `seo`) :
1. **`area`** : votre ville ou région (ex. `"Bruxelles"`). Elle est ajoutée aux titres et descriptions — c'est ce qui vous fait remonter sur « photographe sportif Bruxelles ».
2. **Google Search Console** (<https://search.google.com/search-console>) : ajoutez la propriété « Préfixe d'URL » avec l'adresse du site, choisissez la méthode « Balise HTML », copiez uniquement le code du `content="…"` dans `googleSiteVerification`, publiez, puis validez. Soumettez ensuite `sitemap.xml`.
3. Idem pour **Bing Webmaster Tools** avec `bingSiteVerification` (optionnel).
4. Donnez à vos photos des **noms de fichiers et textes alternatifs descriptifs** (« red-lions-but-van-aubel.jpg » plutôt que « IMG_1234.jpg »).
5. Renseignez les lieux et compétitions de vos matchs dans `src/data/albums.ts`, et écrivez de vraies descriptions : plus il y a de texte utile, mieux c'est.
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

Ensuite, chaque mise à jour de la branche `main` publie automatiquement le site (onglet **Actions**, workflow « Publier le site »). Adresse : <https://rayvocaptures0808.be> (domaine personnalisé ; sans lui, `https://<utilisateur>.github.io/<nom-du-dépôt>/`). Les versions web des photos sont gardées en cache d'une publication à l'autre : seules les photos nouvelles sont encodées (quelques minutes) ; la toute première publication prend une quinzaine de minutes.

**Hébergement — à surveiller.** GitHub Pages limite un site à **1 Go**. Avec les 795 photos actuelles, les versions web et les fichiers à télécharger pèsent environ 880 Mo : `npm run photos` affiche ce total et prévient au-delà de 850 Mo. Quand le site grandit, deux solutions sans changer le code : publier le même dossier `out/` sur **Cloudflare Pages** (gratuit, sans limite de taille totale), ou passer certaines galeries en `downloadEnabled: false` (environ −45 % de poids par photo).

**Domaine personnalisé** (actuellement `rayvocaptures0808.be`) : il se règle dans Settings → Pages → Custom domain ; l'Action adapte automatiquement les adresses du site.

Après la mise en ligne :
- soumettez `…/sitemap.xml` dans Google Search Console ;
- testez le partage d'un lien (une image de partage est générée pour chaque catégorie et chaque album) ;
- complétez les pages Confidentialité et Mentions légales (éléments entre crochets).

---

## Architecture

```
src/
├── app/                      Routes (App Router)
│   ├── page.tsx              Accueil
│   ├── albums/               /albums + /albums/[...chemin] (catégories, sous-catégories, albums)
│   ├── matchs/               Calendrier : tous les matchs par année et par mois
│   ├── og/albums/            Images de partage des albums (PNG générés au build)
│   ├── galeries/             Retrouver mes photos (recherche + code d'accès)
│   ├── football/             Archive football
│   ├── search-index.json/    Index de la recherche ⌘K (chargé à la première ouverture)
│   ├── portfolio/            Redirection de l'ancienne adresse vers /albums
│   ├── about/ services/ contact/ search/ privacy/ legal/
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg …
│   └── globals.css           Design system (tokens, typographie, animations)
├── components/
│   ├── albums/               Page d'album, page de catégorie, cartes, lignes de calendrier, billet
│   ├── clubs/                Logo de club (pastille) et paire de logos
│   ├── gallery/              Galerie (vues éditoriale / planche, sélection), visionneuse, archive ZIP
│   ├── layout/               Header, méga-menu Albums, menu mobile, footer, fil d'Ariane
│   ├── home/                 Sections de l'accueil
│   ├── galleries/            Recherche instantanée des albums, code d'accès, partage
│   ├── search/               Palette de recherche (⌘K ou /)
│   ├── effects/              Animation d'entrée (IntroCurtain), apparitions au scroll…
│   ├── ui/                   PhotoPicture (<picture> AVIF + WebP), PhotoImage, boutons, icônes
│   ├── sections/ contact/ brand/ seo/ football/
├── config/site.ts            ← nom, coordonnées, réseaux, navigation
├── data/
│   ├── albums.ts             ← l'arborescence : catégories et matchs
│   ├── clubs.ts              ← clubs et compétitions (nom, logo)
│   ├── photo-manifest.json   généré par npm run photos
│   ├── logo-manifest.json    généré par npm run logos
│   └── content.ts services.ts placeholder-photos.ts photos.ts
└── lib/
    ├── albums.ts             Accès aux données (tri, validation, logos, textes alternatifs)
    ├── downloads.ts          Règle de téléchargement et noms de fichiers (partagée avec le pipeline)
    ├── photo-sources.ts      Adresses des versions AVIF / WebP
    ├── zip.ts                Archive ZIP préparée dans le navigateur
    ├── seo.ts navigation.ts search-index.ts gallery-index.ts …
Dossier photos/               ← vos photos de match, rangées à votre façon (reliées par `source`)
assets/logos/                 Logos sources (un fichier par club : <identifiant>.png)
public/images/site/           Photos des pages (facultatif)
public/_photos/               Versions web et fichiers à télécharger (générés, non commités)
scripts/photos.mjs            Pipeline photo (AVIF, WebP, JPEG à télécharger, manifest)
scripts/git-hooks/pre-commit  Garde-fou : refuse vidéos et fichiers de plus de 95 Mo
scripts/logos.mjs             Optimisation des logos
scripts/finalize-export.mjs   Finalisation de l'export statique
.github/workflows/deploy.yml  Publication automatique sur GitHub Pages
```

### Design system (extrait)

| Élément     | Valeurs                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Couleurs    | `ink #1D1E1C` (Heavy Metal, fond) · `night #131412` (puits) · `linen #E7E7D8` (texte) · `taupe #AFAC96` (secondaire) · `flamingo #EB642B` (signal) · `tango #ED762F` (survol) · `jaffa #F09235` (lueur) |
| Typographie | **Archivo** étendu 800 en capitales (`t-display`, `t-h1` : 2–3 grands moments par page) · **Poppins** (texte, `t-h2` léger, `t-h3`, `t-lead`, `t-label`) · **JetBrains Mono** très espacé (`t-stamp` : tampons de section, `t-mono` : métadonnées) |
| Rayons      | 4 px (vignettes) · 6 px (petites commandes) · 8 px (bouton bordé) · 20 px (cartes, grandes images) · pilule (actions principales)                         |
| Surfaces    | Plates : filets de lin à 14–30 % d'opacité et voiles translucides (`wash`, `glass`), aucune ombre                                                       |
| Mouvement   | `--ease-out-expo`, rideau d'entrée à l'identité de la marque (une fois par visite, ~1,3 s), apparitions au scroll, masques de titres, tampons qui se resserrent — tout est désactivé avec « réduire les animations » |

L'orange est **rationné** : une action principale par écran (bouton pilule `signal`) et un seul bloc orange par page (`PhotoAccessBand`, classe `theme-orange bloom`). Dans un titre, les mots entre `*astérisques*` passent en ton secondaire (Taupe).
