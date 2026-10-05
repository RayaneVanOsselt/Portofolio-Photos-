# rayvo.captures0808 — Portfolio photographique

Portfolio de photographie sportive (hockey, rugby, football), publié comme **site statique sur GitHub Pages**. Le code est écrit avec Next.js 16, React 19, TypeScript et Tailwind CSS v4 ; une GitHub Action le compile et ne met en ligne que le site final (HTML, CSS, images).
Direction artistique « billet de match à minuit » : la charte de la marque (Heavy Metal, Satin Linen, Taupe Gray, orange Flamingo · Tango · Jaffa) appliquée au style de la référence *dope.security* — canevas presque noir, **une seule couleur signal** (l'orange) rationnée, titres de section « tamponnés » en monospace très espacé, carte « billet » en verre sur le hero, filets fins au lieu des ombres, boutons pilule.

> ⚠️ **Photos temporaires.** En attendant vos images, l'accueil, la page À propos et les Services affichent quelques photos libres de droits issues d'Unsplash (signalées « Photo temporaire »). Les **albums de matchs n'en utilisent jamais** : un album sans photo affiche « Photos à venir ». Remplacez-les via `public/images/site/` (voir §4 ter) avant la mise en ligne.

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

1. Dans `src/data/albums.ts`, ajoutez une ligne dans les `albums` de la bonne catégorie :

   ```ts
   { slug: "18-10-2026-daring-h1-oree-h1", date: "2026-10-18", match: { home: "Daring H1", away: "Orée H1" } },
   ```

   - `date` : AAAA-MM-JJ — affichée « 18 octobre 2026 » ;
   - `slug` : commence par la date en JJ-MM-AAAA, puis les équipes, en minuscules sans accents. C'est l'adresse **et** le nom du dossier photos. Une date et un slug incohérents, ou deux fois le même slug, **bloquent le build** avec un message clair ;
   - le titre « Daring H1 vs Orée H1 » est déduit des équipes (ou `title: "Rugby Final D1"` pour un album sans affiche).

   Facultatif — rien n'est affiché tant que ce n'est pas renseigné : `location` (lieu), `description`, `match.score`, `match.competition`, `match.round`, `cover: "12-but.jpg"` (photo de couverture, sinon la première), `featured: true` (mise en avant sur l'accueil).

2. Déposez les photos dans **le dossier qui porte le même chemin que l'adresse** :

   ```
   public/images/albums/daring-h1/18-10-2026-daring-h1-oree-h1/
   ```

3. `npm run dev` ou `npm run build` (ou `npm run photos`) : la galerie apparaît toute seule. Tant qu'un album n'a pas de photo, sa page affiche « Photos à venir », n'est pas indexée par Google et ne figure pas dans le plan du site ; tout cela bascule automatiquement dès l'ajout des photos.

**Photos** — formats JPEG, PNG, WebP ou AVIF, **3000 px maximum** sur le grand côté. L'ordre d'affichage suit le nom de fichier (`01-…`, `02-…`). Préférez des noms descriptifs (`12-daring-h1-but-capitaine.jpg`) aux noms d'appareil (`DSC_1234.jpg`, signalés par `npm run photos`). Le texte alternatif est déduit du nom de fichier (modifiable dans `src/data/photo-manifest.json`, conservé ensuite) et complété par le match : « Célébration du but — Daring H1 vs Leo H1 ». Pour un nom d'appareil, il devient « Daring H1 vs Leo H1 — photo 12 (hockey sur gazon, 20 septembre 2026) ».

Chaque photo est déclinée en WebP (320 à 2400 px, dans `public/_photos/`, non commité) : le navigateur charge la taille adaptée à l'écran, les images hors écran sont chargées en différé, et les galeries de plus de 24 photos s'affichent par lots. Les réglages de prise de vue (boîtier, objectif, focale, ouverture, vitesse, ISO) sont lus dans les EXIF ; la position GPS n'est jamais lue ni publiée.

**Reportage en chapitres** — rangez les photos dans des sous-dossiers numérotés du dossier de l'album (`01-avant-match/`, `02-action/`, `03-ambiance/`, `04-supporters/`, `05-coulisses/`, `06-apres-match/`) ; textes facultatifs : `chapters: { "avant-match": { text: "…" } }`.

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
  allowDownload: true,                      // bouton « Télécharger » dans la visionneuse
}
```

Il n'apparaît ni dans les listes, ni dans la recherche, ni dans le plan du site, et n'est pas indexé par Google. Le client le retrouve sur la page **Retrouver mes photos** (`/galeries`) → « Vous avez reçu un code d'accès ? » (seule l'empreinte du code est publiée). ⚠️ C'est de la **discrétion, pas une sécurité** : le site étant statique, les photos restent accessibles à qui connaît l'adresse exacte.

### Visionneuse et demandes de photos

Chaque photo possède un lien permanent (`…/#photo-<slug>-<numéro>`) partageable. « Demander cette photo » ouvre le formulaire de contact pré-rempli ; la sélection (cœur dans la visionneuse) permet de demander plusieurs photos d'un coup. L'ancienne adresse `/portfolio` redirige vers `/albums`.

## 4 ter. Photos des pages (accueil, À propos, Services)

Déposez vos images dans `public/images/site/home/` (photo du hero), `site/about/` (portrait et grande photo) et `site/services/` (une par prestation). Elles remplacent aussitôt les photos temporaires ; pour choisir précisément une photo, indiquez son identifiant (`site/about/portrait.jpg`) dans `src/data/content.ts` ou `src/data/services.ts`.

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

Ensuite, chaque mise à jour de la branche `main` publie automatiquement le site (onglet **Actions**, workflow « Publier le site », 1 à 2 minutes). Adresse : `https://<utilisateur>.github.io/<nom-du-dépôt>/`.

**Domaine personnalisé** (ex. `raivocapture.be`) : renseignez-le dans Settings → Pages → Custom domain ; l'Action adapte automatiquement les adresses du site.

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
│   ├── gallery/              Galerie (vues éditoriale / planche) + visionneuse
│   ├── layout/               Header, méga-menu Albums, menu mobile, footer, fil d'Ariane
│   ├── home/                 Sections de l'accueil
│   ├── galleries/            Recherche instantanée des albums, code d'accès, partage
│   ├── search/               Palette de recherche (⌘K ou /)
│   ├── sections/ contact/ effects/ brand/ seo/ football/ ui/
├── config/site.ts            ← nom, coordonnées, réseaux, navigation
├── data/
│   ├── albums.ts             ← l'arborescence : catégories et matchs
│   ├── clubs.ts              ← clubs et compétitions (nom, logo)
│   ├── photo-manifest.json   généré par npm run photos
│   ├── logo-manifest.json    généré par npm run logos
│   └── content.ts services.ts placeholder-photos.ts photos.ts
└── lib/
    ├── albums.ts             Accès aux données (tri, validation, logos, textes alternatifs)
    ├── seo.ts navigation.ts search-index.ts gallery-index.ts …
assets/logos/                 Logos sources (un fichier par club : <identifiant>.png)
public/images/albums/         Photos des albums (même chemin que l'adresse)
public/images/site/           Photos des pages (accueil, À propos, Services)
scripts/photos.mjs            Indexation des photos + versions WebP
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
| Mouvement   | `--ease-out-expo`, apparitions au scroll, masques de titres, tampons qui se resserrent — tout est désactivé avec « réduire les animations »               |

L'orange est **rationné** : une action principale par écran (bouton pilule `signal`) et un seul bloc orange par page (`PhotoAccessBand`, classe `theme-orange bloom`). Dans un titre, les mots entre `*astérisques*` passent en ton secondaire (Taupe).
