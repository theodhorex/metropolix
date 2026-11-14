"""Install Blender citizen and soldier renders into apps/web/public/art/<arc>/ and update manifest.json.
Usage:
  python3 install_people.py [arc ...]   (no args = all arcs with people renders in out/)
Saves WebP q95 to apps/web/public/art/<arc>/ with the same base names:
  cit_<v>_<view>_<f>.webp   (v 0..5, view front|back, f 0..4)
  sol_<view>_<f>.webp       (view front|back, f 0..4)
Sets manifest key "_people": {"cit": 6, "frames": 5} under each arc (keeping all other keys).
"""
import json
import os
import re
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'art'))
OUT = os.path.join(HERE, 'out')
PEOPLE_FILE = re.compile(r'^(?:cit_[0-5]|sol)_(?:front|back)_[0-4]\.png$')
EXT = '.webp'


def install_people(target_arcs=None):
    manifest_path = os.path.join(ART, 'manifest.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    else:
        manifest = {}

    arcs = target_arcs or [d for d in sorted(os.listdir(OUT)) if os.path.isdir(os.path.join(OUT, d))]

    for arc in arcs:
        arc_out = os.path.join(OUT, arc)
        if not os.path.isdir(arc_out):
            continue

        pngs = sorted(f for f in os.listdir(arc_out) if PEOPLE_FILE.match(f))
        if not pngs:
            continue

        dst = os.path.join(ART, arc)
        os.makedirs(dst, exist_ok=True)

        for fname in pngs:
            src_path = os.path.join(arc_out, fname)
            out_name = fname[:-4] + EXT
            im = Image.open(src_path).convert('RGBA')
            im.save(os.path.join(dst, out_name), quality=95, alpha_quality=100, method=6)

        arc_dict = manifest.setdefault(arc, {})
        arc_dict['_people'] = {'cit': 6, 'frames': 5}
        manifest[arc] = dict(sorted(arc_dict.items()))
        print(f'Installed {arc}: {len(pngs)} people sprites -> {dst}')

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f'Updated {manifest_path}')


if __name__ == '__main__':
    install_people(sys.argv[1:] or None)
