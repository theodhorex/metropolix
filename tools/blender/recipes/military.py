# Defence: barracks, tower, palisade, watchtower, armory, war camp, fortress.
import math
import kit
from kit import box, cone, cyl, sphere, mat


def barracks(S, rng):
    # Sim height: 1.4. LONG two-storey block filling X axis (0.84 x 0.38), flat roof with
    # parapet + crenellations and raised watch platform, row of doors and shuttered windows,
    # training yard on the +Y half with two straw dummies, weapon rack, archery target, waving banner.
    bx, by = -0.02, -0.21
    sx, sy = 0.84, 0.38
    h1, h2 = 0.38, 0.36
    z1 = 0.10
    z2 = z1 + h1 + 0.03
    z_roof = z2 + h2

    S.footing(bx, by, sx, sy, z1, rng)
    # Ground storey: heavy stone walls
    S.walls(bx, by, z1, sx, sy, h1, rng, kind='stone')
    # Belt course between storeys
    box(bx, by, z1 + h1, sx + 0.03, sy + 0.03, 0.03, S.m('trim'), 'belt_beam')
    # Upper storey: main walls
    S.walls(bx, by, z2, sx, sy, h2, rng, kind='main')

    # Flat roof with parapet (no gable roof!)
    over = 0.025
    S.roof(bx, by, z_roof, sx, sy, 0.05, rng, shape='flat', over=over)
    rx, ry = sx + over, sy + over
    z_merlon = z_roof + 0.09
    # Crenellations (merlons) along the flat roof parapet
    for i in range(7):
        mx = bx - rx / 2 + 0.05 + i * (rx - 0.10) / 6
        box(mx, by + ry / 2, z_merlon, 0.06, 0.035, 0.045, S.m('stone_dark'), f'merlon_fy_{i}')
        box(mx, by - ry / 2, z_merlon, 0.06, 0.035, 0.045, S.m('stone_dark'), f'merlon_by_{i}')
    for j in range(3):
        my = by - ry / 2 + 0.06 + j * (ry - 0.12) / 2
        box(bx + rx / 2, my, z_merlon, 0.035, 0.06, 0.045, S.m('stone_dark'), f'merlon_fx_{j}')
        box(bx - rx / 2, my, z_merlon, 0.035, 0.06, 0.045, S.m('stone_dark'), f'merlon_bx_{j}')

    # Raised watch platform on the -X end of the flat roof (reaching sim height ~1.35)
    wx, wy = bx - 0.24, by
    wsx, wsy = 0.26, 0.24
    for px, py in ((wx - wsx / 2 + 0.02, wy - wsy / 2 + 0.02),
                   (wx + wsx / 2 - 0.02, wy - wsy / 2 + 0.02),
                   (wx - wsx / 2 + 0.02, wy + wsy / 2 - 0.02),
                   (wx + wsx / 2 - 0.02, wy + wsy / 2 - 0.02)):
        box(px, py, z_roof + 0.04, 0.035, 0.035, 0.22, S.m('trim'), 'watch_post')
    # Watch platform deck & parapet rails
    z_wdeck = z_roof + 0.24
    box(wx, wy, z_wdeck, wsx + 0.04, wsy + 0.04, 0.03, S.m('wood_light'), 'watch_deck')
    for px, py in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        box(wx + px * (wsx + 0.02) / 2, wy + py * (wsy + 0.02) / 2, z_wdeck + 0.03,
            (wsx + 0.04) if py else 0.025, (wsy + 0.04) if px else 0.025, 0.06, S.m('wood_dark'), 'watch_rail')
    # Access ladder up to watch platform on +X side of platform
    for lx_off in (-0.04, 0.04):
        box(wx + wsx / 2 + 0.02, wy + lx_off, z_roof + 0.04, 0.015, 0.015, 0.24, S.m('wood_dark'), 'wladder')
    # Waving flag on watch platform
    S.flag(wx - 0.08, wy + 0.06, z_wdeck + 0.08, h=0.22)

    # Row of 3 doors along the +Y facade + 1 door on the +X end
    y_front = by + sy / 2
    x_front = bx + sx / 2
    for dx in (-0.28, 0.0, 0.26):
        S.door('y', dx, y_front, z1, w=0.12, h=0.23)
        box(dx, y_front + 0.035, 0.0, 0.16, 0.06, 0.025, S.m('stone_light'), 'door_step')
    S.door('x', x_front, by - 0.02, z1, w=0.13, h=0.23)

    # Helper for shuttered windows (window + left/right wooden shutters)
    def shuttered_window(face, x, y, z, w=0.09, h=0.11):
        S.window(face, x, y, z, w=w, h=h)
        sh_w = 0.032
        if face == 'y':
            for side in (-1, 1):
                box(x + side * (w / 2 + sh_w / 2 + 0.008), y + 0.022, z - 0.005,
                    sh_w, 0.018, h + 0.015, S.m('wood_light'), 'shutter')
        else:
            for side in (-1, 1):
                box(x + 0.022, y + side * (w / 2 + sh_w / 2 + 0.008), z - 0.005,
                    0.018, sh_w, h + 0.015, S.m('wood_light'), 'shutter')

    # Ground floor shuttered windows between the doors
    for wx_pos in (-0.14, 0.13):
        shuttered_window('y', wx_pos, y_front, z1 + 0.12, w=0.08, h=0.11)
    # Upper floor row of 4 shuttered windows along +Y and 2 on +X
    for wx_pos in (-0.30, -0.10, 0.10, 0.28):
        shuttered_window('y', wx_pos, y_front, z2 + 0.10, w=0.09, h=0.12)
    for wy_pos in (by - 0.09, by + 0.09):
        shuttered_window('x', x_front, wy_pos, z2 + 0.10, w=0.08, h=0.12)

    # Waving regiment banners on both visible walls
    S.banner('y', -0.01, y_front, z2 - 0.04, w=0.11, h=0.22)
    S.banner('x', x_front, by, z2 - 0.04, w=0.10, h=0.20)

    # Training yard on the +Y half (y from 0.04 to 0.42):
    # Two straw dummies well separated so both read clearly
    dummies = []
    for idx, (dx, dy) in enumerate(((-0.26, 0.28), (-0.04, 0.20))):
        cyl(dx, dy, 0.0, 0.024, 0.28, S.m('wood_dark'), seg=8, name=f'dummy_post_{idx}')
        torso = box(0, 0, 0.0, 0.09, 0.07, 0.13, S.m('crop'), f'dummy_straw_{idx}')
        torso.location = (dx, dy, 0.12)
        tunic = box(0, 0, 0.02, 0.096, 0.076, 0.08, S.m('cloth' if idx == 0 else 'accent'), f'dummy_tunic_{idx}')
        tunic.parent = torso
        arms = box(0, 0, 0.08, 0.21, 0.026, 0.026, S.m('wood'), f'dummy_arms_{idx}')
        arms.parent = torso
        head = sphere(0, 0, 0.17, 0.042, S.m('crop'), f'dummy_head_{idx}', squash=0.95)
        head.parent = torso
        helm = cone(0, 0, 0.19, 0.046, 0.038, S.m('metal'), seg=8, name=f'dummy_helm_{idx}')
        helm.parent = torso
        sh = cyl(-0.08, 0.02, 0.07, 0.04, 0.014, S.m('wood_light'), seg=8, name=f'dummy_shield_{idx}')
        sh.rotation_euler = (math.radians(80), 0, math.radians(-20))
        sh.parent = torso
        dummies.append(torso)

    kit.anim(lambda f, n: [
        setattr(dummies[0], 'rotation_euler', (0, 0, (0.0, math.radians(16), math.radians(-12))[f % 3])),
        setattr(dummies[1], 'rotation_euler', (0, 0, (math.radians(-10), 0.0, math.radians(15))[f % 3])),
    ])

    # Weapon rack in yard (x ~ 0.16, y ~ 0.14)
    box(0.08, 0.14, 0.0, 0.022, 0.06, 0.22, S.m('trim'), 'wrack_l')
    box(0.26, 0.14, 0.0, 0.022, 0.06, 0.22, S.m('trim'), 'wrack_r')
    box(0.17, 0.14, 0.13, 0.20, 0.02, 0.018, S.m('wood_dark'), 'wrack_rail')
    for spx in (0.11, 0.16, 0.21, 0.24):
        cyl(spx, 0.14, 0.02, 0.008, 0.28, S.m('wood_light'), seg=6, name='spear_shaft')
        cone(spx, 0.14, 0.30, 0.018, 0.05, S.m('metal'), seg=4, name='spear_tip')

    # Straw archery target on stand in yard (x ~ 0.28, y ~ 0.30)
    tx, ty = 0.28, 0.30
    cyl(tx, ty - 0.03, 0.0, 0.02, 0.24, S.m('wood_dark'), seg=6, name='target_stand_b')
    cyl(tx - 0.04, ty, 0.0, 0.016, 0.22, S.m('wood'), seg=6, name='target_leg_l')
    cyl(tx + 0.04, ty, 0.0, 0.016, 0.22, S.m('wood'), seg=6, name='target_leg_r')
    t_straw = cyl(tx, ty + 0.01, 0.17, 0.085, 0.025, S.m('crop'), seg=14, name='straw_target')
    t_straw.rotation_euler = (math.radians(80), 0, math.radians(-20))
    t_ring = cyl(tx + 0.004, ty + 0.02, 0.17, 0.055, 0.012, S.m('cloth'), seg=12, name='target_ring')
    t_ring.rotation_euler = (math.radians(80), 0, math.radians(-20))
    sphere(tx + 0.008, ty + 0.028, 0.17, 0.024, S.m('accent'), 'bullseye')

    # Yard perimeter fence and muster props
    S.fence([(-0.40, 0.06), (-0.40, 0.38), (-0.16, 0.38)], rng, h=0.10)
    S.barrel(0.36, 0.16)
    S.crate(-0.34, 0.12, rng=rng)
    S.lamp(0.08, 0.36)


def tower(S, rng):
    # circular stone footing & shaft
    cyl(0.0, 0.0, 0.0, 0.28, 0.14, S.m('stone_dark'), seg=16, name='tbase')
    cyl(0.0, 0.0, 0.14, 0.24, 1.18, S.m('stone'), seg=16, name='tower_shaft')
    # stone belt courses
    for bz in (0.50, 0.90):
        cyl(0.0, 0.0, bz, 0.25, 0.03, S.m('stone_dark'), seg=16, name='belt')
    # flared corbels under battlements
    cone(0.0, 0.0, 1.28, 0.24, 0.10, S.m('stone_dark'), seg=16, r_top=0.30, name='corbels')
    cyl(0.0, 0.0, 1.38, 0.30, 0.12, S.m('stone'), seg=16, name='parapet')
    # crenellations / merlons around rim
    for mi in range(8):
        ang = mi * 2 * math.pi / 8
        mx = 0.27 * math.cos(ang)
        my = 0.27 * math.sin(ang)
        b = box(0, 0, 0, 0.055, 0.045, 0.05, S.m('stone_dark'), f'merlon_{mi}')
        b.location = (mx, my, 1.50)
        b.rotation_euler.z = ang
    # conical roof
    cone(0.0, 0.0, 1.48, 0.28, 0.46, S.m('roof'), seg=16, name='conical_roof')
    S.flag(0.0, 0.0, 1.94, h=0.20)
    # arrow slits on +X and +Y faces
    box(0.235, 0.0, 0.58, 0.02, 0.025, 0.13, S.m('stone_dark'), 'arrowslit_x1')
    box(0.0, 0.235, 0.58, 0.025, 0.02, 0.13, S.m('stone_dark'), 'arrowslit_y1')
    box(0.235, 0.06, 0.98, 0.02, 0.025, 0.13, S.m('stone_dark'), 'arrowslit_x2')
    box(0.06, 0.235, 0.98, 0.025, 0.02, 0.13, S.m('stone_dark'), 'arrowslit_y2')
    # ground door on +Y
    box(0.0, 0.235, 0.0, 0.15, 0.03, 0.26, S.m('stone_dark'), 'door_arch')
    box(0.0, 0.245, 0.0, 0.11, 0.015, 0.23, S.m('wood_dark'), 'door_wood')
    # banner & props
    S.banner('x', 0.24, -0.06, 0.72, w=0.10, h=0.20)
    S.barrel(0.28, 0.18)
    S.barrel(0.28, 0.08, r=0.04, h=0.08)
    S.crate(-0.25, 0.22, rng=rng)
    S.lamp(0.25, 0.28)
    box(0.0, 0.26, 0.0, 0.16, 0.05, 0.02, S.m('stone_light'), 'door_step')


def palisade(S, rng):
    # pointed log wall running across the tile with central gate
    # left wall section
    for i in range(6):
        lx = -0.38 + i * 0.05
        lh = rng.uniform(0.52, 0.62)
        cyl(lx, 0.0, 0.0, 0.026, lh - 0.06, S.m('wood'), seg=8, name=f'log_l_{i}')
        cone(lx, 0.0, lh - 0.06, 0.026, 0.08, S.m('wood_light'), seg=8, name=f'tip_l_{i}')
    box(-0.25, -0.02, 0.20, 0.30, 0.025, 0.03, S.m('wood_dark'), 'binder_l1')
    box(-0.25, -0.02, 0.38, 0.30, 0.025, 0.03, S.m('wood_dark'), 'binder_l2')
    # right wall section
    for i in range(6):
        rx = 0.13 + i * 0.05
        rh = rng.uniform(0.52, 0.62)
        cyl(rx, 0.0, 0.0, 0.026, rh - 0.06, S.m('wood'), seg=8, name=f'log_r_{i}')
        cone(rx, 0.0, rh - 0.06, 0.026, 0.08, S.m('wood_light'), seg=8, name=f'tip_r_{i}')
    box(0.26, -0.02, 0.20, 0.30, 0.025, 0.03, S.m('wood_dark'), 'binder_r1')
    box(0.26, -0.02, 0.38, 0.30, 0.025, 0.03, S.m('wood_dark'), 'binder_r2')
    # central gateposts & lintel
    cyl(-0.11, 0.0, 0.0, 0.04, 0.72, S.m('trunk'), seg=8, name='gpost_l')
    cone(-0.11, 0.0, 0.72, 0.04, 0.08, S.m('wood_light'), seg=8, name='gtip_l')
    cyl(0.11, 0.0, 0.0, 0.04, 0.72, S.m('trunk'), seg=8, name='gpost_r')
    cone(0.11, 0.0, 0.72, 0.04, 0.08, S.m('wood_light'), seg=8, name='gtip_r')
    box(0.0, 0.0, 0.66, 0.28, 0.05, 0.05, S.m('wood_dark'), 'lintel')
    # gate doors
    box(-0.045, 0.0, 0.02, 0.09, 0.025, 0.58, S.m('wood_dark'), 'gdoor_l')
    box(0.045, 0.0, 0.02, 0.09, 0.025, 0.58, S.m('wood_dark'), 'gdoor_r')
    for zh in (0.16, 0.46):
        box(0.0, 0.015, zh, 0.20, 0.01, 0.025, S.m('metal'), f'hinge_{zh}')
    # wooden catwalk behind the wall
    box(0.0, -0.12, 0.32, 0.76, 0.16, 0.02, S.m('wood'), 'catwalk')
    for sx in (-0.28, -0.10, 0.10, 0.28):
        box(sx, -0.12, 0.0, 0.03, 0.03, 0.32, S.m('wood_dark'), 'stilt')
    # sharpened defensive stakes in front
    for k, kx in enumerate((-0.26, -0.16, 0.16, 0.26)):
        st = cyl(kx, 0.14, 0.0, 0.018, 0.24, S.m('wood_light'), seg=6, name='chev')
        st.rotation_euler = (math.radians(-38), 0, math.radians(12 * (1 if k % 2 else -1)))
    # props
    S.banner('y', 0.0, 0.03, 0.50, w=0.10, h=0.14)
    S.lamp(0.24, 0.18)
    S.barrel(-0.26, -0.22)
    S.crate(0.26, -0.22, rng=rng)
    S.sack(0.18, -0.22)
    S.sack(-0.18, -0.22)


def watchtower(S, rng):
    # Sim height: 2.0. Stilted timber observation tower with ladder, platform, hip roof, and props
    S.footing(0, 0, 0.42, 0.42, 0.22, rng)
    for (px, py) in ((0.16, 0.16), (0.16, -0.16), (-0.16, 0.16), (-0.16, -0.16)):
        p = box(px, py, 0.22, 0.06, 0.06, 1.05, S.m('trim'), 'leg')
        p.rotation_euler = (math.copysign(0.04, -py), math.copysign(0.04, px), 0)
    for zz in (0.5, 0.85):
        box(0.17, 0, zz, 0.03, 0.4, 0.03, S.m('wood'), 'xbar')
        box(0, 0.17, zz, 0.4, 0.03, 0.03, S.m('wood'), 'xbar')
    S.walls(0, 0, 1.2, 0.48, 0.48, 0.22, rng, kind='plank')
    box(0, 0, 1.18, 0.54, 0.54, 0.04, S.m('wood_light'), 'deck')
    for (px, py) in ((0.23, 0.23), (0.23, -0.23), (-0.23, 0.23), (-0.23, -0.23)):
        box(px, py, 1.4, 0.04, 0.04, 0.22, S.m('trim'), 'roofpost')
    kit.hip(0, 0, 1.62, 0.50, 0.50, 0.42, S.m('roof'), overhang=0.04)
    S.banner('x', 0.26, 0.0, 1.22, w=0.12, h=0.16)
    S.flag(0, 0, 2.04)

    # Props at base (ladder, barrels, crates, lantern >= 5 props)
    box(-0.10, 0.24, 0.0, 0.02, 0.02, 1.22, S.m('wood_dark'), 'ladder_l').rotation_euler.x = math.radians(-5)
    box(0.04, 0.24, 0.0, 0.02, 0.02, 1.22, S.m('wood_dark'), 'ladder_r').rotation_euler.x = math.radians(-5)
    for rz in (0.25, 0.50, 0.75, 1.0):
        box(-0.03, 0.24 - rz * 0.08, rz, 0.14, 0.015, 0.02, S.m('trim'), 'rung')
    S.barrel(0.24, 0.22)
    S.crate(-0.24, 0.22, rng=rng)
    S.lamp(0.24, -0.22)
    S.barrel(-0.24, -0.22, r=0.04, h=0.08)


def armory(S, rng):
    # Squat stone keep-like block with iron bands (metal strips), heavy iron door,
    # big round shields with S.emblem on both visible walls, weapon racks with spears
    # and axes outside, an anvil with a small glowing forge (S.fire) for motion.
    # Flat roof with crenellations, not a hip roof. (Sim height: 1.3)
    ax, ay = -0.05, -0.06
    sx, sy = 0.66, 0.58
    h_foot = 0.14
    h_wall = 0.56
    z_roof = h_foot + h_wall  # 0.70

    # Battered stone foundation and squat stone keep walls
    S.footing(ax, ay, sx + 0.03, sy + 0.03, h_foot, rng)
    S.stone_walls(ax, ay, h_foot, sx, sy, h_wall, rng)

    # Heavy corner stone buttresses / pilasters
    for cx in (ax - sx / 2, ax + sx / 2):
        for cy in (ay - sy / 2, ay + sy / 2):
            box(cx, cy, 0.0, 0.08, 0.08, z_roof + 0.02, S.m('stone_dark'), 'keep_pilaster', bevel=0.008)

    # Heavy horizontal iron bands (metal strips) strapped across the stone walls
    iron_mat = S.m('metal', metal=0.7, rough=0.4)
    for bz in (0.24, 0.42, 0.58):
        box(ax, ay, bz, sx + 0.035, sy + 0.035, 0.032, iron_mat, f'iron_band_{bz}')
    # Vertical iron reinforcement straps & rivets on visible walls
    for vx in (ax - 0.16, ax + 0.16):
        box(vx, ay + sy / 2 + 0.012, h_foot, 0.03, 0.016, h_wall, iron_mat, 'vstrap_y')
        for rz in (0.255, 0.435, 0.595):
            sphere(vx, ay + sy / 2 + 0.024, rz, 0.014, S.m('stone_light'), 'rivet_y')
    for vy in (ay - 0.14, ay + 0.14):
        box(ax + sx / 2 + 0.012, vy, h_foot, 0.016, 0.03, h_wall, iron_mat, 'vstrap_x')
        for rz in (0.255, 0.435, 0.595):
            sphere(ax + sx / 2 + 0.024, vy, rz, 0.014, S.m('stone_light'), 'rivet_x')

    # Flat roof with overhanging stone cornice, parapet, and heavy crenellations (no hip roof!)
    rx, ry = sx + 0.06, sy + 0.06
    box(ax, ay, z_roof - 0.02, rx, ry, 0.04, S.m('stone_dark'), 'machicolation_cornice')
    box(ax, ay, z_roof + 0.02, rx - 0.02, ry - 0.02, 0.04, S.m('stone_light'), 'flat_roof_deck')
    # Parapet wall around flat roof
    z_para = z_roof + 0.06
    for px, py in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        box(ax + px * (rx / 2 - 0.025), ay + py * (ry / 2 - 0.025), z_para,
            rx if py else 0.05, ry if px else 0.05, 0.05, S.m('stone'), 'keep_parapet')
    # Chunky stone merlons (crenellations) along all 4 sides
    z_merlon = z_para + 0.05
    for i in range(5):
        mx = ax - rx / 2 + 0.05 + i * (rx - 0.10) / 4
        for side_y in (ay + ry / 2 - 0.025, ay - ry / 2 + 0.025):
            box(mx, side_y, z_merlon, 0.08, 0.055, 0.065, S.m('stone_dark'), f'merlon_y_{i}')
            box(mx, side_y, z_merlon + 0.065, 0.09, 0.065, 0.015, S.m('stone_light'), f'merlon_cap_y_{i}')
    for j in range(4):
        my = ay - ry / 2 + 0.06 + j * (ry - 0.12) / 3
        for side_x in (ax + rx / 2 - 0.025, ax - rx / 2 + 0.025):
            box(side_x, my, z_merlon, 0.055, 0.08, 0.065, S.m('stone_dark'), f'merlon_x_{j}')
            box(side_x, my, z_merlon + 0.065, 0.065, 0.09, 0.015, S.m('stone_light'), f'merlon_cap_x_{j}')

    # Squat armored rooftop watch-turret / vent at rear corner + flag (reaches ~1.14)
    box(ax - 0.16, ay - 0.12, z_para, 0.20, 0.20, 0.18, S.m('stone_dark'), 'roof_turret')
    box(ax - 0.16, ay - 0.12, z_para + 0.18, 0.23, 0.23, 0.03, iron_mat, 'turret_rim')
    S.flag(ax - 0.16, ay - 0.12, z_para + 0.21, h=0.22)

    # Heavy iron door on +Y face (left-center so it is 100% unobstructed from camera)
    dx, dy = ax + 0.11, ay + sy / 2
    box(dx, dy + 0.012, h_foot, 0.24, 0.04, 0.34, S.m('stone_dark'), 'iron_door_arch')
    box(dx, dy + 0.026, h_foot, 0.18, 0.025, 0.30, iron_mat, 'heavy_iron_door')
    for dz in (h_foot + 0.07, h_foot + 0.16, h_foot + 0.25):
        box(dx, dy + 0.038, dz, 0.17, 0.012, 0.022, S.m('trim'), 'door_bar')
    sphere(dx + 0.05, dy + 0.044, h_foot + 0.13, 0.018, S.m('accent2'), 'door_ring')
    box(dx, dy + 0.05, 0.0, 0.26, 0.09, 0.035, S.m('stone_dark'), 'armory_step')

    # BIG round shields with S.emblem on BOTH visible walls (+Y and +X)
    # 1. Big round shield on +Y wall (right half of +Y wall)
    sh_yx, sh_yy, sh_yz = ax - 0.15, ay + sy / 2 + 0.022, 0.47
    cyl(sh_yx, sh_yy, sh_yz, 0.125, 0.018, iron_mat, seg=16, name='shield_y_rim').rotation_euler = (math.radians(90), 0, 0)
    cyl(sh_yx, sh_yy + 0.008, sh_yz, 0.102, 0.018, S.m('cloth'), seg=16, name='shield_y_face').rotation_euler = (math.radians(90), 0, 0)
    S.emblem('y', sh_yx, sh_yy + 0.024, sh_yz, 0.13)

    # 2. Big round shield on +X wall
    sh_xx, sh_xy, sh_xz = ax + sx / 2 + 0.022, ay - 0.08, 0.47
    cyl(sh_xx, sh_xy, sh_xz, 0.125, 0.018, iron_mat, seg=16, name='shield_x_rim').rotation_euler = (0, math.radians(90), 0)
    cyl(sh_xx + 0.008, sh_xy, sh_xz, 0.102, 0.018, S.m('cloth'), seg=16, name='shield_x_face').rotation_euler = (0, math.radians(90), 0)
    S.emblem('x', sh_xx + 0.024, sh_xy, sh_xz, 0.13)

    # Barred arrow-slit window on +X wall
    S.window('x', ax + sx / 2, ay + 0.14, 0.34, w=0.08, h=0.16)

    # Weapon racks with spears and axes outside:
    # Rack 1 (front-right +Y yard in front of shield, keeping doorway clear): spears and battleaxes
    box(-0.34, 0.32, 0.0, 0.025, 0.05, 0.26, S.m('trim'), 'wr1_p1')
    box(-0.08, 0.32, 0.0, 0.025, 0.05, 0.26, S.m('trim'), 'wr1_p2')
    box(-0.21, 0.32, 0.15, 0.28, 0.022, 0.022, S.m('wood_dark'), 'wr1_bar')
    for sx_pos in (-0.30, -0.25, -0.20):
        cyl(sx_pos, 0.32, 0.02, 0.008, 0.32, S.m('wood_light'), seg=6, name='rack_spear')
        cone(sx_pos, 0.32, 0.34, 0.022, 0.06, iron_mat, seg=4, name='rack_spear_tip')
    for ax_pos in (-0.15, -0.11):
        cyl(ax_pos, 0.32, 0.02, 0.009, 0.28, S.m('wood_dark'), seg=6, name='rack_axe_shaft')
        box(ax_pos, 0.32, 0.24, 0.055, 0.016, 0.045, iron_mat, 'rack_axe_blade')

    # Rack 2 (+X yard): spears and battleaxes along +X wall
    box(0.35, -0.28, 0.0, 0.05, 0.025, 0.26, S.m('trim'), 'wr2_p1')
    box(0.35, -0.04, 0.0, 0.05, 0.025, 0.26, S.m('trim'), 'wr2_p2')
    box(0.35, -0.16, 0.15, 0.022, 0.26, 0.022, S.m('wood_dark'), 'wr2_bar')
    for sy_pos in (-0.24, -0.16, -0.08):
        cyl(0.35, sy_pos, 0.02, 0.008, 0.30, S.m('wood_light'), seg=6, name='rack2_shaft')
        cone(0.35, sy_pos, 0.32, 0.020, 0.055, iron_mat, seg=4, name='rack2_tip')
        box(0.35, sy_pos, 0.26, 0.016, 0.05, 0.04, iron_mat, 'rack2_axe_blade')

    # Small glowing forge (S.fire) + prominent blacksmith anvil at front (+X, +Y) corner for motion
    fx, fy = 0.28, 0.26
    box(fx, fy, 0.0, 0.16, 0.16, 0.13, S.m('stone_dark'), 'forge_hearth', bevel=0.008)
    box(fx - 0.05, fy, 0.13, 0.05, 0.16, 0.10, S.m('stone'), 'forge_hood_back')
    box(fx + 0.01, fy, 0.125, 0.10, 0.11, 0.02, S.m('glow', emit=4.5), 'noink_forge_coals')
    S.fire(fx + 0.01, fy, 0.14, s=1.05)

    # Prominent blacksmith anvil right in front of the forge
    anv_x, anv_y = 0.18, 0.36
    cyl(anv_x, anv_y, 0.0, 0.055, 0.09, S.m('wood_dark'), seg=8, name='anvil_block')
    box(anv_x, anv_y, 0.09, 0.10, 0.06, 0.05, iron_mat, 'anvil_top')
    cone(anv_x + 0.065, anv_y, 0.115, 0.024, 0.06, iron_mat, seg=6, name='anvil_horn').rotation_euler = (0, math.radians(90), 0)
    # Glowing hot metal bar on the anvil that pulses
    hot_bar = box(0, 0, 0, 0.055, 0.02, 0.014, S.m('glow', emit=4.0), 'noink_hot_bar')
    hot_bar.location = (anv_x, anv_y, 0.142)
    kit.anim(lambda f, n: setattr(hot_bar, 'scale', ((1.0, 1.18, 0.88)[f % 3],) * 3))

    # Quench barrel & crate
    S.barrel(0.35, 0.10, r=0.045, h=0.09)
    S.crate(-0.36, 0.18, s=0.075, rng=rng)


def warcamp(S, rng):
    # Sim height: 1.0. 3 tents of different sizes in cloth/accent with stripes, campfire in the middle (S.fire), racks, banner
    # 1. Main Command tent (large ridge tent) at (-0.14, -0.12)
    kit.gable(-0.14, -0.12, 0.0, 0.46, 0.38, 0.44, S.m('cloth'), overhang=0.03, along='x')
    box(-0.14, 0.07, 0.0, 0.16, 0.02, 0.26, S.m('cloth'), 'c_door')
    # Decorative stripes in accent across command tent roof
    for sx in (-0.26, -0.02):
        box(sx, -0.12, 0.01, 0.045, 0.40, 0.44, S.m('accent'), 'c_stripe')
    S.flag(-0.14, -0.12, 0.44, h=0.20)

    # 2. Warrior wedge tent (medium) at (0.24, -0.10)
    kit.gable(0.24, -0.10, 0.0, 0.30, 0.34, 0.34, S.m('accent'), overhang=0.02, along='y')
    box(0.24, 0.07, 0.0, 0.12, 0.02, 0.20, S.m('accent'), 'w_door')
    # Stripes in cloth on warrior tent
    for sy in (-0.20, 0.0):
        box(0.24, sy, 0.01, 0.32, 0.04, 0.34, S.m('cloth'), 'w_stripe')

    # 3. Scout tent (small conical) at (-0.22, 0.20)
    cone(-0.22, 0.20, 0.0, 0.14, 0.28, S.m('cloth'), seg=6, name='scout_tent')
    cyl(-0.22, 0.20, 0.09, 0.10, 0.03, S.m('accent2'), seg=6, name='scout_band')

    # Central campfire with S.fire in the middle at (0.06, 0.10)
    for i in range(6):
        ang = i * 2 * math.pi / 6
        rx = 0.06 + 0.08 * math.cos(ang)
        ry = 0.10 + 0.08 * math.sin(ang)
        sphere(rx, ry, 0.015, 0.025, S.m('stone_dark'), f'fstone_{i}', squash=0.7)
    box(0.06, 0.10, 0.0, 0.12, 0.12, 0.015, S.m('stone_dark'), 'ash_bed')
    l1 = box(0.06, 0.10, 0.01, 0.12, 0.025, 0.02, S.m('trunk'), 'flog1')
    l1.rotation_euler.z = math.radians(45)
    l2 = box(0.06, 0.10, 0.01, 0.12, 0.025, 0.02, S.m('trunk'), 'flog2')
    l2.rotation_euler.z = math.radians(-45)
    S.fire(0.06, 0.10, 0.02, s=1.3)

    # Cooking spit with suspended iron pot over campfire
    box(0.06, -0.01, 0.0, 0.02, 0.02, 0.22, S.m('trim'), 'spit_l')
    box(0.06, 0.21, 0.0, 0.02, 0.02, 0.22, S.m('trim'), 'spit_r')
    box(0.06, 0.10, 0.19, 0.015, 0.24, 0.015, S.m('metal'), 'spit_rod')
    cyl(0.06, 0.10, 0.10, 0.035, 0.06, S.m('metal'), seg=8, name='cook_pot')

    # Weapon rack beside command tent (task: "racks, banner")
    box(0.04, -0.26, 0.0, 0.02, 0.06, 0.22, S.m('trim'), 'cwr_l')
    box(0.18, -0.26, 0.0, 0.02, 0.06, 0.22, S.m('trim'), 'cwr_r')
    box(0.11, -0.26, 0.12, 0.16, 0.02, 0.015, S.m('wood_dark'), 'cwr_bar')
    for spx in (0.07, 0.11, 0.15):
        cyl(spx, -0.26, 0.02, 0.007, 0.26, S.m('wood_light'), seg=6, name='tent_spear')
        cone(spx, -0.26, 0.28, 0.016, 0.05, S.m('metal'), seg=4, name='spear_point')

    # War banners waving in camp (task: "banner")
    S.banner('x', -0.36, -0.06, 0.02, w=0.12, h=0.24)
    S.banner('y', 0.24, 0.16, 0.02, w=0.12, h=0.24)

    # Camp props: bedroll, barrel, crate, water bucket (>= 5 props)
    br = cyl(-0.34, 0.08, 0.0, 0.035, 0.16, S.m('cloth'), seg=8, name='bedroll')
    br.rotation_euler = (0, math.radians(90), 0)
    S.barrel(0.28, 0.28)
    S.barrel(-0.06, 0.28, r=0.04, h=0.08)
    S.crate(0.16, 0.30, rng=rng)
    S.crate(-0.32, -0.26, s=0.07, rng=rng)


def fortress(S, rng):
    # central tall stone keep
    S.footing(-0.02, -0.02, 0.52, 0.52, 0.18, rng)
    S.stone_walls(-0.02, -0.02, 0.18, 0.48, 0.48, 1.40, rng)
    # keep top battlements walkway
    box(-0.02, -0.02, 1.58, 0.50, 0.50, 0.04, S.m('stone_dark'), 'keep_deck')
    # central high keep turret & spire
    box(-0.02, -0.02, 1.62, 0.24, 0.24, 0.28, S.m('stone'), 'keep_turret')
    ksp = cone(-0.02, -0.02, 1.90, 0.20, 0.32, S.m('roof'), seg=4, name='keep_spire')
    ksp.rotation_euler.z = math.radians(45)
    S.flag(-0.02, -0.02, 2.22, h=0.22)
    # 4 corner bastion towers with battlements
    for i, (cx, cy) in enumerate(((0.20, 0.20), (0.20, -0.24), (-0.24, 0.20), (-0.24, -0.24))):
        cyl(cx, cy, 0.0, 0.10, 1.42, S.m('stone_dark'), seg=12, name=f'ctower_{i}')
        cone(cx, cy, 1.42, 0.10, 0.06, S.m('stone_dark'), seg=12, r_top=0.125, name=f'corbel_{i}')
        cyl(cx, cy, 1.48, 0.125, 0.08, S.m('stone'), seg=12, name=f'parapet_{i}')
        # merlons on corner tower
        for mi in range(4):
            ang = mi * math.pi / 2
            bx = cx + 0.10 * math.cos(ang)
            by = cy + 0.10 * math.sin(ang)
            b = box(0, 0, 0, 0.04, 0.04, 0.05, S.m('stone_dark'), f'cmerlon_{i}_{mi}')
            b.location = (bx, by, 1.56)
            b.rotation_euler.z = ang
        # conical roofs on the two rear corner towers
        if cy < 0:
            cone(cx, cy, 1.56, 0.12, 0.22, S.m('roof'), seg=8, name=f'croof_{i}')
    # arched gatehouse on +Y face
    box(-0.02, 0.22, 0.0, 0.16, 0.06, 0.32, S.m('stone_dark'), 'gate_arch')
    box(-0.02, 0.23, 0.06, 0.12, 0.015, 0.24, S.m('metal'), 'portcullis')
    box(-0.02, 0.21, 0.0, 0.12, 0.02, 0.28, S.m('wood_dark'), 'fort_doors')
    # arrow slits in keep walls
    box(0.23, 0.0, 0.75, 0.02, 0.025, 0.16, S.m('stone_dark'), 'keep_slit_x1')
    box(0.0, 0.23, 0.75, 0.025, 0.02, 0.16, S.m('stone_dark'), 'keep_slit_y1')
    box(0.23, 0.0, 1.15, 0.02, 0.025, 0.16, S.m('stone_dark'), 'keep_slit_x2')
    box(0.0, 0.23, 1.15, 0.025, 0.02, 0.16, S.m('stone_dark'), 'keep_slit_y2')
    # grand banners on walls
    S.banner('x', 0.23, -0.10, 0.85, w=0.12, h=0.22)
    S.banner('y', -0.10, 0.23, 0.85, w=0.12, h=0.22)
    # props
    box(-0.02, 0.25, 0.0, 0.20, 0.08, 0.03, S.m('stone_dark'), 'fort_step')
    S.lamp(0.12, 0.28)
    S.lamp(-0.16, 0.28)
    S.barrel(0.28, 0.14)
    S.barrel(-0.28, 0.14, r=0.045, h=0.09)
    S.crate(-0.28, 0.26, rng=rng)


RECIPES = {
    'watchtower': watchtower, 'barracks': barracks, 'tower': tower,
    'palisade': palisade, 'armory': armory, 'warcamp': warcamp, 'fortress': fortress,
}
