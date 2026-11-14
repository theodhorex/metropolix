"""Blender chibi citizens (6 sub-species) and soldier for all five peoples.
Run headless:
  blender -b --factory-startup -P people.py -- [arc ...]
Renders 64x96 transparent PNGs (4x of 16x24, feet centred at x=32 on bottom row):
  out/<arc>/cit_<v>_<view>_<f>.png   (v 0..5, view front|back, f 0..4)
  out/<arc>/sol_<view>_<f>.png       (view front|back, f 0..4)
Also builds contact sheets:
  out/<arc>/_sheet_people.png        (full 64x96 scale)
  out/<arc>/_sheet_people_1x.png     (4x downscaled 16x24 readability check)
"""
import math
import os
import sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import bpy  # noqa: E402
import kit  # noqa: E402
from kit import box, cone, cyl, mat, sphere  # noqa: E402

ARCS = ('elf', 'lizard', 'caveman', 'dragon', 'goblin')
VIEWS = ('front', 'back')
FRAMES = 5  # 0..3 walk cycle, 4 idle

# 64x96 canvas (4x of 16x24 pixel canvas)
CW = 64
CH = 96
# 1 unit in 16x24 character coordinates (sized so tallest plumes/spears & widest shields fit with clean margin):
U = 1.0 / 17.6
Z = U / math.cos(math.radians(30))
# Camera rotation around Z so local +X faces camera (+F_cam) and local +Y points screen-right (+R_cam)
CAM_Z = math.radians(45)
SIN45 = math.sqrt(0.5)
OUT_COLOR = '#12151d'
OUT_WIDTH = 0.014


def shade(hex_col, d):
    """Shift #rrggbb channels by d (-255..255), matching shade() in apps/web/lib/citizens.ts."""
    n = int(hex_col.lstrip('#'), 16)
    cl = lambda v: max(0, min(255, int(round(v))))
    r = cl((n >> 16) + d)
    g = cl(((n >> 8) & 255) + d)
    b = cl((n & 255) + d)
    return f'#{r:02x}{g:02x}{b:02x}'


def S(name, skin, hair, hairStyle, top, trim, bottom, tool, build='normal', **extra):
    d = {
        'name': name, 'skin': skin, 'hair': hair, 'hairStyle': hairStyle,
        'top': top, 'trim': trim, 'bottom': bottom, 'tool': tool, 'build': build,
        'eye': '#1a1a22', 'beard': False, 'apron': False, 'goggles': False, 'crown': False,
    }
    d.update(extra)
    return d


# Exact SPECIES table from apps/web/lib/citizens.ts
SPECIES = {
    'elf': [
        S('Wood elf', '#f0d2b0', '#7a4a2a', 'long', '#2f8f55', '#d9c46a', '#5a3a22', 'bow'),
        S('High elf', '#f6e2c8', '#e8e8f0', 'long', '#f0ead8', '#e0b83a', '#c9c2ae', 'staff'),
        S('Dark elf', '#a9a0c0', '#f2f2ff', 'short', '#3a2f5a', '#8f6fd0', '#221a38', 'dagger', 'normal', eye='#ff6a8a'),
        S('Elf child', '#f0d2b0', '#c9a050', 'short', '#6bbf6a', '#f0e0a0', '#7a5a3a', 'none', 'child'),
        S('Elf farmer', '#ecc9a2', '#8a5a30', 'bun', '#d8c070', '#8a6a30', '#5a4a2a', 'basket'),
        S('Elf guard', '#f0d2b0', '#5a3a22', 'helmet', '#3a7a4a', '#c0c8d0', '#34503a', 'spear'),
    ],
    'lizard': [
        S('Marsh skink', '#4fae8a', '#2f7a5e', 'bald', '#d98a2b', '#f0e0a0', '#6a4a2a', 'staff', 'normal', eye='#f8e060'),
        S('Sun gecko', '#e8a13a', '#c0501a', 'mohawk', '#a83a3a', '#f8d060', '#6a2a1a', 'none', 'normal', eye='#2a1a05'),
        S('Iguana warrior', '#5a8ad0', '#2a4a8a', 'mohawk', '#4a5a7a', '#c0d0e8', '#2a3248', 'spear', 'broad', eye='#fff080'),
        S('Chameleon trader', '#a888d8', '#6a48a8', 'bald', '#e0c24a', '#7a4ac0', '#4a3a2a', 'basket', 'normal', eye='#fff080'),
        S('Hatchling', '#7fcf8a', '#3a9a58', 'bald', '#e07a2a', '#f8e060', '#6a4a2a', 'none', 'child', eye='#2a1a05'),
        S('Cobra priest', '#7a9a4a', '#4a5a2a', 'hood', '#7a2a6a', '#f0d060', '#3a1a38', 'staff', 'normal', eye='#ffe040'),
    ],
    'caveman': [
        S('Hunter', '#d9a679', '#3a2418', 'wild', '#a8743f', '#e8d8b8', '#6f4a2a', 'club', 'normal', beard=True),
        S('Elder', '#d9b08a', '#e8e8e8', 'bald', '#c0a880', '#e8d8b8', '#8a6a42', 'staff', 'normal', beard=True),
        S('Gatherer', '#d9a679', '#5a3a22', 'bun', '#8a5a32', '#e8d8b8', '#6a4a2a', 'basket'),
        S('Cave child', '#e0b08a', '#4a2a18', 'wild', '#b88a52', '#e8d8b8', '#7a5a38', 'none', 'child'),
        S('Shaman', '#c8956a', '#2a1a10', 'wild', '#4a6a8a', '#e8d8b8', '#2a3a4a', 'staff', 'normal', beard=True),
        S('Brute', '#c8956a', '#2a1a10', 'bald', '#6f4a2a', '#c8a060', '#4a3220', 'hammer', 'broad', beard=True),
    ],
    'dragon': [
        S('Drake warrior', '#b8483c', '#2a1a1a', 'bald', '#3a2a3a', '#d9a64a', '#1e1624', 'spear', 'broad', eye='#ffd34a'),
        S('Scalekin smith', '#8a3a34', '#2a1a1a', 'bald', '#5a4a40', '#2a2a2a', '#2a2018', 'hammer', 'broad', apron=True, eye='#ffd34a'),
        S('Wyrmling', '#d0604a', '#3a1a18', 'bald', '#d9a64a', '#fff0b0', '#5a2a20', 'none', 'child', eye='#ffffff'),
        S('Dragon mage', '#a04a8a', '#2a1a2a', 'hood', '#5a2a8a', '#ffd34a', '#2a1648', 'staff', 'normal', eye='#ffe070'),
        S('Ember noble', '#c85a3a', '#2a1a1a', 'bald', '#7a1a2a', '#ffd34a', '#3a0e18', 'none', 'normal', crown=True, eye='#ffd34a'),
        S('Drake miner', '#7a6a6a', '#2a2a2a', 'helmet', '#4a4a52', '#d9a64a', '#2a2a32', 'pick', 'normal', eye='#ffd34a'),
    ],
    'goblin': [
        S('Scrapper', '#7fb347', '#3a4a22', 'mohawk', '#6b5a3a', '#9a9aa8', '#3a3020', 'dagger', 'normal', eye='#ffe04a'),
        S('Tinker', '#8cbf4f', '#4a3a22', 'bald', '#7a4a2a', '#c8a050', '#3a2a1a', 'hammer', 'normal', goggles=True, eye='#ffe04a'),
        S('Sneak', '#5f9a3a', '#2a3a1a', 'hood', '#3a4a3a', '#6a7a5a', '#222a1e', 'dagger', 'normal', eye='#ff9a3a'),
        S('Gobbo kid', '#9ccf5a', '#4a5a2a', 'wild', '#8a6a2a', '#c8a050', '#4a3a1a', 'none', 'child', eye='#ffe04a'),
        S('Warboss', '#6a9a3a', '#2a3a1a', 'helmet', '#5a4a3a', '#b8b8c8', '#2e2418', 'club', 'broad', eye='#ff6a3a'),
        S('Scavenger', '#86b64a', '#4a3a22', 'bun', '#8a7a4a', '#c8a050', '#3a3220', 'basket', 'normal', eye='#ffe04a'),
    ],
}

# Exact SOLDIER_STYLES table from apps/web/lib/sprites-wave2.ts
SOLDIER_STYLES = {
    'elf': {
        'skin': '#f0d2b0', 'skinDark': '#c9a682', 'tunic': '#25633e',
        'armor': '#90a4ae', 'armorLight': '#cfd8dc', 'helm': '#90a4ae', 'helmLight': '#e2e8f0',
        'plume': '#ffd54f', 'shield': '#2e7d47', 'shieldRim': '#ffd54f', 'legs': '#344e3a', 'eye': '#1a1a22',
    },
    'lizard': {
        'skin': '#4fae8a', 'skinDark': '#2f7a5e', 'tunic': '#2a5c6a',
        'armor': '#c98a32', 'armorLight': '#f7d454', 'helm': '#b57c28', 'helmLight': '#ffe082',
        'plume': '#ef5350', 'shield': '#8c2f24', 'shieldRim': '#f7d454', 'legs': '#26384a', 'eye': '#fff080',
    },
    'caveman': {
        'skin': '#d9a679', 'skinDark': '#a8784e', 'tunic': '#6e4726',
        'armor': '#9c6b3f', 'armorLight': '#c99a6b', 'helm': '#d9cfc0', 'helmLight': '#fff8eb',
        'plume': '#e53935', 'shield': '#7d5230', 'shieldRim': '#e8d8b8', 'legs': '#4a3220', 'eye': '#1a1a22',
    },
    'dragon': {
        'skin': '#b8483c', 'skinDark': '#822c22', 'tunic': '#4a1c24',
        'armor': '#4f5661', 'armorLight': '#7d8796', 'helm': '#454c57', 'helmLight': '#909ba8',
        'plume': '#ffd54f', 'shield': '#8c221c', 'shieldRim': '#ffd54f', 'legs': '#241822', 'eye': '#ffd34a',
    },
    'goblin': {
        'skin': '#7fb347', 'skinDark': '#56802b', 'tunic': '#5c3424',
        'armor': '#687280', 'armorLight': '#9aa5b4', 'helm': '#5c6673', 'helmLight': '#9aa5b4',
        'plume': '#ef5350', 'shield': '#962820', 'shieldRim': '#cfd8dc', 'legs': '#2e2418', 'eye': '#ffe04a',
    },
}


def setup_scene():
    """Reset scene with kit's iso camera and warm sun, framed for a 64x96 character canvas."""
    sc = kit.reset()
    sc.render.resolution_x = CW
    sc.render.resolution_y = CH
    ee = sc.eevee
    if hasattr(ee, 'taa_render_samples'):
        try:
            ee.taa_render_samples = 16
        except Exception:
            pass
    cam = sc.camera.data
    cam.ortho_scale = 1.0
    # Put world (0, 0, 0) 6.5 px above bottom edge so feet + outline sit on row 23 (y=92..95)
    cam.shift_y = (CH / 2.0 - 6.5) / CW
    return sc


def wpos(u, v, z, back=False):
    """Convert character coordinates (u=screen-right, v=char-forward, z=up) in 16x24 pixel units to world XYZ."""
    vv = (-v if back else v) * U
    uu = u * U
    return (-uu * SIN45 + vv * SIN45, uu * SIN45 + vv * SIN45, z * Z)


class RigPart:
    """Group of Blender objects moved/rotated around a pivot in character (u, v, z) space."""
    def __init__(self, u0, v0, z0, back=False):
        self.u0 = u0
        self.v0 = v0
        self.z0 = z0
        self.back = back
        self.items = []

    def add(self, ob, du, dv, dz, rx=0.0, ry=0.0, rz=0.0):
        self.items.append((ob, du, dv, dz, rx, ry, rz))
        return ob

    def pose(self, du=0.0, dv=0.0, dz=0.0, pitch=0.0, roll=0.0, yaw=0.0):
        s_v = -1.0 if self.back else 1.0
        cp, sp_ = math.cos(pitch), math.sin(pitch)
        for ob, ox, oy, oz, rx, ry, rz in self.items:
            rv = oy * cp - oz * sp_
            rz_off = oy * sp_ + oz * cp
            u = self.u0 + du + ox
            v = self.v0 + dv + rv
            z = self.z0 + dz + rz_off
            ob.location = wpos(u, v, z, self.back)
            ob.rotation_euler = (rx + roll, ry + s_v * pitch, CAM_Z + rz + yaw)


def cbox(part, du, dv, dz, su, sv, sz, m, name='box', bevel=0.05, rx=0.0, ry=0.0, rz=0.0):
    """Create a box in character space relative to `part` pivot (du=right, dv=fwd, dz=bottom-up)."""
    ob = box(0, 0, -sz * Z * 0.5, sv * U, su * U, sz * Z, m, name=name, bevel=bevel * U if bevel else 0.0)
    return part.add(ob, du, dv, dz + sz * 0.5, rx, ry, rz)


def csphere(part, du, dv, dz, ru, rv, rz_rad, m, name='sph', rx=0.0, ry=0.0, rz=0.0):
    """Create a low-poly sphere with vertex-baked scale so SOLIDIFY outline has uniform thickness."""
    ob = sphere(0, 0, 0, 1.0, m, name=name, squash=1.0)
    sx, sy, sz = rv * U, ru * U, rz_rad * Z
    for v in ob.data.vertices:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    ob.data.update()
    return part.add(ob, du, dv, dz, rx, ry, rz)


def ccone(part, du, dv, dz, r1, r2, sz, m, seg=8, name='cone', rx=0.0, ry=0.0, rz=0.0):
    """Create a cone/frustum in character space with base at dz and height sz."""
    ob = cone(0, 0, -sz * Z * 0.5, r1 * U, sz * Z, m, seg=seg, r_top=r2 * U, name=name)
    return part.add(ob, du, dv, dz + sz * 0.5, rx, ry, rz)


def ccyl(part, du, dv, dz, r, sz, m, seg=10, name='cyl', rx=0.0, ry=0.0, rz=0.0):
    """Create a cylinder in character space with base at dz and height sz."""
    ob = cyl(0, 0, -sz * Z * 0.5, r * U, sz * Z, m, seg=seg, name=name)
    return part.add(ob, du, dv, dz + sz * 0.5, rx, ry, rz)


def build_race_head_features(arc, head, hw, hd, hh, sp, m_skin, m_skin_dark, m_hair, child=False):
    """Add distinct racial head features: ears, snout, horns, brow."""
    if arc in ('elf', 'goblin'):
        big = (arc == 'goblin')
        ew = 2.6 if big else 1.9
        eh = 1.4 if big else 1.1
        tilt = 0.25 if big else 0.35
        for s in (-1, 1):
            cbox(head, s * (hw * 0.5 + ew * 0.42), -0.1, hh * 0.42, ew, 1.1, eh, m_skin, bevel=0.08, rx=s * tilt)
            # Inner ear shade
            cbox(head, s * (hw * 0.5 + ew * 0.45), 0.35, hh * 0.45, ew * 0.55, 0.5, eh * 0.45, m_skin_dark, name='noink_ear')
        if big:
            # Prominent goblin pointy nose on front
            cbox(head, 0.0, hd * 0.5 + 0.45, hh * 0.28, 1.3, 1.2, 1.2, m_skin_dark, bevel=0.06)

    elif arc == 'lizard':
        # Projecting reptilian snout with nostrils
        sn_w = hw * 0.58
        sn_d = 1.8 if not child else 1.3
        sn_h = 2.2 if not child else 1.8
        cbox(head, 0.0, hd * 0.5 + sn_d * 0.35, hh * 0.12, sn_w, sn_d, sn_h, m_skin, bevel=0.12)
        cbox(head, 0.0, hd * 0.5 + sn_d * 0.55, hh * 0.14, sn_w * 0.85, 0.7, 0.8, m_skin_dark, name='noink_snout')
        # Dorsal scale crest along top of head when not hooded
        if sp.get('hairStyle') != 'hood':
            for i, (dz_c, dv_c) in enumerate(((hh - 0.1, 0.6), (hh + 0.15, -0.5), (hh - 0.1, -1.6))):
                cbox(head, 0.0, dv_c, dz_c, 1.3, 1.2, 1.1 - i * 0.12, m_hair, bevel=0.04)

    elif arc == 'caveman':
        # Heavy prehistoric brow ridge
        cbox(head, 0.0, hd * 0.5 + 0.25, hh * 0.58, hw * 0.86, 1.1, 1.0, m_skin_dark, bevel=0.06)

    elif arc == 'dragon':
        # Draconic snout
        sn_w = hw * 0.56
        sn_d = 1.6 if not child else 1.2
        cbox(head, 0.0, hd * 0.5 + sn_d * 0.32, hh * 0.14, sn_w, sn_d, 2.0, m_skin, bevel=0.10)
        cbox(head, 0.0, hd * 0.5 + sn_d * 0.52, hh * 0.14, sn_w * 0.8, 0.6, 0.7, m_skin_dark, name='noink_snout')
        # Curved pale ivory dragon horns (#e8d8b8) on both sides of crown
        m_horn = mat('#e8d8b8', rough=0.5)
        horn_h = 2.4 if not child else 1.6
        for s in (-1, 1):
            ccone(head, s * (hw * 0.36), -0.3, hh - 0.3, 0.85, 0.2, horn_h, m_horn, seg=6, rx=-s * 0.28, ry=-0.22)


def build_hair(style_name, head, hw, hd, hh, sp, m_hair, m_top, m_trim, m_skin_dark):
    """Build hair/headgear matching hair() in apps/web/lib/citizens.ts."""
    if style_name == 'short':
        cbox(head, 0.0, -0.15, hh * 0.68, hw + 0.5, hd + 0.5, hh * 0.38, m_hair, bevel=0.12)
        cbox(head, 0.0, -hd * 0.35, hh * 0.18, hw + 0.4, hd * 0.45, hh * 0.58, m_hair, bevel=0.10)
        for s in (-1, 1):
            cbox(head, s * (hw * 0.48), 0.0, hh * 0.42, 0.8, hd * 0.85, hh * 0.38, m_hair, bevel=0.06)

    elif style_name == 'long':
        cbox(head, 0.0, -0.1, hh * 0.68, hw + 0.6, hd + 0.5, hh * 0.38, m_hair, bevel=0.12)
        # Back flowing hair sheet down to upper back
        cbox(head, 0.0, -hd * 0.42, -1.2, hw + 0.6, hd * 0.42, hh + 1.4, m_hair, bevel=0.10)
        # Side locks framing the face
        for s in (-1, 1):
            cbox(head, s * (hw * 0.5 + 0.35), 0.15, -0.8, 1.3, 1.6, hh * 0.92, m_hair, bevel=0.08)

    elif style_name == 'bald':
        cbox(head, 0.0, -hd * 0.46, hh * 0.55, hw * 0.78, 0.4, hh * 0.32, m_skin_dark, name='noink_scalp', bevel=0.04)

    elif style_name == 'mohawk':
        # Tall spiky mohawk crest from front to back of head
        cbox(head, 0.0, 0.1, hh - 0.3, 2.0, hd * 0.85, 2.6, m_hair, bevel=0.08)
        cbox(head, 0.0, -hd * 0.38, hh * 0.25, 1.8, 1.5, hh * 0.65, m_hair, bevel=0.08)

    elif style_name == 'hood':
        m_hood_hi = mat(shade(sp['top'], 24), rough=0.8)
        cbox(head, 0.0, -0.1, hh * 0.58, hw + 1.4, hd + 1.2, hh * 0.52, m_top, bevel=0.14)
        cbox(head, 0.0, 0.1, hh * 0.88, hw + 1.0, hd + 0.8, 0.9, m_hood_hi, name='noink_hood_hi', bevel=0.08)
        # Hood back and sides enveloping head
        cbox(head, 0.0, -hd * 0.32, 0.0, hw + 1.4, hd * 0.58, hh * 0.95, m_top, bevel=0.12)
        for s in (-1, 1):
            cbox(head, s * (hw * 0.5 + 0.35), 0.1, 0.2, 1.1, hd * 0.85, hh * 0.82, m_top, bevel=0.08)

    elif style_name == 'bun':
        cbox(head, 0.0, -0.1, hh * 0.65, hw + 0.5, hd + 0.5, hh * 0.38, m_hair, bevel=0.12)
        cbox(head, 0.0, -hd * 0.35, hh * 0.22, hw + 0.3, hd * 0.45, hh * 0.52, m_hair, bevel=0.10)
        csphere(head, 0.0, -0.4, hh + 1.2, 1.6, 1.6, 1.5, m_hair)

    elif style_name == 'helmet':
        m_helm = mat('#8a95a8', rough=0.45, metal=0.4)
        m_helm_hi = mat('#c8d0e0', rough=0.35, metal=0.5)
        cbox(head, 0.0, -0.05, hh * 0.52, hw + 1.3, hd + 1.1, hh * 0.56, m_helm, bevel=0.14)
        cbox(head, 0.0, 0.15, hh * 0.52, hw + 1.5, hd + 1.2, 1.0, m_helm_hi, name='noink_rim', bevel=0.06)
        cbox(head, 0.0, -hd * 0.34, hh * 0.15, hw + 1.1, hd * 0.48, hh * 0.55, m_helm, bevel=0.10)
        # Crest plume in trim colour
        cbox(head, 0.0, -0.1, hh + 0.5, 1.8, 2.6, 2.0, m_trim, bevel=0.08)

    elif style_name == 'wild':
        cbox(head, 0.0, -0.1, hh * 0.55, hw + 1.4, hd + 1.0, hh * 0.52, m_hair, bevel=0.12)
        cbox(head, 0.0, -hd * 0.32, hh * 0.08, hw + 1.3, hd * 0.52, hh * 0.78, m_hair, bevel=0.10)
        for s in (-1, 1):
            cbox(head, s * (hw * 0.32), 0.1, hh + 0.2, 2.0, 2.2, 1.5, m_hair, bevel=0.08, rx=s * 0.25)
            cbox(head, s * (hw * 0.5 + 0.4), 0.0, hh * 0.35, 1.2, 2.0, 2.2, m_hair, bevel=0.08, rx=s * 0.35)


def build_tool(tool_name, arm_r, arm_h, sp, child=False):
    """Attach tool to right arm (`arm_r`) matching tool() in apps/web/lib/citizens.ts."""
    if tool_name == 'none' or child:
        return
    m_wood = mat('#7a5230', rough=0.85)
    m_wood_lt = mat('#8a6240', rough=0.8)
    m_steel = mat('#c8d0e0', rough=0.35, metal=0.55)
    m_iron = mat('#9aa3b4', rough=0.45, metal=0.45)
    m_trim = mat(sp['trim'], rough=0.5, emit=0.3)

    # Hand position relative to right shoulder pivot
    hu = 1.0
    hv = 0.8
    hz = -arm_h + 0.8

    if tool_name == 'bow':
        cbox(arm_r, hu + 0.4, hv + 0.4, hz - 3.5, 1.0, 1.1, 11.0, m_wood, bevel=0.04)
        cbox(arm_r, hu + 0.1, hv + 0.9, hz + 6.5, 1.0, 1.2, 1.2, m_wood)
        cbox(arm_r, hu + 0.1, hv + 0.9, hz - 3.5, 1.0, 1.2, 1.2, m_wood)
        cbox(arm_r, hu + 0.6, hv - 0.2, hz - 2.8, 0.6, 0.6, 9.5, mat('#e8e8d8', rough=0.6), name='noink_string')

    elif tool_name == 'club':
        cbox(arm_r, hu + 0.4, hv + 0.3, hz - 1.0, 1.3, 1.3, 4.5, m_wood, bevel=0.04)
        cbox(arm_r, hu + 0.4, hv + 0.4, hz + 3.0, 2.8, 2.8, 3.8, m_wood_lt, bevel=0.10)

    elif tool_name == 'spear':
        cbox(arm_r, hu + 0.5, hv + 0.3, hz - 4.0, 1.0, 1.0, 14.5, m_wood, bevel=0.03)
        ccone(arm_r, hu + 0.5, hv + 0.3, hz + 10.2, 1.5, 0.15, 3.4, m_steel, seg=6)

    elif tool_name == 'dagger':
        cbox(arm_r, hu + 0.4, hv + 0.5, hz - 1.2, 2.4, 1.0, 1.0, m_wood, bevel=0.03)
        ccone(arm_r, hu + 0.4, hv + 0.5, hz - 4.5, 1.1, 0.15, 3.5, m_steel, seg=6, rx=math.pi)

    elif tool_name == 'basket':
        m_bask = mat('#b88a42', rough=0.85)
        m_bask_hi = mat('#d8aa5a', rough=0.8)
        m_goods = mat(sp['hair'], rough=0.75)
        cbox(arm_r, hu - 0.2, hv + 0.8, hz - 2.2, 3.8, 3.2, 3.0, m_bask, bevel=0.08)
        cbox(arm_r, hu - 0.2, hv + 0.85, hz + 0.2, 4.1, 3.4, 0.9, m_bask_hi, name='noink_rim', bevel=0.04)
        cbox(arm_r, hu - 0.2, hv + 0.8, hz + 0.8, 2.6, 2.2, 1.1, m_goods, bevel=0.06)

    elif tool_name == 'hammer':
        cbox(arm_r, hu + 0.4, hv + 0.3, hz - 2.5, 1.1, 1.1, 8.5, m_wood, bevel=0.03)
        cbox(arm_r, hu + 0.4, hv + 0.3, hz + 5.2, 3.8, 2.4, 2.6, m_iron, bevel=0.08)

    elif tool_name == 'staff':
        cbox(arm_r, hu + 0.5, hv + 0.3, hz - 4.0, 1.0, 1.0, 15.0, m_wood, bevel=0.03)
        csphere(arm_r, hu + 0.5, hv + 0.3, hz + 12.0, 1.6, 1.6, 1.7, m_trim)

    elif tool_name == 'pick':
        cbox(arm_r, hu + 0.4, hv + 0.3, hz - 2.5, 1.1, 1.1, 9.0, m_wood, bevel=0.03)
        cbox(arm_r, hu + 0.4, hv + 0.3, hz + 5.6, 4.8, 1.6, 1.8, m_iron, bevel=0.06)


def build_tail_and_wings(arc, sp_skin, sp_skin_dark, leg_top, torso_top, tw, child=False, back=False):
    """Build lizard/dragon tail and dragon wings as animatable RigParts."""
    tail = None
    wings = None
    if arc in ('lizard', 'dragon'):
        tail = RigPart(1.8, -1.6, leg_top + 0.4, back=back)
        m_tc = mat(sp_skin, rough=0.75)
        m_tc_d = mat(sp_skin_dark, rough=0.8)
        cbox(tail, 1.4, -0.3, -0.4, 3.2, 2.0, 2.0, m_tc, bevel=0.08, rz=-0.15)
        cbox(tail, 3.6, -0.5, -1.0, 2.4, 1.7, 1.8, m_tc_d, bevel=0.08, rz=-0.25)

    if arc == 'dragon' and not child:
        wings = RigPart(0.0, -1.8, torso_top + 3.5, back=back)
        m_wing = mat('#7a2a24', rough=0.7)
        m_strut = mat('#4a1612', rough=0.75)
        for s in (-1, 1):
            cbox(wings, s * (tw * 0.5 + 1.4), -0.4, -1.2, 2.4, 1.0, 3.6, m_wing, bevel=0.06, rx=s * 0.25)
            cbox(wings, s * (tw * 0.5 + 1.5), -0.3, 1.8, 2.5, 0.7, 0.8, m_strut, name='noink_wing_top')
    return tail, wings


def build_citizen(arc, variant, view):
    """Construct a citizen figure and return its animatable rig dictionary."""
    setup_scene()
    sp = SPECIES[arc][variant]
    back = (view == 'back')
    child = (sp['build'] == 'child')
    broad = (sp['build'] == 'broad')

    leg_len = 3.2 if child else 5.8
    torso_h = 4.8 if child else 6.8
    if broad:
        tw = 7.8
    elif child:
        tw = 5.2
    elif arc == 'elf':
        tw = 5.5
    elif arc == 'caveman':
        tw = 6.6
    else:
        tw = 6.0
    td = 4.6 if broad else (3.6 if child else 4.0)

    leg_top = leg_len
    torso_top = leg_top
    head_top = torso_top + torso_h
    hw = 6.4 if child else (7.0 if broad else 6.6)
    hd = 5.4 if child else 5.8
    hh = 5.8 if child else 6.2
    arm_h = 3.2 if child else 4.8

    m_skin = mat(sp['skin'], rough=0.75)
    m_skin_dark = mat(shade(sp['skin'], -34), rough=0.8)
    m_hair = mat(sp['hair'], rough=0.8)
    m_top = mat(sp['top'], rough=0.8)
    m_top_hi = mat(shade(sp['top'], 26), rough=0.75)
    m_trim = mat(sp['trim'], rough=0.65)
    m_bot = mat(sp['bottom'], rough=0.85)
    m_bot_dark = mat(shade(sp['bottom'], -34), rough=0.85)

    # Legs
    leg_w = 2.6 if broad else (2.0 if child else 2.2)
    leg_u = leg_w * 0.58
    leg_l = RigPart(-leg_u, 0.0, 0.0, back=back)
    leg_r = RigPart(leg_u, 0.0, 0.0, back=back)
    for lp in (leg_l, leg_r):
        if arc in ('caveman', 'lizard'):
            cbox(lp, 0.0, 0.0, leg_len * 0.55, leg_w, leg_w * 1.05, leg_len * 0.5, m_bot, bevel=0.06)
            cbox(lp, 0.0, 0.0, 0.0, leg_w * 0.92, leg_w * 1.1, leg_len * 0.58, m_skin, bevel=0.06)
        else:
            cbox(lp, 0.0, 0.0, 0.9, leg_w, leg_w * 1.05, leg_len - 0.8, m_bot, bevel=0.06)
            cbox(lp, 0.0, 0.2, 0.0, leg_w * 1.04, leg_w * 1.25, 1.1, m_bot_dark, bevel=0.05)

    # Torso
    torso = RigPart(0.0, 0.0, torso_top, back=back)
    cbox(torso, 0.0, 0.0, 0.0, tw, td, torso_h, m_top, bevel=0.10)
    # Sunlit left edge highlight & belt hem
    cbox(torso, -tw * 0.36, 0.1, 1.2, tw * 0.22, td * 0.96, torso_h - 2.2, m_top_hi, name='noink_hi')
    cbox(torso, 0.0, 0.0, 0.7, tw + 0.3, td + 0.3, 1.2, m_trim, bevel=0.04)

    if sp.get('apron'):
        cbox(torso, 0.0, td * 0.45, 0.4, tw * 0.75, 0.6, torso_h * 0.72, mat('#8a6a42', rough=0.85), bevel=0.04)
    if arc == 'caveman':
        # Diagonal fur pelt strap & ivory clasps
        cbox(torso, -tw * 0.25, td * 0.48, torso_h * 0.65, 1.3, 0.6, 1.2, m_trim, name='noink_clasp')
        cbox(torso, tw * 0.25, td * 0.48, torso_h * 0.45, 1.3, 0.6, 1.2, m_trim, name='noink_clasp')
    if arc == 'goblin':
        # Back scavenger pack strap
        cbox(torso, 0.0, -td * 0.48, torso_h * 0.45, tw * 0.75, 0.7, 2.0, mat('#4a3a22', rough=0.85), name='noink_pack')

    # Arms (pivoted at shoulders)
    arm_w = 2.1 if broad else 1.85
    arm_l = RigPart(-(tw * 0.5 + arm_w * 0.48), 0.0, torso_top + torso_h - 0.8, back=back)
    arm_r = RigPart(tw * 0.5 + arm_w * 0.48, 0.0, torso_top + torso_h - 0.8, back=back)
    for ap in (arm_l, arm_r):
        cbox(ap, 0.0, 0.0, -arm_h, arm_w, arm_w * 1.05, arm_h * 0.65, m_skin, bevel=0.06)
        cbox(ap, 0.0, 0.0, -arm_h * 0.45, arm_w * 1.12, arm_w * 1.15, arm_h * 0.48, m_top, bevel=0.06)

    # Tool in right hand
    build_tool(sp['tool'], arm_r, arm_h, sp, child=child)

    # Head
    head = RigPart(0.0, 0.0, head_top - 0.2, back=back)
    cbox(head, 0.0, 0.0, 0.0, hw, hd, hh, m_skin, bevel=0.16)

    build_race_head_features(arc, head, hw, hd, hh, sp, m_skin, m_skin_dark, m_hair, child=child)
    build_hair(sp['hairStyle'], head, hw, hd, hh, sp, m_hair, m_top, m_trim, m_skin_dark)

    if sp.get('crown'):
        m_crown = mat('#ffd34a', rough=0.35, metal=0.5, emit=0.2)
        cbox(head, 0.0, 0.0, hh - 0.2, hw + 0.4, hd + 0.4, 1.1, m_crown, bevel=0.05)
        for cu in (-hw * 0.32, 0.0, hw * 0.32):
            cbox(head, cu, hd * 0.35, hh + 0.7, 1.1, 1.0, 1.2, m_crown, bevel=0.03)

    # Eyes, goggles, beard, mouth (positioned on front face +v; hidden on far side in back view)
    m_eye = mat(sp['eye'], rough=0.2, emit=0.6 if sp['eye'] != '#1a1a22' else 0.0)
    ey_z = hh * 0.38
    for s in (-1, 1):
        cbox(head, s * (hw * 0.26), hd * 0.5 + 0.08, ey_z, 1.25, 0.45, 1.35, m_eye, name='noink_eye')

    if sp.get('goggles'):
        m_gog_frame = mat('#6a5a2a', rough=0.5, metal=0.3)
        m_gog_lens = mat('#9ad0e0', rough=0.2, emit=0.8)
        cbox(head, 0.0, hd * 0.5 + 0.15, ey_z - 0.1, hw + 0.4, 0.7, 1.9, m_gog_frame, bevel=0.04)
        for s in (-1, 1):
            cbox(head, s * (hw * 0.26), hd * 0.5 + 0.35, ey_z, 1.4, 0.5, 1.5, m_gog_lens, name='noink_lens')

    if sp.get('beard'):
        cbox(head, 0.0, hd * 0.45, -0.6, hw * 0.76, 1.6, 2.6, m_hair, bevel=0.10)
    else:
        cbox(head, 0.0, hd * 0.5 + 0.05, hh * 0.12, 1.8, 0.4, 0.7, m_skin_dark, name='noink_mouth')

    tail, wings = build_tail_and_wings(arc, sp['skin'], shade(sp['skin'], -34), leg_top, torso_top, tw, child=child, back=back)

    kit.outline_all(width=OUT_WIDTH, color=OUT_COLOR)
    return {
        'leg_l': leg_l, 'leg_r': leg_r, 'torso': torso,
        'arm_l': arm_l, 'arm_r': arm_r, 'head': head,
        'tail': tail, 'wings': wings,
    }


def build_soldier(arc, view):
    """Construct a soldier figure matching drawSoldier in apps/web/lib/sprites-wave2.ts."""
    setup_scene()
    st = SOLDIER_STYLES[arc]
    back = (view == 'back')

    leg_len = 5.8
    torso_h = 6.8
    tw = 6.4 if arc != 'caveman' else 7.0
    td = 4.4
    leg_top = leg_len
    torso_top = leg_top
    head_top = torso_top + torso_h
    hw, hd, hh = 6.6, 5.8, 6.0
    arm_h = 4.8

    m_skin = mat(st['skin'], rough=0.75)
    m_skin_dark = mat(st['skinDark'], rough=0.8)
    m_tunic = mat(st['tunic'], rough=0.8)
    m_armor = mat(st['armor'], rough=0.45, metal=0.45)
    m_armor_lt = mat(st['armorLight'], rough=0.35, metal=0.5)
    m_helm = mat(st['helm'], rough=0.4, metal=0.45)
    m_helm_lt = mat(st['helmLight'], rough=0.3, metal=0.55)
    m_plume = mat(st['plume'], rough=0.7, emit=0.2)
    m_shield = mat(st['shield'], rough=0.65)
    m_rim = mat(st['shieldRim'], rough=0.4, metal=0.4)
    m_legs = mat(st['legs'], rough=0.8)
    m_eye = mat(st['eye'], rough=0.2, emit=0.6 if st['eye'] != '#1a1a22' else 0.0)

    # Armored boots & greaves
    leg_w = 2.3
    leg_u = leg_w * 0.58
    leg_l = RigPart(-leg_u, 0.0, 0.0, back=back)
    leg_r = RigPart(leg_u, 0.0, 0.0, back=back)
    for lp in (leg_l, leg_r):
        cbox(lp, 0.0, 0.0, 1.0, leg_w, leg_w * 1.05, leg_len - 0.9, m_legs, bevel=0.06)
        cbox(lp, 0.0, 0.2, 0.0, leg_w * 1.06, leg_w * 1.25, 1.2, m_armor, bevel=0.05)

    # Armored torso & war belt
    torso = RigPart(0.0, 0.0, torso_top, back=back)
    cbox(torso, 0.0, 0.0, 0.0, tw, td, torso_h, m_tunic, bevel=0.10)
    cbox(torso, 0.0, 0.0, 1.8, tw + 0.4, td + 0.4, 4.2, m_armor, bevel=0.10)
    cbox(torso, -tw * 0.28, 0.25, 2.6, tw * 0.35, td * 0.9, 3.0, m_armor_lt, name='noink_glint')
    cbox(torso, 0.0, 0.0, 0.7, tw + 0.4, td + 0.4, 1.2, m_rim, bevel=0.04)

    # Arms + armored shoulder pauldrons
    arm_w = 2.0
    arm_l = RigPart(-(tw * 0.5 + arm_w * 0.48), 0.0, torso_top + torso_h - 0.8, back=back)
    arm_r = RigPart(tw * 0.5 + arm_w * 0.48, 0.0, torso_top + torso_h - 0.8, back=back)
    cbox(arm_l, 0.0, 0.0, -arm_h, arm_w, arm_w * 1.05, arm_h * 0.65, m_skin, bevel=0.06)
    cbox(arm_l, -0.1, 0.0, -arm_h * 0.45, arm_w * 1.25, arm_w * 1.25, arm_h * 0.5, m_armor_lt, bevel=0.08)
    cbox(arm_r, 0.0, 0.0, -arm_h, arm_w, arm_w * 1.05, arm_h * 0.65, m_skin, bevel=0.06)
    cbox(arm_r, 0.1, 0.0, -arm_h * 0.45, arm_w * 1.25, arm_w * 1.25, arm_h * 0.5, m_armor, bevel=0.08)

    # Emblem shield on left arm (placed slightly toward viewer in both views for iconic silhouette)
    sh_v = -1.6 if back else 1.6
    cbox(arm_l, -1.2, sh_v, -arm_h - 0.5, 4.2, 1.2, 6.0, m_shield, bevel=0.08)
    cbox(arm_l, -1.2, sh_v + (0.15 if not back else -0.15), -0.2, 4.3, 1.3, 1.0, m_rim, name='noink_srim')
    cbox(arm_l, -1.2, sh_v + (0.15 if not back else -0.15), -arm_h - 0.5, 4.3, 1.3, 1.0, m_rim, name='noink_srim')
    cbox(arm_l, -1.2, sh_v + (0.35 if not back else -0.35), -arm_h + 1.8, 1.8, 1.0, 1.8, m_rim, name='noink_sboss')

    # Upright war-spear in right hand
    m_shaft = mat('#6e4726', rough=0.8)
    cbox(arm_r, 1.4, 0.4, -arm_h - 3.5, 1.0, 1.0, 15.0, m_shaft, bevel=0.03)
    ccone(arm_r, 1.4, 0.4, -arm_h + 11.2, 1.6, 0.15, 3.5, m_helm_lt, seg=6)

    # Head + racial features + crested war-helmet
    head = RigPart(0.0, 0.0, head_top - 0.2, back=back)
    cbox(head, 0.0, 0.0, 0.0, hw, hd, hh, m_skin, bevel=0.16)
    build_race_head_features(arc, head, hw, hd, hh, {'hairStyle': 'helmet'}, m_skin, m_skin_dark, m_helm, child=False)

    ey_z = hh * 0.36
    for s in (-1, 1):
        cbox(head, s * (hw * 0.26), hd * 0.5 + 0.08, ey_z, 1.25, 0.45, 1.35, m_eye, name='noink_eye')
    if arc == 'caveman':
        cbox(head, 0.0, hd * 0.45, -0.5, hw * 0.76, 1.5, 2.4, mat('#3a2418', rough=0.85), bevel=0.08)

    # War-helmet dome, brow band, nasal guard, and tall plume crest
    cbox(head, 0.0, -0.05, hh * 0.52, hw + 1.4, hd + 1.2, hh * 0.58, m_helm, bevel=0.14)
    cbox(head, 0.0, 0.15, hh * 0.50, hw + 1.6, hd + 1.3, 1.0, m_helm_lt, name='noink_hrim', bevel=0.05)
    cbox(head, 0.0, hd * 0.5 + 0.2, hh * 0.28, 1.3, 0.8, 2.2, m_helm_lt, name='noink_nasal', bevel=0.03)
    cbox(head, 0.0, -hd * 0.35, hh * 0.12, hw + 1.2, hd * 0.48, hh * 0.58, m_helm, bevel=0.10)
    # Plume crest
    cbox(head, 0.0, -0.1, hh + 0.5, 2.0, 3.0, 3.0, m_plume, bevel=0.10)

    tail, wings = build_tail_and_wings(arc, st['skin'], st['skinDark'], leg_top, torso_top, tw, child=False, back=back)

    kit.outline_all(width=OUT_WIDTH, color=OUT_COLOR)
    return {
        'leg_l': leg_l, 'leg_r': leg_r, 'torso': torso,
        'arm_l': arm_l, 'arm_r': arm_r, 'head': head,
        'tail': tail, 'wings': wings,
    }


def pose_rig(rig, frame):
    """Pose figure for walk frames 0..3 or idle frame 4, matching citizens.ts."""
    idle = (frame >= 4)
    f = 0 if idle else (frame & 3)
    lift_l = 0.0 if idle else (1.8, 0.9, 0.0, 0.9)[f]
    lift_r = 0.0 if idle else (0.0, 0.9, 1.8, 0.9)[f]
    stride = 0.0 if idle else (1.0, 0.0, -1.0, 0.0)[f]
    arm_l_dz = 0.0 if idle else (-1.0, 0.0, 1.0, 0.0)[f]
    arm_r_dz = -arm_l_dz
    bob = 0.0 if idle else (0.0, 0.85, 0.0, 0.85)[f]
    sway = 0.0 if idle else (0.0, 0.9, 0.0, -0.9)[f]

    rig['leg_l'].pose(dv=stride * 0.7, dz=lift_l, pitch=-stride * 0.18)
    rig['leg_r'].pose(dv=-stride * 0.7, dz=lift_r, pitch=stride * 0.18)
    rig['torso'].pose(dz=bob, yaw=stride * 0.05)
    rig['head'].pose(dz=bob, yaw=stride * 0.03)
    rig['arm_l'].pose(dv=-stride * 0.6, dz=bob + arm_l_dz, pitch=stride * 0.22)
    rig['arm_r'].pose(dv=stride * 0.6, dz=bob + arm_r_dz, pitch=-stride * 0.22)
    if rig['tail']:
        rig['tail'].pose(du=sway * 0.5, dz=bob * 0.5, yaw=sway * 0.12)
    if rig['wings']:
        rig['wings'].pose(dz=bob + abs(sway) * 0.35, roll=sway * 0.08)


def render_people(arc, out_root=None):
    """Render all 6 citizens and 1 soldier (front/back, frames 0..4) for `arc`."""
    bpy.context.preferences.filepaths.save_version = 0
    out_dir = os.path.join(out_root or os.path.join(HERE, 'out'), arc)
    os.makedirs(out_dir, exist_ok=True)

    count = 0
    for v in range(len(SPECIES[arc])):
        for view in VIEWS:
            rig = build_citizen(arc, v, view)
            for f in range(FRAMES):
                pose_rig(rig, f)
                kit.render(os.path.join(out_dir, f'cit_{v}_{view}_{f}.png'))
                count += 1
        print(f'OK {arc}/cit_{v} (10 frames)', flush=True)

    for view in VIEWS:
        rig = build_soldier(arc, view)
        for f in range(FRAMES):
            pose_rig(rig, f)
            kit.render(os.path.join(out_dir, f'sol_{view}_{f}.png'))
            count += 1
    print(f'OK {arc}/sol (10 frames) total={count}', flush=True)
    make_sheet(arc, out_dir)


def make_sheet(arc, out_dir):
    """Build full-scale (64x96 per cell) and 4x-downscaled (16x24 per cell) contact sheets."""
    # 7 rows (cit_0..5 + sol), 10 cols (front 0..4, back 0..4)
    cols = 10
    rows = 7
    pad_top = 16
    cw, ch = CW + 8, CH + pad_top + 4
    sh = Image.new('RGBA', (cols * cw, rows * ch), (78, 96, 68, 255))
    d = ImageDraw.Draw(sh)

    names = [f'cit_{v}' for v in range(6)] + ['sol']
    for r, base in enumerate(names):
        for v_idx, view in enumerate(VIEWS):
            for f in range(FRAMES):
                c = v_idx * FRAMES + f
                p = os.path.join(out_dir, f'{base}_{view}_{f}.png')
                if not os.path.exists(p):
                    continue
                im = Image.open(p).convert('RGBA')
                x = c * cw + 4
                y = r * ch + pad_top
                # Draw subtle 64x96 bounds box + x=32 foot marker
                d.rectangle([x, y, x + CW - 1, y + CH - 1], outline=(58, 74, 50, 255))
                sh.alpha_composite(im, (x, y))
                if f == 0:
                    label = f'{base}_{view}'
                    d.text((x + 2, y - 14), label, fill=(255, 255, 255, 255))

    sheet_path = os.path.join(out_dir, '_sheet_people.png')
    sh.save(sheet_path)

    # Also build pure 4x-downscaled 16x24 sheet (no text clutter, 2px gap around each 16x24 cell)
    dw, dh = 16, 24
    dcw, dch = dw + 4, dh + 4
    sh1x = Image.new('RGBA', (cols * dcw, rows * dch), (78, 96, 68, 255))
    for r, base in enumerate(names):
        for v_idx, view in enumerate(VIEWS):
            for f in range(FRAMES):
                c = v_idx * FRAMES + f
                p = os.path.join(out_dir, f'{base}_{view}_{f}.png')
                if not os.path.exists(p):
                    continue
                im = Image.open(p).convert('RGBA').resize((dw, dh), Image.BOX)
                sh1x.alpha_composite(im, (c * dcw + 2, r * dch + 2))
    sheet1x_path = os.path.join(out_dir, '_sheet_people_1x.png')
    sh1x.save(sheet1x_path)
    print(f'SHEET {sheet_path} & {sheet1x_path}', flush=True)


if __name__ == '__main__' and '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    target_arcs = args or ARCS
    for a in target_arcs:
        render_people(a)
