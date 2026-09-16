// ===================================================================
//  La Fabrique du Maquettiste — generateur du site (apercu LocWeb,
//  2026-09-16). Node, sans dependance :  node build.mjs
//
//  Source : _source/catalogue.json, extrait de la boutique SumUp de
//  Yoann (noms, prix, categories, descriptions, photos).
//
//  Un site A PLUSIEURS PAGES, pour le referencement : une page par
//  categorie et une page par creation. Chaque creation porte son nom,
//  sa description (les mots de Yoann, non reecrits : il a demande un
//  site « naturel, sans IA »), ses dimensions et ses photos.
//
//  Les liens sont RELATIFS : le meme site fonctionne sous
//  shigyn.github.io/lafabrique/ et, plus tard, sur son domaine.
// ===================================================================
import fs from 'node:fs';
import path from 'node:path';

const ICI = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const URL_SITE = 'https://shigyn.github.io/lafabrique/';
const BOUTIQUE = 'https://la-fabrique-du-maquettiste.sumupstore.com';
const INSTAGRAM = 'https://www.instagram.com/la_fabrique_du_maquettiste/';
const EMAIL = 'lemaquettiste.boutique@gmail.com';
const NOM = 'La Fabrique du Maquettiste';

const catalogueBrut = JSON.parse(fs.readFileSync(path.join(ICI, '_source', 'catalogue.json'), 'utf8'));
// Une creation sans photo ne s'expose pas : une carte vide dessert tout le reste.
const creations = catalogueBrut.filter((c) => c.photos && c.photos.length);

/* ---------- categories : nom affiche, adresse, phrase d'introduction ----------
   Les introductions sont courtes et factuelles, tirees de ce que Yoann ecrit
   lui-meme dans ses fiches. A faire valider par lui. */
const CATEGORIES = [
  { source: 'Lanterne/photophore', slug: 'lanternes-et-veilleuses', nom: 'Lanternes et veilleuses',
    intro: 'Des lanternes en bois découpé au laser, éclairées de l’intérieur par une guirlande de leds. Le papier calque adoucit la lumière et dessine les silhouettes.' },
  { source: 'Horloge', slug: 'horloges', nom: 'Horloges',
    intro: 'Des horloges murales en plusieurs couches de bois, peintes et assemblées à la main. Livrées avec leur crochet et un support sur pieds.' },
  { source: 'Décoration murale', slug: 'decoration-murale', nom: 'Décoration murale',
    intro: 'Des cadres et des décorations en relief, superposition de couches de bois pour un effet 3D, à accrocher ou à poser.' },
  { source: 'Famille', slug: 'cadeaux-famille', nom: 'Cadeaux pour la famille',
    intro: 'Papa, mamie, parrain, marraine, nounou : des prénoms et des mots en relief, à offrir à ceux qui comptent.' },
  { source: 'Enfance', slug: 'enfance', nom: 'Enfance',
    intro: 'Des tableaux pour aider les enfants à exprimer leurs émotions et à organiser leur journée, personnalisables avec leur prénom.' },
  { source: 'Jeux/puzzle', slug: 'puzzles-en-bois', nom: 'Puzzles en bois',
    intro: 'Des puzzles tout en bois, rigolos et pas si simples. Ne conviennent pas aux enfants de moins de 3 ans.' },
  { source: 'Bibliothèque', slug: 'separateurs-de-livres', nom: 'Séparateurs de livres lumineux',
    intro: 'Un petit décor éclairé glissé entre deux livres, pour la bibliothèque des enfants comme des grands.' },
  { source: 'Fleur personnalisée', slug: 'fleurs-personnalisees', nom: 'Fleurs personnalisées',
    intro: 'Rose, lys, orchidée : des fleurs en bois qui ne fanent pas, avec un prénom ou un message gravé.' },
  { source: 'Gravure ardoise', slug: 'gravure-sur-ardoise', nom: 'Gravure sur ardoise',
    intro: 'Vos photos et vos animaux gravés sur de l’ardoise naturelle, vernie pour durer, même en extérieur.' },
  { source: 'Mariage et Saint Valentin', slug: 'mariage-et-saint-valentin', nom: 'Mariage et Saint-Valentin',
    intro: 'Cadres, cœurs et horloges personnalisés pour un mariage ou une Saint-Valentin. Un projet de décoration de mariage ? Parlons-en.' },
  { source: 'Objets à personnaliser', slug: 'objets-personnalises', nom: 'Objets personnalisés',
    intro: 'Stylos, décapsuleurs, boîtes à dents : des petits objets utiles, gravés au nom ou au message de votre choix.' },
];
// La photo de couverture de chaque univers : la plus parlante, pas la premiere venue.
const COUVERTURES = {
  'lanternes-et-veilleuses': 'lanterne-lumineuse-chiens-1', horloges: 'horloge-planisphere-2',
  'decoration-murale': 'cadre-plantes-18cm-1', 'cadeaux-famille': 'decoration-papa-1',
  enfance: 'gestion-des-emotions-fille-1', 'puzzles-en-bois': 'puzzle-planisphere-1',
  'separateurs-de-livres': 'separateur-de-livres-lumineux-sirene-4', 'fleurs-personnalisees': 'lys-personnalise-1',
  'gravure-sur-ardoise': 'gravure-portrait-20x20-cm-1', 'mariage-et-saint-valentin': 'cadre-love-1',
  'objets-personnalises': 'stylo-personnalise-1',
};
CATEGORIES.forEach((c) => { c.couverture = COUVERTURES[c.slug]; });
// « Separateur "sirene" » : les guillemets droits deviennent des guillemets francais.
catalogueBrut.forEach((c) => { c.nom = c.nom.replace(/"([^"]+)"/g, '« $1 »').trim(); });
const catParSource = Object.fromEntries(CATEGORIES.map((c) => [c.source, c]));
creations.forEach((c) => { c.cat = catParSource[c.categorie]; });
CATEGORIES.forEach((cat) => { cat.creations = creations.filter((c) => c.cat === cat); });
const categoriesVisibles = CATEGORIES.filter((c) => c.creations.length);

/* ---------- outils ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prixNombre = (p) => Number(String(p).replace(',', '.'));
const euros = (p) => `${String(p).replace('.', ',')} €`;
const prixAffiche = (c) => (c.variantes ? 'à partir de ' : '') + euros(c.prix);

// « Dimensions : 23cm de haut sur 12cm de large » -> « 23 × 12 cm »
function dimensions(texte) {
  const t = texte.replace(/\s+/g, ' ');
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*cm\s*(?:de\s*)?diam[eè]tre/i) || t.match(/diam[eè]tre\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/i);
  if (m) return `Ø ${m[1]} cm`;
  m = t.match(/(\d+(?:[.,]\d+)?)\s*cm\s*(?:de\s*)?haut(?:eur)?\s*sur\s*(\d+(?:[.,]\d+)?)\s*cm/i);
  if (m) return `${m[1]} × ${m[2]} cm`;
  m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:cm)?\s*sur\s*(\d+(?:[.,]\d+)?)\s*cm/i);
  if (m) return `${m[1]} × ${m[2]} cm`;
  m = t.match(/(\d+)\s*x\s*(\d+)\s*cm/i);
  if (m) return `${m[1]} × ${m[2]} cm`;
  m = t.match(/(\d+(?:[.,]\d+)?)\s*cm\s*de\s*hauteur/i) || t.match(/hauteur\s*:\s*(\d+(?:[.,]\d+)?)\s*cm/i);
  if (m) return `${m[1]} cm de haut`;
  return null;
}

// Les mots de Yoann, a peine nettoyes : smileys de clavier retires,
// adresse e-mail rendue cliquable.
function paragraphes(texte) {
  return texte.split(/\n+/).map((l) => l.replace(/\s*[=:]\)\s*/g, ' ').trim()).filter(Boolean)
    .map((l) => `<p>${esc(l).replace(EMAIL, `<a href="mailto:${EMAIL}">${EMAIL}</a>`)}</p>`).join('');
}

const premiereLigne = (texte, max = 150) => {
  const l = texte.replace(/\s*[=:]\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return l.length > max ? l.slice(0, l.lastIndexOf(' ', max)) + '…' : l;
};

const img = (r, fichier, alt, { taille = '600', classe = '', eager = false, l = 600, h = 800 } = {}) =>
  `<img class="${classe}" src="${r}photos/creations/${fichier}${taille === '1200' ? '' : '-600'}.webp" alt="${esc(alt)}" width="${l}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const urlCat = (cat) => `creations/${cat.slug}/`;
const urlCreation = (c) => `creations/${c.cat.slug}/${c.slug}/`;

/* ---------- gabarit commun ---------- */

const MENU = [
  { url: 'creations/', texte: 'Créations' },
  { url: 'personnalisation/', texte: 'Personnalisation' },
  { url: 'ou-me-trouver/', texte: 'Où me trouver' },
  { url: 'contact/', texte: 'Contact' },
];

function page({ chemin, titre, description, corps, jsonld = [], actif = '', sombre = false, imageOg = null }) {
  const profondeur = chemin ? chemin.split('/').filter(Boolean).length : 0;
  const r = '../'.repeat(profondeur);
  const canonique = URL_SITE + chemin;
  const og = imageOg ? `${URL_SITE}photos/creations/${imageOg}.webp` : `${URL_SITE}photos/creations/lampe-arbre-de-vie-2.webp`;
  const nav = MENU.map((m) => `<a href="${r}${m.url}"${actif === m.url ? ' aria-current="page"' : ''}>${m.texte}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
<!-- APERCU DE PRESENTATION (2026-09-16) : noindex tant que le site n'est
     pas livre sur le domaine de Yoann. A la livraison : retirer cette
     balise et passer URL_SITE (build.mjs) sur le vrai domaine. -->
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonique}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${NOM}">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonique}">
<meta property="og:image" content="${og}">
<meta name="theme-color" content="#17120e">
<link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gloock&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/style.css?v=3">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body${sombre ? ' class="entete-sombre"' : ''}>
<a class="evitement" href="#contenu">Aller au contenu</a>
<header class="entete">
  <div class="enveloppe entete-ligne">
    <a class="marque" href="${r}" aria-label="${NOM}, accueil">
      <span class="marque-sigle" aria-hidden="true">F<i>M</i></span>
      <span class="marque-nom">La Fabrique<br><em>du Maquettiste</em></span>
    </a>
    <button class="menu-bouton" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav class="menu" id="menu" aria-label="Menu principal">${nav}</nav>
  </div>
</header>
<main id="contenu">
${corps(r)}
</main>
<footer class="pied">
  <div class="enveloppe pied-grille">
    <div>
      <p class="pied-marque">${NOM}</p>
      <p class="pied-texte" data-editable-zone="pied_texte">Objets décoratifs et gravures personnalisées sur bois et ardoise, fabriqués à la main dans le Cambrésis.</p>
    </div>
    <div>
      <p class="pied-titre">Les créations</p>
      <ul class="pied-liste">${categoriesVisibles.map((c) => `<li><a href="${r}${urlCat(c)}">${c.nom}</a></li>`).join('')}</ul>
    </div>
    <div>
      <p class="pied-titre">Me suivre, m’écrire</p>
      <ul class="pied-liste">
        <li><a href="${INSTAGRAM}" rel="noopener">Instagram</a></li>
        <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><a href="${r}ou-me-trouver/">Boutiques et marchés</a></li>
      </ul>
    </div>
  </div>
  <div class="enveloppe pied-bas"><p>© 2026 ${NOM} · Fait main, dans le Cambrésis</p></div>
</footer>
<script>
  window.LOCWEB_CONFIG = {
    supabaseUrl: 'https://ibqawtgnucakzdldnitj.supabase.co',
    supabaseAnonKey: 'sb_publishable_rpLrUo4Cqnfl8zSohDqO0A_Q5Vkj2Hk',
    clientId: '',
    ga4Id: ''
  };
</script>
<script src="${r}assets/site.js?v=3" defer></script>
<script src="${r}mesure.js" defer></script>
</body>
</html>
`;
}

const ORGANISATION = {
  '@type': 'LocalBusiness',
  '@id': URL_SITE + '#atelier',
  name: NOM,
  description: 'Fabrication d’objets décoratifs et de gravures personnalisées sur bois et ardoise : lanternes, horloges, décorations, cadeaux personnalisés.',
  url: URL_SITE,
  email: EMAIL,
  image: URL_SITE + 'photos/creations/lampe-arbre-de-vie-2.webp',
  areaServed: ['Cambrai', 'Cambrésis', 'Nord'],
  address: { '@type': 'PostalAddress', addressRegion: 'Nord', addressCountry: 'FR' },
  sameAs: [INSTAGRAM, BOUTIQUE],
};

const fil = (etapes) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: etapes.map(([nom, url], i) => ({ '@type': 'ListItem', position: i + 1, name: nom, item: URL_SITE + url })),
});

const filVisible = (r, etapes) => `<nav class="fil" aria-label="Fil d’Ariane"><ol>${etapes.map(([nom, url], i) =>
  i === etapes.length - 1 ? `<li aria-current="page">${esc(nom)}</li>` : `<li><a href="${r}${url}">${esc(nom)}</a></li>`).join('')}</ol></nav>`;

/* Une carte de creation : photo, nom, dimensions, prix. Le trace
   pointille, c'est le chemin de decoupe du laser. */
const carte = (r, c, niveauTitre = 'h3') => {
  const dim = dimensions(c.description);
  const p = c.photos[0];
  return `<article class="carte">
    <a class="carte-lien" href="${r}${urlCreation(c)}">
      <span class="carte-photo">${img(r, p.fichier, c.nom, { l: 600, h: Math.round(600 * p.h / p.l) })}</span>
      <${niveauTitre} class="carte-nom">${esc(c.nom)}</${niveauTitre}>
      <span class="carte-infos">${dim ? `<span class="cote">${esc(dim)}</span>` : '<span></span>'}<span class="carte-prix">${prixAffiche(c)}</span></span>
    </a>
  </article>`;
};

/* ---------- les couches de bois decoupe de la scene d'accueil ----------
   Trois silhouettes en SVG, generees ici (graine fixe : le dessin est
   identique a chaque construction). Du fond vers l'avant : une foret
   lointaine, une foret plus proche, puis la branche aux deux oiseaux,
   comme sur ses lanternes. Le trait pointille dore suit la decoupe. */
function hasard(graine) {
  return () => { graine |= 0; graine = (graine + 0x6D2B79F5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const L = 1600, H = 420;

function foret(graine, { sol, hMin, hMax, pasMin, pasMax, rond = 0.25 }) {
  const r = hasard(graine);
  const solY = (x) => sol + Math.sin(x / 210 + graine) * 14 + Math.sin(x / 67) * 5;
  let d = `M0,${H} L0,${solY(0).toFixed(1)} `;
  for (let x = 0; x <= L; x += 40) d += `L${x},${solY(x).toFixed(1)} `;
  d += `L${L},${H} Z `;
  const formes = [];
  for (let x = -20; x < L + 40; x += pasMin + r() * (pasMax - pasMin)) {
    const h = hMin + r() * (hMax - hMin), base = solY(x) + 6, w = h * (0.42 + r() * 0.16);
    if (r() < rond) {
      // feuillu : un tronc et trois ronds de feuillage
      formes.push(`M${(x - 3).toFixed(1)},${base} h6 v${(-h * 0.45).toFixed(1)} h-6 Z`);
      const cy = base - h * 0.62;
      [[0, 0, w * 0.42], [-w * 0.28, h * 0.1, w * 0.3], [w * 0.28, h * 0.12, w * 0.3]].forEach(([dx, dy, rr]) => {
        const cx = x + dx, y = cy + dy;
        formes.push(`M${(cx - rr).toFixed(1)},${y.toFixed(1)} a${rr.toFixed(1)},${rr.toFixed(1)} 0 1,0 ${(2 * rr).toFixed(1)},0 a${rr.toFixed(1)},${rr.toFixed(1)} 0 1,0 ${(-2 * rr).toFixed(1)},0 Z`);
      });
    } else {
      // sapin : trois etages
      for (let k = 0; k < 3; k++) {
        const yb = base - h * k * 0.26, yt = base - h * (0.46 + k * 0.27), hw = (w / 2) * (1 - k * 0.24);
        formes.push(`M${(x - hw).toFixed(1)},${yb.toFixed(1)} L${x.toFixed(1)},${Math.max(yt, base - h).toFixed(1)} L${(x + hw).toFixed(1)},${yb.toFixed(1)} Z`);
      }
    }
  }
  return d + formes.join(' ');
}

// Un passereau pose, de profil ; l'oeil est evide, comme une decoupe laser.
const oiseau = (x, y, s, sens = 1) => `<g transform="translate(${x} ${y}) scale(${s * sens} ${s})">
  <path fill-rule="evenodd" d="M52,-31 L66,-27 L52,-23 C49,-15 43,-9 35,-5 C27,-1 15,1 3,-1 L-34,9 L-29,2 L-42,4 L-9,-8 C-15,-15 -13,-25 -3,-31 C9,-39 25,-40 35,-37 C42,-42 50,-38 52,-31 Z M44,-32 a3.2,3.2 0 1,0 6.4,0 a3.2,3.2 0 1,0 -6.4,0 Z"/>
  <path d="M8,-3 L6,9 L9,9 L11,-3 Z M17,-5 L17,8 L20,8 L20,-5 Z"/></g>`;

function branche() {
  const r = hasard(7);
  let feuilles = '';
  for (let i = 0; i < 16; i++) {
    const t = i / 15, x = L - t * 520, y = 128 + t * 88 + (r() - 0.5) * 18, a = (r() - 0.5) * 120 + (i % 2 ? 35 : -35), s = 0.7 + r() * 0.6;
    feuilles += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)}) scale(${s.toFixed(2)})" d="M0,0 C12,-10 34,-10 46,0 C34,10 12,10 0,0 Z"/>`;
  }
  return `<path d="M${L},112 C1480,126 1330,160 1170,204 C1130,214 1098,218 1068,214 C1096,202 1146,188 1186,176 C1336,140 1478,112 ${L},100 Z"/>
    <path d="M1390,150 C1370,120 1360,96 1368,70 C1376,98 1384,122 1402,146 Z"/>
    <path d="M1250,180 C1240,206 1224,226 1200,238 C1218,222 1232,204 1238,178 Z"/>
    ${feuilles}${oiseau(1300, 170, 1.15)}${oiseau(1418, 140, 0.95, -1)}`;
}

const COUCHES = `
  <svg class="couche couche-1" data-profondeur="0.35" viewBox="0 0 ${L} ${H}" preserveAspectRatio="xMidYMax slice"><path d="${foret(3, { sol: 270, hMin: 90, hMax: 170, pasMin: 34, pasMax: 70, rond: 0.2 })}"/></svg>
  <svg class="couche couche-2" data-profondeur="0.7" viewBox="0 0 ${L} ${H}" preserveAspectRatio="xMidYMax slice"><path d="${foret(11, { sol: 330, hMin: 70, hMax: 150, pasMin: 70, pasMax: 150, rond: 0.35 })}"/></svg>
  <svg class="couche couche-3" data-profondeur="1.2" viewBox="0 0 ${L} ${H}" preserveAspectRatio="xMaxYMax slice">
    <path class="couche-sol" d="M0,${H + 400} L0,388 C200,370 380,398 620,384 C860,370 1080,396 1300,380 C1440,370 1520,378 ${L},372 L${L},${H + 400} Z"/>
    <path class="decoupe" d="M0,388 C200,370 380,398 620,384 C860,370 1080,396 1300,380 C1440,370 1520,378 ${L},372"/>

  </svg>`;

/* ---------- les pages ---------- */

const pages = [];

/* ACCUEIL */
const phares = ['lanterne-oiseaux-sur-leurs-branches', 'horloge-planisphere', 'separateur-de-livres-lumineux-sirene',
  'horloge-carpes-koi', 'lanterne-maman-et-sa-fille', 'cadre-plantes-just-one-more-18cm', 'veilleuse-colibri', 'gestion-des-emotions-panda-fille-garcon']
  .map((s) => creations.find((c) => c.slug === s)).filter(Boolean);

pages.push({
  chemin: '',
  titre: `${NOM} : lanternes, horloges et objets en bois personnalisés, Cambrai`,
  description: 'Créations en bois découpé et gravé au laser, assemblées et peintes à la main dans le Cambrésis : lanternes lumineuses, horloges, décorations et cadeaux personnalisés.',
  sombre: true,
  jsonld: [{ '@context': 'https://schema.org', ...ORGANISATION }],
  corps: (r) => `
<section class="scene" data-scene>
  <!-- PHOTO D'ILLUSTRATION (Unsplash, o54RjF-C7xo) : a remplacer par une
       photo de l'atelier de Yoann. -->
  <picture class="scene-photo" data-profondeur="0.15">
    <source media="(max-width: 700px)" srcset="${r}photos/atelier-mobile.webp">
    <source media="(max-width: 1300px)" srcset="${r}photos/atelier-1200.webp">
    <img src="${r}photos/atelier-2200.webp" alt="" width="2200" height="1514" fetchpriority="high" data-editable-zone="accueil_photo">
  </picture>
  <div class="scene-voile"></div>
  <div class="scene-lueur" aria-hidden="true"></div>
  <div class="enveloppe scene-contenu">
    <p class="surtitre scene-apparait" data-editable-zone="accueil_surtitre">Découpe et gravure laser · Cambrésis</p>
    <h1 class="scene-titre">
      <span class="scene-ligne"><span>La Fabrique</span></span>
      <span class="scene-ligne"><em>du Maquettiste</em></span>
    </h1>
    <p class="scene-chapo scene-apparait" data-editable-zone="accueil_chapo">Lanternes, horloges et cadeaux personnalisés, découpés, assemblés et peints à la main, <span>couche de bois après couche de bois.</span></p>
    <p class="scene-actions scene-apparait">
      <a class="bouton bouton-lueur" href="${r}creations/">Voir les ${creations.length} créations</a>
      <a class="bouton bouton-contour" href="${r}personnalisation/">Personnaliser un objet</a>
    </p>
  </div>
  <!-- Les couches de bois decoupees : le metier de Yoann, en entree de site.
       Elles montent l'une apres l'autre au chargement, puis bougent a des
       vitesses differentes avec la souris et le defilement. -->
  <div class="couches" aria-hidden="true">
    ${COUCHES}
  </div>
</section>

<section class="allumees">
  <div class="enveloppe">
    <div class="allumees-tete">
      <p class="surtitre">À la tombée du jour</p>
      <h2>Le bois découpé laisse passer la lumière.</h2>
    </div>
    <ul class="allumees-liste">
      ${['lanterne-oiseaux-sur-leurs-branches', 'lampe-arbre-de-vie', 'veilleuse-colibri', 'lanterne-maman-et-sa-fille']
        .map((s, i) => creations.find((c) => c.slug === s)).filter(Boolean).map((c, i) => {
          const photo = { 'lanterne-oiseaux-sur-leurs-branches': 2, 'lampe-arbre-de-vie': 2, 'veilleuse-colibri': 2, 'lanterne-maman-et-sa-fille': 4 }[c.slug];
          return `<li class="reveler"><a href="${r}${urlCreation(c)}">
            <span class="allumee-photo">${img(r, `${c.slug}-${photo}`, c.nom, { l: 600, h: 800 })}</span>
            <span class="allumee-nom">${esc(c.nom)}</span><span class="allumee-prix">${prixAffiche(c)}</span>
          </a></li>`;
        }).join('')}
    </ul>
  </div>
</section>

<section class="section">
  <div class="enveloppe">
    <div class="section-tete section-tete-ligne">
      <div><p class="surtitre">Les créations</p><h2>Par univers</h2></div>
      <a class="lien-fleche" href="${r}creations/">Toutes les créations (${creations.length})</a>
    </div>
    <ul class="univers">
      ${categoriesVisibles.map((cat) => `<li class="reveler"><a href="${r}${urlCat(cat)}">
        <span class="univers-photo">${img(r, cat.couverture || cat.creations[0].photos[0].fichier, '', { l: 600, h: 800 })}</span>
        <span class="univers-nom">${cat.nom}</span><span class="univers-nb">${cat.creations.length} création${cat.creations.length > 1 ? 's' : ''}</span>
      </a></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section gestes">
  <div class="enveloppe">
    <div class="section-tete">
      <p class="surtitre">De la planche à l’objet</p>
      <h2 data-editable-zone="gestes_titre">Tout est fait ici, à la main.</h2>
    </div>
    <ol class="gestes-liste">
      <li class="reveler"><span class="geste-num">01</span><h3>Découpe et gravure</h3><p data-editable-zone="geste_1">Le dessin est découpé et gravé au laser dans le bois : c’est là que naissent les silhouettes, les feuillages et les motifs.</p></li>
      <li class="reveler"><span class="geste-num">02</span><h3>Assemblage en couches</h3><p data-editable-zone="geste_2">Les pièces se superposent, parfois jusqu’à sept couches, pour donner le relief et l’effet 3D.</p></li>
      <li class="reveler"><span class="geste-num">03</span><h3>Peinture et finitions</h3><p data-editable-zone="geste_3">Peinture à la main, vernis, lumière : chaque pièce sort légèrement différente de la précédente.</p></li>
    </ol>
  </div>
</section>

<section class="section section-kraft">
  <div class="enveloppe">
    <div class="section-tete"><p class="surtitre">Sortis de l’atelier</p><h2>Quelques pièces</h2></div>
    <div class="grille-cartes">${phares.map((c) => carte(r, c)).join('')}</div>
  </div>
</section>

<section class="section perso-bandeau">
  <div class="enveloppe perso-grille">
    <figure class="perso-photo">${img(r, 'horloge-mariage-1', 'Horloge de mariage personnalisée en bois', { l: 600, h: 800 })}</figure>
    <div>
      <p class="surtitre">Sur mesure</p>
      <h2 data-editable-zone="perso_titre">Un prénom, un message, vos couleurs.</h2>
      <p data-editable-zone="perso_texte">La plupart des créations se personnalisent sans frais supplémentaires : un prénom sur une lanterne, les noms de vos chats sur une horloge, une date sur un cadre. Mariage, naissance, anniversaire ou événement d’entreprise : dites-moi ce que vous imaginez.</p>
      <p class="scene-actions"><a class="bouton bouton-nuit" href="${r}personnalisation/">Voir les possibilités</a></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="enveloppe trouver-grille">
    <div>
      <p class="surtitre">En vrai, c’est encore mieux</p>
      <h2>Où voir mes créations</h2>
      <p>Une lanterne, ça se regarde allumée. Mes pièces sont en dépôt dans deux boutiques de créateurs, et je suis régulièrement sur les marchés artisanaux du Cambrésis et du Douaisis.</p>
      <p class="scene-actions"><a class="bouton bouton-nuit" href="${r}ou-me-trouver/">Boutiques et prochains marchés</a></p>
    </div>
    <ul class="lieux">
      <li><span class="lieu-type">Boutique</span><strong>La Boutique des Artisans</strong><span>Cambrai</span></li>
      <li><span class="lieu-type">Boutique</span><strong>Au comptoir des artisans</strong><span data-editable-zone="lieu_2_ville">Ville à préciser</span></li>
      <li><span class="lieu-type">Marchés</span><strong>Marchés artisanaux</strong><span>Cambrésis et Douaisis</span></li>
    </ul>
  </div>
</section>`,
});

/* TOUTES LES CREATIONS */
pages.push({
  chemin: 'creations/',
  titre: `Toutes les créations en bois : lanternes, horloges, cadeaux | ${NOM}`,
  description: `${creations.length} créations en bois découpé et gravé au laser : lanternes et veilleuses, horloges, décorations murales, puzzles, gravure sur ardoise et objets personnalisés.`,
  actif: 'creations/',
  jsonld: [
    fil([['Accueil', ''], ['Créations', 'creations/']]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Créations', url: URL_SITE + 'creations/' },
  ],
  corps: (r) => `
<section class="tete-page">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Créations', 'creations/']])}
    <h1>Les créations</h1>
    <p class="tete-chapo">${creations.length} pièces en bois découpé et gravé au laser, assemblées et peintes à la main. Choisissez un univers ou parcourez tout.</p>
    <nav class="puces" aria-label="Univers">${categoriesVisibles.map((c) => `<a href="#${c.slug}">${c.nom}</a>`).join('')}</nav>
  </div>
</section>
${categoriesVisibles.map((cat) => `
<section class="section section-serree" id="${cat.slug}">
  <div class="enveloppe">
    <div class="section-tete section-tete-ligne">
      <h2>${cat.nom}</h2>
      <a class="lien-fleche" href="${r}${urlCat(cat)}">Voir l’univers</a>
    </div>
    <div class="grille-cartes">${cat.creations.map((c) => carte(r, c)).join('')}</div>
  </div>
</section>`).join('')}`,
});

/* UNE PAGE PAR CATEGORIE */
for (const cat of categoriesVisibles) {
  const autres = categoriesVisibles.filter((c) => c !== cat);
  pages.push({
    chemin: urlCat(cat),
    titre: `${cat.nom} en bois, faits main | ${NOM}`,
    description: `${cat.intro} ${cat.creations.length} création${cat.creations.length > 1 ? 's' : ''}, à partir de ${euros(Math.min(...cat.creations.map((c) => prixNombre(c.prix))).toFixed(2))}.`.slice(0, 300),
    actif: 'creations/',
    imageOg: cat.creations[0].photos[0].fichier,
    jsonld: [
      fil([['Accueil', ''], ['Créations', 'creations/'], [cat.nom, urlCat(cat)]]),
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: cat.nom, url: URL_SITE + urlCat(cat),
        mainEntity: { '@type': 'ItemList', itemListElement: cat.creations.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_SITE + urlCreation(c), name: c.nom })) } },
    ],
    corps: (r) => `
<section class="tete-page">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Créations', 'creations/'], [cat.nom, urlCat(cat)]])}
    <h1>${cat.nom}</h1>
    <p class="tete-chapo" data-editable-zone="cat_${cat.slug.replace(/-/g, '_')}_intro">${esc(cat.intro)}</p>
  </div>
</section>
<section class="section section-serree">
  <div class="enveloppe"><div class="grille-cartes">${cat.creations.map((c) => carte(r, c, 'h2')).join('')}</div></div>
</section>
<section class="section section-kraft section-serree">
  <div class="enveloppe">
    <p class="surtitre">Les autres univers</p>
    <nav class="puces" aria-label="Autres univers">${autres.map((c) => `<a href="${r}${urlCat(c)}">${c.nom}</a>`).join('')}</nav>
  </div>
</section>`,
  });
}

/* UNE PAGE PAR CREATION */
for (const c of creations) {
  const dim = dimensions(c.description);
  const voisins = c.cat.creations.filter((x) => x !== c).slice(0, 4);
  const perso = /personnalis|prénom|message|gravure/i.test(c.description + c.nom);
  pages.push({
    chemin: urlCreation(c),
    titre: `${c.nom}${dim ? ` (${dim})` : ''}, fait main | ${NOM}`,
    description: premiereLigne(c.description, 155) || `${c.nom}, création en bois faite main par ${NOM}.`,
    actif: 'creations/',
    imageOg: c.photos[0].fichier,
    jsonld: [
      fil([['Accueil', ''], ['Créations', 'creations/'], [c.cat.nom, urlCat(c.cat)], [c.nom, urlCreation(c)]]),
      { '@context': 'https://schema.org', '@type': 'Product', name: c.nom,
        description: c.description.replace(/\s+/g, ' ').trim(),
        image: c.photos.map((p) => `${URL_SITE}photos/creations/${p.fichier}.webp`),
        category: c.cat.nom, brand: { '@type': 'Brand', name: NOM },
        offers: { '@type': 'Offer', price: prixNombre(c.prix).toFixed(2), priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock', url: URL_SITE + urlCreation(c), seller: { '@id': URL_SITE + '#atelier' } } },
    ],
    corps: (r) => `
<section class="fiche">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Créations', 'creations/'], [c.cat.nom, urlCat(c.cat)], [c.nom, urlCreation(c)]])}
    <div class="fiche-grille">
      <div class="galerie" data-galerie>
        <figure class="galerie-grande">${img(r, c.photos[0].fichier, c.nom, { taille: '1200', eager: true, l: c.photos[0].l, h: c.photos[0].h })}</figure>
        ${c.photos.length > 1 ? `<div class="galerie-vignettes">${c.photos.map((p, i) => `<button type="button" class="vignette"${i === 0 ? ' aria-current="true"' : ''} data-grande="${r}photos/creations/${p.fichier}.webp" aria-label="Photo ${i + 1} sur ${c.photos.length}">${img(r, p.fichier, '', { l: 120, h: Math.round(120 * p.h / p.l) })}</button>`).join('')}</div>` : ''}
      </div>
      <div class="fiche-texte">
        <p class="surtitre"><a href="${r}${urlCat(c.cat)}">${c.cat.nom}</a></p>
        <h1>${esc(c.nom)}</h1>
        <p class="fiche-prix">${prixAffiche(c)}</p>
        ${dim ? `<p class="fiche-cote"><span class="cote">${esc(dim)}</span></p>` : ''}
        <div class="fiche-description">${paragraphes(c.description)}</div>
        <div class="fiche-actions">
          <a class="bouton bouton-lueur" href="${r}contact/?creation=${encodeURIComponent(c.nom)}">${perso ? 'Commander et personnaliser' : 'Commander cette création'}</a>
          <a class="bouton bouton-contour-sombre" href="${BOUTIQUE}/product/${c.slug}" rel="noopener">Acheter sur ma boutique en ligne</a>
        </div>
        <ul class="fiche-garanties">
          <li>Fabriqué à la main dans le Cambrésis</li>
          <li>À voir en boutique à Cambrai et sur les marchés</li>
        </ul>
      </div>
    </div>
  </div>
</section>
${voisins.length ? `<section class="section section-kraft section-serree">
  <div class="enveloppe">
    <div class="section-tete section-tete-ligne"><h2>Dans le même univers</h2><a class="lien-fleche" href="${r}${urlCat(c.cat)}">${c.cat.nom}</a></div>
    <div class="grille-cartes">${voisins.map((v) => carte(r, v)).join('')}</div>
  </div>
</section>` : ''}`,
  });
}

/* PERSONNALISATION */
pages.push({
  chemin: 'personnalisation/',
  titre: `Objets en bois personnalisés : prénom, message, mariage, naissance | ${NOM}`,
  description: 'Personnalisez une lanterne, une horloge ou un cadre en bois : prénom, message, couleurs. Mariage, naissance, anniversaire, événement d’entreprise, gravure photo sur ardoise.',
  actif: 'personnalisation/',
  imageOg: 'horloge-mariage-1',
  jsonld: [fil([['Accueil', ''], ['Personnalisation', 'personnalisation/']])],
  corps: (r) => `
<section class="tete-page">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Personnalisation', 'personnalisation/']])}
    <h1>Personnaliser un objet</h1>
    <p class="tete-chapo" data-editable-zone="perso_page_chapo">Un prénom, un message, une date, vos couleurs : la plupart de mes créations se personnalisent, et le plus souvent sans frais supplémentaires.</p>
  </div>
</section>
<section class="section section-serree">
  <div class="enveloppe occasions">
    ${[
      ['horloge-mariage-1', 'Mariage', 'Horloges, cadres, cœurs à vos prénoms. Et pour la décoration de la salle : chevalets, dessous de verre, lanternes, selon vos goûts.'],
      ['boite-a-dents-1', 'Naissance et enfance', 'Boîte à dents, tableaux des émotions et de la routine, avec le prénom de l’enfant.'],
      ['decoration-parrain-1', 'Famille', 'Papa, mamie, parrain, marraine, nounou : un mot en relief, et une couleur à choisir.'],
      ['gravure-portrait-20x20-cm-1', 'Gravure photo sur ardoise', 'Votre photo gravée sur ardoise naturelle, en 20 × 20 ou 30 × 30 cm. Envoyez-moi d’abord votre photo : je fais un test de gravure avant toute commande.'],
      ['stylo-personnalise-1', 'Entreprises et événements', 'Stylos, décapsuleurs et objets gravés à votre nom ou à votre message, pour un événement ou un cadeau d’entreprise.'],
      ['horloge-personnalisee-chats-1', 'Vos animaux', 'Le nom de vos chats sur une horloge, votre chien sur une lanterne ou gravé sur ardoise.'],
    ].map(([photo, titre, texte]) => `<article class="occasion reveler">
      <span class="occasion-photo">${img(r, photo, titre, { l: 600, h: 800 })}</span>
      <h2>${titre}</h2><p>${texte}</p>
    </article>`).join('')}
  </div>
</section>
<section class="section section-kraft">
  <div class="enveloppe comment">
    <h2>Comment ça se passe</h2>
    <ol class="gestes-liste">
      <li><span class="geste-num">01</span><h3>Vous m’écrivez</h3><p>La création qui vous plaît, le texte à graver, les couleurs, la date dont vous avez besoin.</p></li>
      <li><span class="geste-num">02</span><h3>Je vous réponds</h3><p>Je vous dis ce qui est possible, le prix et le délai. Pour une gravure photo, je fais d’abord un test.</p></li>
      <li><span class="geste-num">03</span><h3>Je fabrique</h3><p>Découpe, assemblage, peinture : votre pièce est faite pour vous, puis remise en main propre ou envoyée.</p></li>
    </ol>
    <p class="scene-actions"><a class="bouton bouton-nuit" href="${r}contact/">Décrire mon projet</a></p>
  </div>
</section>`,
});

/* OU ME TROUVER */
pages.push({
  chemin: 'ou-me-trouver/',
  titre: `Boutiques et marchés artisanaux, Cambrai et Cambrésis | ${NOM}`,
  description: 'Où voir et acheter les créations de La Fabrique du Maquettiste : La Boutique des Artisans à Cambrai, Au comptoir des artisans et les marchés artisanaux du Cambrésis.',
  actif: 'ou-me-trouver/',
  jsonld: [fil([['Accueil', ''], ['Où me trouver', 'ou-me-trouver/']])],
  corps: (r) => `
<section class="tete-page">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Où me trouver', 'ou-me-trouver/']])}
    <h1>Où me trouver</h1>
    <p class="tete-chapo">Mes créations sont en dépôt dans deux boutiques de créateurs, et je suis souvent sur les marchés artisanaux du Cambrésis et du Douaisis.</p>
  </div>
</section>
<section class="section section-serree">
  <div class="enveloppe trouver-grille">
    <div>
      <h2>En boutique</h2>
      <ul class="lieux">
        <li><span class="lieu-type">Dépôt</span><strong>La Boutique des Artisans</strong><span>Cambrai</span></li>
        <li><span class="lieu-type">Dépôt</span><strong>Au comptoir des artisans</strong><span data-editable-zone="lieu_2_ville">Ville à préciser</span></li>
      </ul>
    </div>
    <div>
      <h2>Prochains marchés</h2>
      <ul class="agenda" data-editable-zone="agenda">
        <li><time datetime="2026-09-18"><b>18</b> sept.</time><span><strong>Animation gravure</strong>Repère des créateurs, Cambrai</span></li>
        <li><time datetime="2026-09-19"><b>19</b> sept.</time><span><strong>Foire</strong>Le Cateau-Cambrésis</span></li>
      </ul>
      <p class="petit">Les dates sont aussi annoncées sur <a href="${INSTAGRAM}" rel="noopener">Instagram</a>.</p>
    </div>
  </div>
</section>
<section class="section section-kraft section-serree">
  <div class="enveloppe perso-grille">
    <figure class="perso-photo">${img(r, 'lanterne-maman-et-sa-fille-4', 'Lanterne allumée dans la pénombre', { l: 600, h: 800 })}</figure>
    <div>
      <h2>Pas près de Cambrai ?</h2>
      <p>Toutes les créations se commandent aussi à distance. Écrivez-moi : on voit ensemble la personnalisation, le délai et l’envoi.</p>
      <p class="scene-actions"><a class="bouton bouton-nuit" href="${r}contact/">M’écrire</a></p>
    </div>
  </div>
</section>`,
});

/* CONTACT */
pages.push({
  chemin: 'contact/',
  titre: `Contact et commande | ${NOM}`,
  description: 'Commander une création en bois, demander une personnalisation ou un devis pour un mariage ou un événement : écrivez à La Fabrique du Maquettiste.',
  actif: 'contact/',
  jsonld: [fil([['Accueil', ''], ['Contact', 'contact/']])],
  corps: (r) => `
<section class="tete-page">
  <div class="enveloppe">
    ${filVisible(r, [['Accueil', ''], ['Contact', 'contact/']])}
    <h1>Commander, personnaliser, poser une question</h1>
    <p class="tete-chapo">Dites-moi quelle création vous plaît et ce que vous voulez y graver. Je vous réponds avec le prix et le délai.</p>
  </div>
</section>
<section class="section section-serree">
  <div class="enveloppe contact-grille">
    <form class="formulaire" data-formulaire action="mailto:${EMAIL}" method="post">
      <label>Votre nom<input name="nom" autocomplete="name" required></label>
      <label>Votre e-mail ou téléphone<input name="coordonnees" autocomplete="email" required></label>
      <label>La création<input name="creation" data-creation placeholder="Ex. : Lanterne hiboux"></label>
      <label>Votre demande<textarea name="message" rows="6" required placeholder="Prénom ou message à graver, couleurs, date souhaitée…"></textarea></label>
      <button class="bouton bouton-lueur" type="submit">Envoyer ma demande</button>
      <p class="petit">Votre message s’ouvre dans votre messagerie, prêt à partir.</p>
    </form>
    <aside class="contact-aside">
      <h2>Directement</h2>
      <p><a class="lien-fort" href="mailto:${EMAIL}">${EMAIL}</a></p>
      <p><a class="lien-fort" href="${INSTAGRAM}" rel="noopener">Instagram</a></p>
      <p class="petit">Pour une gravure photo sur ardoise, joignez votre photo à l’e-mail : je fais un test avant toute commande.</p>
    </aside>
  </div>
</section>`,
});

/* ---------- ecriture ---------- */

for (const p of pages) {
  const dossier = path.join(ICI, p.chemin);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), page(p));
}

fs.writeFileSync(path.join(ICI, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${URL_SITE}${p.chemin}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ICI, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${URL_SITE}sitemap.xml\n`);

console.log(`${pages.length} pages · ${creations.length} créations · ${categoriesVisibles.length} univers`);
const sansDim = creations.filter((c) => !dimensions(c.description)).map((c) => c.slug);
console.log('sans dimensions :', sansDim.join(', '));
