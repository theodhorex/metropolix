# Homes. Footprints: a small home ~0.5, a big one ~0.65 of the tile; heights from sim BUILDINGS.height.
import math
import kit
from kit import box, cyl, cone, sphere
from style import Style  # noqa: F401 (type of S)


def rowhouse(S, rng):
    # 3 narrow joined homes side-by-side along y
    # Shared footing
    S.footing(-0.02, 0.0, 0.46, 0.72, 0.09, rng)

    # Unit 1 (left: y = -0.23)
    S.walls(-0.03, -0.23, 0.09, 0.44, 0.22, 0.52, rng)
    S.gable(-0.03, -0.23, 0.61, 0.44, 0.22, 0.28, rng, along='x', over=0.04, rows=5)
    S.door('x', 0.19, -0.23, 0.09, w=0.10, h=0.22)
    box(0.24, -0.23, 0.0, 0.08, 0.14, 0.02, S.m('stone_light'), 'step1')
    S.window('x', 0.19, -0.23, 0.38, w=0.09, h=0.11)
    S.chimney(-0.16, -0.28, 0.65, 0.32, rng)

    # Unit 2 (center: y = 0.0, slightly taller)
    S.walls(-0.01, 0.0, 0.09, 0.48, 0.23, 0.60, rng)
    S.gable(-0.01, 0.0, 0.69, 0.48, 0.23, 0.32, rng, along='x', over=0.04, rows=5)
    S.door('x', 0.23, 0.0, 0.09, w=0.10, h=0.22)
    box(0.28, 0.0, 0.0, 0.08, 0.14, 0.02, S.m('stone_light'), 'step2')
    S.window('x', 0.23, 0.0, 0.44, w=0.09, h=0.11)

    # Unit 3 (right: y = 0.23)
    S.walls(-0.03, 0.23, 0.09, 0.44, 0.22, 0.54, rng)
    S.gable(-0.03, 0.23, 0.63, 0.44, 0.22, 0.29, rng, along='x', over=0.04, rows=5)
    S.door('x', 0.19, 0.23, 0.09, w=0.10, h=0.22)
    box(0.24, 0.23, 0.0, 0.08, 0.14, 0.02, S.m('stone_light'), 'step3')
    S.window('x', 0.19, 0.23, 0.40, w=0.09, h=0.11)
    S.window('y', -0.03, 0.34, 0.25, w=0.09, h=0.11)
    S.window('y', -0.03, 0.34, 0.45, w=0.09, h=0.11)
    S.chimney(-0.16, 0.28, 0.66, 0.32, rng)

    # Fluttering laundry between units (calm motion)
    box(0.24, -0.11, 0.42, 0.01, 0.12, 0.01, S.m('trim'), 'row_line')
    rc1 = box(0.24, -0.08, 0.35, 0.008, 0.05, 0.07, S.m('cloth'), 'row_laundry1')
    rc2 = box(0.24, -0.14, 0.36, 0.008, 0.05, 0.06, S.m('accent2'), 'row_laundry2')
    kit.anim(lambda f, n: [
        setattr(rc1, 'rotation_euler', (0.12 * math.sin(2 * math.pi * f / n), 0, 0)),
        setattr(rc2, 'rotation_euler', (0.15 * math.sin(2 * math.pi * (f + 1) / n), 0, 0))
    ])

    # Flower box under central window
    box(0.24, 0.0, 0.38, 0.03, 0.12, 0.035, S.m('wood_dark'), 'flowerbox')
    sphere(0.25, 0.0, 0.41, 0.025, S.m('accent'), 'flowers')

    # Props along the front (>= 5 props: lamp, barrel, crate, flowerbox, steps)
    S.lamp(0.32, 0.36)
    S.barrel(0.28, -0.32)
    S.crate(0.28, -0.10, rng=rng)
    S.sack(0.30, 0.12)


def house(S, rng):
    S.footing(0, 0, 0.52, 0.48, 0.1, rng)
    S.walls(0, 0, 0.1, 0.52, 0.48, 0.32, rng)
    S.roof(0, 0, 0.42, 0.52, 0.48, 0.3, rng, shape='gable', along='x')
    S.door('y', 0.05, 0.24, 0.1)
    box(0.05, 0.29, 0.0, 0.18, 0.08, 0.02, S.m('stone_light'), 'h_step')
    S.window('y', -0.14, 0.24, 0.22)
    # Window flowerbox
    box(-0.14, 0.26, 0.18, 0.13, 0.03, 0.03, S.m('wood_dark'), 'h_box')
    sphere(-0.14, 0.26, 0.21, 0.025, S.m('accent2'), 'h_flowers')
    S.window('x', 0.26, -0.08, 0.22)
    S.chimney(-0.16, -0.12, 0.45, 0.32, rng)

    # Roof weathervane that swivels in the breeze (calm motion)
    cyl(0.0, 0.0, 0.72, 0.008, 0.12, S.m('metal'), seg=4, name='vane_post')
    vane = box(0.0, 0.0, 0.81, 0.01, 0.14, 0.035, S.m('accent'), 'vane_fin')
    kit.anim(lambda f, n: setattr(vane, 'rotation_euler', (
        0,
        0,
        0.28 * math.sin(2 * math.pi * f / n)
    )))

    # Props (>= 5 props)
    S.barrel(0.33, 0.3)
    S.crate(0.32, 0.15, s=0.07, rng=rng)
    S.lamp(-0.3, 0.36)
    S.bush(0.28, -0.25, r=0.065)


def villa(S, rng):
    S.footing(-0.05, -0.05, 0.62, 0.56, 0.12, rng)
    S.walls(-0.05, -0.05, 0.12, 0.62, 0.56, 0.34, rng)
    S.walls(-0.05, -0.05, 0.46, 0.66, 0.6, 0.26, rng)  # jettied upper floor
    S.roof(-0.05, -0.05, 0.72, 0.66, 0.6, 0.36, rng, shape='gable', along='x')
    S.door('y', -0.05, 0.23, 0.12)
    box(-0.05, 0.28, 0.0, 0.20, 0.08, 0.02, S.m('stone_light'), 'v_step')
    S.window('y', -0.24, 0.25, 0.25)
    S.window('x', 0.26, -0.18, 0.25)
    S.window('x', 0.28, 0.05, 0.55)
    S.window('y', 0.12, 0.25, 0.55)
    S.window('y', -0.22, 0.25, 0.55)
    S.chimney(-0.25, -0.2, 0.7, 0.42, rng)
    S.banner('x', 0.27, -0.12, 0.47)
    # Props (>= 5 props)
    S.barrel(0.36, 0.3)
    S.crate(0.3, 0.42, rng=rng)
    S.lamp(0.14, 0.38)
    S.bush(0.32, -0.32, r=0.07)
    S.sack(0.24, 0.38)


def manor(S, rng):
    # Big L-shaped home with a small tower
    # Main wing (along x: sx=0.54, sy=0.28)
    S.footing(-0.04, -0.14, 0.54, 0.28, 0.12, rng)
    S.walls(-0.04, -0.14, 0.12, 0.54, 0.28, 0.34, rng, kind='stone')
    S.walls(-0.04, -0.14, 0.46, 0.54, 0.28, 0.30, rng)
    S.gable(-0.04, -0.14, 0.76, 0.54, 0.28, 0.32, rng, along='x', rows=6)

    # Cross wing (along y: sx=0.28, sy=0.36) forming the L
    S.footing(-0.17, 0.14, 0.28, 0.36, 0.12, rng)
    S.walls(-0.17, 0.14, 0.12, 0.28, 0.36, 0.34, rng, kind='stone')
    S.walls(-0.17, 0.14, 0.46, 0.28, 0.36, 0.30, rng)
    S.gable(-0.17, 0.14, 0.76, 0.28, 0.36, 0.32, rng, along='y', rows=6)

    # Tower at the corner junction (-0.20, -0.16)
    S.footing(-0.20, -0.16, 0.22, 0.22, 0.12, rng)
    S.stone_walls(-0.20, -0.16, 0.12, 0.22, 0.22, 0.95, rng)
    S.roof(-0.20, -0.16, 1.07, 0.24, 0.24, 0.36, rng, shape='cone', over=0.03)
    S.flag(-0.20, -0.16, 1.43, h=0.20)

    # Openings: doors and windows facing camera (+x and +y)
    S.door('x', -0.03, 0.14, 0.12, w=0.14, h=0.24)
    S.door('y', 0.10, 0.0, 0.12, w=0.14, h=0.24)
    S.window('x', 0.23, -0.14, 0.24)
    S.window('x', 0.23, -0.14, 0.54)
    S.window('x', -0.03, 0.26, 0.54)
    S.window('y', -0.17, 0.32, 0.24)
    S.window('y', -0.17, 0.32, 0.54)
    S.window('y', 0.12, 0.0, 0.54)

    # Chimney on the main wing
    S.chimney(0.16, -0.18, 0.82, 0.36, rng)

    # Courtyard details in the crook of the L (+x, +y area) (>= 5 props)
    S.tree(0.24, 0.22, s=0.75, rng=rng)
    S.lamp(0.12, 0.32)
    S.barrel(0.26, 0.05)
    S.crate(0.22, -0.02, rng=rng)
    S.crate(0.28, -0.02, s=0.06, rng=rng)
    S.banner('y', -0.09, -0.05, 0.88, w=0.08, h=0.18)


def cottage(S, rng):
    # Tiny, low, round-ish thatch feel
    # Compact stone base and low cozy walls
    S.footing(-0.02, -0.02, 0.44, 0.42, 0.08, rng)
    S.walls(-0.02, -0.02, 0.08, 0.44, 0.42, 0.24, rng, kind='stone')
    # Soft hip roof with generous overhang for thatch feel
    S.roof(-0.02, -0.02, 0.32, 0.44, 0.42, 0.30, rng, shape='hip', over=0.09)

    # Curved thatch ridge cap along top
    box(-0.02, -0.02, 0.60, 0.16, 0.14, 0.04, S.m('roof2'), 'thatch_cap', bevel=0.01)

    # Openings: low wooden door and small leaded windows
    S.door('y', 0.06, 0.19, 0.08, w=0.13, h=0.20)
    S.window('y', -0.12, 0.19, 0.15, w=0.09, h=0.10)
    S.window('x', 0.20, -0.06, 0.15, w=0.09, h=0.10)

    # Crooked stone chimney
    S.chimney(-0.16, -0.14, 0.32, 0.34, rng)

    # Garden clothesline with fluttering laundry out front (calm motion, visible on +y)
    box(0.12, 0.28, 0.0, 0.02, 0.02, 0.44, S.m('wood'), 'c_pole')
    box(0.20, 0.28, 0.38, 0.16, 0.008, 0.008, S.m('trim'), 'c_line')
    c_cloth1 = box(0.16, 0.28, 0.28, 0.07, 0.008, 0.10, S.m('cloth'), 'c_laundry1')
    c_cloth2 = box(0.24, 0.28, 0.29, 0.06, 0.008, 0.09, S.m('accent2'), 'c_laundry2')
    kit.anim(lambda f, n: [
        setattr(c_cloth1, 'rotation_euler', (0.22 * math.sin(2 * math.pi * f / n), 0, 0.18 * math.sin(2 * math.pi * f / n))),
        setattr(c_cloth2, 'rotation_euler', (0.25 * math.sin(2 * math.pi * (f + 1) / n), 0, 0.20 * math.sin(2 * math.pi * (f + 1) / n)))
    ])

    # Rustic garden props: fence, bush, rain barrel, rock
    S.fence([(-0.35, 0.12), (-0.35, 0.34), (-0.14, 0.38)], rng, h=0.08)
    S.bush(0.26, 0.24, r=0.07)
    S.barrel(0.26, -0.14, r=0.045, h=0.09)
    S.rock(0.30, 0.08, rng=rng)
    S.lamp(-0.06, 0.34)


def longhouse(S, rng):
    # Long low hall, roof along y
    # Long plank hall on low stone footing
    S.footing(0.0, 0.0, 0.38, 0.66, 0.09, rng)
    S.walls(0.0, 0.0, 0.09, 0.38, 0.66, 0.24, rng, kind='plank')
    # Steep pitched roof along y
    S.roof(0.0, 0.0, 0.33, 0.38, 0.66, 0.38, rng, shape='gable', along='y', over=0.04)

    # Carved gable cross-timbers at the front peak (y = +0.33)
    box(0.0, 0.35, 0.68, 0.03, 0.03, 0.16, S.m('trim'), 'gablefinial')

    # Grand hall entrance on the front gable (+y face)
    S.door('y', 0.0, 0.33, 0.09, w=0.16, h=0.24)
    S.emblem('y', 0.0, 0.34, 0.44, 0.10)

    # Side windows along the +x flank
    S.window('x', 0.19, -0.18, 0.17, w=0.08, h=0.10)
    S.window('x', 0.19, 0.02, 0.17, w=0.08, h=0.10)
    S.window('x', 0.19, 0.20, 0.17, w=0.08, h=0.10)

    # Central smoke ridge chimney with smoke
    S.chimney(0.0, -0.08, 0.71, 0.18, rng)

    # Hallside props: firewood stack, barrels, lamp, sack
    box(0.25, -0.16, 0.0, 0.08, 0.22, 0.08, S.m('wood_dark'), 'firewood')
    box(0.24, -0.15, 0.08, 0.06, 0.18, 0.06, S.m('wood'), 'firewood_top')
    S.barrel(0.26, 0.14, r=0.05, h=0.10)
    S.sack(0.18, 0.36)
    S.lamp(0.26, 0.32)
    S.banner('y', 0.12, 0.34, 0.22, w=0.07, h=0.16)

    # Hallside props: firewood stack, barrels, lamp, sack
    box(0.25, -0.16, 0.0, 0.08, 0.22, 0.08, S.m('wood_dark'), 'firewood')
    box(0.24, -0.15, 0.08, 0.06, 0.18, 0.06, S.m('wood'), 'firewood_top')
    S.barrel(0.26, 0.14, r=0.05, h=0.10)
    S.sack(0.18, 0.36)
    S.lamp(0.26, 0.32)
    S.banner('y', 0.12, 0.34, 0.22, w=0.07, h=0.16)


def tenement(S, rng):
    # 3-4 storeys, narrow, many windows, laundry line
    # Stone ground course and footing
    S.footing(-0.02, -0.02, 0.44, 0.38, 0.10, rng)
    S.walls(-0.02, -0.02, 0.10, 0.44, 0.38, 0.32, rng, kind='stone')

    # Upper storeys with trim belt courses
    S.walls(-0.02, -0.02, 0.42, 0.46, 0.40, 0.30, rng)
    box(-0.02, -0.02, 0.71, 0.47, 0.41, 0.03, S.m('trim'), 'belt1')
    S.walls(-0.02, -0.02, 0.72, 0.46, 0.40, 0.30, rng)
    box(-0.02, -0.02, 1.01, 0.47, 0.41, 0.03, S.m('trim'), 'belt2')
    S.walls(-0.02, -0.02, 1.02, 0.46, 0.40, 0.28, rng)

    # Steep roof
    S.roof(-0.02, -0.02, 1.30, 0.46, 0.40, 0.32, rng, shape='gable', along='x', over=0.05)

    # Entrance door on ground floor
    S.door('x', 0.20, -0.08, 0.10, w=0.13, h=0.22)

    # Many windows on both visible faces (+x and +y) across storeys
    # +x face windows
    S.window('x', 0.20, 0.10, 0.18, w=0.09, h=0.12)
    S.window('x', 0.21, -0.10, 0.49, w=0.09, h=0.12)
    S.window('x', 0.21, 0.10, 0.49, w=0.09, h=0.12)
    S.window('x', 0.21, -0.10, 0.79, w=0.09, h=0.12)
    S.window('x', 0.21, 0.10, 0.79, w=0.09, h=0.12)
    S.window('x', 0.21, -0.10, 1.09, w=0.09, h=0.12)
    S.window('x', 0.21, 0.10, 1.09, w=0.09, h=0.12)

    # +y face windows
    S.window('y', -0.12, 0.17, 0.18, w=0.09, h=0.12)
    S.window('y', 0.08, 0.17, 0.18, w=0.09, h=0.12)
    S.window('y', -0.12, 0.18, 0.49, w=0.09, h=0.12)
    S.window('y', 0.08, 0.18, 0.49, w=0.09, h=0.12)
    S.window('y', -0.12, 0.18, 0.79, w=0.09, h=0.12)
    S.window('y', 0.08, 0.18, 0.79, w=0.09, h=0.12)
    S.window('y', -0.12, 0.18, 1.09, w=0.09, h=0.12)
    S.window('y', 0.08, 0.18, 1.09, w=0.09, h=0.12)

    # Laundry line: strung from wall bracket to a timber clothes-prop pole
    box(0.34, -0.22, 0.0, 0.02, 0.02, 0.85, S.m('trim'), 'laundry_pole')
    # Line rope from upper wall to pole
    box(0.28, -0.16, 0.84, 0.16, 0.01, 0.01, S.m('trim'), 'clothesline')

    # Hanging laundry items that flutter
    c1 = box(0.24, -0.13, 0.73, 0.01, 0.07, 0.11, S.m('cloth'), 'laundry1')
    c2 = box(0.28, -0.17, 0.74, 0.01, 0.06, 0.09, S.m('accent'), 'laundry2')
    c3 = box(0.32, -0.20, 0.75, 0.01, 0.05, 0.08, S.m('emblem'), 'laundry3')
    import math, kit
    kit.anim(lambda f, n: [
        setattr(c1, 'rotation_euler', (0.12 * math.sin(2 * math.pi * f / n), 0, 0)),
        setattr(c2, 'rotation_euler', (0.15 * math.sin(2 * math.pi * (f + 1) / n), 0, 0)),
        setattr(c3, 'rotation_euler', (0.10 * math.sin(2 * math.pi * (f + 2) / n), 0, 0)),
    ])

    # Tall chimney stack with smoke
    S.chimney(-0.16, -0.14, 1.30, 0.38, rng)

    # Ground props: street lamp, stacked crates, barrel
    S.lamp(0.28, 0.28)
    S.crate(0.26, -0.02, s=0.07, rng=rng)
    S.crate(0.26, -0.02, z=0.07, s=0.06, rng=rng)
    S.barrel(0.28, 0.18)


def highrise(S, rng):
    # Tallest home, stacked storeys with balconies, height 2.0+
    # Tier 1 (ground base): stone footing and sturdy lower floor
    S.footing(-0.02, -0.02, 0.50, 0.46, 0.12, rng)
    S.walls(-0.02, -0.02, 0.12, 0.50, 0.46, 0.36, rng, kind='stone')
    S.door('x', 0.23, -0.06, 0.12, w=0.14, h=0.24)
    S.window('x', 0.23, 0.12, 0.24)
    S.window('y', -0.14, 0.21, 0.24)
    S.window('y', 0.10, 0.21, 0.24)

    # Tier 2 (z = 0.48 to 0.82): with balcony on +x face
    S.walls(-0.02, -0.02, 0.48, 0.46, 0.42, 0.34, rng)
    # Balcony on +x
    box(0.26, -0.02, 0.47, 0.12, 0.22, 0.03, S.m('wood_dark'), 'balc1_plat')
    box(0.31, -0.02, 0.50, 0.02, 0.22, 0.07, S.m('trim'), 'balc1_rail_front')
    box(0.26, 0.08, 0.50, 0.10, 0.02, 0.07, S.m('trim'), 'balc1_rail_side1')
    box(0.26, -0.12, 0.50, 0.10, 0.02, 0.07, S.m('trim'), 'balc1_rail_side2')
    # Balcony door / window
    S.door('x', 0.21, -0.02, 0.48, w=0.12, h=0.22)
    S.window('y', -0.12, 0.19, 0.60)
    S.window('y', 0.08, 0.19, 0.60)

    # Tier 3 (z = 0.82 to 1.14): with balcony on +y face
    S.walls(-0.02, -0.02, 0.82, 0.42, 0.38, 0.32, rng)
    # Balcony on +y
    box(-0.02, 0.22, 0.81, 0.22, 0.12, 0.03, S.m('wood_dark'), 'balc2_plat')
    box(-0.02, 0.27, 0.84, 0.22, 0.02, 0.07, S.m('trim'), 'balc2_rail_front')
    box(0.08, 0.22, 0.84, 0.02, 0.10, 0.07, S.m('trim'), 'balc2_rail_side1')
    box(-0.12, 0.22, 0.84, 0.02, 0.10, 0.07, S.m('trim'), 'balc2_rail_side2')
    S.door('y', -0.02, 0.17, 0.82, w=0.12, h=0.22)
    S.window('x', 0.19, 0.06, 0.94)

    # Tier 4 (z = 1.14 to 1.46): cantilevered upper floor with corner balcony
    S.walls(-0.02, -0.02, 1.14, 0.38, 0.34, 0.32, rng)
    box(0.20, 0.06, 1.13, 0.10, 0.14, 0.03, S.m('wood_dark'), 'balc3_plat')
    box(0.24, 0.06, 1.16, 0.02, 0.14, 0.07, S.m('trim'), 'balc3_rail')
    S.window('x', 0.17, 0.06, 1.26)
    S.window('x', 0.17, -0.08, 1.26)
    S.window('y', -0.08, 0.15, 1.26)

    # Tier 5 (z = 1.46 to 1.76): attic penthouse
    S.walls(-0.02, -0.02, 1.46, 0.32, 0.28, 0.30, rng)
    S.window('x', 0.14, 0.0, 1.58)
    S.window('y', 0.0, 0.12, 1.58)

    # Tall hip roof crown with spire tower (z = 1.76 to 2.15)
    S.roof(-0.02, -0.02, 1.76, 0.34, 0.30, 0.28, rng, shape='hip', over=0.04)
    cone(-0.02, -0.02, 2.04, 0.10, 0.22, S.m('roof'), seg=6, name='spire')
    S.flag(-0.02, -0.02, 2.22, h=0.18)

    # Tall chimney stack on the flank with smoke
    S.chimney(-0.16, -0.14, 1.60, 0.40, rng)

    # Hanging banner and street-level props
    S.banner('y', 0.12, 0.19, 0.52, w=0.08, h=0.18)
    S.lamp(0.28, 0.30)
    S.barrel(0.28, -0.22)
    S.crate(0.28, 0.20, s=0.08, rng=rng)
    S.crate(0.33, 0.18, s=0.06, rng=rng)


RECIPES = {'house': house, 'villa': villa, 'rowhouse': rowhouse, 'manor': manor, 'cottage': cottage, 'longhouse': longhouse, 'tenement': tenement, 'highrise': highrise}
