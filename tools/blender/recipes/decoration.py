# Decoration: park, tree, lamp, fountain, statue, flowerbed, hedge, well, pond, arch.
import math
import kit
from kit import box, cone, cyl, sphere, mat


def fountain(S, rng):
    # Tiered classical fountain with surging central jet, cascading spouts, benches, and planter urns
    # Circular stone plinth (tight to fountain basin, no tile-sized ground plate)
    cyl(0.0, 0.0, 0.0, 0.38, 0.015, S.m('stone_light'), seg=14, name='basin_apron')

    # Lower main circular stone basin
    cyl(0.0, 0.0, 0.015, 0.33, 0.14, S.m('stone'), seg=14, name='lower_basin')
    cyl(0.0, 0.0, 0.155, 0.35, 0.035, S.m('stone_dark'), seg=14, name='basin_coping')

    # Shimmering lower water surface (raised and fully visible to camera)
    S.water(0.0, 0.0, 0.16, 0.44, 0.44)

    # Fluted central column pedestal
    cyl(0.0, 0.0, 0.155, 0.09, 0.24, S.m('stone_light'), seg=8, name='center_column')
    cyl(0.0, 0.0, 0.355, 0.11, 0.03, S.m('stone_dark'), seg=8, name='capital')

    # Upper carved water bowl
    cyl(0.0, 0.0, 0.385, 0.18, 0.06, S.m('stone'), seg=10, name='upper_bowl')
    cyl(0.0, 0.0, 0.445, 0.19, 0.02, S.m('stone_dark'), seg=10, name='upper_rim')
    S.water(0.0, 0.0, 0.455, 0.22, 0.22)

    # Carved finial / spout
    cone(0.0, 0.0, 0.465, 0.04, 0.08, S.m('accent2', metal=0.7), seg=8, name='finial')

    # Surging animated central water jet
    jet = cone(0.0, 0.0, 0.545, 0.035, 0.15, S.m('water'), seg=6, name='central_jet')
    kit.anim(lambda f, n: setattr(jet, 'scale', (1.0, 1.0, (1.0, 1.45, 0.75)[f % 3])))

    # Cascading falling water spouts from upper bowl to lower basin
    spouts = []
    for k in range(4):
        ang = k * math.pi / 2 + math.pi / 4
        sx = 0.15 * math.cos(ang)
        sy = 0.15 * math.sin(ang)
        sp = cone(sx, sy, 0.22, 0.022, 0.16, S.m('water'), seg=4, name=f'cascade_{k}')
        spouts.append(sp)
    kit.anim(lambda f, n: [setattr(sp, 'scale', (1.0, 1.0, (1.0, 1.35, 0.70)[(f + i) % 3])) for i, sp in enumerate(spouts)])

    # Civic stone resting benches
    box(0.24, 0.24, 0.0, 0.08, 0.18, 0.06, S.m('stone_light'), 'fount_bench1').rotation_euler.z = math.radians(-45)
    box(-0.24, -0.24, 0.0, 0.08, 0.18, 0.06, S.m('stone_light'), 'fount_bench2').rotation_euler.z = math.radians(-45)

    # Stone planter urns with clipped shrubs
    cyl(0.28, -0.20, 0.0, 0.04, 0.08, S.m('stone'), seg=8, name='fount_urn1')
    sphere(0.28, -0.20, 0.09, 0.045, S.m('foliage'), 'fount_bush1')
    cyl(-0.20, 0.28, 0.0, 0.04, 0.08, S.m('stone'), seg=8, name='fount_urn2')
    sphere(-0.20, 0.28, 0.09, 0.045, S.m('foliage'), 'fount_bush2')

    # Plaza street lamps
    S.lamp(0.36, 0.36)
    S.lamp(-0.36, -0.36)


def park(S, rng):
    # Public park with dense trees via S.tree, winding stone path, benches, birdbath, and street lamps
    # Stepping stone pathway curving across the tile
    for i in range(6):
        t = -0.32 + i * 0.13
        box(t, t * 0.65 - 0.05, 0.0, 0.14, 0.14, 0.012, S.m('stone_light'), f'path_{i}', bevel=0.01)

    # Dense shaded trees (small grove)
    S.tree(-0.22, 0.20, 0.0, s=0.96, rng=rng)
    S.tree(0.24, -0.16, 0.0, s=0.88, rng=rng)
    S.tree(-0.06, -0.26, 0.0, s=0.68, rng=rng)

    # Shimmering stone birdbath with bubbling spout
    cyl(-0.06, 0.16, 0.0, 0.06, 0.12, S.m('stone'), seg=8, name='bath_base')
    cyl(-0.06, 0.16, 0.12, 0.11, 0.035, S.m('stone_light'), seg=8, name='bath_bowl')
    S.water(-0.06, 0.16, 0.145, 0.14, 0.14)
    bath_spout = cone(-0.06, 0.16, 0.15, 0.018, 0.04, S.m('water'), seg=6, name='bath_spout')
    kit.anim(lambda f, n: setattr(bath_spout, 'scale', (1, 1, (1.0, 1.35, 0.8)[f % 3])))

    # Fluttering park butterfly
    flutter = sphere(0.04, 0.10, 0.18, 0.016, S.m('glow', emit=4.0), 'park_flutter')
    kit.anim(lambda f, n: setattr(flutter, 'location', (
        0.04 + 0.05 * math.sin(2 * math.pi * f / n),
        0.10 + 0.05 * math.cos(2 * math.pi * f / n),
        0.18 + 0.03 * math.sin(4 * math.pi * f / n)
    )))

    # Comfortable park benches
    box(0.08, 0.22, 0.0, 0.08, 0.22, 0.06, S.m('wood'), 'bench1')
    box(0.11, 0.22, 0.06, 0.02, 0.22, 0.07, S.m('wood_dark'), 'bench1_back')

    box(-0.22, -0.18, 0.0, 0.20, 0.08, 0.06, S.m('wood'), 'bench2')
    box(-0.22, -0.21, 0.06, 0.20, 0.02, 0.07, S.m('wood_dark'), 'bench2_back')

    box(0.24, 0.10, 0.0, 0.08, 0.16, 0.06, S.m('wood'), 'bench3')
    box(0.27, 0.10, 0.06, 0.02, 0.16, 0.07, S.m('wood_dark'), 'bench3_back')

    # Bushes, wildflowers, and litter barrel
    S.bush(-0.36, -0.08, r=0.07)
    S.bush(0.34, 0.12, r=0.06)
    sphere(0.02, -0.20, 0.03, 0.035, S.m('accent'), 'flower1')
    sphere(-0.06, -0.22, 0.03, 0.03, S.m('accent2'), 'flower2')
    S.barrel(0.26, 0.30, r=0.045, h=0.09)

    # Twin park lamps
    S.lamp(-0.16, -0.34)
    S.lamp(0.32, 0.28)


def tree(S, rng):
    # One big majestic tree filling the tile with crown reaching height ~1.0
    S.tree(0.0, 0.0, 0.0, s=2.25, rng=rng)

    # Extra lush canopy foliage to fill the tile and create a dense majestic crown
    sphere(-0.14, 0.12, 0.68, 0.22, S.m('foliage'), 'canopy_w')
    sphere(0.16, 0.10, 0.70, 0.21, S.m('foliage2'), 'canopy_e')
    sphere(0.08, -0.14, 0.66, 0.23, S.m('foliage_dark'), 'canopy_s')
    sphere(-0.08, -0.12, 0.72, 0.20, S.m('foliage'), 'canopy_sw')
    sphere(0.0, 0.0, 0.86, 0.20, S.m('foliage2'), 'canopy_top')

    # Spreading surface roots
    for ang in (0.3, 1.5, 2.7, 4.0, 5.2):
        rx, ry = 0.12 * math.cos(ang), 0.12 * math.sin(ang)
        box(rx, ry, 0.0, 0.09, 0.05, 0.04, S.m('trunk'), 'root').rotation_euler.z = ang

    # Wooden tree swing suspended from a thick bough that gently sways in the breeze
    swing = box(0.18, 0.14, 0.16, 0.07, 0.14, 0.016, S.m('wood'), 'swing_seat')
    box(0.18, 0.09, 0.16, 0.006, 0.006, 0.44, S.m('crop'), 'swing_rope1')
    box(0.18, 0.19, 0.16, 0.006, 0.006, 0.44, S.m('crop'), 'swing_rope2')
    kit.anim(lambda f, n: setattr(swing, 'location', (
        0.18 + 0.035 * math.sin(2 * math.pi * f / n),
        0.14 + 0.035 * math.cos(2 * math.pi * f / n),
        0.16
    )))

    # Rustic bench under the shade
    box(-0.20, 0.18, 0.0, 0.08, 0.18, 0.06, S.m('wood'), 'tree_bench')
    box(-0.18, 0.18, 0.06, 0.02, 0.18, 0.07, S.m('wood_dark'), 'tree_bench_back')

    # Surrounding wild shrubs, mossy boulders, and fallen stump
    S.bush(-0.30, 0.14, r=0.08)
    S.bush(0.28, 0.16, r=0.075)
    S.bush(-0.18, -0.28, r=0.08)
    S.bush(0.28, -0.20, r=0.085)
    S.rock(0.14, 0.30, r=0.065, rng=rng)
    S.rock(-0.32, -0.10, r=0.06, rng=rng)
    cyl(-0.18, 0.08, 0.0, 0.06, 0.08, S.m('trunk'), seg=8, name='stump')

    # Wildflowers
    sphere(-0.06, 0.28, 0.02, 0.03, S.m('accent2'), 'bloom1')
    sphere(0.20, -0.26, 0.02, 0.03, S.m('accent'), 'bloom2')

    # Animated lively fireflies hovering in front of the lower boughs and bench
    fly1 = sphere(0.24, 0.16, 0.32, 0.025, S.m('glow', emit=5.0), 'firefly1')
    fly2 = sphere(-0.12, 0.28, 0.28, 0.022, S.m('accent2'), 'tree_bird')
    kit.anim(lambda f, n: [
        setattr(fly1, 'location', (
            0.24 + 0.05 * math.sin(2 * math.pi * f / n),
            0.16 + 0.05 * math.cos(2 * math.pi * f / n),
            0.32 + 0.03 * math.sin(4 * math.pi * f / n)
        )),
        setattr(fly2, 'location', (
            -0.12 + 0.05 * math.cos(2 * math.pi * f / n),
            0.28 + 0.05 * math.sin(2 * math.pi * f / n),
            0.28 + 0.03 * math.cos(4 * math.pi * f / n)
        ))
    ])


def lamp(S, rng):
    # Grand civic street lamp with twin gas lanterns, fluted iron post, and tight stone plinth
    # Tight cobblestone pavement (no wide plate)
    cyl(0.0, 0.0, 0.0, 0.20, 0.012, S.m('stone_light'), seg=10, name='pave_ring')
    cyl(0.0, 0.0, 0.012, 0.10, 0.06, S.m('stone_dark'), seg=8, name='plinth_stone')
    cyl(0.0, 0.0, 0.072, 0.065, 0.08, S.m('metal'), seg=8, name='plinth_iron')

    # Fluted tapering central post
    cone(0.0, 0.0, 0.152, 0.040, 0.48, S.m('trim'), seg=8, r_top=0.026, name='shaft')
    cyl(0.0, 0.0, 0.28, 0.046, 0.02, S.m('metal'), seg=8, name='collar1')
    cyl(0.0, 0.0, 0.50, 0.040, 0.02, S.m('metal'), seg=8, name='collar2')
    cyl(0.0, 0.0, 0.63, 0.052, 0.04, S.m('metal'), seg=8, name='capital')

    # Ornamental crossarm supporting two lanterns
    box(0.0, 0.0, 0.67, 0.34, 0.035, 0.03, S.m('trim'), 'crossarm')
    cone(0.0, 0.0, 0.70, 0.03, 0.14, S.m('accent2', metal=0.7), seg=4, name='post_finial')

    # Left & Right glass lanterns
    glows = []
    for side, lx in ((-1, -0.14), (1, 0.14)):
        cyl(lx, 0.0, 0.60, 0.008, 0.07, S.m('trim'), seg=6, name=f'hanger_{side}')
        box(lx, 0.0, 0.50, 0.075, 0.075, 0.10, S.m('metal'), f'cage_{side}')
        g = box(lx, 0.0, 0.51, 0.065, 0.065, 0.08, S.m('glow', emit=4.5), f'noink_glow_{side}')
        cone(lx, 0.0, 0.60, 0.055, 0.045, S.m('metal'), seg=4, name=f'cap_{side}')
        glows.append(g)

    # Subtle flicker of gaslight lanterns
    kit.anim(lambda f, n: [setattr(g, 'scale', ((1.0, 1.25, 0.85)[(f + i) % 3],) * 3) for i, g in enumerate(glows)])

    # Hanging flower basket on the post
    box(0.0, -0.08, 0.56, 0.006, 0.06, 0.006, S.m('trim'), 'basket_arm')
    cone(0.0, -0.08, 0.50, 0.035, 0.045, S.m('wood_dark'), seg=6, name='flower_basket')
    sphere(0.0, -0.08, 0.54, 0.032, S.m('accent'), 'hanging_flowers')

    # Surrounding resting bench & stone bollards
    box(0.0, 0.20, 0.0, 0.20, 0.08, 0.06, S.m('wood'), 'lamp_bench')
    box(0.0, 0.23, 0.06, 0.20, 0.02, 0.07, S.m('wood_dark'), 'lamp_bench_back')
    cyl(0.20, 0.16, 0.0, 0.03, 0.12, S.m('stone'), seg=6, name='bollard1')
    cyl(-0.20, -0.16, 0.0, 0.03, 0.12, S.m('stone'), seg=6, name='bollard2')
    S.barrel(0.24, -0.16, r=0.04, h=0.08)


def statue(S, rng):
    # Monumental founder statue: stepped stone pedestal, bronze hero figure, eagle, and waving banners
    # Stepped classical pedestal (tight to base, no ground slab)
    box(0.0, 0.0, 0.0, 0.44, 0.44, 0.10, S.m('stone'), 'plinth_base', bevel=0.015)
    box(0.0, 0.0, 0.10, 0.34, 0.34, 0.44, S.m('stone_light'), 'plinth_die', bevel=0.01)
    box(0.0, 0.0, 0.54, 0.38, 0.38, 0.08, S.m('stone'), 'plinth_cap', bevel=0.015)

    # Inscription plaque on +Y face
    box(0.0, 0.175, 0.26, 0.18, 0.012, 0.14, S.m('accent2', metal=0.75, rough=0.3), 'plaque')

    # Heroic bronze warrior figure
    m_statue = S.m('metal', metal=0.65, rough=0.40)
    box(0.0, 0.0, 0.62, 0.26, 0.26, 0.04, S.m('stone_dark'), 'fig_plinth')

    # Boots & Greaves
    box(0.05, -0.04, 0.66, 0.06, 0.09, 0.08, m_statue, 'boot_r')
    box(-0.05, 0.03, 0.66, 0.06, 0.09, 0.08, m_statue, 'boot_l')
    cyl(0.05, -0.04, 0.74, 0.028, 0.20, m_statue, seg=8, name='leg_r')
    cyl(-0.05, 0.03, 0.74, 0.028, 0.20, m_statue, seg=8, name='leg_l')

    # Armoured cuirass & belt
    box(0.0, 0.0, 0.94, 0.16, 0.18, 0.24, m_statue, 'cuirass', bevel=0.01)
    box(0.0, 0.0, 0.93, 0.17, 0.19, 0.03, S.m('accent2', metal=0.7), 'belt')

    # Left arm resting on emblem shield
    cyl(-0.10, 0.01, 1.00, 0.024, 0.16, m_statue, seg=6, name='arm_l')
    box(-0.12, 0.04, 0.96, 0.018, 0.11, 0.17, S.m('accent'), 'shield')
    S.emblem('x', -0.135, 0.04, 1.04, 0.07)

    # Right arm raising heroic staff/sword
    cyl(0.10, -0.02, 1.02, 0.024, 0.16, m_statue, seg=6, name='arm_r')
    box(0.13, 0.03, 1.00, 0.016, 0.016, 0.44, S.m('stone_light'), 'sword_blade')
    box(0.13, 0.03, 1.07, 0.016, 0.08, 0.02, S.m('accent2'), 'sword_guard')

    # Helmeted head with crest
    sphere(0.0, 0.0, 1.24, 0.055, m_statue, 'head')
    cone(0.0, 0.0, 1.29, 0.042, 0.08, S.m('accent2', metal=0.7), seg=6, name='crown')

    # Perched bird / eagle on the raised weapon crossbar (wings flap animated)
    eagle = sphere(0.13, 0.03, 1.45, 0.022, S.m('accent2'), 'eagle')
    wing = box(0.13, 0.03, 1.46, 0.045, 0.012, 0.02, S.m('accent2', metal=0.7), 'wing')
    kit.anim(lambda f, n: setattr(wing, 'scale', (1.0, (1.3, 0.7, 1.0)[f % 3], (0.8, 1.4, 1.0)[f % 3])))

    # Ceremonial corner braziers with eternal flames (S.fire)
    for px, py in ((0.28, 0.28), (-0.28, -0.28)):
        cyl(px, py, 0.0, 0.045, 0.14, S.m('stone'), seg=8, name='brazier')
        S.fire(px, py, 0.14, s=0.6)

    # Waving triumphal banner at pedestal side
    S.banner('x', 0.24, -0.14, 0.12, w=0.10, h=0.24)

    # Commemorative wreaths & corner lamp
    sphere(0.16, 0.0, 0.04, 0.035, S.m('foliage'), 'wreath')
    S.lamp(0.34, 0.34)


def flowerbed(S, rng):
    # Raised stone border flowerbed bursting with bright blossoms, animated butterfly, and watering can
    # Stepped ornamental retaining wall (tight border, no tile-sized ground slab)
    box(0.0, 0.0, 0.0, 0.68, 0.68, 0.10, S.m('stone_light'), 'retaining_wall', bevel=0.015)
    box(0.0, 0.0, 0.06, 0.56, 0.56, 0.05, S.m('dirt'), 'rich_soil')

    # Corner decorative stone piers with spherical finials
    for px in (-0.31, 0.31):
        for py in (-0.31, 0.31):
            box(px, py, 0.0, 0.07, 0.07, 0.12, S.m('stone'), 'pier')
            sphere(px, py, 0.14, 0.032, S.m('stone_light'), 'pier_ball')

    # Central blooming rosette mound
    sphere(0.0, 0.0, 0.13, 0.09, S.m('accent'), 'centre_rose')
    sphere(0.0, 0.0, 0.18, 0.045, S.m('accent2'), 'rose_core')

    # Richly patterned flowers in varied colors
    offsets = (
        (-0.16, -0.16, 'accent2'), (0.16, -0.16, 'accent'),
        (-0.16, 0.16, 'crop2'), (0.16, 0.16, 'cloth'),
        (0.0, -0.20, 'accent'), (0.0, 0.20, 'accent2'),
        (-0.20, 0.0, 'cloth'), (0.20, 0.0, 'crop2'),
    )
    for fx, fy, col in offsets:
        cyl(fx, fy, 0.07, 0.01, 0.05, S.m('foliage_dark'), seg=6, name='stem')
        sphere(fx, fy, 0.12, 0.035, S.m(col), f'bloom_{col}')

    # Circling butterfly / pollinator
    flutter = sphere(0.08, 0.08, 0.22, 0.018, S.m('glow', emit=4.0), 'butterfly')
    kit.anim(lambda f, n: setattr(flutter, 'location', (
        0.12 * math.sin(2 * math.pi * f / n),
        0.12 * math.cos(2 * math.pi * f / n),
        0.22 + 0.03 * math.sin(4 * math.pi * f / n)
    )))

    # Gardeners watering can and seed sack beside the bed
    cyl(0.34, -0.18, 0.0, 0.035, 0.07, S.m('metal'), seg=8, name='can')
    cyl(0.34, -0.14, 0.03, 0.01, 0.06, S.m('metal'), seg=6, name='spout')
    S.sack(0.32, 0.18)
    box(-0.32, 0.20, 0.0, 0.08, 0.08, 0.05, S.m('wood_light'), 'trowel_box')
    cyl(0.36, -0.14, 0.03, 0.01, 0.06, S.m('metal'), seg=6, name='spout')


def hedge(S, rng):
    # Clipped formal boxwood hedge section with stone arch portal, gravel path, and garden bench
    # Gravel path running through the hedge opening
    box(0.0, 0.0, 0.0, 0.18, 0.76, 0.01, S.m('stone_light'), 'gravel_path')

    # Two dense clipped hedge flanks (left and right of path)
    box(-0.27, 0.0, 0.0, 0.28, 0.24, 0.38, S.m('foliage_dark'), 'hedge_l', bevel=0.02)
    box(0.27, 0.0, 0.0, 0.28, 0.24, 0.38, S.m('foliage_dark'), 'hedge_r', bevel=0.02)

    # Topiary spherical finials on outer hedge ends
    sphere(-0.36, 0.0, 0.42, 0.08, S.m('foliage'), 'topiary_ball_l')
    sphere(0.36, 0.0, 0.42, 0.08, S.m('foliage'), 'topiary_ball_r')

    # Stone portal archway framing the pathway
    box(-0.13, 0.0, 0.0, 0.05, 0.26, 0.44, S.m('stone'), 'arch_jamb_l')
    box(0.13, 0.0, 0.0, 0.05, 0.26, 0.44, S.m('stone'), 'arch_jamb_r')
    box(0.0, 0.0, 0.44, 0.31, 0.26, 0.05, S.m('stone_light'), 'arch_lintel')
    cone(0.0, 0.0, 0.49, 0.05, 0.08, S.m('stone'), seg=4, name='arch_keystone')

    # Hanging lantern on the stone portal archway with animated flicker
    box(0.0, 0.16, 0.34, 0.01, 0.06, 0.01, S.m('trim'), 'lantern_arm')
    lantern = box(0.0, 0.16, 0.25, 0.05, 0.05, 0.06, S.m('glow', emit=4.0), 'noink_arch_lamp')
    kit.anim(lambda f, n: setattr(lantern, 'scale', ((1.0, 1.25, 0.85)[f % 3],) * 3))

    # Garden bench along the hedge
    box(0.24, -0.22, 0.0, 0.08, 0.18, 0.06, S.m('wood'), 'hedge_bench')
    box(0.27, -0.22, 0.06, 0.02, 0.18, 0.07, S.m('wood_dark'), 'hedge_bench_back')

    # Gardening shears basket & flower clumps
    box(0.26, 0.26, 0.0, 0.08, 0.08, 0.07, S.m('wood_light'), 'basket')
    sphere(-0.28, 0.18, 0.03, 0.035, S.m('accent'), 'flower_hedge1')
    sphere(-0.28, -0.18, 0.03, 0.035, S.m('accent2'), 'flower_hedge2')


def well(S, rng):
    # Round stone well with pitched timber roof, winch crank, bucket, water trough, and dripping water
    # Flagstone apron around well (tight footprint)
    cyl(0.0, 0.0, 0.0, 0.32, 0.012, S.m('stone_light'), seg=12, name='well_apron')

    # Round ashlar stone well curb
    cyl(0.0, 0.0, 0.012, 0.20, 0.22, S.m('stone'), seg=12, name='well_wall')
    cyl(0.0, 0.0, 0.232, 0.22, 0.04, S.m('stone_dark'), seg=12, name='well_coping')

    # Deep water surface inside well
    S.water(0.0, 0.0, 0.18, 0.28, 0.28)

    # Open wooden water trough in front (visible water from camera)
    box(0.20, 0.14, 0.0, 0.14, 0.22, 0.10, S.m('wood_dark'), 'trough')
    S.water(0.20, 0.14, 0.08, 0.10, 0.18)

    # Timber uprights supporting roof
    box(-0.15, 0.0, 0.24, 0.035, 0.035, 0.36, S.m('trim'), 'well_post_l')
    box(0.15, 0.0, 0.24, 0.035, 0.035, 0.36, S.m('trim'), 'well_post_r')

    # Winch roller beam & iron crank
    cyl(0.0, 0.0, 0.42, 0.022, 0.30, S.m('wood_dark'), seg=8, name='winch_beam')
    cyl(0.0, 0.0, 0.42, 0.032, 0.10, S.m('crop'), seg=8, name='rope_coil')
    box(0.17, 0.0, 0.42, 0.04, 0.015, 0.015, S.m('metal'), 'crank_axle')
    box(0.19, 0.03, 0.42, 0.015, 0.06, 0.015, S.m('metal'), 'crank_arm')

    # Suspended wooden bucket with metal hoops (animated sway & water dripping)
    bkt = cone(0.0, 0.08, 0.24, 0.05, 0.08, S.m('wood'), seg=8, r_top=0.062, name='bucket')
    hoop = cyl(0.0, 0.08, 0.26, 0.058, 0.012, S.m('metal'), seg=8, name='bucket_hoop')
    bkt_water = sphere(0.0, 0.08, 0.30, 0.04, S.m('water'), 'bucket_water', squash=0.2)
    drop = sphere(0.0, 0.08, 0.14, 0.016, S.m('water'), 'water_drop')
    kit.anim(lambda f, n: [
        setattr(bkt, 'location', (0.0, 0.08 + 0.015 * math.sin(2 * math.pi * f / n), 0.24)),
        setattr(hoop, 'location', (0.0, 0.08 + 0.015 * math.sin(2 * math.pi * f / n), 0.26)),
        setattr(bkt_water, 'location', (0.0, 0.08 + 0.015 * math.sin(2 * math.pi * f / n), 0.30)),
        setattr(drop, 'location', (0.0, 0.08, 0.19 - 0.07 * (f % 3)))
    ])

    # Gable timber roof over well
    S.roof(0.0, 0.0, 0.58, 0.40, 0.34, 0.18, rng, shape='gable', along='x')

    # Animated lantern on well post
    lamp = box(0.17, 0.04, 0.30, 0.045, 0.045, 0.06, S.m('glow', emit=4.5), 'well_lantern')
    kit.anim(lambda f, n: setattr(lamp, 'scale', ((1.0, 1.25, 0.85)[f % 3],) * 3))

    # Water barrel, resting stone, and moss
    S.barrel(0.26, -0.16, r=0.045, h=0.09)
    sphere(-0.20, 0.14, 0.02, 0.035, S.m('foliage'), 'moss')
    box(-0.22, -0.14, 0.0, 0.12, 0.12, 0.06, S.m('stone_light'), 'bench_stone')
    S.lamp(0.32, -0.26)


def pond(S, rng):
    # Natural pond with shimmering water (S.water), river stones, reed clusters, deck, and animated duck
    # Embankment and excavated earth
    box(0.0, 0.0, -0.01, 0.78, 0.70, 0.025, S.m('dirt'), 'pond_bank', bevel=0.03)
    box(0.0, 0.0, -0.02, 0.70, 0.62, 0.02, S.m('stone_dark'), 'pond_bed')

    # Shimmering water surface
    S.water(0.0, 0.0, 0.012, 0.68, 0.60)

    # River stones encircling the pond edge
    S.rock(-0.32, 0.20, r=0.07, rng=rng)
    S.rock(0.30, -0.22, r=0.075, rng=rng)
    S.rock(-0.26, -0.24, r=0.065, rng=rng)
    S.rock(0.28, 0.22, r=0.06, rng=rng)
    S.rock(0.04, 0.30, r=0.05, rng=rng)

    # Reed clusters & cattails along the shore
    for k in range(5):
        ang = k * 0.55
        rx = -0.22 + 0.05 * math.cos(ang)
        ry = 0.16 + 0.05 * math.sin(ang)
        cyl(rx, ry, 0.01, 0.007, 0.22, S.m('foliage_dark'), seg=4, name='reed_stem')
        cyl(rx, ry, 0.16, 0.014, 0.06, S.m('trunk'), seg=6, name='cattail')

    for k in range(4):
        rx = 0.20 + 0.035 * (k - 1.5)
        ry = -0.12 + 0.025 * (k % 2)
        cyl(rx, ry, 0.01, 0.007, 0.20, S.m('foliage_dark'), seg=4, name='reed_stem2')
        cyl(rx, ry, 0.15, 0.013, 0.05, S.m('trunk'), seg=6, name='cattail2')

    for k in range(4):
        rx = 0.22 + 0.035 * (k - 1.5)
        ry = -0.14 + 0.025 * (k % 2)
        cyl(rx, ry, 0.01, 0.007, 0.20, S.m('foliage_dark'), seg=4, name='reed_stem2')
        cyl(rx, ry, 0.15, 0.013, 0.05, S.m('trunk'), seg=6, name='cattail2')

    # Floating lily pads & water lilies
    cyl(-0.06, -0.08, 0.022, 0.05, 0.003, S.m('foliage2'), seg=8, name='pad1')
    sphere(-0.06, -0.08, 0.03, 0.018, S.m('emblem'), 'lily1')
    cyl(0.12, 0.08, 0.022, 0.045, 0.003, S.m('foliage2'), seg=8, name='pad2')
    sphere(0.12, 0.08, 0.03, 0.016, S.m('accent2'), 'lily2')

    # Animated gentle duck swimming in circles
    duck = sphere(0.04, -0.04, 0.04, 0.026, S.m('crop'), 'duck_body')
    duck_head = sphere(0.06, -0.04, 0.06, 0.016, S.m('crop'), 'duck_head')
    kit.anim(lambda f, n: [
        setattr(duck, 'location', (
            0.04 + 0.05 * math.sin(2 * math.pi * f / n),
            -0.04 + 0.05 * math.cos(2 * math.pi * f / n),
            0.04
        )),
        setattr(duck_head, 'location', (
            0.065 + 0.05 * math.sin(2 * math.pi * f / n),
            -0.04 + 0.05 * math.cos(2 * math.pi * f / n),
            0.06
        ))
    ])

    # Wooden corner observation deck
    box(0.24, 0.24, 0.02, 0.14, 0.18, 0.02, S.m('wood'), 'deck')


def arch(S, rng):
    # Grand ceremonial stone arch with classical pylons, frieze, flags, and ornamental lanterns
    # Paved roadway apron through arch (tight roadway, no tile-sized ground plate)
    box(0.0, 0.0, 0.0, 0.64, 0.44, 0.012, S.m('stone_light'), 'arch_pave', bevel=0.01)

    # Left & Right monumental stone pylons
    for side, px in ((-1, -0.22), (1, 0.22)):
        box(px, 0.0, 0.012, 0.22, 0.36, 0.12, S.m('stone_dark'), f'pylon_base_{side}', bevel=0.01)
        box(px, 0.0, 0.132, 0.18, 0.32, 0.70, S.m('stone'), f'pylon_shaft_{side}')
        box(px, 0.0, 0.832, 0.22, 0.36, 0.06, S.m('stone_light'), f'impost_{side}', bevel=0.01)

        # Fluted engaged decorative columns
        cyl(px, 0.17, 0.132, 0.035, 0.70, S.m('stone_light'), seg=8, name=f'col_front_{side}')
        cyl(px, -0.17, 0.132, 0.035, 0.70, S.m('stone_light'), seg=8, name=f'col_back_{side}')

        # Roadway stone guard bollards
        cyl(px, 0.22, 0.0, 0.025, 0.12, S.m('stone'), seg=6, name=f'bollard_f_{side}')

    # Arch span vault & keystone
    box(0.0, 0.0, 0.832, 0.26, 0.32, 0.05, S.m('stone'), 'arch_vault')
    cone(0.0, 0.17, 0.84, 0.055, 0.09, S.m('accent2', metal=0.7), seg=4, name='keystone').rotation_euler.z = math.radians(45)

    # Entablature & Attic storey above arch
    box(0.0, 0.0, 0.892, 0.66, 0.38, 0.14, S.m('stone_light'), 'frieze', bevel=0.01)
    box(0.0, 0.0, 1.032, 0.62, 0.34, 0.26, S.m('stone'), 'attic', bevel=0.01)
    box(0.0, 0.18, 1.14, 0.22, 0.012, 0.12, S.m('accent2', metal=0.7), 'triumph_plaque')
    box(0.0, 0.0, 1.292, 0.66, 0.38, 0.05, S.m('stone_dark'), 'cornice', bevel=0.01)

    # Acroteria / corner stone urns
    for ux in (-0.28, 0.28):
        for uy in (-0.14, 0.14):
            cyl(ux, uy, 1.342, 0.035, 0.08, S.m('accent2', metal=0.6), seg=8, name='urn')

    # Waving triumphal flags on top of the attic
    S.flag(-0.20, 0.0, 1.342, h=0.22)
    S.flag(0.20, 0.0, 1.342, h=0.22)

    # Heraldic banners on pylon faces
    S.banner('y', -0.22, 0.17, 0.40, w=0.10, h=0.22)
    S.banner('y', 0.22, 0.17, 0.40, w=0.10, h=0.22)

    # Flanking street lamps
    S.lamp(0.36, 0.26)
    S.lamp(-0.36, 0.26)


RECIPES = {
    'fountain': fountain,
    'park': park,
    'tree': tree,
    'lamp': lamp,
    'statue': statue,
    'flowerbed': flowerbed,
    'hedge': hedge,
    'well': well,
    'pond': pond,
    'arch': arch,
}
