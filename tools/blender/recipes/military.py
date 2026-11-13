# Defence: barracks, tower, palisade, watchtower, armory, war camp, fortress.
import math
import kit
from kit import box, cone, cyl, sphere, mat


def barracks(S, rng):
    # Sim height: 1.4. LONG two-storey hall filling one axis (X) + training yard with dummy, weapon rack, banner
    # Footprint: long hall along X filling the axis (|x| up to 0.43)
    bx, by = 0.0, -0.18
    sx, sy = 0.84, 0.38
    h_stone = 0.44
    h_plank = 0.40
    S.footing(bx, by, sx, sy, 0.12, rng)
    # Ground floor: sturdy stone walls with corner quoins
    S.walls(bx, by, 0.12, sx, sy, h_stone, rng, kind='stone')
    # Timber belt course separating storeys
    box(bx, by, 0.12 + h_stone, sx + 0.04, sy + 0.04, 0.035, S.m('trim'), 'belt_beam')
    # Second floor: timber dormitory
    S.walls(bx, by, 0.12 + h_stone + 0.035, sx, sy, h_plank, rng, kind='plank')
    # Long gable roof running along X, ridge reaching height 1.35 (sim height 1.4)
    S.roof(bx, by, 0.12 + h_stone + 0.035 + h_plank, sx, sy, 0.36, rng, shape='gable', along='x')

    # Main arched stone entrance door and secondary quartermaster door
    S.door('y', -0.14, by + sy / 2, 0.12, w=0.18, h=0.28)
    box(-0.14, by + sy / 2 + 0.04, 0.0, 0.24, 0.08, 0.03, S.m('stone_light'), 'door_step')
    S.door('x', bx + sx / 2, by + 0.04, 0.12, w=0.14, h=0.24)

    # Ground floor barred windows and arrow slits
    S.window('y', 0.18, by + sy / 2, 0.24, w=0.10, h=0.14)
    S.window('y', 0.32, by + sy / 2, 0.24, w=0.10, h=0.14)
    S.window('x', bx - sx / 2, by, 0.24, w=0.10, h=0.14)

    # Long row of 4 upper dormitory windows along +Y face
    for wx_pos in (-0.28, -0.10, 0.10, 0.28):
        S.window('y', wx_pos, by + sy / 2, 0.68, w=0.10, h=0.14)
    S.window('x', bx + sx / 2, by, 0.68, w=0.10, h=0.14)

    # Regiment banners hanging from upper facade
    S.banner('y', 0.04, by + sy / 2, 0.44, w=0.12, h=0.24)
    S.banner('x', bx + sx / 2, by - 0.06, 0.44, w=0.10, h=0.22)

    # Heavy stone barracks chimney at rear corner
    S.chimney(bx - 0.30, by - 0.12, 1.05, 0.28, rng)

    # Expansive training yard out front (+Y: y from 0.04 to 0.44)
    # Weapon rack filled with polearms and halberds
    box(0.06, 0.26, 0.0, 0.02, 0.08, 0.24, S.m('trim'), 'wrack_l')
    box(0.24, 0.26, 0.0, 0.02, 0.08, 0.24, S.m('trim'), 'wrack_r')
    box(0.15, 0.26, 0.14, 0.20, 0.02, 0.015, S.m('wood_dark'), 'wrack_rail')
    for spx in (0.09, 0.14, 0.19):
        cyl(spx, 0.26, 0.02, 0.008, 0.30, S.m('wood_light'), seg=6, name='spear_shaft')
        cone(spx, 0.26, 0.32, 0.018, 0.05, S.m('metal'), seg=4, name='spear_tip')

    # Training dummy in yard that wobbles when struck (animated with kit.anim)
    dx, dy = -0.22, 0.26
    cyl(dx, dy, 0.0, 0.03, 0.28, S.m('wood_dark'), seg=8, name='dummy_post')
    dummy = box(0, 0, 0.14, 0.10, 0.08, 0.14, S.m('cloth'), 'dummy_torso')
    dummy.location = (dx, dy, 0)
    d_arms = box(0, 0, 0.22, 0.22, 0.03, 0.03, S.m('wood'), 'dummy_arms')
    d_arms.parent = dummy
    d_head = sphere(0, 0, 0.31, 0.045, S.m('crop'), 'dummy_head', squash=0.9)
    d_head.parent = dummy
    d_helm = cone(0, 0, 0.34, 0.05, 0.04, S.m('metal'), seg=8, name='dummy_helm')
    d_helm.parent = dummy
    d_sh = cyl(-0.09, 0, 0.22, 0.045, 0.015, S.m('wood_light'), seg=8, name='dummy_shield')
    d_sh.rotation_euler = (0, math.radians(90), 0)
    d_sh.parent = dummy
    d_eye = sphere(-0.10, 0, 0.22, 0.016, S.m('emblem'), 'target_eye')
    d_eye.parent = dummy

    kit.anim(lambda f, n: setattr(dummy, 'rotation_euler', (
        0,
        0,
        (0.0, math.radians(18), math.radians(-12))[f % 3]
    )))

    # Straw archery target on stand in yard
    cyl(0.36, 0.12, 0.0, 0.02, 0.22, S.m('wood'), seg=6, name='target_stand')
    target = cyl(0.36, 0.12, 0.18, 0.07, 0.02, S.m('crop'), seg=12, name='straw_target')
    target.rotation_euler = (math.radians(85), 0, 0)
    sphere(0.36, 0.13, 0.18, 0.022, S.m('accent'), 'bullseye')

    # Yard perimeter fence and muster props
    S.fence([(-0.40, 0.04), (-0.40, 0.40), (-0.08, 0.40)], rng, h=0.10)
    S.barrel(0.34, 0.28)
    S.crate(-0.04, 0.30, rng=rng)
    S.lamp(0.34, 0.36)


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
    # Fortified stone armoury with heavy iron bands, big shields on walls, weapon racks
    # Substantial stone bastion filling the footprint (sim height 1.3)
    ax, ay = -0.02, -0.04
    sx, sy = 0.70, 0.58
    S.footing(ax, ay, sx, sy, 0.14, rng)
    S.stone_walls(ax, ay, 0.14, sx, sy, 0.54, rng)

    # Heavy iron reinforcement bands strapped across the stone walls (task: "stone with iron bands")
    for bz in (0.26, 0.42, 0.58):
        box(ax, ay, bz, sx + 0.025, sy + 0.025, 0.03, S.m('metal'), f'iron_band_{bz}')
    # Corner iron angle brackets and vertical reinforcement straps
    for cx in (ax - sx / 2, ax + sx / 2):
        for cy in (ay - sy / 2, ay + sy / 2):
            box(cx, cy, 0.14, 0.04, 0.04, 0.54, S.m('metal'), 'corner_iron')
            for rz in (0.22, 0.34, 0.50):
                sphere(cx, cy, rz, 0.012, S.m('trim'), 'iron_rivet')

    # Crenellated stone parapet cornice at z=0.68
    box(ax, ay, 0.68, sx + 0.04, sy + 0.04, 0.035, S.m('stone_dark'), 'parapet_cornice')

    # Heavy hip roof from z=0.71, height 0.38 (ridge at z=1.09)
    S.roof(ax, ay, 0.71, sx, sy, 0.38, rng, shape='hip')

    # Central watch cupola / lantern turret on roof peak reaching height 1.28 (sim height 1.3)
    cyl(ax, ay, 1.05, 0.07, 0.12, S.m('metal'), seg=8, name='armory_cupola')
    cone(ax, ay, 1.17, 0.085, 0.11, S.m('stone_dark'), seg=8, name='armory_cap')
    sphere(ax, ay, 1.28, 0.015, S.m('accent'), 'armory_finial')

    # Reinforced iron-studded door on +Y face with heavy iron hinges
    S.door('y', -0.12, ay + sy / 2, 0.14, w=0.20, h=0.30)
    box(-0.12, ay + sy / 2 + 0.04, 0.0, 0.26, 0.08, 0.03, S.m('stone_dark'), 'armory_step')
    # Narrow barred arrowslits in stone
    S.window('y', 0.18, ay + sy / 2, 0.34, w=0.08, h=0.18)
    S.window('x', ax + sx / 2, ay - 0.08, 0.34, w=0.08, h=0.18)

    # BIG heraldic shields mounted on visible stone walls (task: "big shields (S.emblem) on walls")
    # Big shield on +Y wall with crossed battleaxes
    sh_y_x, sh_y_y, sh_y_z = 0.08, ay + sy / 2 + 0.015, 0.50
    # Crossed axe handles behind shield
    a1 = cyl(sh_y_x, sh_y_y - 0.005, sh_y_z, 0.007, 0.32, S.m('wood_dark'), seg=6, name='axe_shaft_1')
    a1.rotation_euler = (0, 0, math.radians(40))
    a2 = cyl(sh_y_x, sh_y_y - 0.005, sh_y_z, 0.007, 0.32, S.m('wood_dark'), seg=6, name='axe_shaft_2')
    a2.rotation_euler = (0, 0, math.radians(-40))
    # Big heraldic round shield
    sh1 = cyl(sh_y_x, sh_y_y, sh_y_z, 0.09, 0.02, S.m('cloth'), seg=14, name='w_shield1')
    sh1.rotation_euler = (math.radians(90), 0, 0)
    cyl(sh_y_x, sh_y_y + 0.012, sh_y_z, 0.094, 0.008, S.m('metal'), seg=14, name='w_shield1_rim').rotation_euler = (math.radians(90), 0, 0)
    cyl(sh_y_x, sh_y_y + 0.016, sh_y_z, 0.028, 0.012, S.m('metal'), seg=8, name='w_boss1').rotation_euler = (math.radians(90), 0, 0)
    S.emblem('y', sh_y_x, sh_y_y + 0.025, sh_y_z, 0.10)

    # Big shield on +X wall with crossed longswords
    sh_x_x, sh_x_y, sh_x_z = ax + sx / 2 + 0.015, -0.16, 0.50
    # Crossed swords behind shield
    s1 = box(sh_x_x - 0.005, sh_x_y, sh_x_z, 0.01, 0.02, 0.34, S.m('metal'), 'xsword_1')
    s1.rotation_euler = (0, math.radians(35), 0)
    s2 = box(sh_x_x - 0.005, sh_x_y, sh_x_z, 0.01, 0.02, 0.34, S.m('metal'), 'xsword_2')
    s2.rotation_euler = (0, math.radians(-35), 0)
    sh2 = cyl(sh_x_x, sh_x_y, sh_x_z, 0.09, 0.02, S.m('cloth'), seg=14, name='w_shield2')
    sh2.rotation_euler = (0, math.radians(90), 0)
    cyl(sh_x_x + 0.012, sh_x_y, sh_x_z, 0.094, 0.008, S.m('metal'), seg=14, name='w_shield2_rim').rotation_euler = (0, math.radians(90), 0)
    cyl(sh_x_x + 0.016, sh_x_y, sh_x_z, 0.028, 0.012, S.m('metal'), seg=8, name='w_boss2').rotation_euler = (0, math.radians(90), 0)
    S.emblem('x', sh_x_x + 0.025, sh_x_y, sh_x_z, 0.10)

    # Weapon racks out front (task: "weapon racks out front")
    # Spear / pike rack
    box(-0.28, 0.30, 0.0, 0.025, 0.025, 0.28, S.m('trim'), 'wr_p1')
    box(-0.06, 0.30, 0.0, 0.025, 0.025, 0.28, S.m('trim'), 'wr_p2')
    box(-0.17, 0.30, 0.16, 0.24, 0.02, 0.02, S.m('trim'), 'wr_bar')
    for hx in (-0.23, -0.17, -0.11):
        cyl(hx, 0.30, 0.02, 0.008, 0.32, S.m('wood_light'), seg=6, name='halberd_shaft')
        cone(hx, 0.30, 0.34, 0.022, 0.06, S.m('metal'), seg=4, name='halberd_tip')

    # Iron-banded weapon chest with swords
    box(0.18, 0.30, 0.0, 0.18, 0.12, 0.11, S.m('wood_dark'), 'wchest', bevel=0.005)
    box(0.18, 0.30, 0.11, 0.185, 0.125, 0.012, S.m('metal'), 'wchest_band')
    sw1 = box(0.14, 0.30, 0.09, 0.012, 0.022, 0.16, S.m('metal'), 'sword1')
    sw1.rotation_euler = (0, math.radians(15), 0)
    sw2 = box(0.22, 0.30, 0.09, 0.012, 0.022, 0.16, S.m('metal'), 'sword2')
    sw2.rotation_euler = (0, math.radians(-15), 0)

    # Blacksmith anvil & whetstone sharpening trough
    cyl(0.32, 0.16, 0.0, 0.05, 0.10, S.m('wood_dark'), seg=8, name='anvil_block')
    box(0.32, 0.16, 0.10, 0.08, 0.05, 0.04, S.m('metal'), 'anvil_top')
    cone(0.37, 0.16, 0.11, 0.02, 0.05, S.m('metal'), seg=6, name='anvil_horn').rotation_euler = (0, math.radians(90), 0)

    # Forge chimney with animated smoke
    S.chimney(ax - 0.24, ay - 0.18, 0.90, 0.28, rng)

    # Waving heraldic banner out front
    S.banner('y', 0.28, ay + sy / 2, 0.36, w=0.10, h=0.22)

    # Yard props: barrel, crates, lamp
    S.barrel(-0.35, 0.18)
    S.crate(-0.34, 0.30, rng=rng)
    S.lamp(0.34, 0.34)


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
