"""Blender scenery (wilds) for every people.
Run headless:
  blender -b --factory-startup -P wilds.py -- <arc> [recipe_indices ...]
Example:
  blender -b --factory-startup -P wilds.py -- elf
Renders into out/<arc>/wild_<i>_<v>_<f>.png (i = recipe index, v = variant 0/1, f = frame 0..2).
Also creates a contact sheet at out/<arc>/_sheet_wilds.png.
"""
import os
import sys
import math
import random
import importlib
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import kit  # noqa: E402
import style  # noqa: E402
import bpy  # noqa: E402
from kit import box, poly, cyl, cone, sphere, mat  # noqa: E402

ARCS = ('elf', 'lizard', 'caveman', 'dragon', 'goblin')
FRAMES = 3


def load_style(arc, reload=False):
    mod = importlib.import_module(f'styles.{arc}')
    if reload:
        importlib.reload(kit)
        importlib.reload(style)
        mod = importlib.reload(mod)
    return mod.STYLE


# ==============================================================================
# Helpers
# ==============================================================================
def add_sway(ob, max_ang=0.05, phase=0.0):
    """Calm wind sway over 3 frames."""
    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        ob.rotation_euler = (max_ang * math.sin(t), max_ang * 0.7 * math.cos(t), 0)
    kit.anim(step)


def pulse_emit(mat_obj, base_emit=3.0, amp=2.0, phase=0.0):
    """Pulsing glow over 3 frames."""
    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        val = base_emit + amp * (0.5 + 0.5 * math.sin(t))
        try:
            mat_obj.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = val
        except Exception:
            pass
    kit.anim(step)


# ==============================================================================
# ELF RECIPES (5 recipes: 3 tall, 2 low)
# Lore: deep enchanted forest, ancient white-bark trees, lush layered foliage,
# bioluminescent azure mushrooms, flowering bushes.
# ==============================================================================
def _elf_mushroom(S, x, y, h, r_cap, phase=0.0):
    """Glowing bioluminescent teal/cyan mushroom with pale stem and pulsing cap."""
    cyl(x, y, 0, r_cap * 0.26, h, S.m('wall'), seg=7, name='shroom_stem')
    cyl(x, y, h * 0.78, r_cap * 0.72, h * 0.14, S.m('emblem', emit=2.2), seg=8, name='noink_gill')
    cap_mat = mat(S.P['accent2'], rough=0.4, emit=4.2)
    cap = sphere(x, y, h + r_cap * 0.25, r_cap, cap_mat, 'noink_cap', squash=0.62)
    spot_mat = S.m('emblem', emit=3.5)
    s1 = sphere(x + r_cap * 0.38, y + r_cap * 0.15, h + r_cap * 0.55, r_cap * 0.20, spot_mat, 'noink_spot')
    s2 = sphere(x - r_cap * 0.32, y - r_cap * 0.22, h + r_cap * 0.52, r_cap * 0.17, spot_mat, 'noink_spot')

    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        k = 1.0 + 0.12 * math.sin(t)
        cap.scale = (k, k, 0.62 * (1.0 + 0.15 * math.cos(t)))
        s1.scale = (k, k, k)
        s2.scale = (k, k, k)
    kit.anim(step)


def _elf_moonflower(S, x, y, h, r_bloom, phase=0.0):
    """Luminous silver-teal moon-flower with pulsing golden-star heart."""
    st = cyl(x, y, 0, 0.010, h, S.m('crop2'), seg=6, name='flower_stem')
    # Basal light-green leaves
    for ang in (0.6, 2.7, 4.8):
        lx, ly = x + math.cos(ang) * r_bloom * 0.65, y + math.sin(ang) * r_bloom * 0.65
        lf = sphere(lx, ly, 0.025, r_bloom * 0.55, S.m('foliage2'), 'leaf', squash=0.35)
        lf.scale.x = 1.35
        lf.rotation_euler.z = ang
    # Glowing silver-teal chalice and petals
    cup = cone(x, y, h * 0.72, r_bloom * 0.35, h * 0.32, S.m('accent2', emit=3.0), seg=7, r_top=r_bloom * 0.95, name='noink_chalice')
    petals = []
    for k in range(5):
        ang = k * (2.0 * math.pi / 5.0) + phase
        px = x + math.cos(ang) * r_bloom * 0.62
        py = y + math.sin(ang) * r_bloom * 0.62
        pt = sphere(px, py, h + 0.01, r_bloom * 0.44, S.m('glow', emit=3.8), 'noink_petal', squash=0.38)
        petals.append((pt, px, py))
    core = sphere(x, y, h + 0.022, r_bloom * 0.38, S.m('accent', emit=5.2), 'noink_core', squash=0.75)

    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        dx = 0.012 * math.sin(t)
        dy = 0.008 * math.cos(t)
        st.rotation_euler = (dy * 2.5, dx * 2.5, 0)
        cup.location = (x + dx, y + dy, h * 0.88)
        s = 1.0 + 0.16 * math.sin(t)
        core.location = (x + dx, y + dy, h + 0.022)
        core.scale = (s, s, 0.75 * s)
        for pt, px0, py0 in petals:
            pt.location = (px0 + dx * 1.2, py0 + dy * 1.2, h + 0.01 + 0.005 * math.sin(t))
    kit.anim(step)


def _elf_pine(S, x, y, h, r_base, phase=0.0):
    """Tall graceful elven conifer with pale trunk, wide light-emerald tiers, and silver-teal rim."""
    cone(x, y, 0, r_base * 0.36, h * 0.11, S.m('wood'), seg=7, name='roots')
    cyl(x, y, 0, r_base * 0.18, h * 0.34, S.m('wall'), seg=8, name='pale_trunk')
    # Layered tiers: silver-teal rim skirts right under wide light-green foliage cones
    rim_m = S.m('accent2', emit=0.32)
    tiers = [
        (0.11, 1.06, 0.13, rim_m),
        (0.13, 1.00, 0.27, S.m('foliage')),
        (0.30, 0.88, 0.12, rim_m),
        (0.32, 0.82, 0.27, S.m('foliage2')),
        (0.50, 0.66, 0.11, rim_m),
        (0.52, 0.62, 0.27, S.m('crop2')),
        (0.71, 0.42, 0.29, S.m('crop2')),
    ]
    cones = []
    for tz, tr, th, m_use in tiers:
        c = cone(x, y, tz * h, tr * r_base, th * h, m_use, seg=9, name='pine_tier')
        cones.append(c)
    add_sway(cones[-2], max_ang=0.05, phase=phase)
    add_sway(cones[-1], max_ang=0.065, phase=phase + 0.15)


def _elf_broad_tree(S, x, y, h, r_crown, phase=0.0):
    """Ancient white-bark broadleaf with wide billowy light-green canopy and silver-teal rim."""
    # Pale ivory flared roots and trunk
    cone(x, y, 0, r_crown * 0.40, h * 0.15, S.m('wood_light'), seg=7, name='root_flare')
    cyl(x, y, 0, r_crown * 0.20, h * 0.42, S.m('wall'), seg=8, name='pale_trunk')
    for ang, bx_off, by_off in ((0.6, 0.28, -0.22), (2.4, -0.24, 0.26), (4.5, 0.18, 0.22)):
        b = cyl(x + bx_off * r_crown, y + by_off * r_crown, h * 0.30, r_crown * 0.09, h * 0.22, S.m('wood_light'), seg=6, name='bough')
        b.rotation_euler = (-by_off * 0.8, bx_off * 0.8, 0)

    rim_m = S.m('accent2', emit=0.30)
    # Wide silver-teal outer rim puffs along screen-horizontal (+x,-y) and (-x,+y) so the crown spans the tile
    for rx, ry, rz, rr in (
        (0.56, -0.44, 0.44, 0.56),
        (-0.44, 0.56, 0.45, 0.56),
        (0.32, 0.42, 0.43, 0.52),
        (-0.40, -0.32, 0.45, 0.50),
    ):
        sphere(x + rx * r_crown, y + ry * r_crown, rz * h, rr * r_crown, rim_m, 'crown_rim', squash=0.68)

    # Huge overlapping main and upper domes in lighter greens filling the tile width
    sphere(x - 0.32 * r_crown, y - 0.24 * r_crown, 0.49 * h, 0.68 * r_crown, S.m('foliage'), 'leaves_back', squash=0.76)
    sphere(x + 0.46 * r_crown, y - 0.36 * r_crown, 0.52 * h, 0.68 * r_crown, S.m('foliage2'), 'leaves_r', squash=0.76)
    sphere(x - 0.36 * r_crown, y + 0.46 * r_crown, 0.53 * h, 0.68 * r_crown, S.m('foliage2'), 'leaves_l', squash=0.76)
    sphere(x + 0.20 * r_crown, y + 0.28 * r_crown, 0.55 * h, 0.64 * r_crown, S.m('crop2'), 'leaves_front', squash=0.76)
    top = sphere(x, y, 0.67 * h, 0.80 * r_crown, S.m('crop2'), 'leaves_top', squash=0.80)
    crest = sphere(x + 0.05 * r_crown, y + 0.05 * r_crown, 0.82 * h, 0.55 * r_crown, S.m('foliage2'), 'leaves_crest', squash=0.74)
    # Subtle glowing moon-blossoms nestled inside the canopy
    for bx, by, bz in ((0.52, -0.20, 0.58), (-0.22, 0.52, 0.60), (0.24, 0.28, 0.64)):
        sphere(x + bx * r_crown, y + by * r_crown, bz * h, 0.022, S.m('emblem', emit=2.4), 'noink_canopy_bloom')
    add_sway(top, max_ang=0.045, phase=phase)
    add_sway(crest, max_ang=0.055, phase=phase + 0.2)


def elf_recipe_0(S, rng, v):
    """Recipe 0: Towering Silver-Rimmed Conifer Grove (tall)."""
    flip = -1 if v else 1
    _elf_pine(S, 0.07 * flip + rng.uniform(-0.015, 0.015), -0.06, 0.99, 0.26, phase=0.0)
    _elf_pine(S, -0.16 * flip + rng.uniform(-0.015, 0.015), 0.07, 0.86, 0.22, phase=0.35)
    _elf_pine(S, 0.16 * flip, 0.15, 0.62, 0.16, phase=0.65)
    # Pale forest stone and glowing mushroom at roots
    S.rock(-0.04 * flip, 0.22, r=0.07, rng=rng)
    _elf_mushroom(S, -0.12 * flip, -0.18, 0.10, 0.046, phase=0.2)


def elf_recipe_1(S, rng, v):
    """Recipe 1: Ancient White-Bark Broadleaf & Moon-Blossom Bush (tall)."""
    flip = -1 if v else 1
    _elf_broad_tree(S, -0.02 * flip, -0.02, 0.99, 0.31, phase=0.15)
    # Wide layered bush with silver-teal rim and moon-flower at front
    bx, by = 0.20 * flip, 0.17
    sphere(bx, by, 0.06, 0.14, S.m('accent2', emit=0.35), 'bush_rim', squash=0.65)
    b_top = sphere(bx, by, 0.09, 0.12, S.m('crop2'), 'bush_top', squash=0.74)
    add_sway(b_top, max_ang=0.04, phase=0.4)
    _elf_moonflower(S, bx + 0.03 * flip, by + 0.03, 0.16, 0.048, phase=0.2)
    _elf_mushroom(S, -0.20 * flip, 0.16, 0.11, 0.050, phase=0.5)


def elf_recipe_2(S, rng, v):
    """Recipe 2: Tall Silver Conifer & Broadleaf Canopy Grove (tall)."""
    flip = -1 if v else 1
    _elf_pine(S, 0.13 * flip, -0.08, 0.99, 0.25, phase=0.0)
    _elf_broad_tree(S, -0.12 * flip, 0.07, 0.86, 0.26, phase=0.45)
    # Understory lush bush and glowing mushroom
    sphere(0.06 * flip, 0.20, 0.055, 0.12, S.m('foliage2'), 'grove_bush', squash=0.68)
    sphere(0.06 * flip, 0.20, 0.085, 0.085, S.m('crop2'), 'grove_bush_top', squash=0.72)
    _elf_mushroom(S, 0.17 * flip, 0.18, 0.10, 0.048, phase=0.3)


def elf_recipe_3(S, rng, v):
    """Recipe 3: Bioluminescent Mushroom Ring & Moon-Flowers (low, glow: 0x5fe0d0)."""
    flip = -1 if v else 1
    # Mossy pale elven stones framing the cluster
    S.rock(-0.04 * flip, -0.02, r=0.09, rng=rng)
    sphere(-0.04 * flip, -0.02, 0.055, 0.075, S.m('crop2'), 'moss_cap', squash=0.45)
    S.rock(0.16 * flip, -0.10, r=0.06, rng=rng)
    # Large glowing mushrooms filling the tile
    shrooms = [
        (-0.14 * flip, 0.06, 0.22, 0.085, 0.0),
        (0.12 * flip, 0.04, 0.18, 0.072, 0.25),
        (-0.02 * flip, -0.15, 0.15, 0.062, 0.50),
        (0.02 * flip, 0.18, 0.14, 0.058, 0.70),
        (-0.22 * flip, -0.10, 0.11, 0.048, 0.40),
        (0.22 * flip, 0.14, 0.12, 0.050, 0.85),
    ]
    for sx, sy, sh, sr, ph in shrooms:
        _elf_mushroom(S, sx, sy, sh, sr, phase=ph)
    # Glowing moon-flower accent
    _elf_moonflower(S, 0.05 * flip, -0.04, 0.17, 0.046, phase=0.15)


def elf_recipe_4(S, rng, v):
    """Recipe 4: Enchanted Silver-Rimmed Bushes & Pulsing Moon-Flowers (low)."""
    flip = -1 if v else 1
    bushes = [
        (-0.14 * flip, 0.05, 0.16, 0.1),
        (0.15 * flip, -0.06, 0.14, 0.4),
        (0.02 * flip, -0.16, 0.12, 0.7),
        (-0.02 * flip, 0.17, 0.11, 0.25),
    ]
    rim_m = S.m('accent2', emit=0.65)
    for bx, by, br, ph in bushes:
        sphere(bx, by, br * 0.45, br * 1.08, rim_m, 'bush_rim', squash=0.62)
        b_mid = sphere(bx, by, br * 0.62, br * 0.94, S.m('foliage2'), 'bush_mid', squash=0.72)
        b_top = sphere(bx + 0.015 * flip, by + 0.015, br * 0.88, br * 0.68, S.m('crop2'), 'bush_top', squash=0.72)
        add_sway(b_mid, max_ang=0.035, phase=ph)
        add_sway(b_top, max_ang=0.045, phase=ph + 0.15)
    # Pulsing moon-flowers and glowing mushrooms
    _elf_moonflower(S, -0.12 * flip, 0.07, 0.22, 0.052, phase=0.0)
    _elf_moonflower(S, 0.14 * flip, -0.04, 0.20, 0.048, phase=0.35)
    _elf_moonflower(S, 0.01 * flip, 0.16, 0.18, 0.044, phase=0.65)
    _elf_mushroom(S, 0.18 * flip, 0.14, 0.11, 0.046, phase=0.2)
    _elf_mushroom(S, -0.22 * flip, -0.10, 0.10, 0.042, phase=0.55)


# ==============================================================================
# LIZARD RECIPES (5 recipes: 2 tall, 3 low)
# Lore: swamp / marsh, arching stilt roots, hanging vines, murky pools with sheen,
# cattails/reeds, mossy fallen logs.
# ==============================================================================
def lizard_recipe_0(S, rng, v):
    """Recipe 0: Swamp Mangrove with Aerial Stilt Roots (tall)."""
    # Arching aerial stilt roots
    n_roots = 6
    s = 1.05 + rng.uniform(-0.05, 0.05)
    for k in range(n_roots):
        ang = k * (2 * math.pi / n_roots) + rng.uniform(-0.15, 0.15)
        r_out = 0.11 * s
        rx, ry = math.cos(ang) * r_out, math.sin(ang) * r_out
        r1 = box(0, 0, 0, 0.018 * s, 0.018 * s, 0.08 * s, S.m('trunk'), 'mangrove_root')
        r1.location = (rx, ry, 0)
        r1.rotation_euler = (-math.sin(ang) * 0.45, math.cos(ang) * 0.45, 0)

    cyl(0, 0, 0.05 * s, 0.042 * s, 0.24 * s, S.m('trunk'), seg=8, name='trunk')
    canopy = sphere(0, 0, 0.32 * s, 0.18 * s, S.m('foliage'), 'mangrove_top', squash=0.65)
    sphere(0.09 * s, -0.06 * s, 0.28 * s, 0.13 * s, S.m('foliage2'), 'mangrove_r', squash=0.6)
    sphere(-0.08 * s, 0.07 * s, 0.29 * s, 0.13 * s, S.m('foliage_dark'), 'mangrove_l', squash=0.6)
    add_sway(canopy, max_ang=0.04, phase=0.1)

    # Hanging vines
    for vx, vy, vlen in ((0.07, -0.08, 0.11), (-0.08, 0.06, 0.12), (0.09, 0.07, 0.09)):
        cyl(vx * s, vy * s, (0.24 - vlen) * s, 0.007 * s, vlen * s, S.m('foliage_dark'), seg=6, name='vine')


def lizard_recipe_1(S, rng, v):
    """Recipe 1: Mangrove Tree by Shimmering Swamp Pool (tall, water: 'pool')."""
    # Swamp pool
    S.water(-0.10, -0.08, 0.0, 0.24, 0.24)
    # Mangrove standing at pool edge
    tx, ty = 0.12 + rng.uniform(-0.02, 0.02), 0.06 + rng.uniform(-0.02, 0.02)
    s = 0.88
    cyl(tx, ty, 0, 0.03 * s, 0.22 * s, S.m('trunk'), seg=8, name='trunk')
    crown = sphere(tx, ty, 0.28 * s, 0.15 * s, S.m('foliage'), 'crown', squash=0.65)
    sphere(tx + 0.06 * s, ty - 0.04 * s, 0.24 * s, 0.10 * s, S.m('foliage2'), 'crown_r', squash=0.6)
    add_sway(crown, max_ang=0.04, phase=0.3)
    # Root touching water
    box(tx - 0.06, ty - 0.05, 0, 0.02, 0.06, 0.03, S.m('trunk'), 'water_root')


def lizard_recipe_2(S, rng, v):
    """Recipe 2: Shimmering Water Pool with Lily Pads (low, water: 'pool')."""
    # Shallow pool
    S.water(0.0, 0.0, 0.0, 0.38, 0.34)
    # Muddy rim
    poly([(-0.21, -0.19, 0), (0.21, -0.19, 0), (0.21, 0.19, 0), (-0.21, 0.19, 0)], [(0, 1, 2, 3)], S.m('dirt'), 'pool_rim')
    # Lily pads on water surface
    lily_mat = S.m('foliage2')
    pads = [(-0.08, 0.04), (0.09, -0.06), (-0.02, -0.09), (0.07, 0.07)]
    for lx, ly in pads:
        cyl(lx, ly, 0.012, 0.035, 0.003, lily_mat, seg=8, name='lily_pad')
    # Pink water flower
    sphere(0.08, -0.06, 0.022, 0.014, mat('#f59ab5'), 'noink_flower')


def lizard_recipe_3(S, rng, v):
    """Recipe 3: Marsh Reeds and Cattails (low)."""
    # Clump of marsh reeds
    stalk_mat = S.m('foliage_dark')
    head_mat = S.m('wood_dark')
    reeds = [
        (-0.12, -0.04, 0.22), (-0.08, 0.06, 0.25), (-0.03, -0.08, 0.20),
        (0.03, 0.08, 0.26), (0.08, -0.03, 0.24), (0.12, 0.05, 0.21),
    ]
    stalks = []
    for rx, ry, rh in reeds:
        st = cyl(rx, ry, 0, 0.006, rh, stalk_mat, seg=5, name='reed_stalk')
        cyl(rx, ry, rh - 0.05, 0.012, 0.045, head_mat, seg=6, name='cattail_head')
        stalks.append(st)
    for idx, st in enumerate(stalks):
        add_sway(st, max_ang=0.07, phase=idx * 0.2)
    # Water puddles around base
    S.water(0.0, 0.0, 0.0, 0.22, 0.18)


def lizard_recipe_4(S, rng, v):
    """Recipe 4: Mossy Fallen Swamp Log (low)."""
    # Gnarled fallen log
    ob = cyl(0, 0, 0.035, 0.038, 0.44, S.m('wood_dark'), seg=8, name='fallen_log')
    # Rotate horizontally
    ob.rotation_euler = (0, math.pi / 2, 0.5 + rng.uniform(-0.1, 0.1))
    # Mossy clusters on the log
    m1 = sphere(0.05, 0.02, 0.06, 0.045, S.m('foliage'), 'moss', squash=0.6)
    sphere(-0.07, -0.03, 0.055, 0.035, S.m('foliage2'), 'moss', squash=0.6)
    add_sway(m1, max_ang=0.03, phase=0.2)
    # Bracket shelf fungi
    poly([(-0.02, 0.05, 0.04), (0.04, 0.08, 0.04), (0.02, 0.04, 0.04)], [(0, 1, 2)], S.m('wood_light'), 'fungus')
    S.rock(0.14, -0.12, r=0.045, rng=rng)


# ==============================================================================
# CAVEMAN RECIPES (5 recipes: 3 tall, 2 low)
# Lore: primeval steppe, rugged dark conifers, cyclopean boulders, mammoth tusks,
# windswept dry tundra grass.
# ==============================================================================
def caveman_recipe_0(S, rng, v):
    """Recipe 0: Rugged Conifer & Boulder (tall)."""
    # Rugged conifer
    px, py = 0.08 + rng.uniform(-0.02, 0.02), -0.04 + rng.uniform(-0.02, 0.02)
    ph = 0.88 + rng.uniform(-0.04, 0.04)
    cyl(px, py, 0, 0.034, ph * 0.35, S.m('trunk'), seg=7, name='trunk')
    cone(px, py, 0, 0.052, 0.06, S.m('trunk'), seg=6, name='roots')
    c_top = None
    for tz, tr, th, mkey in ((0.12, 0.16, 0.22, 'foliage_dark'), (0.24, 0.13, 0.20, 'foliage'), (0.36, 0.09, 0.20, 'foliage2'), (0.46, 0.06, 0.18, 'foliage_dark')):
        c = cone(px, py, tz * ph, tr * ph, th * ph, S.m(mkey), seg=8, name='pine_tier')
        c_top = c
    if c_top:
        add_sway(c_top, max_ang=0.05, phase=0.1)
    # Primeval boulder at base
    S.rock(-0.16, 0.08, r=0.08, rng=rng)


def caveman_recipe_1(S, rng, v):
    """Recipe 1: Boulder Group / Megalith Cluster (tall)."""
    # 3 rugged boulders grouped tightly
    b1 = sphere(-0.02, -0.02, 0.22, 0.19, S.m('stone'), 'megalith_center', squash=0.85)
    b2 = sphere(0.14, 0.08, 0.14, 0.14, S.m('stone_dark'), 'megalith_r', squash=0.75)
    b3 = sphere(-0.14, 0.10, 0.12, 0.13, S.m('stone_light'), 'megalith_l', squash=0.70)
    for b in (b1, b2, b3):
        b.rotation_euler.z = rng.uniform(0, 3)
    # Steppe dry grass tufts between rocks
    g_mat = S.m('crop')
    t1 = box(0.04, -0.16, 0, 0.015, 0.015, 0.08, g_mat, 'tuft')
    box(-0.10, -0.12, 0, 0.015, 0.015, 0.07, g_mat, 'tuft')
    add_sway(t1, max_ang=0.06, phase=0.2)


def caveman_recipe_2(S, rng, v):
    """Recipe 2: Twin Windswept Pines (tall)."""
    pines = [
        (-0.12 + rng.uniform(-0.02, 0.02), -0.05, 0.72),
        (0.12 + rng.uniform(-0.02, 0.02), 0.06, 0.84),
    ]
    for idx, (px, py, ph) in enumerate(pines):
        cyl(px, py, 0, 0.03, ph * 0.35, S.m('trunk'), seg=7, name='trunk')
        cone(px, py, 0, 0.048, 0.05, S.m('trunk'), seg=6, name='roots')
        c = cone(px, py, 0.32 * ph, 0.12 * ph, 0.25 * ph, S.m('foliage_dark'), seg=7, name='pine_tier')
        add_sway(c, max_ang=0.06, phase=idx * 0.4)
    S.rock(0.0, -0.12, r=0.05, rng=rng)


def caveman_recipe_3(S, rng, v):
    """Recipe 3: Mammoth Tusk and Ancient Beast Bones (low)."""
    # Great curved mammoth tusk arching from earth
    tusk_mat = mat('#ede4d0', rough=0.6)
    # Arc of cylinder segments
    n_seg = 6
    for k in range(n_seg):
        t = k / n_seg
        ang = t * 1.3
        tx = -0.12 + math.cos(ang) * 0.22
        ty = -0.06 + math.sin(ang) * 0.10
        tz = math.sin(t * math.pi) * 0.18
        r = 0.024 * (1.0 - t * 0.6)
        c = cyl(tx, ty, tz, r, 0.045, tusk_mat, seg=7, name='tusk_seg')
        c.rotation_euler = (0, -0.4 + t * 0.8, ang)
    # Rib bone fragment
    box(0.08, 0.08, 0, 0.018, 0.12, 0.016, tusk_mat, 'rib_bone')
    # Steppe dry grass tuft
    t_bone = box(-0.02, -0.12, 0, 0.015, 0.015, 0.08, S.m('crop'), 'bone_grass')
    add_sway(t_bone, max_ang=0.07, phase=0.3)
    S.rock(0.12, -0.08, r=0.04, rng=rng)


def caveman_recipe_4(S, rng, v):
    """Recipe 4: Steppe Boulder & Grass Tufts (low)."""
    # Weathered boulder
    S.rock(0.06, 0.02, r=0.08, rng=rng)
    # Windblown grass tufts
    g_mat = S.m('crop')
    tufts = [(-0.12, -0.04), (-0.08, 0.10), (-0.02, -0.10), (0.16, -0.08)]
    for tx, ty in tufts:
        t_box = box(tx, ty, 0, 0.015, 0.015, 0.09, g_mat, 'steppe_tuft')
        add_sway(t_box, max_ang=0.08, phase=tx * 2.0)


# ==============================================================================
# DRAGON RECIPES (5 recipes: 3 tall, 2 low)
# Lore: volcanic rock, obsidian spires, charred dead timber, basalt columns,
# bubbling molten lava pools, smoking volcanic fissures.
# ==============================================================================
def _dragon_spire(S, x, y, h, r, m_key='stone_light', tilt_x=0.0, tilt_y=0.0, phase=0.0):
    """Tall faceted obsidian crystal spire with glowing orange/red magma cracks along its faces."""
    # Cracked basalt collar and molten root pool
    cyl(x, y, 0, r * 1.38, 0.045, S.m('stone'), seg=7, name='spire_base')
    root_glow = sphere(x, y, 0.025, r * 1.22, S.m('glow', emit=5.2), 'noink_root_glow', squash=0.35)
    # Main faceted obsidian crystal cone
    c = cone(x, y, 0.03, r, h, S.m(m_key), seg=6, name='obsidian_spire')
    c.rotation_euler = (tilt_x, tilt_y, phase * 1.7)
    # Glowing orange/red cracks climbing the camera-facing (+X and +Y) slopes
    slope = math.atan2(r, h)
    cracks = []
    for side_idx, (ang, m_crack, emit_v, z_frac) in enumerate((
        (0.35, 'glow', 5.8, 0.26),
        (1.15, 'crop2', 4.8, 0.44),
        (0.75, 'emblem', 6.5, 0.62),
    )):
        cz = 0.04 + h * z_frac
        r_at_z = r * (1.0 - z_frac) * 0.92
        cx = x + math.cos(ang) * r_at_z + tilt_y * cz * 0.6
        cy = y + math.sin(ang) * r_at_z - tilt_x * cz * 0.6
        cr = box(0, 0, -h * 0.11, 0.022, 0.022, h * 0.22, S.m(m_crack, emit=emit_v), 'noink_spire_crack')
        cr.location = (cx, cy, cz)
        cr.rotation_euler = (math.sin(ang) * slope + tilt_x, -math.cos(ang) * slope + tilt_y, ang)
        cracks.append((cr, side_idx))

    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        s = 1.0 + 0.15 * math.sin(t)
        root_glow.scale = (s, s, 0.35 * s)
        for cr, idx in cracks:
            cs = 1.0 + 0.22 * math.sin(t + idx * 0.9)
            cr.scale = (cs, cs, 1.0 + 0.08 * math.cos(t))
    kit.anim(step)


def _dragon_brazier_stone(S, x, y, r=0.085, h=0.15, fire_s=0.95):
    """Carved basalt & bronze brazier stone with glowing coals and flickering dragonfire."""
    cyl(x, y, 0, r * 1.12, h * 0.35, S.m('stone'), seg=7, name='brazier_foot')
    cone(x, y, h * 0.30, r * 0.85, h * 0.70, S.m('stone_light'), seg=7, r_top=r * 1.15, name='brazier_bowl')
    cyl(x, y, h * 0.78, r * 1.20, h * 0.18, S.m('accent2'), seg=8, name='brazier_brass_rim')
    for k in range(4):
        ang = k * (math.pi / 2.0) + 0.4
        sx = x + math.cos(ang) * r * 1.20
        sy = y + math.sin(ang) * r * 1.20
        cone(sx, sy, h * 0.92, 0.016, 0.045, S.m('accent'), seg=4, name='brazier_horn')
    sphere(x, y, h * 0.96, r * 0.88, S.m('glow', emit=5.5), 'noink_brazier_coals', squash=0.42)
    S.fire(x, y, h * 1.02, s=fire_s)


def _dragon_charred_stump(S, x, y, r=0.11, h=0.34, tall_boughs=False, phase=0.0):
    """Charred petrified stump/trunk with glowing molten ember hollow and vertical bark cracks."""
    # Gnarled roots and dark charred bark
    cone(x, y, 0, r * 1.48, h * 0.36, S.m('wall2'), seg=7, name='stump_roots')
    cyl(x, y, 0, r, h, S.m('stone'), seg=8, name='charred_stump')
    # Glowing molten ember core in the hollow top
    ember_top = sphere(x, y, h * 0.96, r * 0.80, S.m('glow', emit=5.5), 'noink_stump_ember', squash=0.42)
    ember_heart = sphere(x + 0.01, y + 0.01, h * 1.02, r * 0.48, S.m('emblem', emit=6.5), 'noink_ember_heart', squash=0.45)
    # Glowing orange/red vertical bark cracks on camera-facing sides
    seams = []
    for idx, (ang, m_key, z_f) in enumerate(((0.25, 'glow', 0.48), (0.95, 'crop2', 0.55), (1.50, 'emblem', 0.42))):
        sx = x + math.cos(ang) * r * 0.98
        sy = y + math.sin(ang) * r * 0.98
        sm = box(sx, sy, h * 0.14, 0.022, 0.022, h * z_f, S.m(m_key, emit=5.2), 'noink_bark_crack')
        seams.append((sm, idx))

    if tall_boughs:
        # Gnarled bare boughs angling outward with glowing ember joints at their bases
        for rx_dir, ry_dir, bz, blen, br in (
            (0.65, -0.45, h * 0.72, 0.28, r * 0.36),
            (-0.45, 0.65, h * 0.78, 0.30, r * 0.34),
            (0.45, 0.45, h * 0.66, 0.24, r * 0.32),
        ):
            bx = x + rx_dir * r * 0.90
            by = y + ry_dir * r * 0.90
            b = cone(bx, by, bz, br, blen, S.m('stone'), seg=5, r_top=br * 0.28, name='charred_bough')
            b.rotation_euler = (-ry_dir * 0.65, rx_dir * 0.65, 0)
            sphere(bx, by, bz + 0.04, br * 0.85, S.m('glow', emit=5.2), 'noink_bough_ember', squash=0.6)

    def step(f, n):
        t = 2.0 * math.pi * (f / n + phase)
        s = 1.0 + 0.16 * math.sin(t)
        ember_top.scale = (s, s, 0.42 * s)
        ember_heart.scale = (1.0 + 0.22 * math.cos(t), 1.0 + 0.22 * math.cos(t), 0.45)
        for sm, idx in seams:
            ks = 1.0 + 0.20 * math.sin(t + idx)
            sm.scale = (ks, ks, 1.0)
    kit.anim(step)


def dragon_recipe_0(S, rng, v):
    """Recipe 0: Towering Obsidian Crystal Spires with Glowing Orange/Red Cracks (tall)."""
    flip = -1 if v else 1
    # Cluster of tall obsidian crystal spires (0.74 - 0.98) spread wide across the tile
    _dragon_spire(S, -0.02 * flip, -0.04, 0.98, 0.118, 'stone_light', tilt_x=0.04, tilt_y=-0.03 * flip, phase=0.0)
    _dragon_spire(S, 0.19 * flip, -0.11, 0.84, 0.098, 'stone', tilt_x=-0.07, tilt_y=0.10 * flip, phase=0.35)
    _dragon_spire(S, -0.18 * flip, 0.13, 0.76, 0.094, 'roof3', tilt_x=0.09, tilt_y=-0.09 * flip, phase=0.65)
    # Flanking angled shards & glowing magma pool at the base
    _dragon_spire(S, 0.10 * flip, 0.17, 0.50, 0.074, 'stone_light', tilt_x=0.14, tilt_y=0.10 * flip, phase=0.2)
    _dragon_spire(S, -0.19 * flip, -0.14, 0.46, 0.070, 'wall2', tilt_x=-0.12, tilt_y=-0.10 * flip, phase=0.5)
    S.water(0.02 * flip, 0.04, 0.0, 0.26, 0.22)


def dragon_recipe_1(S, rng, v):
    """Recipe 1: Charred Tree Stump with Embers, Tall Obsidian Spire & Brazier Stone (tall)."""
    flip = -1 if v else 1
    # Gnarled charred trunk with glowing ember hollow and boughs
    _dragon_charred_stump(S, -0.14 * flip, 0.06, r=0.11, h=0.48, tall_boughs=True, phase=0.1)
    # Towering obsidian crystal spire with glowing cracks beside it
    _dragon_spire(S, 0.15 * flip, -0.09, 0.95, 0.108, 'stone_light', tilt_x=-0.05, tilt_y=0.07 * flip, phase=0.4)
    _dragon_spire(S, 0.22 * flip, 0.08, 0.58, 0.075, 'roof3', tilt_x=0.10, tilt_y=0.12 * flip, phase=0.7)
    # Lit brazier stone at front
    _dragon_brazier_stone(S, 0.04 * flip, 0.19, r=0.080, h=0.14, fire_s=0.95)


def dragon_recipe_2(S, rng, v):
    """Recipe 2: Stepped Hexagonal Basalt Columns, Obsidian Spires & Brazier (tall)."""
    flip = -1 if v else 1
    cols = [
        (-0.03 * flip, -0.05, 0.90, 0.098, 'stone_light'),
        (0.16 * flip, -0.08, 0.76, 0.090, 'stone'),
        (-0.18 * flip, 0.09, 0.66, 0.088, 'roof3'),
        (0.03 * flip, 0.12, 0.54, 0.084, 'stone_light'),
        (0.20 * flip, 0.11, 0.42, 0.078, 'wall2'),
        (-0.15 * flip, -0.15, 0.48, 0.080, 'stone'),
    ]
    seams = []
    for idx, (cx, cy, ch, cr, m_key) in enumerate(cols):
        cyl(cx, cy, 0, cr, ch, S.m(m_key), seg=6, name='basalt_col')
        # Glowing molten cap or crystal crown on top of column
        if idx < 2:
            cone(cx, cy, ch - 0.01, cr * 0.92, 0.14, S.m('stone_light'), seg=6, name='col_spire_cap')
        sphere(cx, cy, ch, cr * 0.72, S.m('glow', emit=5.2), 'noink_col_lava_cap', squash=0.32)
        # Protruding red-hot horizontal and vertical magma seams on camera-facing sides
        s1 = cyl(cx, cy, ch * 0.42, cr * 1.07, 0.024, S.m('glow', emit=5.5), seg=6, name='noink_col_seam')
        s2 = cyl(cx, cy, ch * 0.72, cr * 1.06, 0.020, S.m('crop2', emit=4.8), seg=6, name='noink_col_seam2')
        seams.append((s1, s2, idx))

    def step(f, n):
        for s1, s2, idx in seams:
            t = 2.0 * math.pi * (f / n + idx * 0.2)
            k = 1.0 + 0.08 * math.sin(t)
            s1.scale = (k, k, 1.0 + 0.25 * math.sin(t))
            s2.scale = (k, k, 1.0 + 0.25 * math.cos(t))
    kit.anim(step)
    # Brazier stone at front
    _dragon_brazier_stone(S, -0.06 * flip, 0.21, r=0.075, h=0.13, fire_s=0.9)


def dragon_recipe_3(S, rng, v):
    """Recipe 3: Glowing Molten Lava Pool with Obsidian Shards (low, water: 'lava', glow: 0xff6a1a)."""
    flip = -1 if v else 1
    # Wide glowing molten lava surface + bright orange/gold inner core
    S.water(0.0, 0.0, 0.0, 0.46, 0.42)
    cyl(0.0, 0.0, 0.002, 0.27, 0.016, S.m('water', emit=4.2), seg=12, name='noink_lava_outer')
    hot_mid = cyl(0.01 * flip, 0.01, 0.006, 0.19, 0.016, S.m('glow', emit=5.5), seg=10, name='noink_lava_mid')
    hot_core = cyl(0.02 * flip, -0.01, 0.010, 0.11, 0.016, S.m('emblem', emit=6.5), seg=8, name='noink_lava_core')
    # Rugged volcanic basalt & crimson rocks framing the pool perimeter
    rim_rocks = [
        (-0.24 * flip, -0.10, 0.095, 'stone'),
        (-0.14 * flip, -0.22, 0.085, 'stone_light'),
        (0.10 * flip, -0.23, 0.090, 'roof3'),
        (0.25 * flip, -0.08, 0.095, 'stone_light'),
        (0.22 * flip, 0.14, 0.088, 'stone'),
        (0.02 * flip, 0.23, 0.082, 'wall2'),
        (-0.20 * flip, 0.16, 0.092, 'stone_light'),
    ]
    for rx, ry, rr, m_key in rim_rocks:
        rk = sphere(rx, ry, rr * 0.35, rr, S.m(m_key), 'lava_rim_rock', squash=0.62)
        rk.rotation_euler.z = rng.uniform(0, 6.28)
        box(rx, ry, rr * 0.32, rr * 1.15, 0.016, 0.016, S.m('glow', emit=4.8), 'noink_rim_seam')
    # Small glowing obsidian shard cluster and flickering flame at pool edge
    cone(-0.22 * flip, 0.04, 0.02, 0.055, 0.26, S.m('stone_light'), seg=6, name='pool_shard')
    S.fire(0.14 * flip, -0.12, 0.02, s=0.85)
    # Animated rising/popping lava bubbles
    bubbles = [
        sphere(-0.08 * flip, 0.05, 0.022, 0.036, S.m('emblem', emit=6.5), 'noink_bubble', squash=0.65),
        sphere(0.09 * flip, -0.04, 0.022, 0.032, S.m('glow', emit=5.8), 'noink_bubble', squash=0.65),
        sphere(0.02 * flip, 0.09, 0.022, 0.028, S.m('emblem', emit=6.5), 'noink_bubble', squash=0.65),
    ]

    def step_pool(f, n):
        t = 2.0 * math.pi * (f / n)
        s = 1.0 + 0.12 * math.sin(t)
        hot_mid.scale = (s, s, 1.0)
        hot_core.scale = (1.0 + 0.18 * math.cos(t), 1.0 + 0.18 * math.cos(t), 1.0)
        for idx, b in enumerate(bubbles):
            ph = (f + idx) % 3
            bs = (0.65, 1.15, 1.45)[ph]
            b.scale = (bs, bs, 0.65 * bs)
    kit.anim(step_pool)


def dragon_recipe_4(S, rng, v):
    """Recipe 4: Charred Stump with Embers & Glowing Brazier Stones (low)."""
    flip = -1 if v else 1
    # Hollow charred stump brimming with molten embers
    _dragon_charred_stump(S, -0.10 * flip, -0.04, r=0.125, h=0.25, tall_boughs=False, phase=0.0)
    # Pair of carved basalt & bronze brazier stones with roaring fire
    _dragon_brazier_stone(S, 0.16 * flip, 0.06, r=0.090, h=0.16, fire_s=1.05)
    _dragon_brazier_stone(S, -0.02 * flip, 0.18, r=0.074, h=0.12, fire_s=0.80)
    # Glowing magma fissure & basalt rock at side
    S.rock(0.14 * flip, -0.15, r=0.085, rng=rng)
    # Rising volcanic smoke puffs from the charred stump
    puffs = [
        sphere(-0.10 * flip, -0.04, 0.27 + k * 0.03, 0.032 + k * 0.008, S.m('smoke', alpha=0.55), 'noink_smoke', squash=0.8)
        for k in range(3)
    ]

    def step_smoke(f, n):
        for k, p in enumerate(puffs):
            ph = (f + k) % 3
            p.location = (-0.10 * flip + 0.015 * ph, -0.04 - 0.01 * ph, 0.26 + ph * 0.032)
            s = 0.85 + ph * 0.25
            p.scale = (s, s, 0.8 * s)
    kit.anim(step_smoke)


# ==============================================================================
# GOBLIN RECIPES (10 pieces, one per prop of the goblin valley in wilds-goblin.ts: 5 tall, 5 low)
# Lore: sunny meadow, scrubby pines, round oaks, mossy boulders, scrap heaps. Only variant 0 is used.
# ==============================================================================
def _gpine(S, x, y, s, phase=0.0):
    """Scrubby goblin pine (same shape as GoblinStyle.tree) with a swaying top."""
    cyl(x, y, 0, 0.025 * s, 0.1 * s, S.m('trunk'), seg=6, name='trunk')
    top = None
    for k, (zz, r) in enumerate(((0.08, 0.12), (0.18, 0.095), (0.27, 0.065))):
        top = cone(x, y, zz * s, r * s, 0.14 * s, S.m(('foliage_dark', 'foliage', 'foliage2')[k]), seg=7, name='pine')
    add_sway(top, max_ang=0.06, phase=phase)


def _goak(S, x, y, s, phase=0.0):
    """Round meadow oak with a swaying crown."""
    cyl(x, y, 0, 0.03 * s, 0.22 * s, S.m('trunk'), seg=6, name='trunk')
    crown = sphere(x, y, 0.32 * s, 0.14 * s, S.m('foliage'), 'leaves')
    sphere(x + 0.07 * s, y - 0.03 * s, 0.25 * s, 0.1 * s, S.m('foliage2'), 'leaves_r')
    sphere(x - 0.06 * s, y + 0.05 * s, 0.27 * s, 0.1 * s, S.m('foliage_dark'), 'leaves_l')
    add_sway(crown, max_ang=0.04, phase=phase)


def goblin_recipe_0(S, rng, v):
    """Two pines (tall)."""
    _gpine(S, -0.16, -0.06, 2.1, 0.0)
    _gpine(S, 0.15, 0.08, 2.5, 0.3)


def goblin_recipe_1(S, rng, v):
    """One tall pine (tall)."""
    _gpine(S, 0.0, 0.0, 2.7, 0.1)


def goblin_recipe_2(S, rng, v):
    """Big round oak (tall)."""
    _goak(S, 0.02, 0.0, 2.0, 0.2)


def goblin_recipe_3(S, rng, v):
    """Pine and an oak (tall)."""
    _gpine(S, -0.15, -0.05, 2.4, 0.0)
    _goak(S, 0.17, 0.1, 1.5, 0.5)


def goblin_recipe_4(S, rng, v):
    """Three pines of different heights (tall)."""
    _gpine(S, -0.22, -0.12, 1.7, 0.0)
    _gpine(S, 0.0, -0.02, 2.5, 0.35)
    _gpine(S, 0.22, 0.14, 1.5, 0.7)


def goblin_recipe_5(S, rng, v):
    """Two mossy boulders (low)."""
    S.rock(-0.1, 0.0, r=0.17, rng=rng)
    S.rock(0.2, 0.12, r=0.09, rng=rng)
    sphere(-0.12, 0.0, 0.1, 0.07, S.m('foliage'), 'moss', squash=0.4)


def goblin_recipe_6(S, rng, v):
    """Three bushes (low)."""
    for k, (bx, by, r) in enumerate(((-0.2, -0.03, 0.09), (0.04, -0.1, 0.12), (0.24, 0.1, 0.07))):
        b = sphere(bx, by, r * 0.6, r, S.m('foliage2'), 'bush', squash=0.75)
        add_sway(b, max_ang=0.03, phase=k * 0.3)


def goblin_recipe_7(S, rng, v):
    """Scrap pile and a gear (low)."""
    box(0.0, 0.0, 0.0, 0.2, 0.15, 0.05, S.m('metal'), 'scrap1', bevel=0.008)
    b = box(0.03, 0.0, 0.05, 0.14, 0.1, 0.04, S.m('accent'), 'scrap2', bevel=0.008)
    b.rotation_euler.z = 0.4
    cyl(-0.2, -0.04, 0, 0.07, 0.025, S.m('metal'), seg=10, name='gear')
    cyl(-0.2, -0.04, 0.025, 0.025, 0.02, S.m('stone_dark'), seg=6, name='gear_hub')
    box(0.17, 0.1, 0.0, 0.03, 0.03, 0.09, S.m('accent'), 'rod')


def goblin_recipe_8(S, rng, v):
    """A log pile and a barrel (low)."""
    for k, (lz, lx) in enumerate(((0.0, 0.0), (0.0, 0.07), (0.055, 0.035))):
        lg = cyl(-0.05 + lx, -0.1, lz + 0.03, 0.03, 0.28, S.m('wood'), seg=8, name='log')
        lg.rotation_euler = (0, math.pi / 2, 0.0)
    S.barrel(0.17, 0.08, 0, r=0.06, h=0.12)


def goblin_recipe_9(S, rng, v):
    """Wildflowers in the grass (low)."""
    ws = []
    for k in range(9):
        fx, fy = rng.uniform(-0.3, 0.3), rng.uniform(-0.25, 0.25)
        box(fx, fy, 0, 0.012, 0.012, 0.06, S.m('foliage_dark'), 'stem')
        col = '#f4e04a' if k % 3 else '#f08ab4'
        bl = sphere(fx, fy, 0.075, 0.022, mat(col, emit=0.6), 'noink_flower')
        ws.append((bl, fx, fy, k))

    def step(f, n):
        for bl, fx, fy, k in ws:
            t = 2.0 * math.pi * (f / n + k * 0.11)
            bl.location = (fx + 0.008 * math.sin(t), fy, 0.075 + 0.004 * math.cos(t))
    kit.anim(step)



# ==============================================================================
# Recipe Tables
# ==============================================================================
TABLES = {
    'elf': [
        ('wild_0', True, elf_recipe_0),
        ('wild_1', True, elf_recipe_1),
        ('wild_2', True, elf_recipe_2),
        ('wild_3', False, elf_recipe_3),
        ('wild_4', False, elf_recipe_4),
    ],
    'lizard': [
        ('wild_0', True, lizard_recipe_0),
        ('wild_1', True, lizard_recipe_1),
        ('wild_2', False, lizard_recipe_2),
        ('wild_3', False, lizard_recipe_3),
        ('wild_4', False, lizard_recipe_4),
    ],
    'caveman': [
        ('wild_0', True, caveman_recipe_0),
        ('wild_1', True, caveman_recipe_1),
        ('wild_2', True, caveman_recipe_2),
        ('wild_3', False, caveman_recipe_3),
        ('wild_4', False, caveman_recipe_4),
    ],
    'dragon': [
        ('wild_0', True, dragon_recipe_0),
        ('wild_1', True, dragon_recipe_1),
        ('wild_2', True, dragon_recipe_2),
        ('wild_3', False, dragon_recipe_3),
        ('wild_4', False, dragon_recipe_4),
    ],
    'goblin': [
        ('wild_0', True, goblin_recipe_0),
        ('wild_1', True, goblin_recipe_1),
        ('wild_2', True, goblin_recipe_2),
        ('wild_3', True, goblin_recipe_3),
        ('wild_4', True, goblin_recipe_4),
        ('wild_5', False, goblin_recipe_5),
        ('wild_6', False, goblin_recipe_6),
        ('wild_7', False, goblin_recipe_7),
        ('wild_8', False, goblin_recipe_8),
        ('wild_9', False, goblin_recipe_9),
    ],
}


# ==============================================================================
# LANDMARKS (3 per people, 1-tile footprint, height <= 1.2, 3 frames of motion)
# ==============================================================================
def rbox(x, y, z, sx, sy, sz, material, name='box', rot=(0.0, 0.0, 0.0), bevel=0.0):
    """Box with mesh centered at local origin and object placed at (x, y, z)."""
    ob = box(0, 0, -sz * 0.5, sx, sy, sz, material, name=name, bevel=bevel)
    ob.location = (x, y, z)
    if any(rot):
        ob.rotation_euler = rot
    return ob


def _wheel_flat(S, x, y, z, r=0.125, thick=0.032, tilt_x=0.18, tilt_y=-0.15):
    """Spoked wooden cart wheel with iron tyre lying on the ground (tilted slightly)."""
    n_seg = 10
    for k in range(n_seg):
        a = k * (2.0 * math.pi / n_seg)
        dx, dy = math.cos(a) * r, math.sin(a) * r
        dz = -dx * math.sin(tilt_y) + dy * math.sin(tilt_x)
        seg_len = 2.0 * math.pi * r / n_seg * 1.12
        rbox(x + dx, y + dy, z + dz, seg_len, 0.028, thick, S.m('metal'), 'wheel_tyre',
             rot=(tilt_x, tilt_y, a + math.pi / 2))
        rbox(x + dx * 0.86, y + dy * 0.86, z + dz * 0.86, seg_len * 0.88, 0.024, thick * 0.85, S.m('wood'), 'wheel_felloe',
             rot=(tilt_x, tilt_y, a + math.pi / 2))
    for k in range(4):
        a = k * (math.pi / 4.0)
        rbox(x, y, z, r * 1.82, 0.020, thick * 0.72, S.m('wood_dark'), 'wheel_spoke',
             rot=(tilt_x, tilt_y, a))
    hub = cyl(x, y, z - thick * 0.5, r * 0.28, thick * 1.35, S.m('wood_dark'), seg=8, name='wheel_hub')
    hub.rotation_euler = (tilt_x, tilt_y, 0)
    cap = cyl(x, y, z + thick * 0.3, r * 0.18, 0.022, S.m('accent2'), seg=8, name='wheel_hub_cap')
    cap.rotation_euler = (tilt_x, tilt_y, 0)


def _wheel_upright(S, x, y, z, r=0.125, thick=0.034, yaw=-0.32):
    """Spoked wooden cart wheel standing upright on a cart side (oriented along yaw)."""
    tx, ty = math.cos(yaw), math.sin(yaw)
    n_seg = 10
    for k in range(n_seg):
        a = k * (2.0 * math.pi / n_seg)
        ca, sa = math.cos(a), math.sin(a)
        px = x + ca * r * tx
        py = y + ca * r * ty
        pz = z + sa * r
        seg_len = 2.0 * math.pi * r / n_seg * 1.12
        rbox(px, py, pz, seg_len, thick, 0.028, S.m('metal'), 'wheel_tyre',
             rot=(0, -a + math.pi / 2, yaw))
        px_w = x + ca * r * 0.86 * tx
        py_w = y + ca * r * 0.86 * ty
        pz_w = z + sa * r * 0.86
        rbox(px_w, py_w, pz_w, seg_len * 0.88, thick * 0.85, 0.024, S.m('wood'), 'wheel_felloe',
             rot=(0, -a + math.pi / 2, yaw))
    for k in range(4):
        a = k * (math.pi / 4.0)
        rbox(x, y, z, r * 1.82, thick * 0.72, 0.020, S.m('wood_dark'), 'wheel_spoke',
             rot=(0, a, yaw))
    sphere(x, y, z, r * 0.28, S.m('accent2'), 'wheel_hub', squash=0.85)


def goblin_landmark_0(S, rng, v=0):
    """Goblin landmark 0: Scrap heap with a small crane (hook swings)."""
    # --- Scrap heap mound on the right/front of the tile ---
    S.rock(0.06, -0.12, r=0.15, rng=rng)
    S.rock(0.20, 0.04, r=0.13, rng=rng)
    S.rock(-0.04, 0.16, r=0.11, rng=rng)
    sphere(0.05, -0.10, 0.09, 0.09, S.m('foliage'), 'heap_moss', squash=0.45)

    rbox(0.06, -0.04, 0.04, 0.28, 0.22, 0.055, S.m('metal'), 'scrap_plate1', rot=(0.08, -0.06, 0.25), bevel=0.008)
    rbox(0.10, -0.08, 0.09, 0.22, 0.16, 0.048, S.m('accent', metal=0.4, rough=0.6), 'scrap_plate2', rot=(-0.12, 0.10, -0.35), bevel=0.006)
    rbox(0.02, 0.06, 0.09, 0.20, 0.12, 0.042, S.m('wood_dark'), 'scrap_beam', rot=(0.06, 0.14, 0.5), bevel=0.006)

    # Salvaged gears & boiler pipe on the heap
    g1 = cyl(0.16, -0.14, 0.07, 0.09, 0.026, S.m('accent2', metal=0.5, rough=0.5), seg=12, name='cog1')
    g1.rotation_euler = (0.35, 0.25, 0.4)
    cyl(-0.02, 0.18, 0.03, 0.075, 0.025, S.m('metal', metal=0.5), seg=10, name='cog2')
    cyl(-0.02, 0.18, 0.055, 0.03, 0.02, S.m('accent2'), seg=8, name='cog2_hub')
    pipe = cyl(0.08, 0.04, 0.12, 0.05, 0.20, S.m('accent', metal=0.4), seg=10, name='boiler_pipe')
    pipe.rotation_euler = (0.2, 1.35, 0.3)

    S.barrel(-0.24, -0.10, 0, r=0.062, h=0.12)
    S.crate(0.22, -0.02, 0, s=0.095, rng=rng)

    # --- Small timber & iron crane in clear side-profile (from screen-left (-0.16, 0.12) to screen-right (0.18, -0.14)) ---
    base_x, base_y = -0.16, 0.12
    cyl(base_x, base_y, 0.0, 0.13, 0.08, S.m('stone_dark'), seg=10, name='crane_plinth')
    cyl(base_x, base_y, 0.08, 0.10, 0.04, S.m('metal'), seg=10, name='crane_turntable')

    # Twin A-frame timber masts rising to z=0.72
    rbox(base_x - 0.04, base_y - 0.04, 0.40, 0.044, 0.044, 0.60, S.m('wood_dark'), 'mast_l', rot=(0.04, 0.04, -0.75))
    rbox(base_x + 0.04, base_y + 0.04, 0.40, 0.044, 0.044, 0.60, S.m('wood_dark'), 'mast_r', rot=(-0.04, -0.04, -0.75))
    rbox(base_x, base_y, 0.42, 0.15, 0.06, 0.035, S.m('trim'), 'mast_cross', rot=(0, 0, 0.8))
    rbox(base_x, base_y, 0.68, 0.13, 0.08, 0.045, S.m('metal'), 'mast_cap', rot=(0, 0, 0.8))
    # Counterweight stone box hanging off the back-left (-0.26, 0.20)
    rbox(base_x - 0.10, base_y + 0.08, 0.20, 0.12, 0.11, 0.10, S.m('stone'), 'counterweight', rot=(0, 0, -0.68), bevel=0.01)
    rbox(base_x - 0.05, base_y + 0.04, 0.22, 0.14, 0.035, 0.035, S.m('trim'), 'cw_arm', rot=(0, 0, -0.68))

    # Angled jib boom reaching across the tile from (-0.14, 0.10, 0.48) to (+0.18, -0.14, 0.94)
    boom_yaw = -0.64  # points from (-x, +y) toward (+x, -y) across screen
    for k in range(7):
        t = k / 6.0
        bx = -0.14 + t * 0.32
        by = 0.10 - t * 0.24
        bz = 0.48 + t * 0.46
        rbox(bx, by, bz, 0.09, 0.048, 0.048, S.m('wood' if k < 6 else 'metal'), 'boom_seg',
             rot=(0.0, -0.85, boom_yaw))
    # Guy tie rod from mast top (-0.14, 0.10, 0.70) to boom upper third (0.10, -0.08, 0.84)
    for k in range(5):
        t = (k + 0.5) / 5.0
        gx = -0.14 + t * 0.24
        gy = 0.10 - t * 0.18
        gz = 0.70 + t * 0.14
        rbox(gx, gy, gz, 0.068, 0.020, 0.020, S.m('metal'), 'guy_tie', rot=(0.0, -0.45, boom_yaw))

    # Top pulley sheave at boom tip (0.19, -0.15, 0.93)
    tx, ty, tz = 0.19, -0.15, 0.93
    pulley = cyl(tx, ty, tz - 0.02, 0.048, 0.028, S.m('accent2'), seg=10, name='pulley_wheel')
    pulley.rotation_euler = (0.7, 0.7, 0)

    # Swinging cable + hook block + hooked salvage lantern/gear
    cable_segs = [
        cyl(tx, ty, tz - (idx + 1) * 0.085, 0.011, 0.09, S.m('metal'), seg=6, name='cable_seg')
        for idx in range(4)
    ]
    block = rbox(tx, ty, tz - 0.36, 0.058, 0.058, 0.058, S.m('accent2'), 'hook_block')
    hook_stem = rbox(tx, ty, tz - 0.41, 0.024, 0.024, 0.055, S.m('metal'), 'hook_stem')
    hook_jaw = rbox(tx + 0.02, ty - 0.01, tz - 0.44, 0.058, 0.032, 0.026, S.m('metal'), 'hook_jaw')
    hook_tip = rbox(tx + 0.042, ty - 0.01, tz - 0.42, 0.022, 0.028, 0.045, S.m('metal'), 'hook_tip')
    load_glow = sphere(tx + 0.01, ty - 0.01, tz - 0.49, 0.044, S.m('glow', emit=4.8), 'noink_hook_lamp', squash=1.1)
    load_cap = cone(tx + 0.01, ty - 0.01, tz - 0.45, 0.050, 0.036, S.m('accent'), seg=6, name='hook_lamp_cap')

    def step_crane(f, n):
        t = 2.0 * math.pi * (f / n)
        sw = 0.075 * math.sin(t)
        sw_y = -0.055 * math.sin(t)
        pulley.rotation_euler = (0.7, 0.7, t)
        for idx, c_seg in enumerate(cable_segs):
            frac = (idx + 0.5) / 4.0
            c_seg.location = (tx + sw * frac, ty + sw_y * frac, tz - (idx + 0.5) * 0.085)
            c_seg.rotation_euler = (-sw_y * 1.4, sw * 1.4, 0)
        bx_now, by_now = tx + sw, ty + sw_y
        block.location = (bx_now, by_now, tz - 0.36)
        hook_stem.location = (bx_now, by_now, tz - 0.41)
        hook_jaw.location = (bx_now + 0.02, by_now - 0.01, tz - 0.44)
        hook_tip.location = (bx_now + 0.042, by_now - 0.01, tz - 0.42)
        load_glow.location = (bx_now + 0.01, by_now - 0.01, tz - 0.49)
        load_cap.location = (bx_now + 0.01, by_now - 0.01, tz - 0.45)
    kit.anim(step_crane)


def goblin_landmark_1(S, rng, v=0):
    """Goblin landmark 1: Broken cart with a lost wheel."""
    # Tilted wooden cart bed & side rails (shifted slightly screen-left so lost wheel on right stands out)
    cx, cy = -0.10, 0.05
    tilt = (0.16, 0.22, -0.32)
    rbox(cx, cy, 0.14, 0.34, 0.22, 0.042, S.m('wood'), 'cart_bed', rot=tilt, bevel=0.006)
    rbox(cx - 0.03, cy + 0.09, 0.21, 0.33, 0.032, 0.088, S.m('wood_light'), 'cart_rail_l', rot=tilt)
    rbox(cx + 0.03, cy - 0.09, 0.15, 0.33, 0.032, 0.088, S.m('wood_light'), 'cart_rail_r', rot=tilt)
    rbox(cx - 0.15, cy - 0.04, 0.21, 0.032, 0.21, 0.095, S.m('trim'), 'cart_tailboard', rot=tilt)

    # Broken front shafts resting on the ground toward (+X, -Y)
    rbox(cx + 0.18, cy - 0.02, 0.07, 0.18, 0.026, 0.026, S.m('wood_dark'), 'shaft_1', rot=(0.08, 0.28, -0.32))
    rbox(cx + 0.12, cy + 0.11, 0.09, 0.18, 0.026, 0.026, S.m('wood_dark'), 'shaft_2', rot=(0.08, 0.28, -0.32))

    # Intact spoked wheel still attached on high side (-0.16, 0.18, 0.15)
    _wheel_upright(S, cx - 0.05, cy + 0.13, 0.15, r=0.12, thick=0.034, yaw=-0.32)

    # Detached LOST WHEEL lying clearly separated at screen-right/front (+0.18, -0.12)
    S.rock(0.14, -0.16, r=0.08, rng=rng)
    _wheel_flat(S, 0.18, -0.10, 0.045, r=0.13, thick=0.034, tilt_x=0.20, tilt_y=-0.22)

    # Spilled cargo tumbled between the broken cart and lost wheel
    S.barrel(-0.02, -0.18, 0, r=0.062, h=0.125)
    S.crate(0.06, 0.19, 0, s=0.092, rng=rng)
    S.sack(0.04, -0.05, 0)
    S.sack(cx + 0.02, cy + 0.01, 0.16)
    S.rock(-0.24, -0.10, r=0.085, rng=rng)

    # Crooked banner pole & swinging lantern on the cart corner
    px, py = cx - 0.12, cy + 0.04
    box(px, py, 0.18, 0.028, 0.028, 0.50, S.m('trim'), 'cart_post')
    box(px + 0.05, py + 0.02, 0.64, 0.12, 0.024, 0.024, S.m('trim'), 'lamp_arm')
    flag = box(0, 0.08, -0.05, 0.016, 0.16, 0.10, S.m('cloth'), 'cart_flag')
    flag.location = (px, py, 0.59)
    S.emblem('x', px + 0.016, py + 0.07, 0.59, 0.07)

    lamp_orb = sphere(px + 0.10, py + 0.02, 0.56, 0.038, S.m('glow', emit=4.8), 'noink_cart_lamp', squash=1.1)
    lamp_hat = cone(px + 0.10, py + 0.02, 0.59, 0.044, 0.035, S.m('metal'), seg=6, name='cart_lamp_hat')

    def step_cart(f, n):
        t = 2.0 * math.pi * (f / n)
        flag.rotation_euler = (0.12 * math.sin(t), 0, 0.28 * math.sin(t))
        dx = 0.032 * math.sin(t)
        dy = 0.022 * math.cos(t)
        lamp_orb.location = (px + 0.10 + dx, py + 0.02 + dy, 0.56)
        s = 1.0 + 0.18 * math.sin(t)
        lamp_orb.scale = (s, s, 1.1 * s)
        lamp_hat.location = (px + 0.10 + dx, py + 0.02 + dy, 0.59)
    kit.anim(step_cart)


def goblin_landmark_2(S, rng, v=0):
    """Goblin landmark 2: Mushroom ring (glow pulse)."""
    # Center mossy goblin stone & spore heart
    S.rock(0.0, 0.0, r=0.11, rng=rng)
    sphere(0.0, 0.0, 0.065, 0.085, S.m('foliage'), 'center_moss', squash=0.45)
    S.emblem('x', 0.07, 0.0, 0.05, 0.07)

    # Ring of 8 spotted goblin toadstools around the tile
    n_shrooms = 8
    caps = []
    spores = []
    for k in range(n_shrooms):
        ang = k * (2.0 * math.pi / n_shrooms) + 0.2
        rx = math.cos(ang) * 0.29
        ry = math.sin(ang) * 0.27
        h = 0.16 + 0.07 * ((k * 3) % 3)
        r_cap = 0.072 + 0.016 * (k % 2)

        # Stem & glowing under-gill
        cyl(rx, ry, 0, r_cap * 0.34, h, S.m('wall'), seg=7, name='shroom_stem')
        gill = cyl(rx, ry, h * 0.78, r_cap * 0.78, h * 0.16, S.m('glow', emit=3.8), seg=8, name='noink_gill')

        # Cap in warm goblin hues with emissive pulse
        cap_key = ('glow', 'accent', 'roof2')[k % 3]
        cap_mat = mat(S.P[cap_key], rough=0.45, emit=3.6 if cap_key == 'glow' else 2.2)
        cap = sphere(rx, ry, h + r_cap * 0.25, r_cap, cap_mat, 'noink_shroom_cap', squash=0.64)
        pulse_emit(cap_mat, base_emit=2.0, amp=2.8, phase=k * 0.25)

        # Bone-white spots on cap
        spot_mat = S.m('emblem', emit=2.8)
        s1 = sphere(rx + r_cap * 0.36, ry + r_cap * 0.14, h + r_cap * 0.55, r_cap * 0.21, spot_mat, 'noink_spot')
        s2 = sphere(rx - r_cap * 0.30, ry - r_cap * 0.20, h + r_cap * 0.52, r_cap * 0.18, spot_mat, 'noink_spot')
        caps.append((cap, gill, s1, s2, k))

    # Floating glowing spore motes above the ring
    for k in range(6):
        ang = k * (math.pi / 3.0)
        sx, sy, sz = math.cos(ang) * 0.16, math.sin(ang) * 0.16, 0.22 + (k % 3) * 0.09
        sp = sphere(sx, sy, sz, 0.026, S.m('glow', emit=5.5), 'noink_spore')
        spores.append((sp, sx, sy, sz, k))

    def step_ring(f, n):
        for cap, gill, s1, s2, k in caps:
            t = 2.0 * math.pi * (f / n + k * 0.18)
            sc = 1.0 + 0.16 * math.sin(t)
            cap.scale = (sc, sc, 0.64 * (1.0 + 0.18 * math.cos(t)))
            gill.scale = (sc, sc, 1.0)
            s1.scale = (sc, sc, sc)
            s2.scale = (sc, sc, sc)
        for sp, sx, sy, sz, k in spores:
            t = 2.0 * math.pi * (f / n + k * 0.33)
            sp.location = (sx + 0.025 * math.cos(t), sy + 0.025 * math.sin(t), sz + 0.035 * math.sin(t))
            sc = 0.8 + 0.45 * (0.5 + 0.5 * math.sin(t))
            sp.scale = (sc, sc, sc)
    kit.anim(step_ring)


def elf_landmark_0(S, rng, v=0):
    """Elf landmark 0: Moonwell (round marble rim, glowing silver pool, light motes)."""
    # Stepped circular white/ivory marble plinth with gold bands
    cyl(0, 0, 0.0, 0.34, 0.045, S.m('stone'), seg=16, name='well_step1')
    cyl(0, 0, 0.045, 0.30, 0.04, S.m('stone_light'), seg=16, name='well_step2')
    cyl(0, 0, 0.078, 0.305, 0.014, S.m('trim'), seg=16, name='well_gold_band')

    # Round carved marble rim of 12 ashlar segments + gold coping
    r_rim = 0.255
    for k in range(12):
        a = k * (2.0 * math.pi / 12.0)
        rx, ry = math.cos(a) * r_rim, math.sin(a) * r_rim
        c_key = 'stone_light' if k % 2 == 0 else 'wall'
        rbox(rx, ry, 0.135, 0.145, 0.055, 0.10, S.m(c_key), 'rim_block', rot=(0, 0, a + math.pi / 2), bevel=0.006)
        rbox(rx, ry, 0.195, 0.155, 0.068, 0.026, S.m('stone_light'), 'rim_coping', rot=(0, 0, a + math.pi / 2), bevel=0.005)
    cyl(0, 0, 0.205, 0.278, 0.012, S.m('trim'), seg=16, name='rim_gold_lip')

    # 4 low marble & gold bollards on the rim + 2 graceful back columns supporting a crescent moon shrine arch
    for a in (0.35, 1.22, -0.6, 2.2):
        bx, by = math.cos(a) * r_rim, math.sin(a) * r_rim
        cyl(bx, by, 0.20, 0.028, 0.07, S.m('wall'), seg=8, name='rim_bollard')
        sphere(bx, by, 0.285, 0.024, S.m('trim'), 'bollard_cap', squash=0.75)

    # Twin back shrine columns at (-0.18, 0.14) and (0.14, -0.18) framing the moonwell
    for px, py in ((-0.19, 0.12), (0.12, -0.19)):
        cyl(px, py, 0.20, 0.034, 0.44, S.m('wall'), seg=10, name='shrine_col')
        cyl(px, py, 0.20, 0.042, 0.025, S.m('trim'), seg=10, name='col_base')
        cyl(px, py, 0.63, 0.044, 0.028, S.m('trim'), seg=10, name='col_cap')
        sphere(px, py, 0.675, 0.032, S.m('glow', emit=4.2), 'noink_col_orb')

    # Glowing silver-cyan pool surface & concentric luminous ripples inside the rim
    pool_base = cyl(0, 0, 0.08, 0.225, 0.085, S.m('water', emit=3.2), seg=16, name='noink_pool_water')
    pool_mid = cyl(0, 0, 0.168, 0.175, 0.012, S.m('glow', emit=4.8), seg=14, name='noink_pool_silver')
    pool_core = cyl(0, 0, 0.175, 0.105, 0.012, S.m('emblem', emit=6.2), seg=12, name='noink_pool_core')
    pulse_emit(pool_mid.data.materials[0], base_emit=3.8, amp=2.5, phase=0.0)

    # Sacred silver crescent moon suspended above the well center
    cres = sphere(-0.03, -0.03, 0.56, 0.085, S.m('emblem', emit=5.0), 'noink_moon_crest', squash=1.0)
    cres.scale = (0.35, 1.0, 1.0)
    cres.rotation_euler = (0.2, -0.2, 0.78)
    star = sphere(0.01, 0.01, 0.58, 0.028, S.m('accent', emit=5.5), 'noink_moon_star')

    # Forest foliage & moonflower at plinth base
    S.bush(-0.28, -0.06, r=0.075)
    S.bush(0.06, -0.28, r=0.068)
    _elf_moonflower(S, 0.26, 0.16, 0.16, 0.045, phase=0.2)
    _elf_mushroom(S, -0.14, 0.28, 0.11, 0.044, phase=0.5)

    # 6 rising & orbiting light motes above the silver pool
    motes = []
    for k in range(6):
        ang = k * (math.pi / 3.0)
        mr = 0.13 if k % 2 == 0 else 0.08
        mx, my = math.cos(ang) * mr, math.sin(ang) * mr
        mz = 0.25 + k * 0.055
        m_key = ('emblem', 'glow', 'accent')[k % 3]
        ob = sphere(mx, my, mz, 0.024, S.m(m_key, emit=6.0), 'noink_mote')
        motes.append((ob, ang, mr, mz, k))

    def step_well(f, n):
        t = 2.0 * math.pi * (f / n)
        s_mid = 1.0 + 0.14 * math.sin(t)
        s_core = 1.0 + 0.22 * math.cos(t)
        pool_mid.scale = (s_mid, s_mid, 1.0)
        pool_core.scale = (s_core, s_core, 1.0)
        star.scale = (s_core, s_core, s_core)
        for ob, ang0, mr, mz, k in motes:
            tk = 2.0 * math.pi * (f / n + k * 0.17)
            a_now = ang0 + 0.35 * math.sin(tk)
            ob.location = (math.cos(a_now) * mr, math.sin(a_now) * mr, mz + 0.04 * math.sin(tk))
            sc = 0.75 + 0.55 * (0.5 + 0.5 * math.cos(tk))
            ob.scale = (sc, sc, sc)
    kit.anim(step_well)


def elf_landmark_1(S, rng, v=0):
    """Elf landmark 1: Overgrown elven arch ruin with vines."""
    # Cracked mossy ivory flagstones on the forest floor
    rbox(-0.14, 0.12, 0.02, 0.22, 0.18, 0.04, S.m('stone'), 'flagstone1', rot=(0, 0, 0.3), bevel=0.006)
    rbox(0.12, -0.14, 0.02, 0.22, 0.18, 0.04, S.m('stone_light'), 'flagstone2', rot=(0, 0, -0.2), bevel=0.006)
    rbox(0.0, 0.0, 0.018, 0.20, 0.16, 0.035, S.m('stone_dark'), 'flagstone3', rot=(0, 0, 0.6), bevel=0.006)

    # Arch spans along screen-horizontal diagonal from (-0.18, 0.16) to (0.16, -0.18)
    yaw = -0.785  # along (+x, -y)
    # Left standing fluted pier (-0.18, 0.16) and right pier (0.16, -0.18)
    for sign, (px, py, ph) in enumerate(((-0.18, 0.16, 0.62), (0.16, -0.18, 0.56))):
        cyl(px, py, 0.03, 0.068, 0.05, S.m('stone_light'), seg=10, name='pier_plinth')
        cyl(px, py, 0.08, 0.072, 0.02, S.m('trim'), seg=10, name='pier_base_gold')
        cyl(px, py, 0.10, 0.052, ph, S.m('wall'), seg=10, name='pier_shaft')
        cyl(px, py, 0.10 + ph, 0.068, 0.035, S.m('trim'), seg=10, name='pier_capital')
        rbox(px, py, 0.15 + ph, 0.13, 0.13, 0.035, S.m('stone_light'), 'pier_abacus', rot=(0, 0, yaw), bevel=0.005)

    # Pointed gothic/elven arch segments curving up from both piers to apex (0, 0, 1.02)
    arch_pts = [
        (-0.16, 0.14, 0.78, 0.45),
        (-0.11, 0.09, 0.90, 0.65),
        (-0.05, 0.04, 0.99, 0.85),
        (0.0, 0.0, 1.03, 1.57),
        (0.06, -0.05, 0.97, -0.85),
        (0.12, -0.11, 0.84, -0.55),
    ]
    for ax, ay, az, pitch in arch_pts:
        rbox(ax, ay, az, 0.11, 0.075, 0.065, S.m('wall'), 'arch_voussoir', rot=(0, pitch, yaw), bevel=0.006)
        rbox(ax, ay, az + 0.025, 0.11, 0.03, 0.022, S.m('trim'), 'arch_gold_rib', rot=(0, pitch, yaw))
    # Finial crest on arch keystone
    sphere(0.0, 0.0, 1.08, 0.036, S.m('trim'), 'arch_keystone')
    cone(0.0, 0.0, 1.10, 0.022, 0.07, S.m('accent'), seg=4, name='arch_finial')

    # Fallen broken column drum & stone block on the ground in front (+0.16, +0.16)
    drum = cyl(0.15, 0.15, 0.05, 0.052, 0.18, S.m('wall2'), seg=10, name='fallen_drum')
    drum.rotation_euler = (1.35, 0.3, 0.5)
    S.rock(-0.04, 0.22, r=0.08, rng=rng)

    # Lush overgrown vines draped across the arch and hanging down in swaying curtains
    for vx, vy, vz, vr, mk in (
        (-0.16, 0.15, 0.82, 0.075, 'foliage'),
        (-0.08, 0.08, 0.96, 0.082, 'foliage2'),
        (0.02, -0.01, 1.04, 0.078, 'crop2'),
        (0.11, -0.10, 0.88, 0.072, 'foliage'),
        (-0.18, 0.17, 0.48, 0.068, 'foliage2'),
    ):
        sphere(vx, vy, vz, vr, S.m(mk), 'arch_moss', squash=0.58)

    # Hanging vine curtains that sway in the breeze + glowing cyan blossoms
    vine_Lock = []
    for idx, (hx, hy, top_z, vlen) in enumerate((
        (-0.10, 0.09, 0.90, 0.32),
        (-0.02, 0.01, 0.96, 0.38),
        (0.07, -0.06, 0.88, 0.28),
        (-0.16, 0.18, 0.68, 0.26),
    )):
        v_cyl = cyl(hx, hy, top_z - vlen, 0.018, vlen, S.m('foliage' if idx % 2 == 0 else 'crop2'), seg=6, name='hanging_vine')
        bl = sphere(hx + 0.01, hy + 0.01, top_z - vlen * 0.65, 0.032, S.m('accent2', emit=4.2), 'noink_vine_bloom', squash=0.7)
        vine_Lock.append((v_cyl, bl, hx, hy, top_z, vlen, idx))

    # Glowing runestone & mushrooms at the foot of the arch
    rune = sphere(0.02, 0.06, 0.08, 0.052, S.m('glow', emit=4.8), 'noink_arch_rune', squash=1.3)
    _elf_mushroom(S, -0.22, -0.04, 0.14, 0.056, phase=0.1)
    _elf_mushroom(S, 0.04, 0.22, 0.12, 0.048, phase=0.5)
    _elf_moonflower(S, -0.08, -0.16, 0.17, 0.046, phase=0.3)

    def step_arch(f, n):
        t = 2.0 * math.pi * (f / n)
        sr = 1.0 + 0.20 * math.sin(t)
        rune.scale = (sr, sr, 1.3 * sr)
        for v_cyl, bl, hx, hy, top_z, vlen, idx in vine_Lock:
            tk = 2.0 * math.pi * (f / n + idx * 0.22)
            dx = 0.032 * math.sin(tk)
            dy = 0.024 * math.cos(tk)
            v_cyl.rotation_euler = (dy * 2.2, -dx * 2.2, 0)
            bl.location = (hx + dx, hy + dy, top_z - vlen * 0.65)
            sb = 0.85 + 0.35 * (0.5 + 0.5 * math.sin(tk))
            bl.scale = (sb, sb, 0.7 * sb)
    kit.anim(step_arch)


def elf_landmark_2(S, rng, v=0):
    """Elf landmark 2: Fallen giant log with glowing mushrooms."""
    # Giant ancient hollow white-bark trunk lying across the tile from (-0.22, 0.18) to (0.22, -0.16)
    yaw = -0.68
    # Build the giant log out of overlapping bark segments with a dark hollow opening at the front-right end
    for k in range(7):
        t = k / 6.0
        lx = -0.22 + t * 0.44
        ly = 0.18 - t * 0.34
        lz = 0.125 - t * 0.015
        r_seg = 0.125 * (1.08 - 0.16 * t)
        rbox(lx, ly, lz, 0.12, r_seg * 1.9, r_seg * 1.75, S.m('wall' if k % 2 == 0 else 'wood_light'),
             'giant_log_seg', rot=(0.04, 0.03, yaw), bevel=0.015)

    # Dark hollow core & glowing cyan crystal heart at the open front end (0.23, -0.17, 0.11)
    rbox(0.23, -0.17, 0.11, 0.04, 0.15, 0.14, S.m('wood_dark'), 'log_hollow', rot=(0, 0, yaw))
    hollow_glow = sphere(0.22, -0.16, 0.10, 0.055, S.m('glow', emit=5.0), 'noink_hollow_glow', squash=0.8)

    # Flared roots at the upper-left buttress (-0.26, 0.21)
    for rx_o, ry_o, rz_o in ((-0.28, 0.24, 0.08), (-0.26, 0.12, 0.07), (-0.16, 0.26, 0.07)):
        S.rock(rx_o, ry_o, r=0.08, rng=rng)

    # Lush emerald moss blanket draped along the top ridge of the giant log
    for mx, my, mz, mr, mk in (
        (-0.18, 0.15, 0.22, 0.10, 'foliage'),
        (-0.06, 0.05, 0.21, 0.11, 'foliage2'),
        (0.06, -0.04, 0.20, 0.105, 'crop2'),
        (0.16, -0.12, 0.19, 0.09, 'foliage2'),
    ):
        sphere(mx, my, mz, mr, S.m(mk), 'log_moss', squash=0.45)

    # Family of 7 glowing bioluminescent mushrooms growing on top of and beside the giant log
    shrooms = [
        (-0.14, 0.12, 0.34, 0.076, 0.0),   # tall shroom on log ridge
        (-0.02, 0.02, 0.38, 0.086, 0.25),  # hero giant shroom on log center
        (0.10, -0.07, 0.31, 0.068, 0.50),  # shroom on log right
        (0.06, 0.16, 0.18, 0.072, 0.15),   # front ground shroom
        (-0.08, -0.14, 0.16, 0.064, 0.40), # back ground shroom
        (0.20, 0.06, 0.14, 0.056, 0.65),   # side shroom
        (-0.22, -0.02, 0.15, 0.058, 0.80), # root shroom
    ]
    for sx, sy, sh, sr, ph in shrooms:
        _elf_mushroom(S, sx, sy, sh, sr, phase=ph)

    _elf_moonflower(S, -0.04, 0.20, 0.18, 0.048, phase=0.2)
    _elf_moonflower(S, 0.14, -0.22, 0.16, 0.044, phase=0.6)

    # Floating cyan/gold light spores above the log
    spores = []
    for k in range(5):
        sx = -0.16 + k * 0.08
        sy = 0.12 - k * 0.06
        sz = 0.42 + (k % 2) * 0.06
        sp = sphere(sx, sy, sz, 0.022, S.m('emblem' if k % 2 == 0 else 'accent', emit=5.5), 'noink_log_spore')
        spores.append((sp, sx, sy, sz, k))

    def step_log(f, n):
        t = 2.0 * math.pi * (f / n)
        sh = 1.0 + 0.22 * math.sin(t)
        hollow_glow.scale = (sh, sh, 0.8 * sh)
        for sp, sx, sy, sz, k in spores:
            tk = 2.0 * math.pi * (f / n + k * 0.2)
            sp.location = (sx + 0.02 * math.sin(tk), sy + 0.02 * math.cos(tk), sz + 0.03 * math.sin(tk))
            sc = 0.8 + 0.45 * (0.5 + 0.5 * math.cos(tk))
            sp.scale = (sc, sc, sc)
    kit.anim(step_log)


def lizard_landmark_0(S, rng, v=0):
    """Lizard landmark 0: Half-sunk stone serpent head with jade eyes (water glints)."""
    # Swamp water pool & mud banks
    cyl(0.0, 0.0, 0.0, 0.42, 0.045, S.m('dirt'), seg=16, name='mud_base')
    rbox(-0.25, 0.22, 0.04, 0.28, 0.24, 0.06, S.m('dirt'), 'mud_bank1', rot=(0, 0, 0.4), bevel=0.015)
    rbox(0.24, -0.22, 0.04, 0.26, 0.24, 0.06, S.m('dirt'), 'mud_bank2', rot=(0, 0, -0.3), bevel=0.015)
    S.rock(-0.28, 0.16, r=0.09, rng=rng)
    S.rock(0.26, -0.18, r=0.08, rng=rng)

    # Murky swamp water surface
    cyl(0.0, 0.0, 0.038, 0.38, 0.015, S.m('water'), seg=16, name='swamp_water')

    # Water lilies on water surface
    for lx, ly in ((-0.20, -0.16), (-0.14, -0.26), (0.22, 0.18)):
        pad = cyl(lx, ly, 0.045, 0.045, 0.005, S.m('foliage2'), seg=8, name='lilypad')
        pad.scale.y = 0.8
        sphere(lx + 0.01, ly + 0.01, 0.052, 0.016, S.m('accent', emit=2.0), 'lily_flower')

    # Ancient carved stone serpent head emerging half-sunk from the pool
    # Snout points towards (+X, +Y) camera face: yaw = -0.785 rad (-45 deg)
    yaw = -0.785
    pitch = 0.38  # tilted up at ~22 deg
    # Neck column rising from depths
    rbox(-0.12, -0.12, 0.09, 0.20, 0.22, 0.14, S.m('stone_dark'), 'serpent_neck',
         rot=(-pitch * 0.7, pitch * 0.7, yaw), bevel=0.012)
    # Main cranium / head block
    rbox(-0.02, -0.02, 0.18, 0.22, 0.24, 0.15, S.m('stone'), 'serpent_cranium',
         rot=(-pitch, pitch, yaw), bevel=0.015)
    # Brow ridge & crown plates (terracotta / weathered stone)
    rbox(-0.04, -0.04, 0.26, 0.18, 0.22, 0.05, S.m('wall2'), 'serpent_brow',
         rot=(-pitch, pitch, yaw), bevel=0.01)
    # Snout / upper jaw extending forward
    rbox(0.08, 0.08, 0.17, 0.17, 0.18, 0.10, S.m('stone_light'), 'serpent_snout',
         rot=(-pitch, pitch, yaw), bevel=0.012)
    # Lower jaw partially submerged at waterline
    rbox(0.05, 0.05, 0.065, 0.15, 0.16, 0.065, S.m('stone_dark'), 'serpent_jaw_sub',
         rot=(-pitch * 0.5, pitch * 0.5, yaw), bevel=0.01)

    # 4 carved bone/stone fangs jutting down from the upper jaw
    for fx_o, fy_o in ((-0.05, 0.06), (0.06, -0.05)):
        fang_bx = 0.11 + fx_o * 0.7
        fang_by = 0.11 + fy_o * 0.7
        fg = cone(fang_bx, fang_by, 0.085, 0.014, 0.065, S.m('accent2'), seg=6, name='serpent_fang')
        fg.rotation_euler = (0.2, -0.2, yaw)

    # Feathered/horned crest plates fanning backward along head
    for k, (cx, cy, cz, c_pitch) in enumerate((
        (-0.12, -0.12, 0.28, 0.65),
        (-0.17, -0.17, 0.33, 0.82),
        (-0.21, -0.21, 0.36, 0.98),
    )):
        c_mat = S.m('accent' if k == 1 else 'wall2')
        rbox(cx, cy, cz, 0.09, 0.19, 0.045, c_mat, 'crest_plate',
             rot=(-c_pitch, c_pitch, yaw), bevel=0.008)

    # Luminous jade / turquoise eyes in carved sockets
    eye_l = sphere(0.04, -0.05, 0.22, 0.034, S.m('emblem', emit=5.2), 'noink_jade_eye_l')
    eye_r = sphere(-0.05, 0.04, 0.22, 0.034, S.m('emblem', emit=5.2), 'noink_jade_eye_r')
    pulse_emit(eye_l.data.materials[0], base_emit=4.2, amp=3.0, phase=0.0)

    # Water glints & ripples around the emerging serpent head
    glints = []
    for k in range(5):
        ang = k * (2.0 * math.pi / 5.0) + 0.3
        gr = 0.22 if k % 2 == 0 else 0.29
        gx, gy = math.cos(ang) * gr, math.sin(ang) * gr
        g_mat = S.m('emblem' if k % 2 == 0 else 'accent', emit=4.5)
        gl = sphere(gx, gy, 0.048, 0.024, g_mat, 'noink_water_glint', squash=0.25)
        glints.append((gl, gx, gy, k))

    # Reeds at the swamp edge
    for rx, ry, rz in ((-0.28, 0.02, 0.04), (-0.22, 0.26, 0.05), (0.24, -0.08, 0.04)):
        cyl(rx, ry, rz, 0.008, 0.24, S.m('crop2'), seg=5, name='swamp_reed')
        cone(rx, ry, rz + 0.18, 0.015, 0.07, S.m('crop'), seg=5, name='reed_head')

    def step_serpent(f, n):
        t = 2.0 * math.pi * (f / n)
        # Pulsing jade eyes
        se = 1.0 + 0.15 * math.sin(t)
        eye_l.scale = (se, se, se)
        eye_r.scale = (se, se, se)
        # Water glints expand/shift with ripples
        for gl, gx, gy, k in glints:
            tk = 2.0 * math.pi * (f / n + k * 0.22)
            sc = 0.7 + 0.55 * (0.5 + 0.5 * math.sin(tk))
            gl.location = (gx + 0.015 * math.cos(tk), gy + 0.015 * math.sin(tk), 0.048)
            gl.scale = (sc, sc, 0.25 * sc)
    kit.anim(step_serpent)


def lizard_landmark_1(S, rng, v=0):
    """Lizard landmark 1: Stilt fishing hut with a net."""
    # Wet marsh ground with shallow pools
    cyl(0.0, 0.0, 0.0, 0.44, 0.035, S.m('dirt'), seg=16, name='marsh_ground')
    cyl(0.12, 0.12, 0.025, 0.24, 0.015, S.m('water'), seg=14, name='marsh_pool')

    # 4 heavy timber stilts driven into the marsh
    stilt_pts = [
        (-0.16, -0.16),
        (-0.16, 0.16),
        (0.16, -0.16),
        (0.16, 0.16),
    ]
    stilt_h = 0.42
    for px, py in stilt_pts:
        cyl(px, py, 0.0, 0.026, stilt_h, S.m('wood_dark'), seg=8, name='stilt_post')
        cone(px, py, 0.0, 0.048, 0.05, S.m('stone_dark'), seg=6, name='stilt_foot')

    # Cross-bracing between stilts
    rbox(0.0, -0.16, 0.20, 0.34, 0.022, 0.028, S.m('wood'), 'stilt_brace_x1')
    rbox(0.0, 0.16, 0.20, 0.34, 0.022, 0.028, S.m('wood'), 'stilt_brace_x2')
    rbox(-0.16, 0.0, 0.22, 0.022, 0.34, 0.028, S.m('wood'), 'stilt_brace_y1')
    rbox(0.16, 0.0, 0.22, 0.022, 0.34, 0.028, S.m('wood'), 'stilt_brace_y2')

    # Elevated plank platform deck
    deck_z = 0.40
    rbox(0.0, 0.0, deck_z, 0.44, 0.44, 0.032, S.m('wood_light'), 'deck_slab', bevel=0.006)
    rbox(0.0, -0.21, deck_z, 0.46, 0.032, 0.045, S.m('wood'), 'rim_x1')
    rbox(0.0, 0.21, deck_z, 0.46, 0.032, 0.045, S.m('wood'), 'rim_x2')
    rbox(-0.21, 0.0, deck_z, 0.032, 0.46, 0.045, S.m('wood'), 'rim_y1')
    rbox(0.21, 0.0, deck_z, 0.032, 0.46, 0.045, S.m('wood'), 'rim_y2')

    # Mud-brick & reed stilt hut sitting on back half (-0.05, -0.05)
    hx, hy, hz = -0.05, -0.05, deck_z + 0.02
    hut_sx, hut_sy, hut_h = 0.28, 0.28, 0.28
    box(hx, hy, hz, hut_sx, hut_sy, hut_h, S.m('wall'), 'hut_wall')
    box(hx, hy, hz, hut_sx + 0.008, hut_sy + 0.008, 0.07, S.m('wall2'), 'hut_terra_band')
    for cx_o, cy_o in ((-hut_sx / 2, -hut_sy / 2), (-hut_sx / 2, hut_sy / 2),
                       (hut_sx / 2, -hut_sy / 2), (hut_sx / 2, hut_sy / 2)):
        box(hx + cx_o, hy + cy_o, hz, 0.032, 0.032, hut_h, S.m('trim'), 'hut_post')

    box(hx + hut_sx / 2 + 0.003, hy, hz, 0.016, 0.11, 0.19, S.m('wood_dark'), 'hut_door')
    box(hx, hy + hut_sy / 2 + 0.003, hz + 0.08, 0.09, 0.016, 0.09, S.m('trim'), 'hut_win_frame')
    hut_light = sphere(hx, hy + hut_sy / 2 + 0.008, hz + 0.125, 0.032, S.m('glow', emit=4.8), 'noink_hut_glow')
    pulse_emit(hut_light.data.materials[0], base_emit=3.6, amp=2.2, phase=0.0)

    # Shaggy drooping reed thatch roof
    roof_z = hz + hut_h - 0.02
    cone(hx, hy, roof_z, 0.24, 0.15, S.m('roof'), seg=4, name='thatched_roof_1')
    cone(hx, hy, roof_z + 0.10, 0.17, 0.16, S.m('roof2'), seg=4, name='thatched_roof_2')
    cyl(hx, hy, roof_z + 0.24, 0.024, 0.08, S.m('roof3'), seg=6, name='roof_finial')

    # Fishing crane / boom pole projecting out from platform toward front-right (0.16, 0.16)
    boom = cyl(0.12, 0.12, deck_z + 0.02, 0.022, 0.44, S.m('wood_light'), seg=7, name='boom_pole')
    boom.rotation_euler = (0.45, -0.45, 0.78)

    # Fishing net draped from boom down into the water
    net_hoop = cyl(0.24, 0.24, 0.32, 0.11, 0.015, S.m('trim'), seg=10, name='net_hoop')
    net_hoop.rotation_euler = (0.2, -0.2, 0.78)

    net_strands = []
    for k in range(6):
        a = k * (2.0 * math.pi / 6.0)
        nx = 0.24 + math.cos(a) * 0.085
        ny = 0.24 + math.sin(a) * 0.085
        st = cyl(nx, ny, 0.08, 0.008, 0.24, S.m('crop'), seg=4, name='net_strand')
        sn = sphere(nx, ny, 0.075, 0.018, S.m('wall2'), 'net_sinker')
        net_strands.append((st, sn, nx, ny, k))

    fish_list = []
    for k, (fx, fy, fz) in enumerate(((0.22, 0.24, 0.16), (0.26, 0.22, 0.12))):
        fsh = sphere(fx, fy, fz, 0.024, S.m('accent', emit=3.2), 'noink_swamp_fish', squash=0.45)
        fsh.scale.x = 1.6
        fsh.rotation_euler = (0.3, 0.2, 0.8)
        fish_list.append((fsh, fx, fy, fz, k))

    cyl(-0.14, 0.14, deck_z + 0.02, 0.055, 0.09, S.m('wood'), seg=8, name='fish_basket')
    sphere(-0.14, 0.14, deck_z + 0.095, 0.038, S.m('accent', emit=2.0), 'basket_fish', squash=0.5)

    def step_hut(f, n):
        t = 2.0 * math.pi * (f / n)
        dx = 0.018 * math.sin(t)
        dy = 0.014 * math.cos(t)
        net_hoop.location = (0.24 + dx, 0.24 + dy, 0.32)
        for st, sn, nx, ny, k in net_strands:
            tk = 2.0 * math.pi * (f / n + k * 0.2)
            dx_k = 0.022 * math.sin(tk)
            dy_k = 0.018 * math.cos(tk)
            st.location = (nx + dx_k * 0.6, ny + dy_k * 0.6, 0.08)
            sn.location = (nx + dx_k, ny + dy_k, 0.075)
        for fsh, fx, fy, fz, k in fish_list:
            tk = 2.0 * math.pi * (f / n + k * 0.3)
            fsh.location = (fx + 0.018 * math.sin(tk), fy + 0.015 * math.cos(tk), fz)
    kit.anim(step_hut)


def lizard_landmark_2(S, rng, v=0):
    """Lizard landmark 2: Bone totem with feathers (sway)."""
    # Stepped mud-brick & swamp stone sacrificial mound base
    cyl(0.0, 0.0, 0.0, 0.36, 0.055, S.m('stone_dark'), seg=14, name='totem_base1')
    cyl(0.0, 0.0, 0.05, 0.30, 0.055, S.m('wall2'), seg=14, name='totem_base2')
    cyl(0.0, 0.0, 0.10, 0.24, 0.045, S.m('wall'), seg=12, name='totem_base3')

    # Carved central swamp timber totem pole (height up to 1.02)
    totem_r = 0.058
    cyl(0.0, 0.0, 0.14, totem_r, 0.82, S.m('wood_dark'), seg=10, name='totem_shaft')

    # Mask 1 (lower, z = 0.26): Carved crocodilian maw with terracotta paint & bone teeth
    rbox(0.04, 0.04, 0.28, 0.14, 0.14, 0.14, S.m('wall2'), 'mask_croc', rot=(0, 0, -0.785), bevel=0.01)
    rbox(0.09, 0.09, 0.26, 0.11, 0.11, 0.07, S.m('wall2'), 'mask_croc_snout', rot=(0, 0, -0.785), bevel=0.008)
    for tx_o, ty_o in ((0.06, 0.12), (0.12, 0.06)):
        cone(tx_o, ty_o, 0.23, 0.012, 0.04, S.m('accent2'), seg=5, name='croc_tooth')

    # Mask 2 (middle, z = 0.52): Horned lizard / sun-demon with turquoise jade inlay
    rbox(0.03, 0.03, 0.52, 0.15, 0.15, 0.16, S.m('wood'), 'mask_lizard', rot=(0, 0, -0.785), bevel=0.012)
    sphere(0.08, 0.08, 0.56, 0.036, S.m('emblem', emit=4.2), 'noink_sun_medallion')
    rbox(-0.16, 0.04, 0.54, 0.22, 0.036, 0.036, S.m('accent2'), 'totem_tusk_l', rot=(0, 0.15, 0.2), bevel=0.008)
    rbox(0.04, -0.16, 0.54, 0.036, 0.22, 0.036, S.m('accent2'), 'totem_tusk_r', rot=(-0.15, 0, -0.2), bevel=0.008)

    # Mask 3 (top crest, z = 0.78 to 0.96): Raptor / serpent skull with glowing turquoise eyes
    rbox(0.02, 0.02, 0.80, 0.14, 0.14, 0.16, S.m('accent2'), 'totem_skull_top', rot=(0, 0, -0.785), bevel=0.012)
    rbox(0.07, 0.07, 0.79, 0.11, 0.10, 0.09, S.m('wall'), 'skull_beak', rot=(0, 0, -0.785), bevel=0.008)
    eye_l = sphere(0.06, -0.01, 0.83, 0.026, S.m('emblem', emit=5.2), 'noink_totem_eye_l')
    eye_r = sphere(-0.01, 0.06, 0.83, 0.026, S.m('emblem', emit=5.2), 'noink_totem_eye_r')
    pulse_emit(eye_l.data.materials[0], base_emit=4.0, amp=2.8, phase=0.0)

    # Magnificent feather crest on top of totem (height 0.94 - 1.15)
    feather_top = []
    feather_configs = [
        (-0.06, -0.06, 0.96, 0.26, 0.45, 'accent', 0.0),    # center tall turquoise plume
        (-0.12, -0.02, 0.93, 0.22, 0.65, 'wall2', 0.18),    # left terracotta plume
        (-0.02, -0.12, 0.93, 0.22, 0.25, 'crop', 0.36),     # right gold plume
        (-0.16, -0.06, 0.90, 0.18, 0.85, 'crop2', 0.54),    # far-left green plume
        (-0.06, -0.16, 0.90, 0.18, 0.10, 'accent2', 0.72),  # far-right red plume
    ]
    for fx, fy, fz, flen, f_yaw, f_color, ph in feather_configs:
        f_shaft = cyl(fx, fy, fz, 0.009, flen, S.m('trim'), seg=5, name='feather_shaft')
        f_vane = sphere(fx, fy, fz + flen * 0.6, 0.038, S.m(f_color), 'feather_vane', squash=0.28)
        f_vane.scale.x = 2.4
        f_shaft.rotation_euler = (0.2, -0.2, f_yaw)
        f_vane.rotation_euler = (0.2, -0.2, f_yaw)
        feather_top.append((f_shaft, f_vane, fx, fy, fz, flen, f_yaw, ph))

    # Swaying feather streamers hanging from the tusks at z = 0.52
    streamers = []
    for k, (sx, sy, sz) in enumerate((
        (-0.20, 0.04, 0.50),
        (-0.10, 0.04, 0.48),
        (0.04, -0.20, 0.50),
        (0.04, -0.10, 0.48),
    )):
        c_key = ('accent', 'wall2', 'crop', 'accent2')[k]
        st = cyl(sx, sy, sz - 0.22, 0.008, 0.22, S.m('trim'), seg=4, name='streamer_cord')
        f_tip = sphere(sx, sy, sz - 0.21, 0.028, S.m(c_key), 'streamer_tip', squash=0.35)
        f_tip.scale.x = 2.0
        streamers.append((st, f_tip, sx, sy, sz, k))

    # Offerings at base: clay pots and ceremonial brazier
    cyl(-0.18, 0.14, 0.10, 0.05, 0.10, S.m('wall2'), seg=8, name='offering_pot1')
    cyl(0.16, -0.16, 0.10, 0.045, 0.09, S.m('wall'), seg=8, name='offering_pot2')
    cyl(0.15, 0.15, 0.08, 0.065, 0.055, S.m('stone'), seg=8, name='brazier_bowl')
    brazier_glow = sphere(0.15, 0.15, 0.135, 0.042, S.m('emblem', emit=5.5), 'noink_brazier_glow')
    pulse_emit(brazier_glow.data.materials[0], base_emit=4.2, amp=3.2, phase=0.0)

    def step_totem(f, n):
        t = 2.0 * math.pi * (f / n)
        sb = 1.0 + 0.18 * math.sin(t)
        brazier_glow.scale = (sb, sb, 0.8 * sb)
        for f_shaft, f_vane, fx, fy, fz, flen, f_yaw, ph in feather_top:
            tk = 2.0 * math.pi * (f / n + ph)
            sw = 0.12 * math.sin(tk)
            f_shaft.rotation_euler = (0.2 + sw * 0.5, -0.2 + sw * 0.5, f_yaw + sw)
            f_vane.rotation_euler = (0.2 + sw * 0.5, -0.2 + sw * 0.5, f_yaw + sw)
        for st, f_tip, sx, sy, sz, k in streamers:
            tk = 2.0 * math.pi * (f / n + k * 0.25)
            dx = 0.03 * math.sin(tk)
            dy = 0.024 * math.cos(tk)
            st.rotation_euler = (dy * 2.5, -dx * 2.5, 0)
            f_tip.location = (sx + dx, sy + dy, sz - 0.21)
    kit.anim(step_totem)


def caveman_landmark_0(S, rng, v=0):
    """Caveman landmark 0: Mammoth skeleton (tusks + rib arcs)."""
    # Excavated tundra earth / gravel knoll
    cyl(0.0, 0.0, 0.0, 0.42, 0.04, S.m('dirt'), seg=14, name='tundra_knoll')
    rbox(-0.20, 0.18, 0.035, 0.24, 0.22, 0.05, S.m('stone_dark'), 'gravel_mound1', rot=(0, 0, 0.3), bevel=0.01)
    rbox(0.18, -0.18, 0.035, 0.22, 0.20, 0.05, S.m('stone'), 'gravel_mound2', rot=(0, 0, -0.2), bevel=0.01)
    S.rock(0.24, 0.16, r=0.075, rng=rng)
    S.rock(-0.22, -0.16, r=0.07, rng=rng)

    yaw = -0.785

    # Giant mammoth cranium at (-0.12, 0.12, 0.18)
    sphere(-0.12, 0.12, 0.18, 0.11, S.m('accent2'), 'mammoth_cranium', squash=0.85)
    rbox(-0.06, 0.06, 0.14, 0.12, 0.13, 0.10, S.m('accent2'), 'tusk_sheaths', rot=(0, 0, yaw), bevel=0.01)
    sphere(-0.08, 0.16, 0.20, 0.026, S.m('stone_dark'), 'socket_l')
    sphere(-0.16, 0.08, 0.20, 0.026, S.m('stone_dark'), 'socket_r')

    # Great sweeping ivory tusks curling up and forward
    tusk_pts_l = [
        (-0.02, 0.12, 0.12, 0.032, 0.10, -0.4, 0.6),
        (0.05, 0.18, 0.15, 0.027, 0.11, -0.2, 0.9),
        (0.12, 0.21, 0.23, 0.022, 0.12, 0.1, 1.2),
        (0.16, 0.20, 0.33, 0.016, 0.11, 0.4, 1.4),
    ]
    for tx, ty, tz, tr, th, tp, tr_y in tusk_pts_l:
        tg = cone(tx, ty, tz, tr, th, S.m('accent2'), seg=7, r_top=tr * 0.75, name='tusk_l_seg')
        tg.rotation_euler = (tp, 0.3, tr_y)

    tusk_pts_r = [
        (0.00, 0.02, 0.12, 0.032, 0.10, -0.6, 0.4),
        (0.09, 0.04, 0.15, 0.027, 0.11, -0.8, 0.6),
        (0.17, 0.05, 0.23, 0.022, 0.12, -0.9, 0.9),
        (0.21, 0.03, 0.33, 0.016, 0.11, -1.1, 1.2),
    ]
    for tx, ty, tz, tr, th, tp, tr_y in tusk_pts_r:
        tg = cone(tx, ty, tz, tr, th, S.m('accent2'), seg=7, r_top=tr * 0.75, name='tusk_r_seg')
        tg.rotation_euler = (tp, 0.3, tr_y)

    spine_pts = [
        (-0.06, 0.06, 0.24),
        (-0.01, 0.01, 0.25),
        (0.04, -0.04, 0.24),
        (0.09, -0.09, 0.22),
        (0.14, -0.14, 0.19),
        (0.19, -0.19, 0.15),
    ]
    for sx, sy, sz in spine_pts:
        sphere(sx, sy, sz, 0.035, S.m('accent2'), 'vertebra', squash=0.7)

    for idx, (sx, sy, sz) in enumerate(spine_pts[1:]):
        arc_h = 0.28 - idx * 0.03
        arc_w = 0.24 - idx * 0.025
        r_lx = sx - arc_w * 0.5
        r_ly = sy + arc_w * 0.5
        cone(r_lx, r_ly, 0.04, 0.018, arc_h, S.m('accent2'), seg=6, r_top=0.012, name='rib_l').rotation_euler = (0.35, -0.35, yaw)
        r_rx = sx + arc_w * 0.5
        r_ry = sy - arc_w * 0.5
        cone(r_rx, r_ry, 0.04, 0.018, arc_h, S.m('accent2'), seg=6, r_top=0.012, name='rib_r').rotation_euler = (-0.35, 0.35, yaw)

    talisman_rib = cyl(-0.01, 0.01, 0.12, 0.006, 0.14, S.m('trim'), seg=4, name='talisman_string')
    f_pendant = sphere(-0.01, 0.01, 0.11, 0.024, S.m('emblem'), 'noink_talisman_feather', squash=0.3)
    f_pendant.scale.x = 2.0
    f_pendant.rotation_euler = (0.2, 0.2, yaw)

    spirit_glow = sphere(0.05, -0.05, 0.08, 0.045, S.m('glow', emit=5.2), 'noink_spirit_glow')
    pulse_emit(spirit_glow.data.materials[0], base_emit=3.8, amp=2.5, phase=0.0)

    S.bush(-0.24, -0.04, r=0.065)
    S.bush(0.08, 0.22, r=0.06)

    def step_skeleton(f, n):
        t = 2.0 * math.pi * (f / n)
        dx = 0.016 * math.sin(t)
        dy = 0.012 * math.cos(t)
        talisman_rib.rotation_euler = (dy * 2.2, -dx * 2.2, 0)
        f_pendant.location = (-0.01 + dx, 0.01 + dy, 0.11)
        sg = 1.0 + 0.18 * math.sin(t)
        spirit_glow.scale = (sg, sg, 0.8 * sg)
    kit.anim(step_skeleton)


def caveman_landmark_1(S, rng, v=0):
    """Caveman landmark 1: Cave mouth in a rock hill with a fire glow inside."""
    boulder_specs = [
        (0.0, 0.0, 0.18, 0.38, 0.38, 0.26, 'stone_dark'),
        (-0.16, -0.16, 0.28, 0.28, 0.28, 0.28, 'stone'),
        (-0.18, 0.14, 0.24, 0.24, 0.26, 0.26, 'stone_dark'),
        (0.14, -0.18, 0.22, 0.26, 0.24, 0.24, 'stone_light'),
        (-0.08, -0.08, 0.50, 0.28, 0.28, 0.24, 'stone'),
        (-0.06, 0.06, 0.65, 0.22, 0.22, 0.22, 'stone_dark'),
        (-0.04, -0.04, 0.80, 0.18, 0.18, 0.18, 'stone_light'),
    ]
    for bx, by, bz, bsx, bsy, bsz, c_key in boulder_specs:
        sphere(bx, by, bz, (bsx + bsy) * 0.5 * 0.5, S.m(c_key), 'hill_boulder', squash=bsz / ((bsx + bsy) * 0.25))

    S.bush(-0.25, 0.18, r=0.07)
    S.bush(-0.20, -0.22, r=0.075)
    S.rock(0.24, 0.20, r=0.08, rng=rng)

    rbox(0.06, 0.06, 0.16, 0.22, 0.22, 0.24, S.m('stone_dark'), 'cave_interior', rot=(0, 0, -0.785))
    sphere(0.02, 0.16, 0.16, 0.09, S.m('stone'), 'jamb_l', squash=1.2)
    sphere(0.16, 0.02, 0.16, 0.09, S.m('stone'), 'jamb_r', squash=1.2)
    sphere(0.10, 0.10, 0.30, 0.11, S.m('stone_dark'), 'lintel_top', squash=0.7)

    sphere(0.14, 0.08, 0.32, 0.026, S.m('emblem'), 'cave_hand_1', squash=0.3)
    sphere(0.08, 0.14, 0.32, 0.024, S.m('emblem'), 'cave_hand_2', squash=0.3)
    sphere(0.11, 0.11, 0.36, 0.020, S.m('accent'), 'cave_sun_symbol')

    sphere(0.09, 0.09, 0.25, 0.045, S.m('accent2'), 'entry_skull', squash=0.8)
    cone(0.12, 0.08, 0.22, 0.012, 0.07, S.m('accent2'), seg=5, name='entry_tusk_l').rotation_euler = (0.2, 0.4, 0.4)
    cone(0.08, 0.12, 0.22, 0.012, 0.07, S.m('accent2'), seg=5, name='entry_tusk_r').rotation_euler = (-0.4, -0.2, 0.4)

    for a in range(6):
        ang = a * (math.pi / 3.0)
        fx = 0.06 + math.cos(ang) * 0.065
        fy = 0.06 + math.sin(ang) * 0.065
        sphere(fx, fy, 0.07, 0.022, S.m('stone_dark'), 'hearth_stone')

    sphere(0.06, 0.06, 0.07, 0.042, S.m('accent'), 'hearth_coals')
    fire_core = sphere(0.06, 0.06, 0.12, 0.052, S.m('glow', emit=6.5), 'noink_cave_fire')
    fire_outer = sphere(0.07, 0.07, 0.16, 0.038, S.m('emblem', emit=5.2), 'noink_cave_flame')
    pulse_emit(fire_core.data.materials[0], base_emit=5.0, amp=3.5, phase=0.0)

    smoke_puffs = []
    for k in range(3):
        sz = 0.88 + k * 0.07
        sm = sphere(-0.02 + k * 0.015, -0.02 + k * 0.015, sz, 0.032 + k * 0.012, S.m('smoke', emit=0.4), 'noink_cave_smoke')
        smoke_puffs.append((sm, -0.02 + k * 0.015, -0.02 + k * 0.015, sz, k))

    def step_cave(f, n):
        t = 2.0 * math.pi * (f / n)
        sf = 1.0 + 0.25 * math.sin(t)
        fire_core.scale = (sf, sf, 1.2 * sf)
        sf2 = 1.0 + 0.28 * math.cos(t)
        fire_outer.scale = (sf2, sf2, 1.4 * sf2)
        for sm, sx, sy, sz, k in smoke_puffs:
            tk = 2.0 * math.pi * (f / n + k * 0.33)
            sm.location = (sx + 0.015 * math.sin(tk), sy + 0.015 * math.cos(tk), sz + 0.02 * math.sin(tk))
            sc = 0.85 + 0.35 * (0.5 + 0.5 * math.cos(tk))
            sm.scale = (sc, sc, sc)
    kit.anim(step_cave)


def caveman_landmark_2(S, rng, v=0):
    """Caveman landmark 2: Pair of menhirs with red hand prints."""
    cyl(0.0, 0.0, 0.0, 0.44, 0.045, S.m('dirt'), seg=16, name='menhir_knoll')
    for k in range(8):
        ang = k * (2.0 * math.pi / 8.0) + 0.2
        sx, sy = math.cos(ang) * 0.36, math.sin(ang) * 0.36
        S.rock(sx, sy, r=0.065, rng=rng)

    m1_x, m1_y = -0.14, 0.08
    m1_h = 0.95
    cyl(m1_x, m1_y, 0.02, 0.095, m1_h * 0.45, S.m('stone_dark'), seg=6, name='menhir1_base')
    cone(m1_x, m1_y, 0.02 + m1_h * 0.45, 0.095, m1_h * 0.55, S.m('stone'), seg=6, r_top=0.045, name='menhir1_top')
    for hy_o, hz_o in ((-0.02, 0.38), (0.02, 0.48), (-0.01, 0.58), (0.01, 0.70)):
        hp = sphere(m1_x + 0.08, m1_y + hy_o, hz_o, 0.026, S.m('emblem'), 'm1_handprint', squash=0.25)
        hp.rotation_euler = (0.2, 0.4, 0.0)

    m2_x, m2_y = 0.12, -0.10
    m2_h = 0.80
    cyl(m2_x, m2_y, 0.02, 0.09, m2_h * 0.45, S.m('stone'), seg=6, name='menhir2_base')
    cone(m2_x, m2_y, 0.02 + m2_h * 0.45, 0.09, m2_h * 0.55, S.m('stone_light'), seg=6, r_top=0.04, name='menhir2_top')
    for hy_o, hz_o in ((0.01, 0.32), (-0.02, 0.42), (0.0, 0.54)):
        hp = sphere(m2_x + 0.075, m2_y + hy_o, hz_o, 0.025, S.m('emblem'), 'm2_handprint', squash=0.25)
        hp.rotation_euler = (0.2, 0.4, 0.0)
    sphere(m2_x + 0.078, m2_y, 0.64, 0.030, S.m('accent'), 'm2_spiral', squash=0.3)

    cyl(-0.06, 0.02, 0.02, 0.04, 0.12, S.m('stone_dark'), seg=6, name='altar_leg1')
    cyl(0.04, -0.04, 0.02, 0.04, 0.12, S.m('stone_dark'), seg=6, name='altar_leg2')
    rbox(-0.01, -0.01, 0.14, 0.22, 0.18, 0.045, S.m('stone_light'), 'altar_slab', rot=(0.02, -0.02, 0.4), bevel=0.01)

    sphere(-0.02, 0.01, 0.20, 0.038, S.m('accent2'), 'altar_skull', squash=0.85)
    altar_fire = sphere(0.03, -0.02, 0.22, 0.038, S.m('glow', emit=5.5), 'noink_altar_fire')
    pulse_emit(altar_fire.data.materials[0], base_emit=4.0, amp=2.8, phase=0.0)

    yaw_line = math.atan2(-0.18, 0.26)
    rbox(-0.01, -0.01, 0.65, 0.34, 0.008, 0.008, S.m('trim'), 'sacred_cord', rot=(0, 0, yaw_line))

    pendants = []
    for k in range(3):
        t = (k + 1) / 4.0
        px = -0.14 + t * 0.26
        py = 0.08 - t * 0.18
        pz = 0.65
        cd = cyl(px, py, pz - 0.12, 0.005, 0.12, S.m('trim'), seg=4, name='pendant_cord')
        p_bead = sphere(px, py, pz - 0.12, 0.020, S.m('accent2' if k % 2 == 0 else 'emblem'), 'pendant_bead')
        pendants.append((cd, p_bead, px, py, pz - 0.12, k))

    def step_menhirs(f, n):
        t = 2.0 * math.pi * (f / n)
        sf = 1.0 + 0.20 * math.sin(t)
        altar_fire.scale = (sf, sf, 1.2 * sf)
        for cd, p_bead, px, py, pz_end, k in pendants:
            tk = 2.0 * math.pi * (f / n + k * 0.3)
            dx = 0.02 * math.sin(tk)
            dy = 0.016 * math.cos(tk)
            cd.rotation_euler = (dy * 2.2, -dx * 2.2, 0)
            p_bead.location = (px + dx, py + dy, pz_end)
    kit.anim(step_menhirs)


def dragon_landmark_0(S, rng, v=0):
    """Dragon landmark 0: Giant dragon skull with glowing eyes."""
    cyl(0.0, 0.0, 0.0, 0.42, 0.045, S.m('dirt'), seg=14, name='ash_base')
    rbox(-0.20, 0.18, 0.035, 0.24, 0.22, 0.05, S.m('stone_dark'), 'basalt_slab1', rot=(0, 0, 0.3), bevel=0.01)
    rbox(0.18, -0.18, 0.035, 0.22, 0.20, 0.05, S.m('stone_dark'), 'basalt_slab2', rot=(0, 0, -0.2), bevel=0.01)
    cyl(0.08, 0.08, 0.03, 0.18, 0.015, S.m('glow', emit=5.5), seg=12, name='lava_pool')

    yaw = -0.785
    pitch = 0.35

    rbox(-0.05, -0.05, 0.22, 0.22, 0.24, 0.16, S.m('wall2'), 'dragon_cranium',
         rot=(-pitch, pitch, yaw), bevel=0.015)
    rbox(-0.08, -0.08, 0.30, 0.18, 0.22, 0.06, S.m('trim'), 'dragon_brow',
         rot=(-pitch, pitch, yaw), bevel=0.01)
    rbox(0.08, 0.08, 0.19, 0.18, 0.19, 0.11, S.m('stone_dark'), 'dragon_snout',
         rot=(-pitch, pitch, yaw), bevel=0.012)
    rbox(0.06, 0.06, 0.08, 0.16, 0.17, 0.07, S.m('stone_dark'), 'dragon_lower_jaw',
         rot=(-pitch * 0.5, pitch * 0.5, yaw), bevel=0.01)

    for fx_o, fy_o in ((-0.06, 0.06), (0.06, -0.06), (0.0, 0.08), (0.08, 0.0)):
        bx = 0.10 + fx_o * 0.6
        by = 0.10 + fy_o * 0.6
        fg = cone(bx, by, 0.10, 0.014, 0.065, S.m('stone_light'), seg=5, name='dragon_fang')
        fg.rotation_euler = (0.2, -0.2, yaw)

    horn_pts_l = [
        (-0.14, 0.02, 0.30, 0.034, 0.12, 0.4, 0.8),
        (-0.18, 0.06, 0.40, 0.028, 0.13, 0.6, 1.1),
        (-0.21, 0.10, 0.51, 0.022, 0.14, 0.8, 1.4),
        (-0.22, 0.12, 0.63, 0.015, 0.14, 1.1, 1.7),
    ]
    for hx, hy, hz, hr, hh, hp, hyaw in horn_pts_l:
        hn = cone(hx, hy, hz, hr, hh, S.m('trim'), seg=6, r_top=hr * 0.75, name='dragon_horn_l')
        hn.rotation_euler = (hp, 0.2, hyaw)

    horn_pts_r = [
        (0.02, -0.14, 0.30, 0.034, 0.12, -0.8, 0.4),
        (0.06, -0.18, 0.40, 0.028, 0.13, -1.1, 0.6),
        (0.10, -0.21, 0.51, 0.022, 0.14, -1.4, 0.8),
        (0.12, -0.22, 0.63, 0.015, 0.14, -1.7, 1.1),
    ]
    for hx, hy, hz, hr, hh, hp, hyaw in horn_pts_r:
        hn = cone(hx, hy, hz, hr, hh, S.m('trim'), seg=6, r_top=hr * 0.75, name='dragon_horn_r')
        hn.rotation_euler = (hp, 0.2, hyaw)

    eye_l = sphere(0.03, -0.06, 0.25, 0.036, S.m('glow', emit=7.0), 'noink_magma_eye_l')
    eye_r = sphere(-0.06, 0.03, 0.25, 0.036, S.m('glow', emit=7.0), 'noink_magma_eye_r')
    pulse_emit(eye_l.data.materials[0], base_emit=5.5, amp=3.8, phase=0.0)

    embers = []
    for k in range(4):
        ang = k * (math.pi / 2.0) + 0.4
        ex = 0.08 + math.cos(ang) * 0.09
        ey = 0.08 + math.sin(ang) * 0.09
        ez = 0.06 + (k % 2) * 0.04
        em = sphere(ex, ey, ez, 0.020, S.m('accent', emit=6.0), 'noink_skull_ember')
        embers.append((em, ex, ey, ez, k))

    def step_skull(f, n):
        t = 2.0 * math.pi * (f / n)
        se = 1.0 + 0.20 * math.sin(t)
        eye_l.scale = (se, se, se)
        eye_r.scale = (se, se, se)
        for em, ex, ey, ez, k in embers:
            tk = 2.0 * math.pi * (f / n + k * 0.25)
            sc = 0.75 + 0.50 * (0.5 + 0.5 * math.sin(tk))
            em.scale = (sc, sc, sc)
            em.location = (ex + 0.01 * math.sin(tk), ey + 0.01 * math.cos(tk), ez + 0.015 * math.sin(tk))
    kit.anim(step_skull)


def dragon_landmark_1(S, rng, v=0):
    """Dragon landmark 1: Volcanic vent (smoke + orange glow pulse)."""
    cyl(0.0, 0.0, 0.0, 0.44, 0.045, S.m('dirt'), seg=14, name='vent_base')
    for k in range(6):
        ang = k * (math.pi / 3.0) + 0.2
        bx, by = math.cos(ang) * 0.32, math.sin(ang) * 0.32
        sphere(bx, by, 0.06, 0.09, S.m('stone_dark'), 'base_crag', squash=0.6)

    cone(0.0, 0.0, 0.02, 0.36, 0.25, S.m('stone_dark'), seg=12, r_top=0.28, name='vent_cone_1')
    cone(0.0, 0.0, 0.24, 0.29, 0.22, S.m('stone'), seg=12, r_top=0.22, name='vent_cone_2')
    cone(0.0, 0.0, 0.44, 0.23, 0.20, S.m('wall2'), seg=10, r_top=0.18, name='vent_cone_3')

    rim_h = 0.62
    for k in range(8):
        ang = k * (2.0 * math.pi / 8.0)
        rx, ry = math.cos(ang) * 0.17, math.sin(ang) * 0.17
        r_mat = S.m('trim' if k % 2 == 0 else 'stone_dark')
        cone(rx, ry, rim_h, 0.038, 0.09, r_mat, seg=5, name='caldera_tooth')

    lava_core = cyl(0.0, 0.0, rim_h - 0.02, 0.15, 0.03, S.m('glow', emit=8.0), seg=12, name='noink_vent_lava')
    lava_bubble = sphere(0.02, -0.02, rim_h + 0.02, 0.055, S.m('accent', emit=6.5), 'noink_vent_bubble', squash=0.7)
    pulse_emit(lava_core.data.materials[0], base_emit=6.0, amp=4.0, phase=0.0)

    for k, ang in enumerate((0.4, 1.8, 3.5, 5.0)):
        lx1, ly1 = math.cos(ang) * 0.16, math.sin(ang) * 0.16
        lx2, ly2 = math.cos(ang) * 0.30, math.sin(ang) * 0.30
        rbox((lx1 + lx2) * 0.5, (ly1 + ly2) * 0.5, 0.32, 0.035, 0.16, 0.025,
             S.m('glow', emit=6.0), 'lava_stream', rot=(0.4 * math.sin(ang), -0.4 * math.cos(ang), ang))

    smoke_clouds = []
    smoke_specs = [
        (0.00, 0.00, 0.74, 0.075, 0.0),
        (0.02, -0.02, 0.86, 0.095, 0.22),
        (-0.03, 0.03, 0.98, 0.115, 0.44),
        (0.03, 0.02, 1.10, 0.130, 0.66),
    ]
    for sx, sy, sz, sr, ph in smoke_specs:
        sm = sphere(sx, sy, sz, sr, S.m('smoke', emit=0.8), 'noink_vent_smoke', squash=0.85)
        smoke_clouds.append((sm, sx, sy, sz, sr, ph))

    cinders = []
    for k in range(5):
        ang = k * (2.0 * math.pi / 5.0) + 0.5
        cx, cy = math.cos(ang) * 0.06, math.sin(ang) * 0.06
        cz = 0.72 + k * 0.08
        spk = sphere(cx, cy, cz, 0.018, S.m('emblem', emit=6.5), 'noink_vent_spark')
        cinders.append((spk, cx, cy, cz, k))

    def step_vent(f, n):
        t = 2.0 * math.pi * (f / n)
        sc = 1.0 + 0.18 * math.sin(t)
        lava_core.scale = (sc, sc, 1.0)
        sb = 1.0 + 0.25 * math.cos(t)
        lava_bubble.scale = (sb, sb, 0.7 * sb)
        lava_bubble.location = (0.02, -0.02, rim_h + 0.02 + 0.015 * math.sin(t))
        for sm, sx, sy, sz, sr, ph in smoke_clouds:
            tk = 2.0 * math.pi * (f / n + ph)
            sm.location = (sx + 0.02 * math.sin(tk), sy + 0.02 * math.cos(tk), sz + 0.03 * math.sin(tk))
            ss = 1.0 + 0.15 * math.cos(tk)
            sm.scale = (ss, ss, 0.85 * ss)
        for spk, cx, cy, cz, k in cinders:
            tk = 2.0 * math.pi * (f / n + k * 0.2)
            spk.location = (cx + 0.02 * math.sin(tk), cy + 0.02 * math.cos(tk), cz + 0.025 * math.sin(tk))
    kit.anim(step_vent)


def dragon_landmark_2(S, rng, v=0):
    """Dragon landmark 2: Basalt column cluster with lava cracks."""
    cyl(0.0, 0.0, 0.0, 0.44, 0.045, S.m('dirt'), seg=14, name='column_base')
    lava_crust = cyl(0.0, 0.0, 0.035, 0.40, 0.015, S.m('glow', emit=6.5), seg=14, name='noink_lava_bed')
    pulse_emit(lava_crust.data.materials[0], base_emit=5.0, amp=3.5, phase=0.0)

    columns = [
        (-0.04, 0.04, 0.96, 0.095, 'stone_dark'),
        (0.08, -0.04, 0.82, 0.090, 'stone'),
        (-0.16, -0.06, 0.74, 0.088, 'stone_dark'),
        (0.02, 0.16, 0.68, 0.085, 'stone'),
        (0.14, 0.10, 0.56, 0.082, 'wall2'),
        (-0.12, 0.18, 0.50, 0.080, 'stone_dark'),
        (0.20, -0.12, 0.44, 0.078, 'stone'),
        (-0.02, -0.18, 0.42, 0.076, 'wall2'),
        (-0.24, 0.06, 0.34, 0.075, 'stone_dark'),
        (0.10, 0.24, 0.30, 0.072, 'stone'),
        (-0.18, -0.20, 0.26, 0.070, 'stone_dark'),
        (0.24, 0.04, 0.22, 0.068, 'stone'),
    ]
    for cx, cy, ch, cr, c_mat_key in columns:
        cyl(cx, cy, 0.02, cr, ch, S.m(c_mat_key), seg=6, name='basalt_col')
        cone(cx, cy, 0.02 + ch, cr, 0.025, S.m('trim'), seg=6, r_top=cr * 0.85, name='col_cap')

    fissures = [
        (0.02, 0.00, 0.40, 0.016, 0.016, 0.45),
        (-0.10, -0.01, 0.36, 0.016, 0.016, 0.40),
        (-0.02, 0.10, 0.32, 0.016, 0.016, 0.35),
    ]
    for fx, fy, fz, fsx, fsy, fsz in fissures:
        rbox(fx, fy, fz, fsx, fsy, fsz, S.m('glow', emit=7.0), 'noink_vertical_crack')

    crevice_bubble = sphere(0.02, 0.04, 0.52, 0.038, S.m('accent', emit=6.5), 'noink_crevice_bubble')

    cinders = []
    for k in range(5):
        ang = k * (2.0 * math.pi / 5.0)
        cx = -0.04 + math.cos(ang) * 0.10
        cy = 0.04 + math.sin(ang) * 0.10
        cz = 0.85 + (k % 3) * 0.07
        sp = sphere(cx, cy, cz, 0.020, S.m('emblem', emit=6.0), 'noink_heat_spark')
        cinders.append((sp, cx, cy, cz, k))

    def step_columns(f, n):
        t = 2.0 * math.pi * (f / n)
        sb = 1.0 + 0.24 * math.sin(t)
        crevice_bubble.scale = (sb, sb, 0.8 * sb)
        crevice_bubble.location = (0.02, 0.04, 0.52 + 0.012 * math.cos(t))
        for sp, cx, cy, cz, k in cinders:
            tk = 2.0 * math.pi * (f / n + k * 0.25)
            sp.location = (cx + 0.015 * math.cos(tk), cy + 0.015 * math.sin(tk), cz + 0.02 * math.sin(tk))
            sc = 0.8 + 0.45 * (0.5 + 0.5 * math.sin(tk))
            sp.scale = (sc, sc, sc)
    kit.anim(step_columns)


LANDMARKS = {
    'goblin': [
        ('land_0', True, goblin_landmark_0),
        ('land_1', False, goblin_landmark_1),
        ('land_2', False, goblin_landmark_2),
    ],
    'elf': [
        ('land_0', False, elf_landmark_0),
        ('land_1', True, elf_landmark_1),
        ('land_2', False, elf_landmark_2),
    ],
    'lizard': [
        ('land_0', False, lizard_landmark_0),
        ('land_1', True, lizard_landmark_1),
        ('land_2', True, lizard_landmark_2),
    ],
    'caveman': [
        ('land_0', True, caveman_landmark_0),
        ('land_1', True, caveman_landmark_1),
        ('land_2', True, caveman_landmark_2),
    ],
    'dragon': [
        ('land_0', True, dragon_landmark_0),
        ('land_1', True, dragon_landmark_1),
        ('land_2', True, dragon_landmark_2),
    ],
}


# ==============================================================================
# Render & Build
# ==============================================================================
def render_piece(arc, i, v):
    """Build and render 3 frames of wild piece (arc, recipe i, variant v)."""
    import bpy
    bpy.context.preferences.filepaths.save_version = 0
    out_dir = os.path.join(HERE, 'out', arc)
    os.makedirs(out_dir, exist_ok=True)

    S = load_style(arc, reload=False)
    name, tall, fn = TABLES[arc][i]

    kit.reset()
    rng = random.Random(f'{arc}/{name}/{v}')
    fn(S, rng, v)
    kit.outline_all()
    kit.pose(0)

    prefix = os.path.join(out_dir, f'wild_{i}_{v}')
    # Clean up old files
    for f in range(FRAMES):
        old = f'{prefix}_{f}.png'
        if os.path.exists(old):
            os.remove(old)

    frames_rendered = kit.render_all(prefix)
    if os.path.exists(prefix + '.png'):  # a still piece comes out without a frame suffix: call it frame 0
        os.replace(prefix + '.png', prefix + '_0.png')
    print(f'OK {arc}/wild_{i}_{v} frames={frames_rendered}', flush=True)
    return frames_rendered


def render_arc(arc, indices=None):
    """Render all wild pieces for one people."""
    out_dir = os.path.join(HERE, 'out', arc)
    os.makedirs(out_dir, exist_ok=True)
    pieces = TABLES[arc]

    target_indices = [int(x) for x in indices] if indices else list(range(len(pieces)))

    variants = (0,) if arc == 'goblin' else (0, 1)  # the goblin valley has 10 distinct pieces, one copy each
    for i in target_indices:
        for v in variants:
            try:
                render_piece(arc, i, v)
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f'FAIL {arc}/wild_{i}_{v}: {e}', flush=True)

    make_sheet(arc)


def make_sheet(arc):
    """Make contact sheet out/<arc>/_sheet_wilds.png (rows = variants, columns = recipes)."""
    out = os.path.join(HERE, 'out', arc)
    n = len(TABLES[arc])
    cols = min(n, 5)
    variants = 1 if arc == 'goblin' else 2
    cw, ch = 160, 260
    rows = variants * ((n + cols - 1) // cols)
    sh = Image.new('RGBA', (cols * cw, rows * ch), (65, 85, 55, 255))
    d = ImageDraw.Draw(sh)

    for i in range(n):
        for v in range(variants):
            p = os.path.join(out, f'wild_{i}_{v}_0.png')
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert('RGBA')
            im = im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS)
            x, y = (i % cols) * cw, ((i // cols) * variants + v) * ch
            im = im.crop((0, max(0, im.height - (ch - 16)), cw, im.height))
            sh.alpha_composite(im, (x, y + ch - 16 - im.height))
            d.text((x + 6, y + ch - 14), f'wild_{i}_{v}', fill=(255, 255, 255, 255))

    sheet_path = os.path.join(out, '_sheet_wilds.png')
    sh.save(sheet_path)
    print('SHEET:', sheet_path, flush=True)


def render_landmark(arc, k):
    """Build and render 3 frames of landmark piece (arc, index k)."""
    import bpy
    bpy.context.preferences.filepaths.save_version = 0
    out_dir = os.path.join(HERE, 'out', arc)
    os.makedirs(out_dir, exist_ok=True)

    S = load_style(arc, reload=False)
    entry = LANDMARKS[arc][k]
    fn = entry[-1]
    name = entry[0] if isinstance(entry, tuple) else f'land_{k}'

    kit.reset()
    rng = random.Random(f'{arc}/{name}')
    fn(S, rng)
    n_objs = len([o for o in bpy.context.scene.objects if o.type == 'MESH'])
    kit.outline_all()
    kit.pose(0)

    prefix = os.path.join(out_dir, f'land_{k}')
    for f in range(FRAMES):
        old = f'{prefix}_{f}.png'
        if os.path.exists(old):
            os.remove(old)

    frames_rendered = kit.render_all(prefix)
    if os.path.exists(prefix + '.png'):
        os.replace(prefix + '.png', prefix + '_0.png')
    print(f'OK {arc}/land_{k} frames={frames_rendered} objs={n_objs}', flush=True)
    return frames_rendered


def render_landmarks(arc, indices=None):
    """Render landmark pieces for one people."""
    pieces = LANDMARKS.get(arc, [])
    if not pieces:
        return
    target = [int(x.split('_')[-1]) for x in indices] if indices else list(range(len(pieces)))
    for k in target:
        try:
            render_landmark(arc, k)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f'FAIL {arc}/land_{k}: {e}', flush=True)
    make_landmarks_sheet()


def make_landmarks_sheet():
    """Make contact sheet out/_sheet_landmarks.png across all 5 peoples x 3 landmarks."""
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    cw, ch = 180, 270
    cols = 3
    rows = len(ARCS)
    sh = Image.new('RGBA', (cols * cw, rows * ch), (65, 85, 55, 255))
    d = ImageDraw.Draw(sh)

    for r_idx, arc in enumerate(ARCS):
        out = os.path.join(HERE, 'out', arc)
        for k in range(cols):
            p = os.path.join(out, f'land_{k}_0.png')
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert('RGBA')
            im = im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS)
            x, y = k * cw, r_idx * ch
            im = im.crop((0, max(0, im.height - (ch - 18)), cw, im.height))
            sh.alpha_composite(im, (x, y + ch - 18 - im.height))
            d.text((x + 6, y + ch - 15), f'{arc}/land_{k}', fill=(255, 255, 255, 255))

    sheet_path = os.path.join(HERE, 'out', '_sheet_landmarks.png')
    sh.save(sheet_path)
    print('LANDMARKS SHEET:', sheet_path, flush=True)


if __name__ == '__main__' and '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    if not args:
        print('Usage: wilds.py -- <arc|landmarks> [recipe_indices|land ...]')
        sys.exit(1)
    if args[0] in ('landmarks', 'land'):
        target_arcs = args[1:] or ARCS
        for a in target_arcs:
            render_landmarks(a)
    elif len(args) > 1 and (args[1] in ('land', 'landmarks') or args[1].startswith('land_')):
        sub = [x for x in args[1:] if x not in ('land', 'landmarks')]
        render_landmarks(args[0], sub or None)
    else:
        render_arc(args[0], args[1:] or None)
        if not args[1:]:
            render_landmarks(args[0])
