# Services: school, library, academy, clinic, shrine, garden, theater, observatory, hospital, university.
import math
import kit
from kit import box, cyl, cone, sphere, poly
from style import Style  # noqa: F401


def school(S, rng):
    # Sim height: 1.3. Wide one-storey classroom hall along X + tall open bell tower + fenced yard with easel slate board & small tree. No chimney.
    hx, hy = -0.09, -0.18
    sx, sy = 0.60, 0.28
    S.footing(hx, hy, sx, sy, 0.08, rng)
    S.walls(hx, hy, 0.08, sx, sy, 0.26, rng, kind='main')
    S.roof(hx, hy, 0.34, sx, sy, 0.17, rng, shape='hip', over=0.04)

    # Hall entrance door & classroom windows on +Y face opening into the yard
    S.door('y', 0.00, hy + sy / 2, 0.08, w=0.13, h=0.22)
    box(0.00, hy + sy / 2 + 0.04, 0.0, 0.16, 0.08, 0.02, S.m('stone_light'), 'doorstep')
    box(0.00, hy + sy / 2 + 0.04, 0.31, 0.18, 0.09, 0.02, S.m('roof'), 'awning')
    for wx in (-0.30, -0.15):
        S.window('y', wx, hy + sy / 2, 0.15, w=0.09, h=0.13)

    # Tall open BELL TOWER at the +X end of the hall (top ~1.21 for sim height 1.3)
    bx, by = 0.24, -0.16
    bsx, bsy = 0.25, 0.25
    S.footing(bx, by, bsx, bsy, 0.10, rng)
    S.walls(bx, by, 0.10, bsx, bsy, 0.52, rng, kind='stone')
    S.window('x', bx + bsx / 2, by, 0.34, w=0.08, h=0.14)
    S.banner('x', bx + bsx / 2, by, 0.14, w=0.08, h=0.16)

    # Open belfry stage (z=0.62..0.96) with 4 slim corner posts so the bell is unobstructed
    box(bx, by, 0.62, 0.28, 0.28, 0.04, S.m('stone_light'), 'belfry_deck', bevel=0.008)
    for px in (-0.105, 0.105):
        for py in (-0.105, 0.105):
            box(bx + px, by + py, 0.66, 0.020, 0.020, 0.30, S.m('trim'), 'belfry_post')
    box(bx, by, 0.96, 0.27, 0.27, 0.035, S.m('trim'), 'belfry_top')
    S.roof(bx, by, 0.995, 0.24, 0.24, 0.22, rng, shape='spire', over=0.04)

    # Yoke and large visible swinging bell inside the open belfry
    box(bx, by, 0.92, 0.20, 0.025, 0.025, S.m('wood_dark'), 'bell_yoke')
    bell = cone(bx, by, 0.72, 0.08, 0.15, S.m('accent2', metal=0.8, rough=0.2), seg=10, name='bell')
    clapper = sphere(bx, by, 0.70, 0.026, S.m('glow', emit=2.0), 'bell_clapper')

    def swing_bell(f, n):
        # Swing across screen diagonal (+X,-Y) so silhouette shift is maximal in isometric view
        ang = (-0.38, 0.45, -0.05)[f % 3]
        dx = 0.10 * math.sin(ang)
        dz = 0.90 - 0.10 * math.cos(ang)
        bell.location = (bx + dx, by - dx, dz)
        bell.rotation_euler = (ang * 0.7, ang * 0.7, 0)
        cdx = 0.16 * math.sin(ang)
        cdz = 0.90 - 0.16 * math.cos(ang)
        clapper.location = (bx + cdx, by - cdx, cdz)

    kit.anim(swing_bell)

    # Fenced front schoolyard with front-left gateway
    S.fence([(0.36, -0.04), (0.36, 0.16)], rng, h=0.09)
    S.fence([(0.36, 0.32), (0.04, 0.36), (-0.34, 0.36), (-0.34, -0.04)], rng, h=0.09)

    # Slate board on a tripod easel in the yard (angled toward camera (+X, +Y))
    ex, ey = 0.04, 0.14
    ang_e = math.radians(45)
    for lx, ly in ((0.05, -0.05), (-0.05, 0.05), (-0.05, -0.05)):
        leg = box(0, 0, 0, 0.02, 0.02, 0.25, S.m('wood'), 'easel_leg')
        leg.location = (ex + lx, ey + ly, 0.0)
        leg.rotation_euler.z = ang_e
    frame = box(0, 0, 0, 0.025, 0.20, 0.15, S.m('wood_dark'), 'easel_frame')
    frame.location = (ex, ey, 0.10)
    frame.rotation_euler.z = ang_e
    slate = box(0, 0, 0, 0.018, 0.17, 0.12, S.m('stone_dark'), 'easel_slate')
    slate.location = (ex + 0.01, ey + 0.01, 0.115)
    slate.rotation_euler.z = ang_e
    chalk1 = box(0, 0, 0, 0.012, 0.11, 0.014, S.m('emblem'), 'chalk_line1')
    chalk1.location = (ex + 0.016, ey + 0.016, 0.18)
    chalk1.rotation_euler.z = ang_e
    chalk2 = box(0, 0, 0, 0.012, 0.08, 0.012, S.m('accent2'), 'chalk_line2')
    chalk2.location = (ex + 0.016, ey + 0.016, 0.145)
    chalk2.rotation_euler.z = ang_e

    # Student bench facing the easel
    bench = box(0, 0, 0, 0.06, 0.18, 0.05, S.m('wood_light'), 'student_bench')
    bench.location = (0.16, 0.26, 0.0)
    bench.rotation_euler.z = ang_e

    # Small tree in the yard + props
    S.tree(-0.24, 0.22, 0.0, s=0.68, rng=rng)
    S.lamp(0.36, 0.18)
    S.crate(-0.12, 0.02, s=0.065, rng=rng)


def library(S, rng):
    # Sim height: 1.0. Tall narrow stone hall with big round-arched window on each visible face,
    # small roof dome/lantern, book-stack sign, scroll racks by the door, reading bench, waving banners. No chimney.
    x0, y0 = -0.08, -0.06
    sx, sy = 0.36, 0.48
    S.footing(x0, y0, sx, sy, 0.12, rng)
    S.walls(x0, y0, 0.12, sx, sy, 0.50, rng, kind='stone')
    S.roof(x0, y0, 0.62, sx, sy, 0.15, rng, shape='hip', over=0.04)

    # Small roof lantern & dome on top of the hall (top ~0.98 for sim height 1.0)
    cyl(x0, y0, 0.72, 0.11, 0.13, S.m('stone_light'), seg=8, name='lantern_drum')
    cyl(x0, y0, 0.84, 0.125, 0.02, S.m('trim'), seg=8, name='lantern_cornice')
    for k in range(4):
        ang = k * math.pi / 2 + math.pi / 4
        lx, ly = x0 + 0.102 * math.cos(ang), y0 + 0.102 * math.sin(ang)
        w = box(0, 0, 0, 0.022, 0.045, 0.065, S.m('glow', emit=3.0), f'noink_lantern_win_{k}')
        w.location = (lx, ly, 0.75)
        w.rotation_euler.z = ang
    S.roof(x0, y0, 0.85, 0.21, 0.21, 0.10, rng, shape='dome', over=0.01)
    cone(x0, y0, 0.95, 0.022, 0.05, S.m('accent2', metal=0.6), seg=6, name='lantern_finial')

    x_face = x0 + sx / 2
    y_face = y0 + sy / 2

    # Big round-arched window on +X face (left side of +X wall)
    wy_x = -0.15
    box(x_face + 0.012, wy_x, 0.22, 0.022, 0.16, 0.17, S.m('trim'), 'arch_frame_x')
    box(x_face + 0.022, wy_x, 0.23, 0.012, 0.13, 0.16, S.m('glow', emit=2.6), 'noink_arch_pane_x')
    af_x = cyl(0, 0, 0, 0.08, 0.022, S.m('trim'), seg=16, name='arch_top_frame_x')
    af_x.location = (x_face + 0.012, wy_x, 0.39)
    af_x.rotation_euler = (0, math.pi / 2, 0)
    ap_x = cyl(0, 0, 0, 0.065, 0.012, S.m('glow', emit=2.6), seg=16, name='noink_arch_top_pane_x')
    ap_x.location = (x_face + 0.022, wy_x, 0.39)
    ap_x.rotation_euler = (0, math.pi / 2, 0)
    box(x_face + 0.028, wy_x, 0.23, 0.010, 0.012, 0.22, S.m('trim'), 'mullion_vx')
    box(x_face + 0.028, wy_x, 0.38, 0.010, 0.13, 0.012, S.m('trim'), 'mullion_hx')

    # Big round-arched window on +Y face (centered on +Y wall)
    wx_y = -0.06
    box(wx_y, y_face + 0.012, 0.22, 0.16, 0.022, 0.17, S.m('trim'), 'arch_frame_y')
    box(wx_y, y_face + 0.022, 0.23, 0.13, 0.012, 0.16, S.m('glow', emit=2.6), 'noink_arch_pane_y')
    af_y = cyl(0, 0, 0, 0.08, 0.022, S.m('trim'), seg=16, name='arch_top_frame_y')
    af_y.location = (wx_y, y_face + 0.012, 0.39)
    af_y.rotation_euler = (math.pi / 2, 0, 0)
    ap_y = cyl(0, 0, 0, 0.065, 0.012, S.m('glow', emit=2.6), seg=16, name='noink_arch_top_pane_y')
    ap_y.location = (wx_y, y_face + 0.022, 0.39)
    ap_y.rotation_euler = (math.pi / 2, 0, 0)
    box(wx_y, y_face + 0.028, 0.23, 0.012, 0.010, 0.22, S.m('trim'), 'mullion_vy')
    box(wx_y, y_face + 0.028, 0.38, 0.13, 0.010, 0.012, S.m('trim'), 'mullion_hy')

    # Entrance door on +X face (right side) with stone steps
    dy = 0.07
    S.door('x', x_face, dy, 0.12, w=0.13, h=0.24)
    box(x_face + 0.04, dy, 0.0, 0.08, 0.17, 0.06, S.m('stone_light'), 'lib_step1')
    box(x_face + 0.09, dy, 0.0, 0.06, 0.19, 0.03, S.m('stone'), 'lib_step2')

    # Scroll racks by the door (wooden cubby rack with protruding rolled parchment scrolls)
    rx, ry = x_face + 0.04, -0.03
    box(rx, ry, 0.12, 0.06, 0.09, 0.19, S.m('wood_dark'), 'scroll_rack')
    for sz in (0.16, 0.21, 0.26):
        for sy_off in (-0.022, 0.022):
            sc = cyl(0, 0, 0, 0.013, 0.075, S.m('emblem'), seg=6, name='scroll_roll')
            sc.location = (rx + 0.015, ry + sy_off, sz)
            sc.rotation_euler = (0, math.pi / 2, 0)

    # Book-stack sign in front-left forecourt (pedestal + 3 oversized stacked books)
    bx, by = 0.26, -0.18
    box(bx, by, 0.0, 0.13, 0.13, 0.14, S.m('stone_light'), 'book_sign_ped', bevel=0.01)
    box(bx, by, 0.14, 0.19, 0.15, 0.05, S.m('accent'), 'book_sign_1', bevel=0.005)
    box(bx + 0.01, by + 0.01, 0.148, 0.17, 0.13, 0.034, S.m('emblem'), 'book_pages_1')
    b2 = box(0, 0, 0, 0.17, 0.13, 0.048, S.m('cloth'), 'book_sign_2', bevel=0.005)
    b2.location = (bx, by, 0.19)
    b2.rotation_euler.z = 0.30
    p2 = box(0, 0, 0, 0.15, 0.11, 0.032, S.m('emblem'), 'book_pages_2')
    p2.location = (bx + 0.008, by + 0.008, 0.198)
    p2.rotation_euler.z = 0.30
    b3 = box(0, 0, 0, 0.15, 0.11, 0.045, S.m('accent2'), 'book_sign_3', bevel=0.005)
    b3.location = (bx, by, 0.238)
    b3.rotation_euler.z = -0.25
    p3 = box(0, 0, 0, 0.13, 0.09, 0.030, S.m('emblem'), 'book_pages_3')
    p3.location = (bx + 0.008, by - 0.006, 0.245)
    p3.rotation_euler.z = -0.25

    # Reading bench in the front-right courtyard with open book & lamp
    box(0.02, 0.32, 0.0, 0.22, 0.08, 0.06, S.m('wood'), 'reading_bench')
    box(0.02, 0.35, 0.06, 0.22, 0.025, 0.07, S.m('wood_dark'), 'bench_back')
    box(0.05, 0.32, 0.06, 0.07, 0.05, 0.018, S.m('emblem'), 'open_book')
    S.lamp(-0.20, 0.34)

    # Waving scholar banners on both visible faces
    S.banner('x', x_face, -0.26, 0.28, w=0.08, h=0.20)
    S.banner('y', -0.21, y_face, 0.28, w=0.08, h=0.20)


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
    # Sim height: 1.1. Low L-shaped building with covered porch on posts, herb garden beds (crop/crop2 bushes)
    # in front, big swinging hanging cross-emblem sign, drying herbs on a rack, and flickering lamp. No chimney.
    # Wing A (rear along X)
    x1, y1 = -0.04, -0.20
    sx1, sy1 = 0.64, 0.26
    S.footing(x1, y1, sx1, sy1, 0.08, rng)
    S.walls(x1, y1, 0.08, sx1, sy1, 0.26, rng, kind='main')
    S.roof(x1, y1, 0.34, sx1, sy1, 0.18, rng, shape='hip', over=0.04)

    # Wing B (left-rear along Y, forming an L opening toward (+X, +Y))
    x2, y2 = -0.23, 0.06
    sx2, sy2 = 0.26, 0.52
    S.footing(x2, y2, sx2, sy2, 0.08, rng)
    S.walls(x2, y2, 0.08, sx2, sy2, 0.26, rng, kind='main')
    S.roof(x2, y2, 0.34, sx2, sy2, 0.18, rng, shape='hip', over=0.04)

    # Doors and windows opening onto the inner L-courtyard
    S.door('y', 0.08, -0.07, 0.08, w=0.13, h=0.21)
    S.window('y', 0.21, -0.07, 0.15, w=0.08, h=0.11)
    S.window('x', -0.10, 0.06, 0.15, w=0.09, h=0.11)
    S.window('x', -0.10, 0.21, 0.15, w=0.09, h=0.11)

    # Covered porch on posts wrapping the inner L-corner
    box(0.07, 0.02, 0.0, 0.34, 0.18, 0.05, S.m('wood'), 'porch_deck_x')
    box(-0.03, 0.14, 0.0, 0.14, 0.30, 0.05, S.m('wood'), 'porch_deck_y')
    box(0.07, 0.03, 0.27, 0.36, 0.20, 0.028, S.m('roof'), 'porch_roof_x')
    box(-0.02, 0.15, 0.27, 0.16, 0.32, 0.028, S.m('roof'), 'porch_roof_y')
    for px, py in ((0.23, 0.11), (0.05, 0.11), (-0.08, 0.11), (-0.08, 0.28)):
        box(px, py, 0.05, 0.024, 0.024, 0.22, S.m('trim'), 'porch_post')

    # Herb garden beds in front with S.m('crop') and S.m('crop2') bushes
    # Bed 1 (front-left of courtyard)
    b1x, b1y = 0.22, 0.18
    box(b1x, b1y, 0.0, 0.18, 0.22, 0.05, S.m('stone_light'), 'herb_bed1', bevel=0.008)
    box(b1x, b1y, 0.035, 0.15, 0.19, 0.02, S.m('dirt'), 'herb_soil1')
    for i, (dx, dy) in enumerate(((-0.04, -0.06), (0.04, -0.06), (-0.04, 0.0), (0.04, 0.0), (-0.04, 0.06), (0.04, 0.06))):
        mat_h = S.m('crop' if i % 2 == 0 else 'crop2')
        sphere(b1x + dx, b1y + dy, 0.075, 0.038, mat_h, f'herb_bush1_{i}', squash=0.75)

    # Bed 2 (front-right of courtyard)
    b2x, b2y = 0.02, 0.33
    box(b2x, b2y, 0.0, 0.20, 0.15, 0.05, S.m('stone_light'), 'herb_bed2', bevel=0.008)
    box(b2x, b2y, 0.035, 0.17, 0.12, 0.02, S.m('dirt'), 'herb_soil2')
    for i, (dx, dy) in enumerate(((-0.05, -0.03), (0.01, -0.03), (0.06, -0.03), (-0.03, 0.03), (0.04, 0.03))):
        mat_h = S.m('crop2' if i % 2 == 0 else 'crop')
        sphere(b2x + dx, b2y + dy, 0.075, 0.036, mat_h, f'herb_bush2_{i}', squash=0.75)

    # Drying herbs on a wooden rack
    rx, ry = -0.20, 0.36
    ang_r = math.radians(45)
    for dy_r in (-0.09, 0.09):
        rp = box(0, dy_r, 0.0, 0.022, 0.022, 0.23, S.m('wood_dark'), 'rack_post')
        rp.location = (rx, ry, 0.0)
        rp.rotation_euler.z = ang_r
    rbar = box(0, 0, 0.20, 0.020, 0.22, 0.020, S.m('wood_light'), 'rack_bar')
    rbar.location = (rx, ry, 0.0)
    rbar.rotation_euler.z = ang_r
    for i, dy_h in enumerate((-0.06, -0.02, 0.02, 0.06)):
        h_mat = S.m(('crop', 'crop2', 'foliage2', 'accent2')[i])
        hb = box(0, dy_h, 0.11, 0.024, 0.028, 0.085, h_mat, f'drying_herb_{i}')
        hb.location = (rx, ry, 0.0)
        hb.rotation_euler.z = ang_r

    # Big hanging sign with a cross-like emblem shape (two crossed boxes, accent colour) that swings
    spx, spy = 0.32, -0.06
    ang_s = math.radians(45)
    box(spx, spy, 0.0, 0.036, 0.036, 0.74, S.m('trim'), 'sign_mast')
    arm = box(0, 0, 0, 0.030, 0.22, 0.030, S.m('trim'), 'sign_arm')
    arm.location = (spx - 0.05, spy + 0.05, 0.70)
    arm.rotation_euler.z = ang_s

    # Hanging signboard + two crossed boxes in accent colour, pivoted at top edge (z=0.69)
    piv = (spx - 0.065, spy + 0.065, 0.69)
    sign_board = box(0, 0, -0.20, 0.022, 0.20, 0.20, S.m('emblem'), 'sign_board', bevel=0.006)
    sign_board.location = piv
    cross_h = box(0, 0, -0.122, 0.032, 0.14, 0.044, S.m('accent'), 'cross_h')
    cross_h.location = piv
    cross_v = box(0, 0, -0.17, 0.032, 0.044, 0.14, S.m('accent'), 'cross_v')
    cross_v.location = piv

    # Flickering clinic lantern at front corner + swinging cross sign
    lx, ly = 0.36, 0.08
    box(lx, ly, 0.0, 0.016, 0.016, 0.20, S.m('trim'), 'clinic_lpost')
    lamp_glow = box(0, 0, -0.03, 0.055, 0.055, 0.065, S.m('glow', emit=4.2), 'noink_clinic_lamp')
    lamp_glow.location = (lx, ly, 0.23)
    cone(lx, ly, 0.26, 0.048, 0.04, S.m('metal'), seg=4, name='clinic_lroof')

    def anim_clinic(f, n):
        sw = (-0.28, 0.30, -0.02)[f % 3]
        for ob in (sign_board, cross_h, cross_v):
            ob.rotation_euler = (0, sw, ang_s)
        sc = (1.0, 1.28, 0.82)[f % 3]
        lamp_glow.scale = (sc, sc, sc)

    kit.anim(anim_clinic)
    S.barrel(0.35, -0.20, r=0.048, h=0.095)


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
