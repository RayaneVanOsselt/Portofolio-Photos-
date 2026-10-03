/**
 * ⚠️ PHOTOS TEMPORAIRES — À REMPLACER AVANT LA MISE EN LIGNE.
 *
 * Ces images proviennent d'Unsplash (licence Unsplash) et servent
 * uniquement à visualiser la mise en page tant que les vraies photos
 * ne sont pas ajoutées. Elles ne représentent PAS le travail du photographe.
 *
 * Dès qu'un dossier de public/images/portfolio contient des photos et que
 * `npm run photos` a été lancé, les vraies images remplacent automatiquement
 * ces placeholders (voir src/data/photos.ts).
 */
import type { Photo } from "@/lib/types";

type Row = [id: string, width: number, height: number, color: string, alt: string, author: string, username: string];

const toPhoto = ([id, width, height, color, alt, author, username]: Row): Photo => {
  // Taille d'origine limitée à 2400px : le serveur d'images de Next.js recadre ensuite.
  const scale = Math.min(1, 2400 / Math.max(width, height));
  return {
    id: `ph-${id.replace("photo-", "")}`,
    src: `https://images.unsplash.com/${id}?w=${width >= height ? 2400 : Math.round(2400 * (width / height))}&q=80&fm=jpg`,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    color,
    alt: `Photo temporaire — ${alt.charAt(0).toUpperCase()}${alt.slice(1)}`,
    credit: { name: author, url: `https://unsplash.com/@${username}` },
  };
};

const hockey: Row[] = [
  ["photo-1734159319354-b9ead78dd441", 6000, 4000, "#8c8c73", "un groupe de joueurs pendant une partie de hockey sur gazon", "Lea Panaino", "lpanaino"],
  ["photo-1541983663620-7571a820610c", 6000, 4000, "#8cf3d9", "joueuse de hockey sur le terrain", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1554539484-e4fab56d4a5c", 2996, 2205, "#73c073", "joueuses de hockey en action", "John Torcasio", "johntorcasio"],
  ["photo-1573459635481-85e9012c05c6", 3553, 2361, "#8cd973", "joueuse en maillot noir sur le terrain", "John Torcasio", "johntorcasio"],
  ["photo-1734158661120-a0605f0cee48", 6000, 4000, "#8c8c73", "phase de jeu de hockey sur gazon", "Lea Panaino", "lpanaino"],
  ["photo-1680010090687-6a5e4fe855b8", 6000, 4000, "#8ca6c0", "jeunes joueurs de hockey sur gazon", "Guillaume Didelet", "mejlivg"],
  ["photo-1537751181166-be1708a8ec4f", 6000, 4000, "#26a68c", "joueuse tenant son stick sur le terrain", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1648312773792-3db3b560c793", 4000, 6000, "#405959", "deux sticks de hockey appuyés contre un mur", "Julian Gentile", "juliangentile"],
  ["photo-1639509249768-cbf320b9dec7", 8256, 5504, "#408c40", "deux joueurs de hockey sur gazon en duel", "Pablo Arenas", "pabloarenas"],
  ["photo-1538352886333-5233ad94cb8b", 6000, 4000, "#40c08c", "équipe féminine sur le terrain", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1540862758454-694a03e98110", 6000, 4000, "#73d9c0", "joueuses en pleine action", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1680010090584-5004654f7b37", 6000, 4000, "#8ca6c0", "joueurs de hockey sur gazon en mouvement", "Guillaume Didelet", "mejlivg"],
  ["photo-1774523195578-121a2d1da490", 3593, 2395, "#0c73c0", "joueur de hockey en mouvement sur un terrain bleu", "Atul Pandey", "iatulp"],
  ["photo-1537753068441-ae5962264fe7", 6000, 4000, "#262626", "joueuses de hockey sur gazon", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1537740544208-8c0246fdfc05", 6000, 4000, "#59d9a6", "trois joueuses à la lutte pour la balle", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1542029383596-692a64ae3ebf", 6000, 4000, "#59d9c0", "joueuse conduisant la balle", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1540775180884-c1df6d776a67", 6000, 4000, "#a6f3d9", "joueur au milieu du terrain", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1636748431525-412ec7086dbd", 5184, 3456, "#f3f3f3", "jeunes joueuses de hockey sur gazon", "Gwendolyn Kwong", "gwendolynkwong"],
  ["photo-1734158776592-4bf027643b2b", 6000, 4000, "#8c8c59", "phase de jeu chez les messieurs", "Lea Panaino", "lpanaino"],
  ["photo-1764967116421-342cb89025bf", 5760, 3840, "#d9d9f3", "joueur tenant son stick sur le gazon", "Arjun Baroi", "arjunbaroi365"],
  ["photo-1644556481721-25ccba035f5a", 3559, 2371, "#0c4073", "joueur en maillot rouge en action", "Abhishek Shintre", "abhishekshintre"],
  ["photo-1548944628-875ccee30e26", 6000, 4000, "#737359", "joueuse près du but", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1780509459807-d47e3571cc99", 5472, 3648, "#0c268c", "terrain bleu sous les projecteurs et un ciel violet", "Glen Carrie", "glencarrie"],
  ["photo-1780509459451-a5766729447a", 5472, 3648, "#a6a6a6", "terrain de hockey bleu vide sous un ciel nuageux", "Glen Carrie", "glencarrie"],
  ["photo-1780509459530-e61c6890e0be", 5472, 3648, "#f3f3f3", "but de hockey sur gazon synthétique", "Glen Carrie", "glencarrie"],
  ["photo-1780509459426-b7831626ebbe", 5472, 3648, "#d9d9d9", "terrain synthétique bleu et but de hockey", "Glen Carrie", "glencarrie"],
  ["photo-1780509459604-8e335e213e5b", 5472, 3648, "#59730c", "but de hockey sous un ciel nuageux", "Glen Carrie", "glencarrie"],
  ["photo-1780509459415-b254920a4c57", 3648, 5472, "#c0c0c0", "ligne blanche sur un terrain bleu", "Glen Carrie", "glencarrie"],
  ["photo-1780509459530-fd20e87a6142", 5472, 3648, "#d9d9d9", "terrain de hockey bleu à bordure rouge", "Glen Carrie", "glencarrie"],
  ["photo-1703229702278-f6088f24a5cc", 8000, 5964, "#262626", "hockey sur gazon, photographie d'archive", "Library of Congress", "libraryofcongress"],
  ["photo-1752401978234-d2aff41b65c9", 3788, 2526, "#0c59a6", "joueurs de hockey sur un gazon bleu", "Atul Pandey", "iatulp"],
  ["photo-1546820975-cf6167a8cd54", 6000, 4000, "#597359", "joueurs de hockey en match", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1537752895990-7040fb41a932", 6000, 4000, "#262626", "équipe féminine réunie sur le terrain", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1537740338305-a4947648da3b", 6000, 4000, "#264026", "joueuses de hockey sur gazon en duel", "Jeffrey F Lin", "jeffreyflin"],
  ["photo-1732820352954-d7d123a40039", 2587, 3234, "#265973", "jeunes joueurs pendant une partie de hockey", "Atul Pandey", "iatulp"],
  ["photo-1775502533962-b848813f3ec0", 4582, 6109, "#0ca6f3", "vue aérienne d'un terrain de hockey bleu", "Bernd Dittrich", "hdbernd"],
];

const rugby: Row[] = [
  ["photo-1529663297269-6d349ec39b57", 6240, 4160, "#a6c0d9", "poteaux de rugby dans un grand stade", "Thomas Serer", "jesusance"],
  ["photo-1480099225005-2513c8947aec", 4595, 2658, "#26260c", "mêlée de rugby", "Olga Guryanova", "designer4u"],
  ["photo-1558151507-c1aa3d917dbb", 5748, 3832, "#8ca673", "joueur tenant un ballon de rugby", "Hanson Lu", "hansonluu"],
  ["photo-1512299286776-c18be8ed6a1a", 5452, 3635, "#8c8c59", "équipe de rugby à l'entraînement", "Quino Al", "quinoal"],
  ["photo-1495329356033-eb76e0af9fd9", 5797, 3870, "#262626", "athlètes en plein contact", "CHUTTERSNAP", "chuttersnap"],
  ["photo-1496224027003-38fc92be458c", 4955, 3304, "#a6a6a6", "rugby féminin en noir et blanc", "Quino Al", "quinoal"],
  ["photo-1485426337939-af69cf101909", 3661, 2441, "#597340", "joueurs de rugby en action", "Quino Al", "quinoal"],
  ["photo-1574618471715-61c6b64aaf31", 6000, 4000, "#404026", "phase de jeu de rugby", "Max Leveridge", "maxleveridge"],
  ["photo-1574618519056-4f25ec2711f4", 6000, 4000, "#737359", "joueurs de rugby au contact", "Max Leveridge", "maxleveridge"],
  ["photo-1574618500275-a5d3458db385", 6000, 4000, "#595940", "affrontement sur le terrain de rugby", "Max Leveridge", "maxleveridge"],
  ["photo-1698679222251-ca884650d001", 4096, 2730, "#d9d9d9", "ballon de rugby sur la pelouse", "Wilson Stratton", "wilsonsharpshots"],
];

const football: Row[] = [
  ["photo-1629217855633-79a6925d6c47", 5377, 3585, "#262626", "supporters dans un stade de football", "Krzysztof Dubiel", "kris1902"],
  ["photo-1706675780107-7c43cc487928", 3635, 2435, "#268c40", "match de football en nocturne", "Alex Simpson", "m_simpsan"],
  ["photo-1676746610993-fa0c050d1f6d", 2328, 3488, "#40590c", "drapeau de corner sur la pelouse", "Chris Kursikowski", "c3k"],
  ["photo-1676746424139-77f8bd8922a8", 3013, 4017, "#40590c", "terrain de football éclairé la nuit", "Chris Kursikowski", "c3k"],
  ["photo-1762013315117-1c8005ad2b41", 3518, 5288, "#260c0c", "match dans un stade comble la nuit", "Eduard Delputte", "edelputte"],
  ["photo-1569337042150-c21c85b80a10", 5778, 3567, "#262640", "tribunes d'un stade de football", "Waldemar Brandt", "waldemarbrandt67w"],
  ["photo-1431324155629-1a6deb1dec8d", 5184, 3456, "#0c2626", "joueurs de football sur le terrain", "Abigail Keenan", "akeenster"],
  ["photo-1574629810360-7efbbe195018", 3849, 2249, "#8cc00c", "footballeur en action", "Emilio Garcia", "piensaenpixel"],
  ["photo-1517927033932-b3d18e61fb3a", 5915, 3307, "#0c2640", "frappe de balle en pose longue", "Jannes Glas", "jannesglas"],
  ["photo-1494177310973-4841f7d5a882", 4895, 3263, "#a68c73", "joueurs de football au duel", "david clarke", "davidclarke"],
  ["photo-1571080096581-53aefc318ac3", 6240, 4160, "#d9f3f3", "phase de jeu de football", "Marcel Strauß", "martzzl"],
  ["photo-1517466787929-bc90951d0974", 2961, 4453, "#d9d9d9", "joueur en maillot noir et bleu", "Ben Weber", "benwiththelens"],
  ["photo-1508087625439-de3978963553", 5348, 3556, "#404026", "joueur frappant le ballon", "Edoardo Busti", "phoedobus"],
  ["photo-1614170059029-3b7422659b37", 4000, 6000, "#595926", "joueur en maillot rouge sur la pelouse", "Rendy Novantino", "novantino"],
  ["photo-1509928015542-fcc9b3bcd048", 2209, 3314, "#0c2626", "projecteurs de stade dans la neige", "Daniel van den Berg", "danielvandenberg"],
  ["photo-1761396677022-3678bcb336f0", 3024, 4032, "#262626", "stade vide aux sièges rouges", "Johannes Hübner", "johanneshuebner"],
];

const photographer: Row[] = [
  ["photo-1777304012262-594db955dce9", 2563, 3845, "#595959", "photographe avec un appareil professionnel au bord d'un terrain", "Leo_Visions", "leo_visions_"],
  ["photo-1656603020708-e3810e667f97", 7952, 5304, "#262626", "photographe agenouillé tenant son appareil", "Yuanzhe Ma", "myz"],
];

export const placeholderPools = {
  hockey: hockey.map(toPhoto),
  rugby: rugby.map(toPhoto),
  football: football.map(toPhoto),
  photographer: photographer.map(toPhoto),
};

const pick = (pool: Photo[], indexes: number[]) => indexes.map((i) => pool[i]);
const { hockey: h } = placeholderPools;

/** Répartition des photos temporaires par dossier de projet. */
export const placeholderByFolder: Record<string, Photo[]> = {
  "portfolio/dh-hommes/daring": pick(h, [8, 18, 0, 4]),
  "portfolio/dh-hommes/leopold": pick(h, [5, 11, 31, 19]),
  "portfolio/fih-pro-league/red-panthers": pick(h, [1, 14, 10, 13]),
  "portfolio/fih-pro-league/red-lions": pick(h, [12, 30, 20, 22]),
  "portfolio/fih-pro-league/pays-bas": pick(h, [29, 16, 26]),
  "portfolio/national-2/wolvendael-h1": pick(h, [2, 3, 24]),
  "portfolio/national-2/woluwe-h1": pick(h, [21, 6, 23]),
  "portfolio/daring/messieurs-1": pick(h, [28, 7, 25, 35]),
  "portfolio/daring/dames-1": pick(h, [33, 9, 15, 32]),
  "portfolio/daring/u19b1": pick(h, [17, 34, 27]),
  "portfolio/rugby": placeholderPools.rugby,
  "portfolio/rwdm": placeholderPools.football,
  "site/about": placeholderPools.photographer,
};
