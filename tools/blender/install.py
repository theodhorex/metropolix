"""Copy renders into the game and rewrite public/art/manifest.json.
   python3 install.py <arc> [kind ...]   (no kinds = every render in out/<arc>)
Each image is cropped at the top only, so the canvas stays 256 px wide with the tile's bottom corner on
its bottom edge; all frames of a kind share one crop so the animation does not jump.
Saved as WebP at full resolution (quality 95, lossless alpha edge): looks the same as the PNG at about a
fifth of the bytes, so a people's art downloads and decodes fast."""
import json, os, re, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'art'))
FRAME = re.compile(r'^(.+)_(\d+)\.(?:png|webp)$')
EXT = '.webp'


def renders(arc):
    out = os.path.join(HERE, 'out', arc)
    kinds = {}
    for f in os.listdir(out):
        if not f.endswith('.png') or f.startswith('_'):
            continue
        m = FRAME.match(f)
        k = m.group(1) if m else f[:-4]
        kinds.setdefault(k, []).append(os.path.join(out, f))
    return {k: sorted(v) for k, v in kinds.items()}


def install(arc, kinds=None):
    dst = os.path.join(ART, arc)
    os.makedirs(dst, exist_ok=True)
    table = renders(arc)
    for k in kinds or sorted(table):
        files = table[k]
        ims = [Image.open(p).convert('RGBA') for p in files]
        top = min(im.getchannel('A').getbbox()[1] for im in ims if im.getchannel('A').getbbox())
        top = min(max(0, top - 4), ims[0].height - 128)  # at least one tile tall
        for old in os.listdir(dst):  # drop the other form (single <-> frames) of this kind
            m = FRAME.match(old)
            if old in (f'{k}.png', f'{k}.webp') or (m and m.group(1) == k):
                os.remove(os.path.join(dst, old))
        names = [f'{k}{EXT}'] if len(ims) == 1 else [f'{k}_{i}{EXT}' for i in range(len(ims))]
        for im, n in zip(ims, names):
            im.crop((0, top, im.width, im.height)).save(os.path.join(dst, n), quality=95, alpha_quality=100, method=6)
    write_manifest()


def write_manifest():
    # scenery (wild_*) is listed under "_wild" by install_wilds.py: keep that entry, skip its files here
    path = os.path.join(ART, 'manifest.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    man = {}
    for arc in sorted(os.listdir(ART)):
        d = os.path.join(ART, arc)
        if not os.path.isdir(d):
            continue
        kinds = {}
        for f in os.listdir(d):
            if f.startswith(('wild_', 'land_')):
                continue
            m = FRAME.match(f)
            if m:
                kinds[m.group(1)] = max(kinds.get(m.group(1), 0), int(m.group(2)) + 1)
            elif f.endswith(EXT):
                kinds.setdefault(f[:-len(EXT)], 1)
        for s in ('_wild', '_land'):
            if s in old.get(arc, {}):
                kinds[s] = old[arc][s]
        if kinds:
            man[arc] = dict(sorted(kinds.items()))
    with open(path, 'w') as f:
        json.dump(man, f, indent=1)
    print('manifest:', {a: len(k) for a, k in man.items()})


if __name__ == '__main__':
    install(sys.argv[1], sys.argv[2:] or None)
