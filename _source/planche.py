# Planche-contact des premieres photos de chaque creation (pour choisir le hero).
import json, os
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
DOSSIER = os.path.join(ICI, '..', 'photos', 'creations')
catalogue = json.load(open(os.path.join(ICI, 'catalogue.json'), encoding='utf-8'))

vignettes = []
for c in catalogue:
    for p in c['photos']:
        vignettes.append((c['slug'] + '-' + p['fichier'].split('-')[-1], os.path.join(DOSSIER, p['fichier'] + '-600.webp')))

COTE, COL = 220, 10
lignes = (len(vignettes) + COL - 1) // COL
planche = Image.new('RGB', (COL * COTE, lignes * (COTE + 18)), 'white')
d = ImageDraw.Draw(planche)
for i, (nom, chemin) in enumerate(vignettes):
    im = Image.open(chemin)
    im.thumbnail((COTE, COTE))
    x, y = (i % COL) * COTE, (i // COL) * (COTE + 18)
    planche.paste(im, (x + (COTE - im.width) // 2, y + (COTE - im.height) // 2))
    d.text((x + 3, y + COTE + 2), f'{i}:{nom[:30]}', fill='black')
planche.save(os.path.join(ICI, 'planche.jpg'), quality=70)
json.dump([n for n, _ in vignettes], open(os.path.join(ICI, 'planche.json'), 'w'))
print(len(vignettes), planche.size)
