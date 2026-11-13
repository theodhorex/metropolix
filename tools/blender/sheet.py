"""Contact sheet for review: python3 sheet.py <arc> [kind ...] -> out/<arc>/_sheet.png (labelled)."""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
arc, kinds = sys.argv[1], sys.argv[2:]
out = os.path.join(HERE, 'out', arc)
if not kinds:
    kinds = sorted({f.rsplit('.', 1)[0].rsplit('_', 1)[0] if f[:-4].rsplit('_', 1)[-1].isdigit() else f[:-4] for f in os.listdir(out) if f.endswith('.png') and not f.startswith('_')})
cols, cw, ch = 8, 160, 260
rows = (len(kinds) + cols - 1) // cols
sh = Image.new('RGBA', (cols * cw, rows * ch), (112, 140, 84, 255))
d = ImageDraw.Draw(sh)
for i, k in enumerate(kinds):
    p = os.path.join(out, k + '.png')
    if not os.path.exists(p):
        p = os.path.join(out, k + '_0.png')
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGBA')
    im = im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS)
    x, y = (i % cols) * cw, (i // cols) * ch
    im = im.crop((0, max(0, im.height - (ch - 16)), cw, im.height))
    sh.alpha_composite(im, (x, y + ch - 16 - im.height))
    d.text((x + 4, y + ch - 14), k, fill=(255, 255, 255, 255))
sh.save(os.path.join(out, '_sheet.png'))
print(os.path.join(out, '_sheet.png'))
