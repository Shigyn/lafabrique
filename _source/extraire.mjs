// Recupere le catalogue de la boutique SumUp de La Fabrique du Maquettiste
// (aperçu de prospection, 2026-09-16) : noms, prix, categories,
// descriptions et identifiants des photos. Ecrit catalogue.json.
import fs from 'node:fs';

const BASE = 'https://la-fabrique-du-maquettiste.sumupstore.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const lire = async (chemin) => {
  const r = await fetch(BASE + chemin, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!r.ok) throw new Error(chemin + ' ' + r.status);
  return r.text();
};

const entites = (s) => s
  .replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'");

const CATEGORIES = { Lanterne: 'Lanterne/photophore', Jeux: 'Jeux/puzzle' };

const liste = [];
for (let p = 1; p <= 4; p++) {
  const html = await lire('/produits?page=' + p);
  const re = /<a data-analytics="product-list-item" href="[^"]*\/product\/([^"]+)" aria-label="([^"]*)"[\s\S]*?<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const bloc = m[0];
    const prix = bloc.match(/(\d+,\d{2})/);
    liste.push({ slug: m[1], nom: entites(m[2]).trim(), prix: prix ? prix[1] : null, variantes: /variantes/i.test(bloc) });
  }
}

const catalogue = [];
for (const item of liste) {
  const html = await lire('/product/' + item.slug);
  const t = html.replace(/\\"/g, '"').replace(/&quot;/g, '"');
  const og = html.match(/<meta property="og:description" content="([^"]*)"/);
  const ogImg = html.match(/<meta property="og:image" content="([^"]*)"/);
  // Les photos des « articles connexes » apparaissent aussi dans la page.
  const connexes = new Set([...t.matchAll(/"slug":"([^"]+)","image":"https:\/\/images\.sumup\.com\/(img_[A-Z0-9]+)"/g)]
    .filter((x) => x[1] !== item.slug).map((x) => x[2]));
  const images = [...new Set(t.match(/img_[A-Z0-9]{26}/g) || [])].filter((i) => !connexes.has(i));
  // Fil d'Ariane : Accueil / Produits / <categorie> / <nom>
  const fil = t.match(/Produits<\/a>[\s\S]{0,400}?>([^<>]{2,40})<\/a>/);
  const cat = fil ? entites(fil[1]).trim() : '';
  catalogue.push({
    ...item,
    categorie: CATEGORIES[cat] || cat,
    description: og ? entites(og[1]).trim() : '',
    images,
    imageSecours: images.length ? null : (ogImg ? ogImg[1] : null),
  });
}

fs.writeFileSync(new URL('./catalogue.json', import.meta.url), JSON.stringify(catalogue, null, 2));
console.log(catalogue.length, 'produits ;', [...new Set(catalogue.map((c) => c.categorie))].join(' | '));
console.log('sans categorie :', catalogue.filter((c) => !c.categorie).map((c) => c.slug).join(', ') || 'aucun');
console.log('photos :', catalogue.reduce((s, c) => s + c.images.length, 0), '; sans photo :', catalogue.filter((c) => !c.images.length).map((c) => c.slug).join(', '));
