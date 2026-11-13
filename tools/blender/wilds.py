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
def elf_recipe_0(S, rng, v):
    """Recipe 0: Twin Conifers / Pines (tall)."""
    # Two slender, graceful tiered pines
    pines = [
        (-0.14 + rng.uniform(-0.02, 0.02), -0.06 + rng.uniform(-0.02, 0.02), 0.78 + rng.uniform(-0.04, 0.04)),
        (0.12 + rng.uniform(-0.02, 0.02), 0.06 + rng.uniform(-0.02, 0.02), 0.92 + rng.uniform(-0.04, 0.04)),
    ]
    for idx, (px, py, ph) in enumerate(pines):
        # Pale trunk
        cyl(px, py, 0, 0.026, ph * 0.35, S.m('trunk'), seg=8, name='trunk')
        cone(px, py, 0, 0.045, 0.06, S.m('trunk'), seg=6, name='roots')
        # 3 tiered conifer cones
        tiers = [
            (0.12, 0.16, 0.22, 'foliage_dark'),
            (0.24, 0.13, 0.22, 'foliage'),
            (0.36, 0.09, 0.24, 'foliage2'),
        ]
        top_group = []
        for tz, tr, th, mkey in tiers:
            c = cone(px, py, tz * ph, tr * ph, th * ph, S.m(mkey), seg=8, name='pine_tier')
            top_group.append(c)
        # Sway upper tier
        top_cone = top_group[-1]
        add_sway(top_cone, max_ang=0.06, phase=idx * 0.3)
    # Small forest stone at foot
    S.rock(-0.02, -0.15, r=0.04, rng=rng)


def elf_recipe_1(S, rng, v):
    """Recipe 1: Ancient Broadleaf Tree + Flowering Bush (tall)."""
    # Flaring pale trunk and lush crown
    tx, ty = 0.04 + rng.uniform(-0.02, 0.02), -0.02 + rng.uniform(-0.02, 0.02)
    s = 1.15 + rng.uniform(-0.05, 0.05)
    cyl(tx, ty, 0, 0.032 * s, 0.26 * s, S.m('trunk'), seg=8, name='trunk')
    cone(tx, ty, 0, 0.055 * s, 0.08 * s, S.m('trunk'), seg=6, name='roots')
    crown = sphere(tx, ty, 0.42 * s, 0.18 * s, S.m('foliage2'), 'leaves_top')
    sphere(tx + 0.07 * s, ty - 0.04 * s, 0.33 * s, 0.13 * s, S.m('foliage'), 'leaves_r')
    sphere(tx - 0.06 * s, ty + 0.06 * s, 0.34 * s, 0.12 * s, S.m('foliage_dark'), 'leaves_l')
    add_sway(crown, max_ang=0.045, phase=0.2)
    # Flowering bush
    bx, by = -0.18 + rng.uniform(-0.02, 0.02), 0.14 + rng.uniform(-0.02, 0.02)
    S.bush(bx, by, r=0.07)
    # Azure floral blossom
    sphere(bx, by + 0.03, 0.06, 0.016, S.m('accent2', emit=3.0), 'noink_blossom')


def elf_recipe_2(S, rng, v):
    """Recipe 2: Tall Pine + Elegant Broadleaf Grove (tall)."""
    # Tall pine
    px, py = 0.12 + rng.uniform(-0.02, 0.02), -0.08 + rng.uniform(-0.02, 0.02)
    ph = 0.95 + rng.uniform(-0.04, 0.04)
    cyl(px, py, 0, 0.028, ph * 0.35, S.m('trunk'), seg=8, name='trunk')
    cone(px, py, 0, 0.048, 0.06, S.m('trunk'), seg=6, name='roots')
    for tz, tr, th, mkey in ((0.14, 0.17, 0.22, 'foliage_dark'), (0.28, 0.13, 0.22, 'foliage'), (0.42, 0.09, 0.25, 'foliage2')):
        c = cone(px, py, tz * ph, tr * ph, th * ph, S.m(mkey), seg=8, name='pine_tier')
    add_sway(c, max_ang=0.055, phase=0.0)

    # Shorter graceful broadleaf
    ox, oy = -0.14 + rng.uniform(-0.02, 0.02), 0.1 + rng.uniform(-0.02, 0.02)
    s = 0.85
    cyl(ox, oy, 0, 0.022 * s, 0.25 * s, S.m('trunk'), seg=7, name='trunk')
    b_crown = sphere(ox, oy, 0.36 * s, 0.14 * s, S.m('foliage2'), 'leaves_top')
    sphere(ox - 0.05 * s, oy + 0.05 * s, 0.28 * s, 0.10 * s, S.m('foliage'), 'leaves_side')
    add_sway(b_crown, max_ang=0.04, phase=0.5)


def elf_recipe_3(S, rng, v):
    """Recipe 3: Glowing Bioluminescent Mushrooms (low, glow: 0x5fe0d0)."""
    # Cluster of glowing teal mushrooms
    m_mat = S.m('accent2', emit=4.0)
    shrooms = [
        (-0.08, 0.04, 0.065, 0.032),
        (0.10, -0.05, 0.055, 0.026),
        (-0.02, -0.12, 0.042, 0.020),
        (0.06, 0.11, 0.048, 0.022),
    ]
    for idx, (sx, sy, sh, sr) in enumerate(shrooms):
        cyl(sx, sy, 0, sr * 0.28, sh, S.m('wood_light'), seg=6, name='stem')
        cap = sphere(sx, sy, sh + sr * 0.5, sr, m_mat, 'noink_cap', squash=0.6)
        # Small white spots
        sphere(sx + sr * 0.4, sy, sh + sr * 0.7, sr * 0.2, mat('#ffffff'), 'spot')
    pulse_emit(m_mat, base_emit=3.5, amp=2.5, phase=0.2)
    S.rock(0.0, 0.0, r=0.045, rng=rng)


def elf_recipe_4(S, rng, v):
    """Recipe 4: Enchanted Flowering Bushes (low)."""
    # Pair of layered bushes with glowing berries
    b1 = sphere(-0.08, 0.04, 0.06, 0.10, S.m('foliage'), 'bush1', squash=0.7)
    sphere(-0.06, 0.02, 0.09, 0.06, S.m('foliage2'), 'bush1_top', squash=0.7)
    b2 = sphere(0.12, -0.05, 0.05, 0.08, S.m('foliage_dark'), 'bush2', squash=0.7)
    sphere(0.10, -0.04, 0.08, 0.05, S.m('foliage'), 'bush2_top', squash=0.7)
    # Azure berries
    berry_m = S.m('accent2', emit=3.0)
    sphere(-0.06, 0.08, 0.11, 0.018, berry_m, 'noink_berry')
    sphere(0.14, -0.02, 0.09, 0.016, berry_m, 'noink_berry')
    add_sway(b1, max_ang=0.03, phase=0.1)
    add_sway(b2, max_ang=0.03, phase=0.6)


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
def dragon_recipe_0(S, rng, v):
    """Recipe 0: Twin Obsidian Spires (tall)."""
    # Towering faceted obsidian crystals
    spires = [
        (-0.08 + rng.uniform(-0.02, 0.02), 0.02, 0.88, 0.048),
        (0.12 + rng.uniform(-0.02, 0.02), -0.06, 0.68, 0.038),
    ]
    g_mat = S.m('glow', emit=4.0)
    for idx, (sx, sy, sh, sr) in enumerate(spires):
        # Basalt base collar
        cyl(sx, sy, 0, sr * 1.5, 0.04, S.m('stone_dark'), seg=8, name='spire_base')
        # Glowing magma vein at roots
        g = sphere(sx, sy, 0.02, sr * 1.1, g_mat, 'noink_root_glow', squash=0.3)
        # Sharp obsidian cone
        c = cone(sx, sy, 0.03, sr, sh, S.m('trim'), seg=6, name='obsidian_spire')
        c.rotation_euler = (0.04 * (idx - 0.5), 0.05 * (0.5 - idx), 0.2 * idx)
    pulse_emit(g_mat, base_emit=3.5, amp=2.5, phase=0.2)
    # Small crystal shard
    cone(0.02, 0.14, 0, 0.022, 0.28, S.m('stone_light'), seg=5, name='crystal_shard')


def dragon_recipe_1(S, rng, v):
    """Recipe 1: Charred Dead Tree & Obsidian Shard (tall)."""
    # Dead petrified trunk with bare jagged boughs
    tx, ty = -0.08 + rng.uniform(-0.02, 0.02), 0.04
    cyl(tx, ty, 0, 0.038, 0.32, S.m('trunk'), seg=6, name='charred_trunk')
    # Jagged boughs
    for ang, bz, blen in ((0.4, 0.20, 0.16), (2.5, 0.26, 0.14), (4.5, 0.18, 0.12)):
        bx = tx + math.cos(ang) * 0.03
        by = ty + math.sin(ang) * 0.03
        b = cyl(bx, by, bz, 0.016, blen, S.m('trunk'), seg=4, name='charred_bough')
        b.rotation_euler = (math.sin(ang) * 0.7, -math.cos(ang) * 0.7, ang)
    # Glowing ember fissure in trunk
    g_mat = S.m('glow', emit=5.0)
    sphere(tx + 0.02, ty, 0.12, 0.02, g_mat, 'noink_ember')
    pulse_emit(g_mat, base_emit=4.0, amp=2.5, phase=0.4)
    # Obsidian crystal needle beside the tree
    cone(0.14, -0.06, 0, 0.032, 0.65, S.m('trim'), seg=6, name='obsidian_needle')


def dragon_recipe_2(S, rng, v):
    """Recipe 2: Stepped Hexagonal Basalt Columns (tall)."""
    cols = [
        (-0.12, -0.05, 0.45),
        (-0.04, 0.08, 0.75),
        (0.06, -0.02, 0.62),
        (0.14, 0.09, 0.48),
        (0.02, -0.14, 0.35),
    ]
    g_mat = S.m('glow', emit=3.5)
    for cx, cy, ch in cols:
        cyl(cx, cy, 0, 0.055, ch, S.m('stone_dark'), seg=6, name='basalt_col')
        # Red-hot joint seam
        box(cx, cy, ch * 0.4, 0.06, 0.01, 0.01, g_mat, 'noink_joint')
    pulse_emit(g_mat, base_emit=3.0, amp=2.0, phase=0.1)


def dragon_recipe_3(S, rng, v):
    """Recipe 3: Bubbling Lava Pool (low, water: 'lava', glow: 0xff6a1a)."""
    # Active molten lava pool
    S.water(0.0, 0.0, 0.0, 0.36, 0.32)
    # Crusty volcanic stone border
    poly([(-0.20, -0.18, 0), (0.20, -0.18, 0), (0.20, 0.18, 0), (-0.20, 0.18, 0)], [(0, 1, 2, 3)], S.m('stone_dark'), 'lava_rim')


def dragon_recipe_4(S, rng, v):
    """Recipe 4: Volcanic Fumarole / Smoking Basalt (low)."""
    # Dark basalt rock
    S.rock(-0.04, 0.02, r=0.085, rng=rng)
    # Active vent hole with glowing magma rim
    sphere(0.08, -0.04, 0.02, 0.035, S.m('glow', emit=5.0), 'noink_vent_glow', squash=0.4)
    # Smoke puffs rising over 3 frames
    puffs = []
    for k in range(3):
        p = sphere(0.08, -0.04, 0.06 + k * 0.05, 0.025 + k * 0.01, S.m('smoke', alpha=0.55), 'noink_smoke')
        puffs.append(p)

    def step_smoke(f, n):
        for k, p in enumerate(puffs):
            phase = (f + k) % 3
            p.location.z = 0.06 + phase * 0.05
            p.scale = (1.0 + phase * 0.3, 1.0 + phase * 0.3, 1.0 + phase * 0.3)
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


if __name__ == '__main__' and '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    if not args:
        print('Usage: wilds.py -- <arc> [recipe_indices...]')
        sys.exit(1)
    render_arc(args[0], args[1:] or None)
