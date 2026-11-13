# Work: farm, factory, lumber, mine, fishery, windmill, sawmill, smelter, craft hall, foundry, workshop.
import math
import kit
from kit import box, cone, cyl, sphere
from style import Style  # noqa: F401


def farm(S, rng):
    # Sim height: 0.5. Farmland with tilled crop rows, fence, scarecrow with fluttering cloth, and animated crow
    # Tilled field soil bed (no full-tile slab)
    box(0.0, 0.0, -0.005, 0.86, 0.86, 0.012, S.m('dirt'), 'field')

    # Furrows and growing crop clusters
    for i in range(6):
        y = -0.32 + i * 0.12
        box(0.0, y, 0.004, 0.78, 0.05, 0.02, S.m('dirt'), f'furrow_{i}')
        for k in range(7):
            x = -0.30 + k * 0.10
            c_mat = S.m('crop' if (i + k) % 2 == 0 else 'crop2')
            cone(x + rng.uniform(-0.01, 0.01), y, 0.024, 0.03, rng.uniform(0.07, 0.10), c_mat, seg=5, name='crop')

    # Fence enclosing rear edges
    S.fence([(-0.44, 0.44), (0.44, 0.44), (0.44, -0.20)], rng, h=0.10)

    # Scarecrow in the field with fluttering cloth
    sc_pos = (-0.12, 0.08)
    box(sc_pos[0], sc_pos[1], 0.0, 0.025, 0.025, 0.36, S.m('wood_dark'), 'sc_pole')
    sc_arm = box(sc_pos[0], sc_pos[1], 0.26, 0.02, 0.26, 0.02, S.m('wood_dark'), 'sc_cross')
    box(sc_pos[0], sc_pos[1], 0.14, 0.09, 0.11, 0.14, S.m('cloth'), 'sc_shirt')
    sphere(sc_pos[0], sc_pos[1], 0.34, 0.045, S.m('emblem'), 'sc_head')
    cone(sc_pos[0], sc_pos[1], 0.36, 0.07, 0.06, S.m('crop'), seg=8, name='sc_hat')

    # Fluttering cloth sleeve on the scarecrow arm (kit.anim)
    sleeve = box(sc_pos[0], sc_pos[1] + 0.11, 0.18, 0.015, 0.06, 0.10, S.m('cloth'), 'sc_cloth')
    sleeve.location = (sc_pos[0], sc_pos[1] + 0.11, 0.24)

    # Animated crow perched on the fence that bobs its head
    crow_body = box(0.44, 0.16, 0.11, 0.025, 0.04, 0.03, S.m('stone_dark'), 'crow_b')
    crow_head = sphere(0.44, 0.14, 0.13, 0.016, S.m('stone_dark'), 'crow_h')
    cone(0.44, 0.12, 0.13, 0.008, 0.02, S.m('accent2'), seg=4, name='crow_beak').rotation_euler.x = math.radians(-90)

    kit.anim(lambda f, n: [
        setattr(sleeve, 'rotation_euler', (
            0.18 * math.sin(2 * math.pi * f / n),
            0.12 * math.cos(2 * math.pi * f / n),
            0.15 * math.sin(2 * math.pi * f / n)
        )),
        setattr(crow_head, 'location', (
            0.44,
            0.14 - 0.008 * (1 if f % 2 else 0),
            0.13 + (0.008 if f % 2 else 0)
        ))
    ])

    # Props: vegetable crates, grain sacks, water trough, wheelbarrow, watering can (>= 5 props)
    S.sack(-0.34, -0.32)
    S.sack(-0.27, -0.34)
    S.barrel(0.34, -0.36, r=0.045, h=0.09)
    S.crate(-0.34, -0.22, s=0.08, rng=rng)
    # Hand wheelbarrow near front
    box(0.18, -0.30, 0.03, 0.10, 0.16, 0.05, S.m('wood'), 'barrow_box')
    cyl(0.18, -0.20, 0.01, 0.035, 0.015, S.m('metal'), seg=8, name='barrow_w').rotation_euler = (0, math.radians(90), 0)
    box(0.18, -0.38, 0.04, 0.08, 0.02, 0.02, S.m('wood_dark'), 'barrow_handle')


def windmill(S, rng):
    # Sim height: 1.5. Stone & timber tapering tower with turning 4-sail wheel
    S.footing(0.0, 0.0, 0.50, 0.50, 0.12, rng)
    cone(0.0, 0.0, 0.12, 0.27, 0.80, S.m('wood'), seg=8, r_top=0.17, name='mill')
    for i in range(5):
        cyl(0.0, 0.0, 0.18 + i * 0.15, 0.27 - i * 0.02, 0.02, S.m('trim'), seg=8, name='band')
    S.window('x', 0.24, 0.0, 0.42, w=0.08, h=0.10)
    S.door('x', 0.26, 0.0, 0.12, w=0.13, h=0.20)
    cone(0.0, 0.0, 0.92, 0.24, 0.30, S.m('roof'), seg=8, name='cap')

    # Turning windmill hub & sails
    hub = (0.22, -0.05, 0.92)
    cyl(hub[0], hub[1], hub[2] - 0.03, 0.035, 0.06, S.m('metal'), seg=8, name='hub').rotation_euler = (0, math.radians(90), 0)
    arms = []
    for k in range(4):
        arm = box(0, 0, 0, 0.02, 0.025, 0.52, S.m('trim'), 'arm')
        arm.location = hub
        sail = box(0, 0.045, 0.12, 0.012, 0.09, 0.38, S.m('emblem'), 'sail')
        sail.parent = arm
        arms.append((arm, math.radians(20 + 90 * k)))

    # 4 sails turn 30 degrees a frame: 3 frames make a seamless loop (90 degree symmetry)
    kit.anim(lambda f, n: [setattr(a, 'rotation_euler', (a0 + math.radians(30) * f, 0, 0)) for a, a0 in arms])

    # Props: flour sacks, grain barrels, wheatsheaf, lantern, bench (>= 5 props)
    S.sack(-0.30, 0.36)
    S.sack(-0.22, 0.36)
    S.sack(-0.26, 0.28)
    S.barrel(0.32, 0.24, r=0.05, h=0.10)
    S.crate(0.28, 0.34, rng=rng)
    S.lamp(-0.28, -0.28)


def factory(S, rng):
    # Sim height: 1.6. Wide works hall, sawtooth roof of 3 small gables, big doors, 2 stacks, crates, ore cart
    # Wide works hall footprint filling the tile
    fx, fy = -0.02, -0.08
    sx, sy = 0.82, 0.48
    h_wall = 0.60
    S.footing(fx, fy, sx, sy, 0.12, rng)
    S.walls(fx, fy, 0.12, sx, sy, h_wall, rng, kind='stone')

    # Sawtooth roof: 3 distinct gables in a row along X (ridges along Y)
    bay_w = sx / 3.0
    for i in range(3):
        bx = fx - sx / 2 + (i + 0.5) * bay_w
        S.gable(bx, fy, 0.12 + h_wall, bay_w, sy, 0.30, rng, along='y', over=0.03, rows=5)

    # 2 tall industrial smoking stacks at the rear (-X) reaching height 1.55 (sim height 1.6)
    stack1_pos = (fx - 0.26, fy - 0.12)
    cyl(stack1_pos[0], stack1_pos[1], 0.35, 0.075, 1.15, S.m('stone_dark'), seg=12, name='stack1')
    cyl(stack1_pos[0], stack1_pos[1], 1.50, 0.09, 0.04, S.m('metal'), seg=12, name='stack1_cap')
    for bz in (0.75, 1.10, 1.35):
        cyl(stack1_pos[0], stack1_pos[1], bz, 0.08, 0.02, S.m('metal'), seg=12, name=f'stack1_band_{bz}')
    S.smoke(stack1_pos[0], stack1_pos[1], 1.55)

    stack2_pos = (fx + 0.10, fy - 0.14)
    cyl(stack2_pos[0], stack2_pos[1], 0.35, 0.065, 1.02, S.m('stone_dark'), seg=12, name='stack2')
    cyl(stack2_pos[0], stack2_pos[1], 1.37, 0.08, 0.04, S.m('metal'), seg=12, name='stack2_cap')
    for bz in (0.70, 1.00, 1.25):
        cyl(stack2_pos[0], stack2_pos[1], bz, 0.07, 0.02, S.m('metal'), seg=12, name=f'stack2_band_{bz}')
    S.smoke(stack2_pos[0], stack2_pos[1], 1.42)

    # Big double factory doors on +Y face with industrial iron frame
    S.door('y', fx + 0.14, fy + sy / 2, 0.12, w=0.26, h=0.38)
    box(fx + 0.14, fy + sy / 2 + 0.01, 0.49, 0.30, 0.02, 0.025, S.m('metal'), 'door_roller_rail')

    # Crane hoist beam projecting from the gable peak above the big doors
    box(fx + 0.14, fy + sy / 2 + 0.07, 0.88, 0.035, 0.16, 0.035, S.m('metal'), 'hoist_jib')
    cyl(fx + 0.14, fy + sy / 2 + 0.13, 0.72, 0.005, 0.16, S.m('metal'), seg=4, name='hoist_chain')
    hook = sphere(fx + 0.14, fy + sy / 2 + 0.13, 0.71, 0.016, S.m('metal'), 'hoist_hook')
    kit.anim(lambda f, n: setattr(hook, 'location', (
        fx + 0.14,
        fy + sy / 2 + 0.13 + 0.01 * math.sin(2 * math.pi * f / n),
        0.71
    )))

    # Industrial grid windows on +Y and +X faces
    S.window('y', fx - 0.24, fy + sy / 2, 0.28, w=0.14, h=0.20)
    S.window('x', fx + sx / 2, fy - 0.08, 0.28, w=0.14, h=0.20)
    S.window('x', fx + sx / 2, fy + 0.08, 0.28, w=0.14, h=0.20)

    # Ore cart on tracks out front (task: "crates, ore cart")
    for i in range(5):
        ty = 0.18 + i * 0.06
        box(-0.16, ty, 0.0, 0.20, 0.025, 0.015, S.m('wood_dark'), f'fsleeper_{i}')
    box(-0.23, 0.30, 0.015, 0.015, 0.28, 0.02, S.m('metal'), 'frail_l')
    box(-0.09, 0.30, 0.015, 0.015, 0.28, 0.02, S.m('metal'), 'frail_r')

    # Ore cart with raw ore
    box(-0.16, 0.30, 0.035, 0.15, 0.18, 0.09, S.m('metal'), 'fcart')
    for wx, wy in ((-0.23, 0.24), (-0.23, 0.36), (-0.09, 0.24), (-0.09, 0.36)):
        c = cyl(wx, wy, 0.012, 0.024, 0.012, S.m('metal'), seg=8, name='fcwheel')
        c.rotation_euler = (0, math.radians(90), 0)
    sphere(-0.16, 0.30, 0.13, 0.05, S.m('accent2'), 'fore', squash=0.7)

    # Factory yard props: crates, barrels, iron gear, lamp
    S.crate(0.26, 0.26, s=0.09, rng=rng)
    S.crate(0.33, 0.33, s=0.08, rng=rng)
    S.barrel(0.24, 0.35, r=0.05, h=0.10)
    S.barrel(0.16, 0.38, r=0.045, h=0.09)
    # Heavy cast iron gear wheel leaned against factory wall
    gear = cyl(fx + sx / 2 + 0.015, fy + 0.14, 0.08, 0.07, 0.015, S.m('metal'), seg=12, name='factory_gear')
    gear.rotation_euler = (0, math.radians(80), 0)
    S.lamp(-0.36, 0.30)


def lumber(S, rng):
    # Sim height: 0.9. Woodcutter's camp: shelter with smoking chimney, log pile, animated chopping axe on stump
    # Shelter / tool shed
    S.walls(-0.18, -0.16, 0.0, 0.36, 0.34, 0.38, rng, kind='plank')
    S.roof(-0.18, -0.16, 0.38, 0.36, 0.34, 0.24, rng, shape='gable', along='y')
    S.door('y', -0.18, 0.01, 0.0, w=0.14, h=0.24)
    box(-0.18, 0.03, 0.0, 0.18, 0.06, 0.02, S.m('stone'), 'lumber_step')
    S.window('x', 0.0, -0.16, 0.14, w=0.09, h=0.11)
    # Cozy woodcutter chimney with animated smoke (task: "axe chops / smoke")
    S.chimney(-0.27, -0.23, 0.46, 0.24, rng)

    # Open awning over entry
    box(-0.04, 0.12, 0.0, 0.025, 0.025, 0.32, S.m('trim'), 'lpost1')
    box(-0.32, 0.12, 0.0, 0.025, 0.025, 0.32, S.m('trim'), 'lpost2')
    box(-0.18, 0.07, 0.33, 0.34, 0.15, 0.02, S.m('wood_light'), 'awning').rotation_euler.x = math.radians(-15)

    # Log pile pyramid at (0.20, -0.12)
    for i, y in enumerate((-0.20, -0.12, -0.04)):
        c = cyl(0.20, y, 0.04, 0.04, 0.40, S.m('trunk'), seg=8, name=f'log0_{i}')
        c.rotation_euler = (0, math.radians(90), 0)
    for i, y in enumerate((-0.16, -0.08)):
        c = cyl(0.20, y, 0.10, 0.04, 0.40, S.m('trunk'), seg=8, name=f'log1_{i}')
        c.rotation_euler = (0, math.radians(90), 0)
    c = cyl(0.20, -0.12, 0.16, 0.04, 0.40, S.m('trunk'), seg=8, name='log2_0')
    c.rotation_euler = (0, math.radians(90), 0)
    # Retaining stakes
    for sx in (0.04, 0.36):
        for sy in (-0.23, 0.0):
            box(sx, sy, 0.0, 0.02, 0.02, 0.22, S.m('wood_dark'), 'stake')

    # Chopping stump with animated chopping axe at (-0.06, 0.24)
    cyl(-0.06, 0.24, 0.0, 0.08, 0.14, S.m('trunk'), seg=8, name='stump')
    # Target cut log on stump
    cyl(-0.06, 0.24, 0.14, 0.04, 0.12, S.m('wood'), seg=8, name='stump_log').rotation_euler = (0, math.radians(90), 0)

    # Axe handle and metal head pivoting in chopping motion
    axe_handle = box(-0.06, 0.24, 0.22, 0.012, 0.016, 0.20, S.m('wood_light'), 'axe_handle')
    axe_head = box(-0.06, 0.24, 0.30, 0.016, 0.06, 0.04, S.m('metal'), 'axe_head')
    axe_head.parent = axe_handle

    # Flying wood chip
    chip = box(-0.06, 0.24, 0.16, 0.02, 0.015, 0.01, S.m('wood_light'), 'chip_fly')

    # Kit.anim for axe chopping motion: 3 distinct poses
    kit.anim(lambda f, n: [
        setattr(axe_handle, 'rotation_euler', (
            0,
            math.radians((35, -10, 15)[f % 3]),
            0
        )),
        setattr(axe_handle, 'location', (
            -0.06,
            0.24,
            (0.26, 0.18, 0.22)[f % 3]
        )),
        setattr(chip, 'location', (
            -0.06 + (0.0, 0.04, 0.02)[f % 3],
            0.24 + (0.0, 0.03, 0.01)[f % 3],
            (0.15, 0.22, 0.18)[f % 3]
        ))
    ])

    # Sawhorse with cut log at (0.14, 0.22)
    for hx in (0.04, 0.24):
        l1 = box(hx, 0.22, 0.0, 0.02, 0.02, 0.24, S.m('trim'), 'leg1')
        l1.rotation_euler = (math.radians(22), 0, 0)
        l2 = box(hx, 0.22, 0.0, 0.02, 0.02, 0.24, S.m('trim'), 'leg2')
        l2.rotation_euler = (math.radians(-22), 0, 0)
    box(0.14, 0.22, 0.16, 0.24, 0.025, 0.025, S.m('trim'), 'saw_spine')

    # Props: log pile, sawhorse, chopping stump, barrel, crate, lamp, chips (>= 5 props)
    S.barrel(0.34, 0.16, r=0.045, h=0.09)
    S.crate(-0.35, -0.05, rng=rng)
    S.lamp(-0.30, 0.20)


def mine(S, rng):
    # Sim height: 0.8. Rocky mountain adit with animated cart moving on rails and flickering lantern
    # Rock outcrop / cliff face (stepped boulders)
    sphere(-0.09, -0.09, 0.24, 0.35, S.m('stone'), 'cliff1', squash=0.65)
    sphere(-0.17, 0.06, 0.20, 0.24, S.m('stone_dark'), 'cliff2', squash=0.65)
    sphere(0.08, -0.16, 0.22, 0.27, S.m('stone_light'), 'cliff3', squash=0.60)
    sphere(-0.09, -0.07, 0.44, 0.21, S.m('stone'), 'cliff4', squash=0.55)

    # Timbered adit entrance at (-0.04, 0.08)
    box(-0.04, 0.06, 0.0, 0.22, 0.16, 0.32, S.m('stone_dark'), 'adit_void')
    box(-0.16, 0.13, 0.0, 0.045, 0.045, 0.36, S.m('wood_dark'), 'tpost_l')
    box(0.08, 0.13, 0.0, 0.045, 0.045, 0.36, S.m('wood_dark'), 'tpost_r')
    box(-0.04, 0.13, 0.34, 0.30, 0.05, 0.05, S.m('wood_dark'), 'lintel')
    box(-0.04, 0.12, 0.38, 0.34, 0.04, 0.06, S.m('wood'), 'retaining')

    # Hanging lantern from lintel with animated flicker
    mlamp = box(-0.04, 0.16, 0.28, 0.035, 0.035, 0.045, S.m('glow', emit=5), 'noink_mlamp')

    # Pickaxe leaning on left post
    pkh = box(-0.18, 0.16, 0.0, 0.012, 0.015, 0.24, S.m('wood_light'), 'pick_handle')
    pkh.rotation_euler = (math.radians(-15), 0, math.radians(20))
    box(-0.18, 0.18, 0.20, 0.015, 0.08, 0.025, S.m('metal'), 'pick_head')

    # Rails leading forward
    for i in range(5):
        yt = 0.10 + i * 0.07
        box(-0.04, yt, 0.0, 0.20, 0.03, 0.015, S.m('wood_dark'), f'sleeper_{i}')
    box(-0.11, 0.24, 0.015, 0.015, 0.32, 0.02, S.m('metal'), 'rail_l')
    box(0.03, 0.24, 0.015, 0.015, 0.32, 0.02, S.m('metal'), 'rail_r')

    # Animated mine cart on rails (task: "cart moves on rails / lantern flicker")
    cart_bed = box(-0.04, 0.24, 0.035, 0.15, 0.18, 0.02, S.m('wood_dark'), 'cart_bed')
    cart_body = box(0.0, 0.0, 0.045, 0.14, 0.17, 0.09, S.m('metal'), 'cart_body')
    cart_body.parent = cart_bed
    # Ore in cart
    ore1 = sphere(0.0, 0.0, 0.09, 0.045, S.m('accent2'), 'cart_ore', squash=0.8)
    ore1.parent = cart_bed

    # Wheels
    for wx, wy in ((-0.07, -0.06), (-0.07, 0.06), (0.07, -0.06), (0.07, 0.06)):
        w = cyl(wx, wy, -0.02, 0.022, 0.015, S.m('metal'), seg=8, name='cart_wheel')
        w.rotation_euler = (0, math.radians(90), 0)
        w.parent = cart_bed

    # 3-frame animation: cart moves along rails and lantern flickers
    kit.anim(lambda f, n: [
        setattr(cart_bed, 'location', (
            -0.04,
            (0.18, 0.30, 0.24)[f % 3],
            0.035
        )),
        setattr(mlamp, 'scale', (
            (1.0, 1.35, 0.8)[f % 3],
            (1.0, 1.35, 0.8)[f % 3],
            (1.0, 1.35, 0.8)[f % 3]
        ))
    ])

    # Ore piles on ground & props (>= 5 props)
    sphere(0.22, 0.24, 0.03, 0.07, S.m('stone_dark'), 'ore_pile1', squash=0.6)
    sphere(0.26, 0.17, 0.025, 0.055, S.m('accent2'), 'ore_pile2', squash=0.6)
    S.barrel(-0.32, 0.26)
    S.crate(0.30, 0.34, rng=rng)
    S.rock(-0.33, -0.30, 0.08, rng=rng)
    S.rock(0.34, -0.30, 0.08, rng=rng)


def fishery(S, rng):
    # Sim height: 0.7. Jetty on an irregular pond (several S.water pieces, not one square), fish drying rack, small boat
    # Irregular pond: 3 overlapping S.water bodies to form an organic shoreline
    S.water(0.18, 0.14, 0.005, 0.44, 0.46)
    S.water(0.04, 0.26, 0.005, 0.30, 0.32)
    S.water(0.28, -0.04, 0.005, 0.26, 0.34)

    # Shoreline revetment and rocks framing the water
    S.rock(-0.14, 0.18, 0.065, rng=rng)
    S.rock(0.14, -0.18, 0.06, rng=rng)
    S.rock(-0.02, 0.38, 0.055, rng=rng)
    S.rock(0.38, 0.20, 0.06, rng=rng)

    # Fisherman's weathered shack on dry ground (-0.22, -0.20)
    S.walls(-0.22, -0.20, 0.0, 0.36, 0.34, 0.32, rng, kind='plank')
    S.roof(-0.22, -0.20, 0.32, 0.36, 0.34, 0.22, rng, shape='gable', along='x')
    S.door('y', -0.22, -0.03, 0.0, w=0.13, h=0.22)
    S.window('x', -0.04, -0.20, 0.12, w=0.09, h=0.11)

    # Wooden pier / jetty extending into the water
    for px, py in ((-0.02, 0.06), (0.12, 0.06), (0.24, 0.06), (-0.02, 0.18), (0.12, 0.18), (0.24, 0.18)):
        cyl(px, py, 0.0, 0.02, 0.10, S.m('wood_dark'), seg=8, name='piling')
    box(0.11, 0.12, 0.09, 0.32, 0.18, 0.02, S.m('wood'), 'jetty_deck')
    # Mooring posts
    cyl(0.25, 0.06, 0.09, 0.022, 0.08, S.m('trim'), seg=8, name='post1')
    cyl(0.25, 0.18, 0.09, 0.022, 0.08, S.m('trim'), seg=8, name='post2')

    # Small wooden rowing boat moored alongside jetty that bobs gently (kit.anim)
    boat_x, boat_y = 0.25, 0.24
    boat = box(boat_x, boat_y, 0.025, 0.13, 0.22, 0.04, S.m('wood_dark'), 'boat_hull')
    # Tapered bow and seats
    bow = cone(boat_x, boat_y + 0.12, 0.025, 0.06, 0.08, S.m('wood_dark'), seg=4, name='boat_bow')
    thwart = box(boat_x, boat_y, 0.05, 0.11, 0.04, 0.015, S.m('wood_light'), 'boat_thwart')
    # Oars resting inside boat
    o1 = cyl(boat_x - 0.03, boat_y, 0.06, 0.007, 0.20, S.m('trim'), seg=6, name='oar1')
    o1.rotation_euler.x = math.radians(15)
    o2 = cyl(boat_x + 0.03, boat_y, 0.06, 0.007, 0.20, S.m('trim'), seg=6, name='oar2')
    o2.rotation_euler.x = math.radians(15)
    bow.parent = boat
    thwart.parent = boat
    o1.parent = boat
    o2.parent = boat

    # Bobbing boat animation
    kit.anim(lambda f, n: setattr(boat, 'location', (
        boat_x,
        boat_y,
        0.025 + (0.0, 0.014, -0.008)[f % 3]
    )))

    # Fish drying rack on shore
    box(-0.28, 0.08, 0.0, 0.02, 0.02, 0.28, S.m('trim'), 'frack_p1')
    box(-0.28, 0.24, 0.0, 0.02, 0.02, 0.28, S.m('trim'), 'frack_p2')
    box(-0.28, 0.16, 0.17, 0.015, 0.18, 0.015, S.m('trim'), 'frack_r1')
    box(-0.28, 0.16, 0.25, 0.015, 0.18, 0.015, S.m('trim'), 'frack_r2')
    for fy in (0.11, 0.16, 0.21):
        f1 = cone(-0.27, fy, 0.11, 0.018, 0.06, S.m('emblem'), seg=4, name='fish')
        f1.rotation_euler.x = math.radians(180)
        f2 = cone(-0.27, fy + 0.01, 0.19, 0.018, 0.06, S.m('emblem'), seg=4, name='fish')
        f2.rotation_euler.x = math.radians(180)

    # Fishing net pile & lantern (>= 5 props)
    box(0.14, 0.14, 0.10, 0.08, 0.07, 0.03, S.m('crop'), 'net_pile', bevel=0.005)
    S.barrel(0.04, 0.14, z=0.09, r=0.035, h=0.08)
    S.barrel(-0.35, -0.06)
    S.crate(-0.36, -0.16, rng=rng)
    box(0.25, 0.06, 0.16, 0.03, 0.03, 0.04, S.m('glow', emit=3.5), 'noink_pier_lamp')


def sawmill(S, rng):
    # Sim height: 1.1. Big water wheel (turning) on a water channel (S.water), log ramp, saw blade, plank stack
    # Mill building
    S.footing(-0.10, -0.08, 0.46, 0.42, 0.12, rng)
    S.walls(-0.10, -0.08, 0.12, 0.46, 0.42, 0.44, rng, kind='plank')
    S.roof(-0.10, -0.08, 0.56, 0.46, 0.42, 0.32, rng, shape='gable', along='x')
    S.door('y', -0.18, 0.13, 0.12, w=0.14, h=0.24)
    S.window('y', 0.04, 0.13, 0.24, w=0.10, h=0.12)
    S.chimney(-0.24, -0.18, 0.60, 0.22, rng)

    # Water channel on the +X flank using S.water (task: "water channel (S.water)")
    box(0.24, -0.06, 0.0, 0.18, 0.66, 0.04, S.m('stone'), 'ch_bed')
    box(0.14, -0.06, 0.03, 0.03, 0.66, 0.06, S.m('wood_dark'), 'ch_wall_l')
    box(0.33, -0.06, 0.03, 0.03, 0.66, 0.06, S.m('wood_dark'), 'ch_wall_r')
    S.water(0.24, -0.06, 0.04, 0.15, 0.64)

    # Big turning water wheel on the +X wall (hub at (0.24, -0.08, 0.28))
    hub_pos = (0.24, -0.08, 0.28)
    hub = cyl(hub_pos[0], hub_pos[1], hub_pos[2] - 0.04, 0.04, 0.08, S.m('metal'), seg=8, name='wheel_hub')
    hub.rotation_euler = (0, math.radians(90), 0)
    paddles = []
    for k in range(4):
        p = box(0, 0, -0.20, 0.045, 0.02, 0.40, S.m('wood_dark'), 'paddle')
        p.location = hub_pos
        a0 = math.radians(k * 45)
        p.rotation_euler = (a0, 0, 0)
        # blade paddles at both ends
        b1 = box(0, 0, 0.18, 0.06, 0.06, 0.012, S.m('wood'), 'blade1')
        b1.parent = p
        b2 = box(0, 0, -0.18, 0.06, 0.06, 0.012, S.m('wood'), 'blade2')
        b2.parent = p
        paddles.append((p, a0))

    # Log feeder ramp & logs on ramp
    box(-0.10, 0.25, 0.0, 0.03, 0.26, 0.10, S.m('wood_dark'), 'ramp_leg1')
    box(0.04, 0.25, 0.0, 0.03, 0.26, 0.10, S.m('wood_dark'), 'ramp_leg2')
    box(-0.03, 0.25, 0.10, 0.18, 0.26, 0.02, S.m('wood'), 'log_bed')
    l1 = cyl(-0.03, 0.20, 0.13, 0.035, 0.20, S.m('trunk'), seg=8, name='feeder_log1')
    l1.rotation_euler = (0, math.radians(90), 0)
    l2 = cyl(-0.03, 0.28, 0.13, 0.035, 0.20, S.m('trunk'), seg=8, name='feeder_log2')
    l2.rotation_euler = (0, math.radians(90), 0)

    # Vertical saw blade in the open bay that reciprocates (kit.anim)
    saw_blade = box(0.11, 0.06, 0.22, 0.01, 0.04, 0.18, S.m('metal'), 'saw_blade')

    # Kit.anim: 8-paddle wheel turns 15 deg per frame (3 frames = 45 deg loop) & saw reciprocates
    kit.anim(lambda f, n: [
        [setattr(p, 'rotation_euler', (a0 + math.radians(15) * f, 0, 0)) for p, a0 in paddles],
        setattr(saw_blade, 'location', (0.11, 0.06, 0.22 + (0.0, 0.03, -0.02)[f % 3]))
    ])

    # Cut lumber plank stacks & props (>= 5 props)
    box(-0.28, 0.28, 0.0, 0.14, 0.22, 0.09, S.m('wood_light'), 'plank_stack1')
    box(-0.28, 0.28, 0.09, 0.12, 0.20, 0.07, S.m('wood'), 'plank_stack2')
    S.barrel(-0.35, 0.12)
    S.crate(-0.34, 0.0, rng=rng)
    S.lamp(0.04, 0.36)


def workshop(S, rng):
    # Sim height: 1.1. Open-front shed with a big gear wheel on the wall that TURNS, workbench, tools
    # Timber footing & post-and-beam framed shed
    wx, wy = -0.04, -0.04
    sx, sy = 0.54, 0.44
    S.footing(wx, wy, sx, sy, 0.10, rng)

    # Enclosed back and side walls; +Y front face is OPEN with corner posts & lintel
    # Back wall (-Y)
    box(wx, wy - sy / 2 + 0.015, 0.10, sx, 0.03, 0.44, S.m('wood'), 'back_wall')
    # Left side wall (-X)
    box(wx - sx / 2 + 0.015, wy, 0.10, 0.03, sy, 0.44, S.m('wood'), 'left_wall')
    # Right side wall (+X)
    box(wx + sx / 2 - 0.015, wy, 0.10, 0.03, sy, 0.44, S.m('wood'), 'right_wall')
    # Heavy timber posts on open front (+Y)
    box(wx - sx / 2 + 0.02, wy + sy / 2 - 0.02, 0.10, 0.04, 0.04, 0.44, S.m('trim'), 'front_post_l')
    box(wx + sx / 2 - 0.02, wy + sy / 2 - 0.02, 0.10, 0.04, 0.04, 0.44, S.m('trim'), 'front_post_r')
    box(wx, wy + sy / 2 - 0.02, 0.50, sx, 0.04, 0.04, S.m('trim'), 'front_lintel')

    # Shed roof sloping forward / gable
    S.roof(wx, wy, 0.54, sx, sy, 0.28, rng, shape='gable', along='x')
    S.chimney(wx - 0.18, wy - 0.12, 0.56, 0.24, rng)

    # Big turning gear wheel mounted on back wall (task: "big gear wheel on the wall that TURNS")
    # Wall hub at (wx - 0.02, wy - sy / 2 + 0.04, 0.38)
    gear_center = (wx - 0.02, wy - sy / 2 + 0.04, 0.38)
    hub = cyl(gear_center[0], gear_center[1] + 0.02, gear_center[2], 0.035, 0.04, S.m('metal'), seg=8, name='gear_hub')
    hub.rotation_euler = (math.radians(90), 0, 0)
    # Gear rim
    rim = cyl(gear_center[0], gear_center[1] + 0.02, gear_center[2], 0.14, 0.018, S.m('accent2'), seg=12, name='gear_rim')
    rim.rotation_euler = (math.radians(90), 0, 0)

    # 6 gear teeth / cross-arms turning 20 deg per frame (60 deg symmetry = seamless loop)
    teeth = []
    for k in range(3):
        t = box(0, 0, 0, 0.028, 0.018, 0.34, S.m('metal'), f'gteeth_{k}')
        t.location = gear_center
        a0 = math.radians(k * 60)
        t.rotation_euler = (0, a0, 0)
        teeth.append((t, a0))
    kit.anim(lambda f, n: [setattr(t, 'rotation_euler', (0, a0 + math.radians(20) * f, 0)) for t, a0 in teeth])

    # Visible interior carpenter/tinkerer workbench facing front
    box(wx + 0.04, wy + 0.04, 0.10, 0.26, 0.14, 0.13, S.m('wood_dark'), 'workbench', bevel=0.005)
    box(wx - 0.07, wy + 0.04, 0.23, 0.035, 0.035, 0.035, S.m('metal'), 'bench_vise')
    # Tools on bench: hammer, hand plane, gears
    box(wx + 0.02, wy + 0.04, 0.23, 0.015, 0.06, 0.012, S.m('wood_light'), 'hammer_h')
    box(wx + 0.02, wy + 0.07, 0.23, 0.03, 0.02, 0.02, S.m('metal'), 'hammer_head')
    cyl(wx + 0.10, wy + 0.04, 0.23, 0.035, 0.015, S.m('accent2'), seg=8, name='brass_gear')

    # Anvil on tree stump in the front yard
    cyl(wx + 0.22, wy + 0.24, 0.0, 0.065, 0.10, S.m('trunk'), seg=8, name='stump')
    box(wx + 0.22, wy + 0.24, 0.10, 0.11, 0.06, 0.05, S.m('metal'), 'anvil')

    # Outdoor props: crate of spare parts, oil barrel, quench bucket, lantern, toolbox (>= 5 props)
    S.crate(-0.32, 0.22, s=0.08, rng=rng)
    S.barrel(-0.32, 0.10)
    S.barrel(wx - 0.18, wy + 0.24, r=0.04, h=0.08)
    S.lamp(0.32, 0.32)


def crafthall(S, rng):
    # Sim height: 1.4. Imposing artisan complex with two distinct wings, artisan goods display, hanging sign
    # Wing 1: Main Guildhall wing along -X / +Y (0.50 x 0.68)
    mx, my = -0.14, -0.04
    msx, msy = 0.50, 0.68
    S.footing(mx, my, msx, msy, 0.12, rng)
    S.walls(mx, my, 0.12, msx, msy, 0.50, rng, kind='main')
    S.roof(mx, my, 0.62, msx, msy, 0.38, rng, shape='gable', along='y')

    # Wing 2: Artisans workshop wing extending along +X (0.44 x 0.44)
    cx, cy = 0.16, -0.16
    csx, csy = 0.44, 0.44
    S.footing(cx, cy, csx, csy, 0.12, rng)
    S.walls(cx, cy, 0.12, csx, csy, 0.50, rng, kind='main')
    S.roof(cx, cy, 0.62, csx, csy, 0.36, rng, shape='gable', along='x')

    # Spire / lantern cupola at the ridge crossing reaching height 1.35 (sim height 1.4)
    box(-0.04, -0.16, 0.98, 0.12, 0.12, 0.14, S.m('stone_light'), 'turret_base')
    cone(-0.04, -0.16, 1.12, 0.08, 0.20, S.m('roof'), seg=8, name='turret_spire')
    sphere(-0.04, -0.16, 1.34, 0.016, S.m('accent'), 'turret_finial')

    # Chimney with animated smoke
    S.chimney(mx - 0.14, my - 0.20, 0.95, 0.26, rng)

    # Doors & mullioned windows
    S.door('y', mx + 0.10, my + msy / 2, 0.12, w=0.18, h=0.28)
    S.door('x', cx + csx / 2, cy + 0.08, 0.12, w=0.16, h=0.26)
    S.window('y', mx - 0.14, my + msy / 2, 0.26, w=0.12, h=0.16)
    S.window('x', mx - msx / 2, my + 0.14, 0.26, w=0.12, h=0.16)
    S.window('x', cx + csx / 2, cy - 0.10, 0.26, w=0.12, h=0.16)

    # Hanging trade sign on ornate wrought-iron bracket
    box(cx + csx / 2 + 0.04, cy + 0.12, 0.44, 0.08, 0.018, 0.018, S.m('metal'), 'sign_arm')
    hang_sign = box(cx + csx / 2 + 0.08, cy + 0.12, 0.32, 0.014, 0.11, 0.12, S.m('accent2'), 'guild_sign')
    S.emblem('x', cx + csx / 2 + 0.09, cy + 0.12, 0.32, 0.06)

    # Sign sways gently in breeze (kit.anim)
    kit.anim(lambda f, n: setattr(hang_sign, 'rotation_euler', (
        0,
        0.14 * math.sin(2 * math.pi * f / n),
        0
    )))

    # Display goods in the sheltered front courtyard (+X, +Y: x from 0.08 to 0.42, y from 0.08 to 0.42)
    bx, by = 0.20, 0.20
    # Covered artisan display colonnade / stall
    box(bx, by, 0.0, 0.28, 0.16, 0.12, S.m('wood_dark'), 'display_table', bevel=0.005)
    # Awning canopy
    canopy = box(bx, by, 0.36, 0.30, 0.20, 0.02, S.m('cloth'), 'display_canopy')
    canopy.rotation_euler.x = math.radians(-10)
    box(bx - 0.13, by + 0.08, 0.0, 0.018, 0.018, 0.36, S.m('trim'), 'dpost_l')
    box(bx + 0.13, by + 0.08, 0.0, 0.018, 0.018, 0.36, S.m('trim'), 'dpost_r')

    # Goods on display (task: "display goods"):
    # Glazed pottery urn & painted vase
    cyl(bx - 0.08, by, 0.12, 0.035, 0.08, S.m('accent'), seg=8, name='pottery_urn')
    sphere(bx - 0.08, by, 0.21, 0.022, S.m('accent2'), 'urn_rim')
    # Golden chalice / plate
    cone(bx, by - 0.02, 0.12, 0.030, 0.06, S.m('accent2'), seg=6, name='gold_chalice')
    cyl(bx + 0.02, by + 0.04, 0.12, 0.032, 0.01, S.m('accent'), seg=8, name='gold_plate')
    # Fine painted heraldic shield on display
    sh = cyl(bx + 0.08, by, 0.16, 0.055, 0.014, S.m('cloth'), seg=10, name='display_shield')
    sh.rotation_euler = (math.radians(70), 0, 0)
    sphere(bx + 0.08, by, 0.16, 0.018, S.m('emblem'), 'dshield_boss')
    # Rolls of vibrant dyed cloth
    c1 = cyl(bx - 0.04, by + 0.04, 0.12, 0.018, 0.10, S.m('cloth'), seg=6, name='cloth_roll_1')
    c1.rotation_euler = (0, math.radians(90), 0)

    # Props: guild banner, crates of materials, barrels, lamp
    S.banner('x', cx + csx / 2, cy - 0.14, 0.26, w=0.10, h=0.22)
    S.crate(0.36, 0.04, s=0.085, rng=rng)
    S.barrel(0.35, -0.06)
    S.barrel(-0.36, 0.20)
    S.lamp(0.34, 0.34)


def smelter(S, rng):
    # Sim height: 1.3. Conical masonry smelter with glowing hearth, cooling bench with metal ingots, and smoke
    box(-0.08, -0.08, 0.0, 0.38, 0.38, 0.44, S.m('stone_dark'), 'furnace_base', bevel=0.01)
    cone(-0.08, -0.08, 0.44, 0.18, 0.70, S.m('stone_dark'), seg=8, r_top=0.09, name='smelter_stack')
    cyl(-0.08, -0.08, 1.14, 0.11, 0.04, S.m('metal'), seg=8, name='smelter_cap')
    S.smoke(-0.08, -0.08, 1.18)

    # Glowing furnace mouth with animated S.fire
    box(-0.08, 0.11, 0.04, 0.20, 0.06, 0.22, S.m('stone_dark'), 'hearth_arch')
    box(-0.08, 0.08, 0.05, 0.15, 0.06, 0.18, S.m('glow', emit=5.0), 'noink_glowcore')
    S.fire(-0.08, 0.11, 0.05, s=1.2)
    box(-0.08, 0.15, 0.0, 0.26, 0.08, 0.04, S.m('stone'), 'hearth_step')

    # Casting shelter awning on right
    for px, py in ((0.10, 0.0), (0.10, 0.30), (0.34, 0.0), (0.34, 0.30)):
        box(px, py, 0.0, 0.03, 0.03, 0.48, S.m('trim'), 'shed_post')
    S.roof(0.22, 0.15, 0.48, 0.30, 0.34, 0.18, rng, shape='gable', along='y')

    # Cooling bench with metal ingots
    box(0.22, 0.15, 0.0, 0.18, 0.20, 0.10, S.m('stone'), 'ingot_bench')
    for i in range(3):
        box(0.22, 0.08 + i * 0.06, 0.10, 0.14, 0.04, 0.025, S.m('metal'), f'ingot1_{i}')
    for i in range(2):
        box(0.18 + i * 0.07, 0.14, 0.125, 0.04, 0.12, 0.025, S.m('metal'), f'ingot2_{i}')
    box(0.22, 0.14, 0.15, 0.12, 0.04, 0.025, S.m('accent2'), 'ingot_gold')

    # Props: coal pile, crucible, quench barrel, ore crates, lamp (>= 5 props)
    sphere(-0.28, -0.06, 0.03, 0.08, S.m('stone_dark'), 'coal_pile', squash=0.6)
    cyl(0.06, 0.06, 0.0, 0.05, 0.08, S.m('metal'), seg=8, name='crucible')
    S.barrel(0.06, 0.32)
    S.crate(-0.32, 0.20, rng=rng)
    S.lamp(0.36, -0.05)


def foundry(S, rng):
    # Sim height: 1.9. Heavy buttressed foundry with tall stack, forge bay, gantry crane, molten crucible
    S.footing(-0.04, -0.04, 0.60, 0.52, 0.16, rng)
    S.walls(-0.04, -0.04, 0.16, 0.60, 0.52, 0.54, rng, kind='stone')
    for bx, by in ((0.26, 0.22), (-0.34, 0.22), (0.26, -0.30), (-0.34, -0.30)):
        box(bx, by, 0.0, 0.08, 0.08, 0.60, S.m('stone_dark'), 'buttress', bevel=0.01)
    S.roof(-0.04, -0.04, 0.70, 0.60, 0.52, 0.38, rng, shape='gable', along='x')

    # Big smoking chimney stack at (-0.16, -0.16)
    cyl(-0.16, -0.16, 0.50, 0.13, 1.20, S.m('stone_dark'), seg=12, name='foundry_stack')
    for bz in (0.80, 1.20, 1.55):
        cyl(-0.16, -0.16, bz, 0.14, 0.03, S.m('metal'), seg=12, name='stack_hoop')
    cyl(-0.16, -0.16, 1.70, 0.16, 0.06, S.m('metal'), seg=12, name='stack_cap')
    S.smoke(-0.16, -0.16, 1.76)

    # Open arched forge bay on +Y face with glowing molten core
    box(0.08, 0.22, 0.16, 0.28, 0.08, 0.32, S.m('stone_dark'), 'arch_void')
    box(0.08, 0.18, 0.18, 0.24, 0.06, 0.26, S.m('glow', emit=5.0), 'noink_forge_core')

    # Gantry crane over crucible
    box(-0.04, 0.26, 0.0, 0.03, 0.03, 0.42, S.m('metal'), 'gantry_l')
    box(0.20, 0.26, 0.0, 0.03, 0.03, 0.42, S.m('metal'), 'gantry_r')
    box(0.08, 0.26, 0.40, 0.27, 0.035, 0.035, S.m('metal'), 'gantry_beam')

    # Hanging crucible pot with glowing molten core and S.fire
    cyl(0.08, 0.26, 0.18, 0.075, 0.12, S.m('metal'), seg=10, name='crucible_pot')
    cyl(0.08, 0.26, 0.28, 0.065, 0.02, S.m('glow', emit=7.0), seg=10, name='noink_molten')
    S.fire(0.08, 0.26, 0.12, s=0.9)

    # Ingot molds in front with glowing metal
    box(0.08, 0.36, 0.0, 0.24, 0.12, 0.04, S.m('stone_dark'), 'mold_bed')
    for mi in range(3):
        box(-0.02 + mi * 0.07, 0.36, 0.035, 0.035, 0.08, 0.015, S.m('glow', emit=4.0), f'noink_cast_{mi}')

    # Props: slag pile, barrels, crates, ingot stack, lantern (>= 5 props)
    sphere(-0.24, 0.24, 0.04, 0.09, S.m('stone_dark'), 'slag', squash=0.55)
    S.barrel(0.28, 0.30)
    S.crate(-0.32, 0.10, rng=rng)
    S.crate(-0.32, 0.20, rng=rng)
    S.lamp(0.34, 0.16)


RECIPES = {
    'farm': farm, 'windmill': windmill, 'factory': factory, 'lumber': lumber,
    'mine': mine, 'fishery': fishery, 'sawmill': sawmill, 'smelter': smelter,
    'crafthall': crafthall, 'foundry': foundry, 'workshop': workshop,
}
