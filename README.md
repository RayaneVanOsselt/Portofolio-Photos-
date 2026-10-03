# Raï VO Capture 0808 — Portfolio photographique

Portfolio de photographie sportive (hockey, rugby, football) : Next.js 16 (App Router), React 19, TypeScript et Tailwind CSS v4.
Direction artistique inspirée de la référence *Auros* : canevas sarcelle abyssal, typographie grotesque en graisse 500, labels en capitales espacées, aucune ombre, profondeur par surfaces.

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
| `npm run build`     | Build de production (vérifie aussi les types)                 |
| `npm run start`     | Sert le build de production                                   |
| `npm run lint`      | ESLint                                                        |
| `npm run typecheck` | Vérification TypeScript                                       |
| `npm run photos`    | Indexe les photos de `public/images/` (dimensions, couleurs…) |

## 3. Variables d'environnement

Dans `.env.local` (jamais commité) :

| Variable               | Rôle                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL publique, sans `/` final — canonical, sitemap, Open Graph                                |
| `RESEND_API_KEY`       | Clé API Resend (secrète, utilisée uniquement côté serveur)                                   |
| `EMAIL_TO`             | Adresse(s) qui reçoivent les demandes — plusieurs : séparées par des virgules                |
| `EMAIL_FROM`           | Expéditeur d'un domaine vérifié chez Resend, ex. `Raï VO Capture 0808 <contact@domaine.be>` |

Sans ces trois variables **en développement**, le formulaire fonctionne mais l'e-mail est affiché dans le terminal au lieu d'être envoyé (un bandeau le signale après l'envoi). **En production**, le visiteur voit un message d'erreur l'invitant à vous écrire directement.

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

Le site convertit automatiquement en AVIF/WebP, génère toutes les tailles utiles (`srcset`) et charge les images hors écran de façon différée. Un dossier rempli remplace aussitôt les photos temporaires correspondantes.

**Nouvelle série (nouveau match)** : créez un sous-dossier, par ex. `public/images/portfolio/fih-pro-league/red-lions/2026-03-belgique-pays-bas/`, lancez `npm run photos`, puis ajoutez une entrée dans `src/data/projects.ts` avec `folder: "portfolio/fih-pro-league/red-lions/2026-03-belgique-pays-bas"`.

**Photo du hero, de la page À propos, des services** : indiquez l'identifiant de la photo dans `src/data/content.ts` et `src/data/services.ts`. L'identifiant d'une photo locale est `dossier/fichier`, par ex. `portfolio/rugby/01-melee.jpg`. Si un identifiant n'existe pas, une photo du portfolio est utilisée.

Une fois toutes les photos temporaires remplacées, vous pouvez supprimer `src/data/placeholder-photos.ts` (et son import dans `src/data/photos.ts`) ainsi que l'entrée `images.unsplash.com` de `next.config.ts`.

## 5. Ajouter ou modifier des rubriques

Tout est dans **`src/data/categories.ts`** : une rubrique = un objet, ses équipes = `children`. L'ordre du fichier est celui des menus, des filtres et du plan du site. Les URL (`/portfolio/<rubrique>/<équipe>`), le méga-menu, le menu mobile, la recherche, le sitemap et les images de partage sont générés automatiquement.

Chaque rubrique ou équipe doit avoir au moins un projet dans `src/data/projects.ts` pour afficher des photos.

## 6. Modifier le nom du site

Dans **`src/config/site.ts`** : `name`, `logo.primary`, `logo.secondary`, `tagline`, `description`.
Le logo, les titres, les metadata, le footer, les e-mails et les images de partage se mettent à jour.
Le monogramme dessiné (initiales « RV ») se trouve dans `src/components/brand/Monogram.tsx` ; les fichiers de marque statiques (logo horizontal, compact, monogramme, filigrane — versions claires et sombres) sont dans `public/brand/`.

## 7. Réseaux sociaux et coordonnées

Toujours dans `src/config/site.ts` → `contact` (e-mail public, téléphone, zone) et `socials` (URL complètes).
Une valeur vide masque l'élément en production ; en développement, une étiquette « À configurer » le signale. Même principe pour les chiffres clés et les références de la page À propos (`src/data/content.ts`) : rien n'est inventé, rien n'est affiché tant que ce n'est pas renseigné.

## 8. Configuration de l'e-mail (Resend)

1. Créez un compte sur <https://resend.com>.
2. Ajoutez et vérifiez votre domaine (enregistrements DNS fournis par Resend).
3. Créez une clé API (permission « Sending access »).
4. Renseignez `RESEND_API_KEY`, `EMAIL_TO` et `EMAIL_FROM` — en local dans `.env.local`, en production dans les variables d'environnement de l'hébergeur.
5. Envoyez un message de test depuis `/contact`.

Protections du formulaire : validation côté client **et** côté serveur (`src/lib/contact/schema.ts`), nettoyage des saisies, échappement HTML dans l'e-mail, champ piège (honeypot), délai minimal de remplissage, limitation à 5 envois / 10 min par IP (`src/lib/contact/rate-limit.ts`, en mémoire — voir le commentaire pour un stockage partagé). L'adresse du visiteur est placée en `Reply-To` : il suffit de répondre à l'e-mail reçu.

Pour changer de fournisseur (Postmark, SendGrid, Mailgun…), seule `src/lib/email/send.ts` est à adapter.

## 9. Build

```bash
npm run lint
npm run build
npm run start   # test local du build de production
```

## 10. Déploiement

**Vercel (recommandé)** : importez le dépôt sur <https://vercel.com/new>, ajoutez les variables d'environnement du §3, déployez.

**Autre hébergeur Node** : `npm run build` puis `npm run start` (port 3000 par défaut, `PORT=…` pour changer). L'optimisation d'images utilise `sharp`, déjà inclus.

Après la mise en ligne :
- vérifiez `NEXT_PUBLIC_SITE_URL` (sitemap, canonical et partages en dépendent) ;
- soumettez `https://votre-domaine/sitemap.xml` dans Google Search Console ;
- testez le partage d'un lien (une image Open Graph est générée pour chaque rubrique, équipe et série) ;
- complétez les pages `/privacy` et `/legal` (éléments entre crochets).

---

## Architecture

```
src/
├── app/                    Routes (App Router)
│   ├── page.tsx            Accueil
│   ├── portfolio/          Portfolio, rubriques, équipes (+ images OG)
│   ├── project/[slug]/     Séries
│   ├── about/ services/ contact/ search/ privacy/ legal/
│   ├── contact/actions.ts  Server Action du formulaire
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg …
│   └── globals.css         Design system (tokens, typographie, animations)
├── components/
│   ├── brand/              Logo, monogramme
│   ├── layout/             Header, méga-menu, menu mobile, footer, en-têtes
│   ├── home/               Sections de l'accueil
│   ├── portfolio/          Tuiles, vue rubrique, galerie filtrable
│   ├── gallery/            Galerie éditoriale + visionneuse (lightbox)
│   ├── search/             Palette de recherche (⌘K ou /)
│   ├── contact/            Formulaire
│   ├── effects/            Révélations au scroll, parallaxe, curseur
│   └── ui/                 Boutons, icônes, image, libellés
├── config/site.ts          ← nom, coordonnées, réseaux, navigation
├── data/                   ← rubriques, projets, services, textes, photos
└── lib/                    Accès aux données, recherche, SEO, e-mail, validation
scripts/photos.mjs          Indexation des photos
```

### Design system (extrait)

| Élément     | Valeurs                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Couleurs    | `abyss #012624` (fond) · `deep #011d1c` · `kelp #003734` · `silver #bbc7c6` · `mist #edfffe` · `phosphor #fde9ff` (accent) |
| Typographie | Inter Tight 400/500 (interface et titres) · Instrument Serif italique (accents éditoriaux)                                 |
| Échelle     | `t-display`, `t-h1`, `t-h2`, `t-h3`, `t-lead`, `t-small`, `t-label`, `t-caption`, `t-nav` — tailles fluides (`clamp`)      |
| Rayons      | 6 px (boutons, images) · 16 px (surfaces)                                                                                  |
| Mouvement   | `--ease-out-expo`, durées 200 / 400 / 800 / 1100 ms — désactivé avec la préférence « réduire les animations »              |

Le dégradé « aurora » est réservé au bouton d'action principal de chaque écran. Dans un texte, les mots entre `*astérisques*` passent en serif italique (titres de `src/data/content.ts`).
