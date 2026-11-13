# Services: school, library, academy, clinic, shrine, garden, theater, observatory, hospital, university.
import math
import kit
from kit import box, cyl, cone, sphere, poly
from style import Style  # noqa: F401


def school(S, rng):
    # Small schoolhouse with a bell tower and animated bell
    x0, y0 = -0.05, -0.04
    sx, sy = 0.52, 0.46
    S.footing(x0, y0, sx, sy, 0.1, rng)
    S.walls(x0, y0, 0.1, sx, sy, 0.38, rng, kind='main')
    S.roof(x0, y0, 0.48, sx, sy, 0.32, rng, shape='gable', along='x')

    # Front door with small porch roof and stone doorstep
    S.door('y', x0 + 0.1, y0 + sy / 2, 0.1, w=0.14, h=0.24)
    box(x0 + 0.1, y0 + sy / 2 + 0.06, 0.36, 0.22, 0.1, 0.02, S.m('roof'), 'awning')
    box(x0 + 0.1, y0 + sy / 2 + 0.03, 0.0, 0.18, 0.06, 0.02, S.m('stone_light'), 'doorstep')

    # Stepping stone pathway to the door
    for i, (px, py) in enumerate(((x0 + 0.1, y0 + sy / 2 + 0.09), (x0 + 0.1, y0 + sy / 2 + 0.16))):
        box(px, py, 0.0, 0.11, 0.08, 0.01, S.m('stone_light'), f'path_{i}')

    # Classroom windows
    S.window('y', x0 - 0.14, y0 + sy / 2, 0.22, w=0.1, h=0.14)
    S.window('x', x0 + sx / 2, y0 - 0.08, 0.22, w=0.1, h=0.14)
    S.window('x', x0 + sx / 2, y0 + 0.1, 0.22, w=0.1, h=0.14)

    # Window flowerbox under classroom window
    box(x0 - 0.14, y0 + sy / 2 + 0.02, 0.18, 0.12, 0.03, 0.03, S.m('wood_dark'), 'flowerbox')
    sphere(x0 - 0.14, y0 + sy / 2 + 0.03, 0.21, 0.025, S.m('accent'), 'flowers')

    # Belfry on the roof ridge
    bx, by, bz = x0 + 0.14, y0, 0.78
    box(bx, by, bz, 0.14, 0.14, 0.03, S.m('wood_dark'), 'belfry_floor')
    for px in (-0.05, 0.05):
        for py in (-0.05, 0.05):
            box(bx + px, by + py, bz + 0.03, 0.02, 0.02, 0.16, S.m('trim'), 'belfry_post')
    cone(bx, by, bz + 0.19, 0.11, 0.12, S.m('roof'), seg=4, name='belfry_roof').rotation_euler.z = math.radians(45)

    # Golden bell that rings (animated)
    bell = cone(bx, by, bz + 0.08, 0.04, 0.06, S.m('accent2', metal=0.7, rough=0.3), seg=8, name='bell')
    kit.anim(lambda f, n: setattr(bell, 'rotation_euler', (0.22 * math.sin(2 * math.pi * f / n), 0, 0)))

    # Warm classroom chimney (always smoking)
    S.chimney(x0 - 0.16, y0 - 0.12, 0.65, 0.28, rng, smoke='always')

    # Outdoor props: school bench, chalkboard sign, lamp, barrel, crate
    box(0.24, 0.22, 0.0, 0.08, 0.22, 0.06, S.m('wood'), 'bench')
    box(0.24, 0.22, 0.06, 0.02, 0.2, 0.08, S.m('wood_light'), 'bench_back')
    # Notice board
    box(0.32, 0.02, 0.0, 0.02, 0.02, 0.2, S.m('trim'), 'signpost')
    box(0.32, 0.02, 0.13, 0.015, 0.12, 0.09, S.m('wood_dark'), 'chalkboard')
    box(0.32, 0.02, 0.13, 0.018, 0.1, 0.07, S.m('stone_dark'), 'slate')

    S.lamp(x0 - 0.24, 0.35)
    S.barrel(0.36, -0.22)
    S.crate(0.34, -0.12, s=0.07, rng=rng)


def library(S, rng):
    # Book-filled hall with tall windows and reading area
    x0, y0 = -0.03, -0.02
    sx, sy = 0.62, 0.48
    S.footing(x0, y0, sx, sy, 0.12, rng)
    S.walls(x0, y0, 0.12, sx, sy, 0.42, rng, kind='stone')
    S.roof(x0, y0, 0.54, sx, sy, 0.34, rng, shape='gable', along='x')

    # Grand front door flanked by columns and stone steps
    S.door('y', x0 - 0.02, y0 + sy / 2, 0.12, w=0.16, h=0.28)
    box(x0 - 0.02, y0 + sy / 2 + 0.04, 0.0, 0.22, 0.08, 0.03, S.m('stone_light'), 'lib_step1')
    box(x0 - 0.02, y0 + sy / 2 + 0.09, 0.0, 0.26, 0.06, 0.015, S.m('stone'), 'lib_step2')
    cyl(x0 - 0.14, y0 + sy / 2 + 0.02, 0.12, 0.025, 0.30, S.m('stone_light'), seg=8, name='col_l')
    cyl(x0 + 0.10, y0 + sy / 2 + 0.02, 0.12, 0.025, 0.30, S.m('stone_light'), seg=8, name='col_r')
    box(x0 - 0.02, y0 + sy / 2 + 0.02, 0.42, 0.30, 0.04, 0.03, S.m('stone_light'), 'pediment')

    # Tall arched-look windows (high ceilings for tall bookcases)
    S.window('y', x0 - 0.22, y0 + sy / 2, 0.24, w=0.10, h=0.22)
    S.window('y', x0 + 0.18, y0 + sy / 2, 0.24, w=0.10, h=0.22)
    S.window('x', x0 + sx / 2, y0 - 0.12, 0.24, w=0.10, h=0.22)
    S.window('x', x0 + sx / 2, y0 + 0.10, 0.24, w=0.10, h=0.22)

    # Window flowerboxes
    box(x0 - 0.22, y0 + sy / 2 + 0.02, 0.20, 0.12, 0.03, 0.03, S.m('wood_dark'), 'wbox1')
    sphere(x0 - 0.22, y0 + sy / 2 + 0.03, 0.23, 0.025, S.m('accent2'), 'wflowers1')

    # Attic archive round window in gable
    sphere(x0 + sx / 2 + 0.01, y0, 0.66, 0.04, S.m('glow', emit=2.0), 'gable_window', squash=0.3)

    # Quiet study chimney (always smoking)
    S.chimney(x0 - 0.20, y0 - 0.14, 0.75, 0.26, rng, smoke='always')

    # Outdoor scholar desk with book stacks
    box(0.24, 0.22, 0.0, 0.14, 0.11, 0.08, S.m('wood_dark'), 'reading_desk')
    box(0.22, 0.22, 0.08, 0.08, 0.06, 0.02, S.m('accent'), 'book1')
    box(0.23, 0.21, 0.10, 0.07, 0.05, 0.018, S.m('cloth'), 'book2')
    box(0.24, 0.23, 0.118, 0.06, 0.045, 0.015, S.m('accent2'), 'book3')
    box(0.24, 0.32, 0.0, 0.12, 0.06, 0.06, S.m('wood'), 'bench')

    # Book return crate
    S.crate(0.34, -0.14, s=0.08, rng=rng)
    box(0.34, -0.14, 0.08, 0.06, 0.05, 0.02, S.m('accent'), 'return_book')

    # Knowledge banner & street lamp
    S.banner('x', x0 + sx / 2, y0 - 0.01, 0.28, w=0.10, h=0.20)
    S.lamp(x0 - 0.28, 0.34)
    S.barrel(0.36, -0.24)


def academy(S, rng):
    # Grand school with two-tier structure, central dome tower, and scholarship halls
    x0, y0 = -0.04, -0.04
    sx, sy = 0.62, 0.56
    S.footing(x0, y0, sx, sy, 0.14, rng)
    S.walls(x0, y0, 0.14, sx, sy, 0.44, rng, kind='stone')
    S.walls(x0, y0, 0.58, sx - 0.04, sy - 0.04, 0.36, rng, kind='main')
    S.roof(x0, y0, 0.94, sx - 0.04, sy - 0.04, 0.32, rng, shape='hip')

    # Central Academy dome tower
    tx, ty, tz = x0, y0, 0.94
    cyl(tx, ty, tz, 0.17, 0.42, S.m('stone_light'), seg=12, name='tower_drum')
    for k in range(4):
        ang = k * math.pi / 2
        box(tx + 0.15 * math.cos(ang), ty + 0.15 * math.sin(ang), tz + 0.16, 0.03, 0.03, 0.14, S.m('trim'), 'drum_window')
    S.roof(tx, ty, tz + 0.42, 0.36, 0.36, 0.26, rng, shape='dome')
    S.flag(tx, ty, tz + 0.68, h=0.22)

    # Entrances & Windows
    S.door('y', x0 + 0.12, y0 + sy / 2, 0.14, w=0.16, h=0.28)
    box(x0 + 0.12, y0 + sy / 2 + 0.03, 0.0, 0.22, 0.08, 0.03, S.m('stone_light'), 'acad_step1')
    box(x0 + 0.12, y0 + sy / 2 + 0.08, 0.0, 0.26, 0.06, 0.015, S.m('stone'), 'acad_step2')

    # Portico columns
    cyl(x0 + 0.02, y0 + sy / 2 + 0.02, 0.14, 0.022, 0.30, S.m('stone_light'), seg=8, name='acad_col_l')
    cyl(x0 + 0.22, y0 + sy / 2 + 0.02, 0.14, 0.022, 0.30, S.m('stone_light'), seg=8, name='acad_col_r')
    box(x0 + 0.12, y0 + sy / 2 + 0.02, 0.44, 0.24, 0.04, 0.03, S.m('stone_light'), 'acad_pediment')

    S.window('y', x0 - 0.18, y0 + sy / 2, 0.26)
    S.window('y', x0 - 0.18, y0 + sy / 2, 0.68)
    S.window('y', x0 + 0.12, y0 + sy / 2, 0.68)

    S.window('x', x0 + sx / 2, y0 - 0.16, 0.26)
    S.window('x', x0 + sx / 2, y0 + 0.08, 0.26)
    S.window('x', x0 + sx / 2 - 0.02, y0 - 0.16, 0.68)
    S.window('x', x0 + sx / 2 - 0.02, y0 + 0.08, 0.68)

    # Flanking stone planters with clipped shrubs
    cyl(x0 - 0.04, y0 + sy / 2 + 0.06, 0.0, 0.04, 0.08, S.m('stone'), seg=8, name='urn_l')
    sphere(x0 - 0.04, y0 + sy / 2 + 0.06, 0.09, 0.045, S.m('foliage'), 'urn_bush_l')

    # Bulletin board / noticeboard
    box(0.30, 0.06, 0.0, 0.02, 0.02, 0.22, S.m('trim'), 'acad_board_post')
    box(0.30, 0.06, 0.14, 0.015, 0.12, 0.09, S.m('wood_dark'), 'acad_board')
    box(0.30, 0.06, 0.14, 0.018, 0.10, 0.07, S.m('stone_light'), 'acad_paper')

    # Grand academy banner & props
    S.banner('y', x0 - 0.02, y0 + sy / 2, 0.56, w=0.12, h=0.22)
    S.lamp(x0 + 0.32, 0.32)
    S.lamp(x0 - 0.32, 0.32)
    S.crate(0.32, -0.26, rng=rng)
    S.barrel(0.38, -0.16)


def clinic(S, rng):
    # Small apothecary clinic with a fragrant herb garden and medical sign
    x0, y0 = -0.12, -0.10
    sx, sy = 0.46, 0.42
    S.footing(x0, y0, sx, sy, 0.10, rng)
    S.walls(x0, y0, 0.10, sx, sy, 0.34, rng, kind='main')
    S.roof(x0, y0, 0.44, sx, sy, 0.30, rng, shape='gable', along='y')

    # Front door on +X face leading out to herb garden
    S.door('x', x0 + sx / 2, y0 - 0.08, 0.10, w=0.14, h=0.24)
    box(x0 + sx / 2 + 0.03, y0 - 0.08, 0.0, 0.06, 0.16, 0.02, S.m('stone_light'), 'doorstep')
    # Stepping stones toward garden
    for i, (px, py) in enumerate(((x0 + sx / 2 + 0.08, y0 - 0.08), (x0 + sx / 2 + 0.14, y0 - 0.05))):
        box(px, py, 0.0, 0.07, 0.09, 0.01, S.m('stone_light'), f'step_{i}')

    S.window('x', x0 + sx / 2, y0 + 0.10, 0.22)
    S.window('y', x0, y0 + sy / 2, 0.22)

    # Window flowerbox with medicinal herbs
    box(x0 + sx / 2 + 0.02, y0 + 0.10, 0.18, 0.03, 0.12, 0.03, S.m('wood_dark'), 'wbox')
    sphere(x0 + sx / 2 + 0.03, y0 + 0.10, 0.21, 0.025, S.m('accent2'), 'wherbs')

    # Healing signpost with emblem
    spx, spy = 0.18, -0.16
    box(spx, spy, 0.0, 0.02, 0.02, 0.32, S.m('trim'), 'signpost')
    box(spx, spy, 0.20, 0.015, 0.12, 0.10, S.m('wood_light'), 'signboard')
    box(spx + 0.01, spy, 0.24, 0.018, 0.08, 0.025, S.m('accent'), 'cross_h')
    box(spx + 0.01, spy, 0.21, 0.018, 0.025, 0.08, S.m('accent'), 'cross_v')

    # Healing chimney (herbal distillations, always smoking)
    S.chimney(x0 - 0.14, y0 - 0.12, 0.64, 0.28, rng, smoke='always')

    # Enclosed herb garden in front right quadrant
    hbx, hby = 0.22, 0.16
    box(hbx, hby, 0.0, 0.34, 0.28, 0.06, S.m('stone_light'), 'herb_bed', bevel=0.01)
    box(hbx, hby, 0.04, 0.30, 0.24, 0.02, S.m('dirt'), 'herb_soil')

    # Varied herbal plants
    cone(hbx - 0.08, hby - 0.06, 0.06, 0.04, 0.08, S.m('crop2'), seg=6, name='herb1')
    cone(hbx + 0.08, hby - 0.05, 0.06, 0.035, 0.07, S.m('foliage'), seg=6, name='herb2')
    cone(hbx - 0.04, hby + 0.06, 0.06, 0.045, 0.09, S.m('foliage2'), seg=6, name='herb3')
    cone(hbx + 0.08, hby + 0.06, 0.06, 0.03, 0.06, S.m('accent2'), seg=6, name='herb_flower')
    sphere(hbx + 0.02, hby, 0.09, 0.035, S.m('accent'), 'flower_cluster')

    # Apothecary bench with mortar & pestle
    box(x0 + sx / 2 + 0.02, y0 + 0.14, 0.0, 0.06, 0.12, 0.07, S.m('wood_dark'), 'apoth_bench')
    cyl(x0 + sx / 2 + 0.02, y0 + 0.14, 0.07, 0.018, 0.025, S.m('stone_light'), seg=6, name='mortar')

    # Water barrel for watering herbs & crate with remedies
    S.barrel(0.36, -0.04, r=0.05, h=0.10)
    S.crate(0.36, -0.14, s=0.07, rng=rng)
    S.lamp(-0.36, 0.24)


def shrine(S, rng):
    # Small open sacred shrine with altar, candles (via S.fire), and offerings
    x0, y0 = 0.0, 0.0
    # Two-tiered stone plinth (tight to columns)
    box(x0, y0, 0.0, 0.44, 0.44, 0.06, S.m('stone'), 'plinth1', bevel=0.01)
    box(x0, y0, 0.06, 0.38, 0.38, 0.06, S.m('stone_light'), 'plinth2', bevel=0.01)

    # Four open corner stone pillars supporting the sacred canopy
    posts = ((0.13, 0.13), (0.13, -0.13), (-0.13, 0.13), (-0.13, -0.13))
    for px, py in posts:
        cyl(x0 + px, y0 + py, 0.12, 0.03, 0.46, S.m('stone_light'), seg=8, name='shrine_col')
    # Canopy entablature
    box(x0, y0, 0.58, 0.40, 0.40, 0.04, S.m('trim'), 'entablature')
    # Pyramidal roof with finial
    cone(x0, y0, 0.62, 0.29, 0.28, S.m('roof'), seg=4, name='shrine_roof').rotation_euler.z = math.radians(45)
    cone(x0, y0, 0.90, 0.035, 0.08, S.m('accent2', metal=0.6), seg=8, name='finial')

    # Central stone altar
    box(x0, y0, 0.12, 0.18, 0.16, 0.16, S.m('stone_dark'), 'altar')
    # Sacred relic on the altar
    sphere(x0, y0, 0.32, 0.04, S.m('emblem'), 'relic', squash=0.85)

    # Candles on the altar with flickering flame
    cyl(x0 - 0.06, y0 + 0.04, 0.28, 0.012, 0.04, S.m('stone_light'), seg=6, name='candle1')
    S.fire(x0 - 0.06, y0 + 0.04, 0.32, s=0.5)
    cyl(x0 + 0.06, y0 + 0.04, 0.28, 0.012, 0.04, S.m('stone_light'), seg=6, name='candle2')
    S.fire(x0 + 0.06, y0 + 0.04, 0.32, s=0.5)

    # Incense censer rising smoke
    cyl(x0, y0 - 0.04, 0.28, 0.025, 0.03, S.m('metal'), seg=8, name='censer')
    S.smoke(x0, y0 - 0.04, 0.34)

    # Flanking ceremonial braziers
    for bx, by in ((0.24, 0.24), (-0.24, 0.24)):
        cyl(bx, by, 0.0, 0.04, 0.14, S.m('stone'), seg=8, name='brazier')
        S.fire(bx, by, 0.14, s=0.6)

    # Waving sacred prayer banner
    S.banner('x', 0.22, -0.04, 0.18, w=0.09, h=0.20)

    # Offering sacks & quiet stone bench
    S.sack(-0.28, -0.16)
    S.sack(-0.33, -0.08)
    box(0.24, -0.22, 0.0, 0.08, 0.18, 0.06, S.m('stone_light'), 'stone_bench')
    S.lamp(0.36, 0.34)


def garden(S, rng):
    # Formal ornamental garden with cross paths, clipped hedges, flowers, fountain jet, and benches
    # Geometric paved cross paths (tight paths, no giant ground plate)
    box(0.0, 0.0, 0.0, 0.80, 0.16, 0.012, S.m('stone_light'), 'path_x')
    box(0.0, 0.0, 0.0, 0.16, 0.80, 0.012, S.m('stone_light'), 'path_y')

    # Central stone birdbath / reflection pool with bubbling spout
    cyl(0.0, 0.0, 0.012, 0.09, 0.12, S.m('stone'), seg=10, name='pedestal')
    cyl(0.0, 0.0, 0.13, 0.14, 0.04, S.m('stone_dark'), seg=10, name='basin')
    S.water(0.0, 0.0, 0.165, 0.18, 0.18)
    spout = cone(0.0, 0.0, 0.17, 0.025, 0.07, S.m('water'), seg=6, name='water_jet')
    kit.anim(lambda f, n: setattr(spout, 'scale', (1, 1, (1.0, 1.35, 0.85)[f % 3])))

    # Hovering butterfly over the blooms
    flutter = sphere(0.18, 0.18, 0.22, 0.018, S.m('glow', emit=4.0), 'garden_butterfly')
    kit.anim(lambda f, n: setattr(flutter, 'location', (
        0.18 + 0.07 * math.sin(2 * math.pi * f / n),
        0.18 + 0.07 * math.cos(2 * math.pi * f / n),
        0.22 + 0.03 * math.sin(4 * math.pi * f / n)
    )))

    # Quadrant 1 (+X, +Y): Topiary & flower bed
    box(0.26, 0.26, 0.0, 0.28, 0.28, 0.04, S.m('dirt'), 'soil1')
    box(0.26, 0.38, 0.0, 0.28, 0.06, 0.12, S.m('foliage_dark'), 'hedge1a', bevel=0.01)
    box(0.38, 0.26, 0.0, 0.06, 0.28, 0.12, S.m('foliage_dark'), 'hedge1b', bevel=0.01)
    for dx, dy in ((-0.06, -0.06), (0.06, -0.06), (0.0, 0.04)):
        sphere(0.26 + dx, 0.26 + dy, 0.08, 0.04, S.m('accent'), 'flower_r')
        cone(0.26 + dx, 0.26 + dy, 0.04, 0.03, 0.05, S.m('foliage2'), seg=6, name='stem')

    # Quadrant 2 (-X, +Y): Topiary sphere & yellow flowers
    box(-0.26, 0.26, 0.0, 0.28, 0.28, 0.04, S.m('dirt'), 'soil2')
    box(-0.26, 0.38, 0.0, 0.28, 0.06, 0.12, S.m('foliage_dark'), 'hedge2a', bevel=0.01)
    box(-0.38, 0.26, 0.0, 0.06, 0.28, 0.12, S.m('foliage_dark'), 'hedge2b', bevel=0.01)
    sphere(-0.26, 0.26, 0.14, 0.09, S.m('foliage'), 'topiary_ball')
    cyl(-0.26, 0.26, 0.04, 0.025, 0.08, S.m('trunk'), seg=6, name='topiary_trunk')

    # Quadrant 3 (+X, -Y): Rose/accent2 flowerbed
    box(0.26, -0.26, 0.0, 0.28, 0.28, 0.04, S.m('dirt'), 'soil3')
    box(0.26, -0.38, 0.0, 0.28, 0.06, 0.12, S.m('foliage_dark'), 'hedge3a', bevel=0.01)
    box(0.38, -0.26, 0.0, 0.06, 0.28, 0.12, S.m('foliage_dark'), 'hedge3b', bevel=0.01)
    for dx, dy in ((-0.05, 0.05), (0.05, 0.05), (-0.02, -0.05)):
        sphere(0.26 + dx, -0.26 + dy, 0.08, 0.04, S.m('accent2'), 'flower_y')

    # Quadrant 4 (-X, -Y): Clipped hedge corner
    box(-0.26, -0.26, 0.0, 0.28, 0.28, 0.04, S.m('dirt'), 'soil4')
    box(-0.26, -0.38, 0.0, 0.28, 0.06, 0.12, S.m('foliage_dark'), 'hedge4a', bevel=0.01)
    box(-0.38, -0.26, 0.0, 0.06, 0.28, 0.12, S.m('foliage_dark'), 'hedge4b', bevel=0.01)
    sphere(-0.26, -0.26, 0.12, 0.08, S.m('foliage2'), 'shrub4')

    # Garden benches along the gravel paths
    box(0.18, 0.0, 0.01, 0.07, 0.18, 0.06, S.m('wood'), 'bench_e')
    box(0.21, 0.0, 0.07, 0.02, 0.18, 0.07, S.m('wood_dark'), 'bench_e_back')
    box(0.0, 0.18, 0.01, 0.18, 0.07, 0.06, S.m('wood'), 'bench_n')
    box(0.0, 0.21, 0.07, 0.18, 0.02, 0.07, S.m('wood_dark'), 'bench_n_back')

    # Corner lamps
    S.lamp(0.38, 0.38)
    S.lamp(-0.38, 0.38)


def theater(S, rng):
    # Round/semi-round stage with backstage house, rich curtains, banners, and audience seating
    # Raised semi-round wooden performance stage
    cyl(-0.05, -0.05, 0.0, 0.35, 0.12, S.m('stone'), seg=12, name='stage_base')
    cyl(-0.05, -0.05, 0.12, 0.37, 0.03, S.m('wood_light'), seg=12, name='stage_deck')

    # Backstage scenery building (holds scenery, dressing rooms)
    bx, by = -0.14, -0.14
    S.footing(bx, by, 0.42, 0.42, 0.12, rng)
    S.walls(bx, by, 0.12, 0.42, 0.42, 0.56, rng, kind='stone')
    S.roof(bx, by, 0.68, 0.42, 0.42, 0.36, rng, shape='gable', along='x')
    S.door('x', bx + 0.21, by - 0.08, 0.12, w=0.12, h=0.22)
    box(bx + 0.24, by - 0.08, 0.0, 0.06, 0.14, 0.02, S.m('stone_light'), 'stage_step')
    S.window('y', bx - 0.10, by + 0.21, 0.26, w=0.09, h=0.12)
    S.flag(bx, by, 1.04, h=0.26)

    # Dressing room chimney (always smoking)
    S.chimney(bx - 0.12, by - 0.12, 0.82, 0.28, rng, smoke='always')

    # Proscenium arch framing stage: columns and architrave
    cyl(0.08, -0.22, 0.15, 0.035, 0.50, S.m('trim'), seg=8, name='proscenium_l')
    cyl(-0.22, 0.08, 0.15, 0.035, 0.50, S.m('trim'), seg=8, name='proscenium_r')
    box(-0.07, -0.07, 0.65, 0.34, 0.34, 0.04, S.m('accent'), 'proscenium_header')

    # Theater curtains: draped side pillars & valance
    cyl(0.07, -0.18, 0.15, 0.035, 0.46, S.m('accent'), seg=8, name='curtain_l')
    cyl(-0.18, 0.07, 0.15, 0.035, 0.46, S.m('accent'), seg=8, name='curtain_r')
    box(-0.07, -0.07, 0.58, 0.28, 0.28, 0.06, S.m('accent'), 'curtain_valance')

    # Stage footlights (glowing lanterns along the stage curve)
    for k in range(4):
        ang = math.radians(10 + k * 24)
        fx = -0.05 + 0.33 * math.cos(ang)
        fy = -0.05 + 0.33 * math.sin(ang)
        cyl(fx, fy, 0.15, 0.018, 0.025, S.m('glow', emit=4), seg=6, name=f'footlight_{k}')

    # Festal stage banners
    S.banner('x', 0.10, -0.10, 0.40, w=0.10, h=0.22)
    S.banner('y', -0.10, 0.10, 0.40, w=0.10, h=0.22)

    # Semi-circular spectator benches in front
    for k in range(3):
        ang = math.radians(20 + k * 25)
        sx = 0.21 * math.cos(ang)
        sy = 0.21 * math.sin(ang)
        box(sx, sy, 0.0, 0.08, 0.14, 0.06, S.m('wood'), f'seat_{k}').rotation_euler.z = -ang

    # Playbill notice board
    box(0.24, -0.26, 0.0, 0.02, 0.02, 0.22, S.m('trim'), 'playbill_post')
    box(0.24, -0.26, 0.13, 0.015, 0.11, 0.08, S.m('wood_dark'), 'playbill_board')
    box(0.24, -0.26, 0.13, 0.018, 0.09, 0.06, S.m('stone_light'), 'playbill_paper')

    # Props: costume crates and barrel
    S.crate(0.32, -0.18, rng=rng)
    S.barrel(0.36, -0.06)
    S.lamp(0.34, 0.34)


def observatory(S, rng):
    # Tall cylindrical stone tower with an observation gallery and dome with telescope slit
    x0, y0 = -0.04, -0.04
    S.footing(x0, y0, 0.54, 0.54, 0.14, rng)

    # Main circular stone tower
    cyl(x0, y0, 0.14, 0.25, 0.90, S.m('stone'), seg=12, name='tower_body')
    # Decorative architectural stone rings
    cyl(x0, y0, 0.48, 0.265, 0.04, S.m('stone_light'), seg=12, name='ring1')
    cyl(x0, y0, 0.82, 0.265, 0.04, S.m('stone_light'), seg=12, name='ring2')

    # Upper observation gallery & balustrade
    cyl(x0, y0, 1.04, 0.28, 0.06, S.m('stone_dark'), seg=12, name='gallery_floor')
    for k in range(8):
        ang = k * math.pi / 4
        box(x0 + 0.26 * math.cos(ang), y0 + 0.26 * math.sin(ang), 1.10, 0.03, 0.03, 0.08, S.m('trim'), 'rail_post')
    # Dome drum
    cyl(x0, y0, 1.10, 0.22, 0.14, S.m('wall'), seg=12, name='dome_drum')

    # Observatory rotating dome with telescope opening
    sphere(x0, y0, 1.44, 0.23, S.m('roof'), 'obs_dome', squash=0.85)
    # Slit cut-out and sliding metal shutters
    box(x0, y0, 1.36, 0.07, 0.44, 0.14, S.m('stone_dark'), 'dome_slit')
    box(x0 + 0.045, y0, 1.37, 0.015, 0.42, 0.15, S.m('metal'), 'shutter_r')
    box(x0 - 0.045, y0, 1.37, 0.015, 0.42, 0.15, S.m('metal'), 'shutter_l')

    # Brass telescope tube protruding through slit
    tele = cyl(x0 + 0.06, y0 + 0.06, 1.38, 0.032, 0.32, S.m('accent2', metal=0.75, rough=0.25), seg=8, name='telescope')
    tele.rotation_euler = (math.radians(-32), math.radians(28), 0)
    lens = cyl(x0 + 0.14, y0 + 0.14, 1.50, 0.038, 0.03, S.m('metal'), seg=8, name='lens_ring')
    lens.rotation_euler = (math.radians(-32), math.radians(28), 0)
    sparkle = sphere(x0 + 0.15, y0 + 0.15, 1.52, 0.02, S.m('glow', emit=4.0), 'lens_sparkle')
    kit.anim(lambda f, n: setattr(sparkle, 'scale', ((1.0, 1.35, 0.75)[f % 3],) * 3))
    S.flag(x0, y0, 1.67, h=0.20)

    # Entrance door & stone steps
    S.door('x', x0 + 0.21, y0, 0.14, w=0.14, h=0.24)
    box(x0 + 0.24, y0, 0.0, 0.06, 0.16, 0.03, S.m('stone_light'), 'obs_step1')
    box(x0 + 0.28, y0, 0.0, 0.05, 0.18, 0.015, S.m('stone'), 'obs_step2')

    # Tower slit windows
    S.window('y', x0, y0 + 0.21, 0.32, w=0.08, h=0.14)
    S.window('y', x0, y0 + 0.21, 0.65, w=0.08, h=0.14)
    S.window('x', x0 + 0.21, y0, 0.65, w=0.08, h=0.14)

    # Outdoor star-chart lectern & armillary globe
    box(0.24, 0.22, 0.0, 0.14, 0.10, 0.08, S.m('wood_dark'), 'chart_desk')
    cyl(0.24, 0.22, 0.08, 0.015, 0.04, S.m('metal'), seg=6, name='globe_stem')
    sphere(0.24, 0.22, 0.15, 0.035, S.m('emblem'), 'celestial_globe')
    box(0.24, 0.33, 0.0, 0.08, 0.14, 0.06, S.m('wood'), 'chart_bench')

    # Exterior sundial / quadrant pedestal
    cyl(0.26, -0.18, 0.0, 0.035, 0.12, S.m('stone'), seg=6, name='sundial_ped')
    box(0.26, -0.18, 0.12, 0.07, 0.07, 0.015, S.m('accent2', metal=0.7), 'sundial_plate')

    S.banner('y', x0, y0 + 0.24, 0.88, w=0.09, h=0.18)
    S.lamp(0.36, 0.34)
    S.crate(0.34, -0.22, rng=rng)
    S.barrel(0.36, -0.08)


def hospital(S, rng):
    # Large sanitarium complex with central pavilion, multiple patient wings, and medicine stores
    # Central administrative & surgery block
    cx, cy = -0.06, -0.06
    S.footing(cx, cy, 0.42, 0.42, 0.12, rng)
    S.walls(cx, cy, 0.12, 0.42, 0.42, 0.58, rng, kind='stone')
    S.roof(cx, cy, 0.70, 0.42, 0.42, 0.32, rng, shape='hip')

    # Ventilation cupola & healing emblem + medical flag
    cyl(cx, cy, 1.02, 0.08, 0.16, S.m('stone_light'), seg=8, name='hosp_cupola')
    cone(cx, cy, 1.18, 0.10, 0.14, S.m('roof'), seg=8, name='cupola_roof')
    box(cx, cy, 1.32, 0.015, 0.06, 0.08, S.m('accent'), 'red_cross_v')
    box(cx, cy, 1.34, 0.015, 0.08, 0.025, S.m('accent'), 'red_cross_h')
    S.flag(cx, cy, 1.32, h=0.22)

    # East Wing (+X convalescent ward)
    ex, ey = 0.16, -0.08
    S.footing(ex, ey, 0.28, 0.38, 0.12, rng)
    S.walls(ex, ey, 0.12, 0.28, 0.38, 0.42, rng, kind='main')
    S.roof(ex, ey, 0.54, 0.28, 0.38, 0.26, rng, shape='gable', along='x')

    # North Wing (+Y recovery ward)
    nx, ny = -0.08, 0.16
    S.footing(nx, ny, 0.38, 0.28, 0.12, rng)
    S.walls(nx, ny, 0.12, 0.38, 0.28, 0.42, rng, kind='main')
    S.roof(nx, ny, 0.54, 0.38, 0.28, 0.26, rng, shape='gable', along='y')

    # Main reception door in sheltered inner angle with porch canopy & steps
    S.door('y', cx, cy + 0.21, 0.12, w=0.16, h=0.26)
    box(cx, cy + 0.21 + 0.04, 0.40, 0.20, 0.08, 0.02, S.m('roof'), 'entry_canopy')
    box(cx, cy + 0.21 + 0.03, 0.0, 0.18, 0.07, 0.02, S.m('stone_light'), 'hosp_step')

    # Ward windows (many windows across wings)
    S.window('x', ex + 0.14, ey - 0.10, 0.22)
    S.window('x', ex + 0.14, ey + 0.08, 0.22)
    S.window('y', ex, ey + 0.19, 0.22)
    S.window('y', nx - 0.10, ny + 0.14, 0.22)
    S.window('y', nx + 0.08, ny + 0.14, 0.22)
    S.window('x', nx + 0.19, ny, 0.22)
    # Upper central windows
    S.window('y', cx, cy + 0.21, 0.48)
    S.window('x', cx + 0.21, cy, 0.48)

    # Window flowerboxes with medicinal plants
    box(ex + 0.14, ey - 0.10, 0.18, 0.03, 0.12, 0.03, S.m('wood_dark'), 'wbox_e')
    sphere(ex + 0.15, ey - 0.10, 0.21, 0.025, S.m('accent2'), 'wplants_e')

    # Ward heating chimneys (always smoking)
    S.chimney(cx - 0.14, cy - 0.14, 0.76, 0.32, rng, smoke='always')

    # Courtyard recovery cot & medicinal supply crates
    box(0.24, 0.22, 0.0, 0.16, 0.08, 0.05, S.m('wood'), 'cot_legs')
    box(0.24, 0.22, 0.05, 0.15, 0.07, 0.03, S.m('cloth'), 'cot_mattress')
    box(0.24, 0.28, 0.08, 0.04, 0.06, 0.02, S.m('cloth'), 'cot_pillow')
    box(0.32, 0.22, 0.0, 0.06, 0.06, 0.07, S.m('wood_dark'), 'nightstand')
    cyl(0.32, 0.22, 0.07, 0.015, 0.03, S.m('stone_light'), seg=6, name='medicine_cup')

    S.barrel(0.34, 0.08)
    S.crate(0.08, 0.34, rng=rng)
    S.lamp(0.36, 0.36)
    S.banner('x', ex + 0.14, ey + 0.08, 0.24, w=0.09, h=0.18)


def university(S, rng):
    # Largest service building: cloistered courtyard, academic wings, grand clock/bell tower
    # Main faculty grand hall (North-West rear block, centered safely within |x|,|y| <= 0.45)
    hx, hy = -0.07, -0.07
    S.footing(hx, hy, 0.54, 0.44, 0.14, rng)
    S.walls(hx, hy, 0.14, 0.54, 0.44, 0.48, rng, kind='stone')
    S.roof(hx, hy, 0.62, 0.54, 0.44, 0.36, rng, shape='hip')

    # Faculty hall heating chimney (always smoking)
    S.chimney(hx - 0.14, hy - 0.10, 0.78, 0.30, rng, smoke='always')

    # East Wing (+X library hall)
    ex, ey = 0.17, -0.14
    S.footing(ex, ey, 0.26, 0.32, 0.14, rng)
    S.walls(ex, ey, 0.14, 0.26, 0.32, 0.40, rng, kind='main')
    S.roof(ex, ey, 0.54, 0.26, 0.32, 0.26, rng, shape='gable', along='x')

    # North Wing (+Y amphitheater hall)
    nx, ny = -0.14, 0.17
    S.footing(nx, ny, 0.32, 0.26, 0.14, rng)
    S.walls(nx, ny, 0.14, 0.32, 0.26, 0.40, rng, kind='main')
    S.roof(nx, ny, 0.54, 0.32, 0.26, 0.26, rng, shape='gable', along='y')

    # Tall University Clock & Bell Tower (at corner of courtyard)
    tx, ty = -0.06, -0.06
    S.walls(tx, ty, 0.62, 0.26, 0.26, 0.70, rng, kind='stone')
    box(tx, ty, 1.32, 0.28, 0.28, 0.22, S.m('stone_light'), 'tower_deck', bevel=0.01)
    # Clock faces
    sphere(tx + 0.145, ty, 1.43, 0.045, S.m('glow', emit=1.6), 'clock_x', squash=0.2)
    sphere(tx, ty + 0.145, 1.43, 0.045, S.m('glow', emit=1.6), 'clock_y', squash=0.2)
    # Spire and waving university banner
    cone(tx, ty, 1.54, 0.18, 0.44, S.m('roof'), seg=8, name='uni_spire')
    S.flag(tx, ty, 1.98, h=0.24)

    # Cloistered courtyard paving
    box(0.16, 0.16, 0.0, 0.32, 0.32, 0.015, S.m('stone_light'), 'quad_pave')
    # Cloister columns along walk
    for k in range(3):
        cyl(0.04 + k * 0.10, 0.12, 0.015, 0.02, 0.22, S.m('trim'), seg=6, name=f'col_n_{k}')
        cyl(0.12, 0.04 + k * 0.10, 0.015, 0.02, 0.22, S.m('trim'), seg=6, name=f'col_e_{k}')
    box(0.14, 0.12, 0.235, 0.22, 0.04, 0.02, S.m('stone'), 'architrave_n')
    box(0.12, 0.14, 0.235, 0.04, 0.22, 0.02, S.m('stone'), 'architrave_e')

    # Quadrangle ancient tree
    S.tree(0.24, 0.24, 0.015, s=0.72, rng=rng)

    # Entrance portals & stone steps
    S.door('y', -0.04, 0.12, 0.14, w=0.16, h=0.26)
    box(-0.04, 0.15, 0.0, 0.18, 0.06, 0.02, S.m('stone_light'), 'uni_step1')
    S.door('x', 0.12, -0.04, 0.14, w=0.16, h=0.26)
    box(0.15, -0.04, 0.0, 0.06, 0.18, 0.02, S.m('stone_light'), 'uni_step2')

    # Mullioned windows
    S.window('x', ex + 0.13, ey, 0.24)
    S.window('y', nx, ny + 0.13, 0.24)
    S.window('x', ex + 0.13, ey, 0.46)
    S.window('y', nx, ny + 0.13, 0.46)

    # Dignified banners, bench, and lanterns
    S.banner('x', ex + 0.13, ey + 0.08, 0.24, w=0.10, h=0.22)
    S.banner('y', nx + 0.08, ny + 0.13, 0.24, w=0.10, h=0.22)
    box(0.33, 0.02, 0.0, 0.08, 0.18, 0.06, S.m('wood'), 'quad_bench')
    S.lamp(0.36, 0.36)
    S.lamp(-0.33, 0.33)


RECIPES = {
    'school': school,
    'library': library,
    'academy': academy,
    'clinic': clinic,
    'shrine': shrine,
    'garden': garden,
    'theater': theater,
    'observatory': observatory,
    'hospital': hospital,
    'university': university,
}
