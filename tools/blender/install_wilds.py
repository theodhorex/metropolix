"""Install Blender wild scenery renders into apps/web/public/art/<arc>/ and update manifest.json.
Usage:
  python3 install_wilds.py [arc ...]   (no args = all arcs with renders in out/)
"""
import json
import os
import re
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'art'))
OUT = os.path.join(HERE, 'out')
WILD_FILE = re.compile(r'^wild_(\d+)_(\d+)_(\d+)\.png$')
LAND_FILE = re.compile(r'^land_(\d+)_(\d+)\.png$')
EXT = '.webp'


def _crop_and_save(dst, prefix, frames_map):
    frame_indices = sorted(frames_map.keys())
    ims = [Image.open(frames_map[fr]).convert('RGBA') for fr in frame_indices]

    # Common top crop for animation stability
    bboxes = [im.getchannel('A').getbbox() for im in ims if im.getchannel('A').getbbox()]
    if bboxes:
        top = min(b[1] for b in bboxes)
        top = max(0, top - 4)
    else:
        top = 0

    # Save as WebP at full resolution, quality 95, bottom-anchored
    for fr_idx, im in zip(frame_indices, ims):
        cropped = im.crop((0, top, im.width, im.height))
        out_name = f'{prefix}_{fr_idx}{EXT}'
        cropped.save(os.path.join(dst, out_name), quality=95, alpha_quality=100, method=6)

    return len(ims), top


def install_wilds(target_arcs=None):
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

        # Group by piece (i, v) -> list of frame paths sorted by frame index
        pieces = {}
        lands = {}
        for f in os.listdir(arc_out):
            m = WILD_FILE.match(f)
            if m:
                i, v, fr = int(m.group(1)), int(m.group(2)), int(m.group(3))
                pieces.setdefault((i, v), {})[fr] = os.path.join(arc_out, f)
                continue
            ml = LAND_FILE.match(f)
            if ml:
                k, fr = int(ml.group(1)), int(ml.group(2))
                lands.setdefault(k, {})[fr] = os.path.join(arc_out, f)

        if not pieces and not lands:
            continue

        dst = os.path.join(ART, arc)
        os.makedirs(dst, exist_ok=True)

        if pieces:
            wild_manifest = manifest.setdefault(arc, {}).setdefault('_wild', {})
            for (i, v), frames_map in sorted(pieces.items()):
                n_ims, top = _crop_and_save(dst, f'wild_{i}_{v}', frames_map)
                wild_manifest[f'{i}_{v}'] = n_ims
                print(f'Installed {arc}/wild_{i}_{v} ({n_ims} frames, crop top={top})')
            manifest[arc]['_wild'] = dict(sorted(wild_manifest.items()))

        if lands:
            land_manifest = manifest.setdefault(arc, {}).setdefault('_land', {})
            for k, frames_map in sorted(lands.items()):
                n_ims, top = _crop_and_save(dst, f'land_{k}', frames_map)
                land_manifest[f'{k}'] = n_ims
                print(f'Installed {arc}/land_{k} ({n_ims} frames, crop top={top})')
            manifest[arc]['_land'] = dict(sorted(land_manifest.items()))

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f'Updated {manifest_path}')


if __name__ == '__main__':
    install_wilds(sys.argv[1:] or None)
