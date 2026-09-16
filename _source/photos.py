# Telecharge les photos du catalogue SumUp (CDN public images.sumup.com) et
# les convertit en WebP : 1200 px (fiche) et 600 px (vignette).
import json, os, io, subprocess
from PIL import Image, ImageOps

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'photos', 'creations')
os.makedirs(SORTIE, exist_ok=True)

catalogue = json.load(open(os.path.join(ICI, 'catalogue.json'), encoding='utf-8'))

def charger(url):
    r = subprocess.run(['curl', '-s', '-f', '--max-time', '60', url], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError('curl ' + str(r.returncode))
    return r.stdout

def enregistrer(img, nom, cote, qualite=80):
    im = img.copy()
    im.thumbnail((cote, cote), Image.LANCZOS)
    im.save(os.path.join(SORTIE, nom), 'WEBP', quality=qualite, method=6)

total = 0
for c in catalogue:
    sources = [('https://images.sumup.com/' + i) for i in c['images']]
    if not sources and c.get('imageSecours'):
        sources = [c['imageSecours']]
    c['photos'] = []
    for n, url in enumerate(sources, 1):
        base = f"{c['slug']}-{n}"
        if not os.path.exists(os.path.join(SORTIE, base + '.webp')):
            try:
                brut = charger(url)
            except Exception as e:
                print('introuvable :', c['slug'], url, e)
                continue
            img = Image.open(io.BytesIO(brut))
            img = ImageOps.exif_transpose(img).convert('RGB')
            enregistrer(img, base + '.webp', 1200)
            enregistrer(img, base + '-600.webp', 600, 78)
        with Image.open(os.path.join(SORTIE, base + '.webp')) as im:
            c['photos'].append({'fichier': base, 'l': im.width, 'h': im.height})
        total += 1

json.dump(catalogue, open(os.path.join(ICI, 'catalogue.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(total, 'photos')
