# Trade: shops, stalls, tavern, bank, bakery, teahouse, tailor, bazaar, trade guild.
from kit import box, cyl, cone, sphere, poly
from style import Style  # noqa: F401 (type of S)


def tavern(S, rng):
    import math, kit
    S.footing(-0.04, -0.04, 0.60, 0.58, 0.1, rng)
    S.walls(-0.04, -0.04, 0.1, 0.60, 0.58, 0.36, rng, kind='plank')
    S.roof(-0.04, -0.04, 0.46, 0.60, 0.58, 0.34, rng, shape='gable', along='y')
    S.door('x', 0.26, 0.05, 0.1, w=0.18)
    box(0.31, 0.05, 0.0, 0.10, 0.22, 0.025, S.m('stone_light'), 't_step')
    S.window('x', 0.26, -0.2, 0.22)
    S.window('y', -0.22, 0.25, 0.22)
    S.window('y', 0.08, 0.25, 0.22)
    S.chimney(-0.25, -0.22, 0.5, 0.38, rng, smoke='always')
    # Swinging tavern trade sign
    box(0.30, 0.22, 0.42, 0.10, 0.02, 0.02, S.m('trim'), 'signarm')
    sign = box(0.34, 0.23, 0.3, 0.012, 0.1, 0.08, S.m('wood_light'), 'sign')
    tankard = cyl(0.35, 0.23, 0.31, 0.022, 0.05, S.m('crop'), seg=8, name='tankard')
    tankard.parent = sign
    kit.anim(lambda f, n: setattr(sign, 'rotation_euler', (
        0,
        0.18 * math.sin(2 * math.pi * f / n),
        0
    )))

    # Outdoor drinking table and seating
    box(0.28, 0.34, 0.0, 0.14, 0.14, 0.06, S.m('wood'), 'table')
    box(0.28, 0.24, 0.0, 0.10, 0.06, 0.04, S.m('wood_dark'), 'stool1')
    cyl(0.28, 0.34, 0.06, 0.015, 0.03, S.m('metal'), seg=6, name='mug1')
    # Props (>= 5 props)
    S.barrel(0.38, 0.16, r=0.055, h=0.11)
    S.barrel(0.38, 0.05, r=0.05, h=0.1)
    S.crate(0.34, -0.16, s=0.08, rng=rng)
    S.lamp(-0.32, 0.34)


def shop(S, rng):
    # Shop front with awning and goods
    S.footing(-0.04, -0.04, 0.52, 0.46, 0.10, rng)
    S.walls(-0.04, -0.04, 0.10, 0.52, 0.46, 0.38, rng)
    S.walls(-0.04, -0.04, 0.48, 0.52, 0.46, 0.28, rng)
    S.roof(-0.04, -0.04, 0.76, 0.52, 0.46, 0.32, rng, shape='gable', along='x', over=0.06)

    # Shop front awning over +x face (slanted cloth canopy)
    # 2 support posts
    box(0.32, -0.20, 0.0, 0.025, 0.025, 0.34, S.m('trim'), 'awn_post1')
    box(0.32, 0.10, 0.0, 0.025, 0.025, 0.34, S.m('trim'), 'awn_post2')
    # Canopy crossbar and sloped cloth roof
    box(0.32, -0.05, 0.34, 0.025, 0.32, 0.02, S.m('trim'), 'awn_bar')
    # Striped awning panels using poly or angled boxes
    awn = box(0.27, -0.05, 0.40, 0.14, 0.34, 0.015, S.m('cloth'), 'awning')
    awn.rotation_euler = (0, 0.35, 0)
    # Decorative stripe on awning
    strp = box(0.27, -0.05, 0.408, 0.14, 0.12, 0.012, S.m('accent'), 'awn_stripe')
    strp.rotation_euler = (0, 0.35, 0)

    # Counter beneath the awning
    box(0.26, -0.05, 0.0, 0.08, 0.28, 0.16, S.m('wood_light'), 'counter')
    # Goods on the counter (potions, trinkets, small sacks)
    cyl(0.26, -0.14, 0.16, 0.022, 0.05, S.m('water'), seg=8, name='potion1')
    cyl(0.26, -0.08, 0.16, 0.025, 0.04, S.m('accent2'), seg=8, name='potion2')
    box(0.26, 0.02, 0.16, 0.04, 0.05, 0.03, S.m('stone_light'), 'gembox')
    sphere(0.26, 0.07, 0.18, 0.02, S.m('glow'), 'orb')

    # Shop entrance door next to the counter
    S.door('x', 0.22, 0.14, 0.10, w=0.12, h=0.22)

    # Hanging trade sign
    import math, kit
    box(0.26, 0.20, 0.46, 0.10, 0.02, 0.02, S.m('trim'), 'signarm')
    shopsign = box(0.30, 0.21, 0.36, 0.012, 0.08, 0.08, S.m('accent'), 'shopsign')
    emb = sphere(0.31, 0.21, 0.36, 0.025, S.m('emblem'), 'shopsign_emb', squash=0.9)
    emb.parent = shopsign
    kit.anim(lambda f, n: setattr(shopsign, 'rotation_euler', (
        0,
        0.15 * math.sin(2 * math.pi * f / n),
        0
    )))

    # Upper floor windows
    S.window('x', 0.22, -0.12, 0.55, w=0.09, h=0.12)
    S.window('x', 0.22, 0.08, 0.55, w=0.09, h=0.12)
    S.window('y', -0.14, 0.19, 0.55, w=0.09, h=0.12)
    S.window('y', 0.08, 0.19, 0.55, w=0.09, h=0.12)

    # Chimney with smoke
    S.chimney(-0.20, -0.16, 0.76, 0.34, rng)

    # Street props
    S.barrel(0.36, -0.18, r=0.05, h=0.10)
    S.crate(0.34, 0.20, s=0.08, rng=rng)
    S.sack(0.24, -0.24)
    S.lamp(0.18, 0.30)


def stall(S, rng):
    # Open market stall, canopy, crates of produce (height ~0.6)
    import math, kit

    # 4 corner timber posts
    post_coords = [(-0.16, -0.18), (0.16, -0.18), (-0.16, 0.18), (0.16, 0.18)]
    for px, py in post_coords:
        box(px, py, 0.0, 0.03, 0.03, 0.38, S.m('wood_dark'), 'stall_post')

    # Connecting top beams
    box(0.0, -0.18, 0.36, 0.34, 0.03, 0.03, S.m('trim'), 'beam_x1')
    box(0.0, 0.18, 0.36, 0.34, 0.03, 0.03, S.m('trim'), 'beam_x2')
    box(-0.16, 0.0, 0.36, 0.03, 0.38, 0.03, S.m('trim'), 'beam_y1')
    box(0.16, 0.0, 0.36, 0.03, 0.38, 0.03, S.m('trim'), 'beam_y2')

    # Central ridge pole for pitched canopy
    box(0.0, 0.0, 0.48, 0.03, 0.42, 0.03, S.m('trim'), 'ridge_pole')
    # Ridge supports
    box(0.0, -0.18, 0.38, 0.02, 0.02, 0.10, S.m('trim'), 'ridge_sup1')
    box(0.0, 0.18, 0.38, 0.02, 0.02, 0.10, S.m('trim'), 'ridge_sup2')

    # Pitched striped fabric canopy
    c_left = box(-0.10, 0.0, 0.44, 0.22, 0.44, 0.015, S.m('cloth'), 'canopy_l')
    c_left.rotation_euler = (0, -0.55, 0)
    c_right = box(0.10, 0.0, 0.44, 0.22, 0.44, 0.015, S.m('accent'), 'canopy_r')
    c_right.rotation_euler = (0, 0.55, 0)

    # Scalloped valance / trim hanging from edges that flutters
    valance = box(0.18, 0.0, 0.33, 0.01, 0.38, 0.06, S.m('emblem'), 'valance')

    # Main wooden display counter inside
    box(0.0, 0.0, 0.0, 0.26, 0.32, 0.16, S.m('wood_light'), 'stall_table')

    # Produce baskets and crates on the table
    box(-0.04, -0.07, 0.16, 0.12, 0.12, 0.05, S.m('wood'), 'produce_crate1')
    box(-0.04, 0.07, 0.16, 0.12, 0.12, 0.05, S.m('wood'), 'produce_crate2')
    # Piles of fresh produce (apples, cabbages, pumpkins)
    for dx in (-0.03, 0.01):
        for dy in (-0.09, -0.05):
            sphere(-0.04 + dx, dy, 0.22, 0.022, S.m('crop'), 'produce_apple')
    for dx in (-0.03, 0.01):
        for dy in (0.05, 0.09):
            sphere(-0.04 + dx, dy, 0.22, 0.025, S.m('crop2'), 'produce_cabbage')

    # Hanging goods / sign from front beam
    gourd = sphere(0.14, -0.06, 0.31, 0.03, S.m('accent2'), 'hanging_gourd')
    lantern = sphere(0.14, 0.06, 0.30, 0.025, S.m('glow'), 'lantern')
    kit.anim(lambda f, n: [
        setattr(valance, 'rotation_euler', (0, 0.14 * math.sin(2 * math.pi * f / n), 0)),
        setattr(lantern, 'location', (0.14, 0.06 + 0.025 * math.sin(2 * math.pi * f / n), 0.30)),
        setattr(gourd, 'location', (0.14, -0.06 + 0.025 * math.cos(2 * math.pi * f / n), 0.31)),
    ])

    # Surrounding props: crates, sacks, barrels of produce
    S.crate(0.28, -0.16, s=0.08, rng=rng)
    S.crate(0.28, -0.16, z=0.08, s=0.06, rng=rng)
    S.sack(-0.26, 0.18)
    S.sack(-0.26, 0.10)
    S.barrel(0.28, 0.16, r=0.05, h=0.10)
    S.lamp(0.28, 0.28)


def bank(S, rng):
    # Imposing stone building, classical columns, strongbox/coins
    # Elevated stone foundation podium with entrance steps
    S.footing(-0.04, -0.02, 0.52, 0.48, 0.14, rng)
    # Entry steps in front of the columns on +x
    box(0.25, -0.02, 0.0, 0.08, 0.32, 0.07, S.m('stone'), 'steps_low')

    # Main reinforced stone building body
    S.stone_walls(-0.08, -0.02, 0.14, 0.44, 0.46, 0.72, rng)

    # Classical colonnade along the front +x entrance
    col_ys = (-0.17, -0.06, 0.06, 0.17)
    for cy in col_ys:
        # Base and capital
        box(0.18, cy, 0.14, 0.07, 0.07, 0.03, S.m('stone_light'), 'col_base')
        cyl(0.18, cy, 0.17, 0.03, 0.62, S.m('stone_light'), seg=12, name='col_shaft')
        box(0.18, cy, 0.79, 0.07, 0.07, 0.03, S.m('stone_light'), 'col_cap')

    # Entablature and architrave beam above columns
    box(0.18, -0.02, 0.82, 0.10, 0.48, 0.06, S.m('stone_light'), 'architrave')

    # Heavy iron-clad double vault door
    box(0.14, -0.02, 0.14, 0.03, 0.18, 0.32, S.m('metal'), 'vault_door')
    # Golden keyhole and lock plate
    box(0.16, -0.02, 0.28, 0.01, 0.04, 0.06, S.m('accent2'), 'vault_lock')

    # Barred security windows on +y face
    S.window('y', -0.22, 0.22, 0.36, w=0.10, h=0.14)
    S.window('y', 0.02, 0.22, 0.36, w=0.10, h=0.14)
    # Iron window grilles
    for wx in (-0.22, 0.02):
        box(wx, 0.24, 0.36, 0.01, 0.08, 0.12, S.m('metal'), 'grille')

    # Grand pediment roof over the hall
    S.roof(-0.06, -0.02, 0.86, 0.50, 0.48, 0.38, rng, shape='gable', along='x', over=0.06)

    # Stone cupola with dome on top (z = 1.24 to 1.54)
    box(-0.06, -0.02, 1.24, 0.20, 0.20, 0.12, S.m('stone_light'), 'cupola_base')
    S.roof(-0.06, -0.02, 1.36, 0.22, 0.22, 0.16, rng, shape='dome')
    cone(-0.06, -0.02, 1.50, 0.035, 0.08, S.m('accent2'), seg=8, name='gold_spire')

    # Strongbox / treasure chest resting on the plinth
    # Chest body with iron straps
    box(0.24, 0.20, 0.14, 0.08, 0.11, 0.08, S.m('wood_dark'), 'chest_body')
    box(0.24, 0.20, 0.14, 0.084, 0.114, 0.082, S.m('metal'), 'chest_bands')
    # Open angled lid
    lid = box(0.24, 0.20, 0.22, 0.085, 0.115, 0.025, S.m('wood_dark'), 'chest_lid')
    lid.rotation_euler = (0, -0.5, 0)
    # Gleaming gold coins spilling from the chest
    for dx, dy, dz in ((-0.01, 0.02, 0.21), (0.01, -0.02, 0.21), (0.02, 0.01, 0.20), (0.04, 0.03, 0.15)):
        cyl(0.24 + dx, 0.20 + dy, dz, 0.018, 0.012, S.m('accent2'), seg=8, name='coin')

    # Security banner, rooftop flag, and grand street lamps
    S.banner('y', 0.12, 0.22, 0.50, w=0.08, h=0.20)
    S.flag(-0.06, -0.02, 1.54, h=0.20)
    S.lamp(0.26, -0.26)
    S.lamp(0.26, 0.28)


def bakery(S, rng):
    # Oven chimney with smoke, bread on a sill
    # Main bakery shop building
    S.footing(0.02, -0.02, 0.46, 0.44, 0.10, rng)
    S.walls(0.02, -0.02, 0.10, 0.46, 0.44, 0.38, rng)
    S.roof(0.02, -0.02, 0.48, 0.46, 0.44, 0.34, rng, shape='gable', along='x', over=0.06)

    # Large masonry bakehouse oven annex on the rear-left flank
    box(-0.18, -0.18, 0.0, 0.24, 0.24, 0.34, S.m('stone'), 'bake_oven', bevel=0.01)
    # Arched brick oven mouth with warm glowing embers inside
    box(-0.05, -0.18, 0.10, 0.04, 0.12, 0.12, S.m('stone_dark'), 'oven_mouth')
    box(-0.04, -0.18, 0.11, 0.02, 0.10, 0.08, S.m('glow', emit=4), 'oven_glow')

    # Heavy stone bakehouse chimney rising from the oven with active smoke
    S.chimney(-0.18, -0.18, 0.34, 0.54, rng, smoke='always')

    # Bread service window with projecting wooden sill on +x face
    box(0.26, -0.08, 0.20, 0.08, 0.20, 0.025, S.m('wood_light'), 'bread_sill')
    # Canopy/awning above the service window
    awn = box(0.28, -0.08, 0.38, 0.09, 0.22, 0.012, S.m('cloth'), 'window_awning')
    awn.rotation_euler = (0, 0.3, 0)
    # Golden loaves of freshly baked bread displayed on the sill
    sphere(0.26, -0.14, 0.23, 0.024, S.m('crop'), 'boule1', squash=0.7)
    sphere(0.26, -0.08, 0.23, 0.025, S.m('accent2'), 'boule2', squash=0.7)
    # Long baguettes / batons
    b1 = box(0.26, -0.02, 0.23, 0.02, 0.06, 0.02, S.m('crop'), 'baguette')
    b1.rotation_euler = (0, 0, 0.2)

    # Shop entrance door next to the bread window
    S.door('x', 0.25, 0.12, 0.10, w=0.12, h=0.22)

    # Bread / pretzel trade sign hanging above door
    import math, kit
    box(0.27, 0.18, 0.42, 0.09, 0.02, 0.02, S.m('trim'), 'bakery_signarm')
    psign = cyl(0.31, 0.19, 0.34, 0.035, 0.015, S.m('accent2'), seg=10, name='pretzelsign')
    kit.anim(lambda f, n: setattr(psign, 'rotation_euler', (
        0,
        0.16 * math.sin(2 * math.pi * f / n),
        0
    )))

    # Side window on +y face
    S.window('y', 0.02, 0.20, 0.24, w=0.10, h=0.12)

    # Flour sacks stacked near the door
    S.sack(0.30, 0.02)
    S.sack(0.33, -0.02)
    # Firewood stacked near the stone oven
    box(-0.18, 0.02, 0.0, 0.08, 0.18, 0.08, S.m('wood_dark'), 'oven_wood')
    # Street props
    S.barrel(0.34, 0.18, r=0.045, h=0.09)
    S.lamp(0.18, 0.26)


def teahouse(S, rng):
    # Wide eaves, lanterns, outdoor tea tables
    # Raised wooden deck platform
    box(-0.02, -0.02, 0.0, 0.56, 0.54, 0.08, S.m('wood_dark'), 'tea_deck')

    # Main pavilion walls with timber lattice framing
    S.footing(-0.04, -0.04, 0.40, 0.38, 0.08, rng)
    S.walls(-0.04, -0.04, 0.08, 0.40, 0.38, 0.36, rng, kind='plank')

    # Sliding lattice screen door on the deck
    S.door('x', 0.16, -0.06, 0.08, w=0.13, h=0.24)
    S.window('y', -0.04, 0.15, 0.20, w=0.12, h=0.14)

    # Wide sweeping lower eaves extending over the veranda
    S.roof(-0.04, -0.04, 0.44, 0.46, 0.44, 0.20, rng, shape='hip', over=0.12)

    # Upper clerestory and tiered pavilion roof
    box(-0.04, -0.04, 0.60, 0.28, 0.26, 0.14, S.m('wall'), 'clerestory')
    S.roof(-0.04, -0.04, 0.74, 0.32, 0.30, 0.26, rng, shape='hip', over=0.10)
    # Roof ornament finial
    cone(-0.04, -0.04, 1.00, 0.035, 0.08, S.m('accent2'), seg=8, name='tea_finial')

    # Glowing paper lanterns hanging from the wide eave corners with pendulum swing (task: "swinging lanterns")
    import math, kit
    lantern_obs = []
    lantern_pos = [
        (0.20, -0.22, 0.38),
        (0.20, 0.16, 0.38),
        (-0.24, 0.16, 0.38),
    ]
    for i, (lx, ly, lz) in enumerate(lantern_pos):
        # String / cord
        box(lx, ly, lz + 0.04, 0.008, 0.008, 0.05, S.m('trim'), 'lstring')
        # Glowing lantern body & cap
        lt = cyl(lx, ly, lz, 0.035, 0.06, S.m('glow', emit=4.5), seg=8, name='tlantern')
        cap = cone(lx, ly, lz + 0.03, 0.042, 0.025, S.m('trim'), seg=6, name='lcap')
        lantern_obs.append((lt, cap, lx, ly, lz, i))

    kit.anim(lambda f, n: [
        [
            setattr(lt, 'location', (
                lx + 0.03 * math.sin(2 * math.pi * (f + idx) / n),
                ly + 0.025 * math.cos(2 * math.pi * (f + idx) / n),
                lz
            )),
            setattr(lt, 'rotation_euler', (
                0.22 * math.sin(2 * math.pi * (f + idx) / n),
                0,
                0.15 * math.cos(2 * math.pi * (f + idx) / n)
            )),
            setattr(cap, 'location', (
                lx + 0.03 * math.sin(2 * math.pi * (f + idx) / n),
                ly + 0.025 * math.cos(2 * math.pi * (f + idx) / n),
                lz + 0.03
            )),
            setattr(cap, 'rotation_euler', (
                0.22 * math.sin(2 * math.pi * (f + idx) / n),
                0,
                0.15 * math.cos(2 * math.pi * (f + idx) / n)
            ))
        ]
        for lt, cap, lx, ly, lz, idx in lantern_obs
    ])

    # Veranda tea tables with cups and steaming teapot
    # Table 1 on +x deck
    box(0.20, 0.08, 0.08, 0.10, 0.10, 0.07, S.m('wood_light'), 'teatable1')
    cyl(0.20, 0.08, 0.15, 0.02, 0.025, S.m('metal'), seg=8, name='teapot')
    S.smoke(0.20, 0.08, 0.18)
    cyl(0.23, 0.11, 0.15, 0.012, 0.015, S.m('emblem'), seg=6, name='teacup1')
    # Table 2 on +y deck
    box(0.06, 0.21, 0.08, 0.10, 0.10, 0.07, S.m('wood_light'), 'teatable2')
    cyl(0.06, 0.21, 0.15, 0.012, 0.015, S.m('emblem'), seg=6, name='teacup2')
    # Low sitting cushions/stools around tables
    box(0.20, 0.0, 0.08, 0.07, 0.07, 0.03, S.m('cloth'), 'cushion1')
    box(0.20, 0.16, 0.08, 0.07, 0.07, 0.03, S.m('cloth'), 'cushion2')
    box(-0.02, 0.21, 0.08, 0.07, 0.07, 0.03, S.m('accent'), 'cushion3')

    # Potted tea bush in a cedar planter
    box(-0.20, 0.20, 0.08, 0.09, 0.09, 0.08, S.m('wood_dark'), 'planter')
    sphere(-0.20, 0.20, 0.21, 0.065, S.m('foliage2'), 'teabush')

    # Garden stone and lantern post
    S.rock(0.24, -0.24, rng=rng)
    S.lamp(-0.24, -0.22)


def tailor(S, rng):
    # Cloth bolts, a mannequin, scissors sign
    # Foundation and two-storey boutique atelier
    S.footing(-0.04, -0.04, 0.48, 0.44, 0.10, rng)
    S.walls(-0.04, -0.04, 0.10, 0.48, 0.44, 0.38, rng)
    S.walls(-0.04, -0.04, 0.48, 0.48, 0.44, 0.26, rng)
    S.roof(-0.04, -0.04, 0.74, 0.48, 0.44, 0.32, rng, shape='gable', along='y', over=0.06)

    # Atelier entrance door on +x face
    S.door('x', 0.21, -0.02, 0.10, w=0.12, h=0.22)
    # Ground floor display window
    S.window('x', 0.21, 0.12, 0.18, w=0.12, h=0.14)
    # Upper floor windows
    S.window('x', 0.21, -0.08, 0.54, w=0.09, h=0.11)
    S.window('x', 0.21, 0.10, 0.54, w=0.09, h=0.11)
    S.window('y', -0.14, 0.19, 0.54, w=0.09, h=0.11)

    # Tailor's mannequin standing outside on +x display
    # Wooden tripod stand and central post
    box(0.28, 0.14, 0.0, 0.08, 0.08, 0.02, S.m('wood_dark'), 'mannequin_base')
    cyl(0.28, 0.14, 0.02, 0.015, 0.16, S.m('wood_light'), seg=8, name='mannequin_post')
    # Tailor's dummy dress form
    cone(0.28, 0.14, 0.18, 0.045, 0.14, S.m('cloth'), seg=10, r_top=0.03, name='dress_form')
    # Dressed shoulder sash and belt
    cyl(0.28, 0.14, 0.24, 0.048, 0.03, S.m('accent'), seg=10, name='dress_belt')
    # Neck topper finial
    sphere(0.28, 0.14, 0.33, 0.022, S.m('wood_light'), 'neck_finial')

    # Display shelf with rolled bolts of fine cloth
    box(0.26, -0.14, 0.0, 0.09, 0.20, 0.14, S.m('wood'), 'bolt_shelf')
    # Horizontal cloth bolts (rolls) in diverse vibrant fabrics
    bolt_colors = ['cloth', 'accent', 'accent2', 'emblem']
    for i, col in enumerate(bolt_colors):
        by = -0.20 + (i % 2) * 0.10
        bz = 0.15 + (i // 2) * 0.05
        b = cyl(0.26, by, bz, 0.022, 0.08, S.m(col), seg=8, name=f'bolt_{i}')
        b.rotation_euler = (0, 1.57, 0)

    # Tailor trade sign: iron bracket with wooden sign & crossed shears/scissors
    import math, kit
    box(0.25, 0.20, 0.44, 0.12, 0.02, 0.02, S.m('trim'), 'signarm')
    signboard = box(0.29, 0.21, 0.32, 0.012, 0.10, 0.09, S.m('wood_light'), 'signboard')
    # Crossed scissor blades on the sign
    s1 = box(0.30, 0.21, 0.32, 0.008, 0.08, 0.012, S.m('metal'), 'shears1')
    s1.rotation_euler = (0.7, 0, 0)
    s2 = box(0.30, 0.21, 0.32, 0.008, 0.08, 0.012, S.m('metal'), 'shears2')
    s2.rotation_euler = (-0.7, 0, 0)
    s1.parent = signboard
    s2.parent = signboard
    kit.anim(lambda f, n: setattr(signboard, 'rotation_euler', (
        0,
        0.15 * math.sin(2 * math.pi * f / n),
        0
    )))

    # Active waving cloth banner from upper floor
    S.banner('y', 0.10, 0.19, 0.50, w=0.08, h=0.20)

    # Stone chimney with smoke
    S.chimney(-0.16, -0.16, 0.74, 0.34, rng)

    # Street props
    S.barrel(0.34, -0.22, r=0.05, h=0.10)
    S.lamp(0.20, 0.28)


def bazaar(S, rng):
    # Several canopies around a small market square with a central fountain/well
    # Cobblestone market plaza paving (plaza IS the building)
    # no paving slab: the game paints plazas itself (a slab reads as a lot plate)

    # Central stone market fountain / well with shimmering water
    box(0.0, 0.0, 0.0, 0.20, 0.20, 0.08, S.m('stone'), 'fountain_rim', bevel=0.01)
    S.water(0.0, 0.0, 0.06, 0.14, 0.14)
    # Central fountain spout / pillar
    cyl(0.0, 0.0, 0.06, 0.025, 0.12, S.m('stone_dark'), seg=8, name='fountain_pillar')

    # Canopy Stall 1 (rear-left: x=-0.20, y=-0.18) - Cloth & Rugs
    # Corner timber posts
    for px, py in ((-0.32, -0.30), (-0.08, -0.30), (-0.32, -0.06), (-0.08, -0.06)):
        box(px, py, 0.0, 0.025, 0.025, 0.36, S.m('wood_dark'), 'post_s1')
    # Pitched striped canopy
    c1 = box(-0.20, -0.18, 0.42, 0.26, 0.26, 0.015, S.m('cloth'), 'canopy1')
    c1.rotation_euler = (0, -0.3, 0)
    # Display table with rolled rugs
    box(-0.20, -0.18, 0.0, 0.18, 0.18, 0.14, S.m('wood'), 'table_s1')
    cyl(-0.20, -0.22, 0.16, 0.022, 0.14, S.m('accent'), seg=8, name='rug1').rotation_euler = (0, 1.57, 0)
    cyl(-0.20, -0.14, 0.16, 0.022, 0.14, S.m('accent2'), seg=8, name='rug2').rotation_euler = (0, 1.57, 0)

    # Canopy Stall 2 (rear-right: x=-0.18, y=0.20) - Spice & Produce
    for px, py in ((-0.30, 0.08), (-0.06, 0.08), (-0.30, 0.32), (-0.06, 0.32)):
        box(px, py, 0.0, 0.025, 0.025, 0.38, S.m('wood_dark'), 'post_s2')
    # Pyramidal / curved canopy
    c2 = box(-0.18, 0.20, 0.44, 0.26, 0.26, 0.015, S.m('accent'), 'canopy2')
    c2.rotation_euler = (0.25, 0, 0)
    # Spice bowls and sacks
    box(-0.18, 0.20, 0.0, 0.18, 0.18, 0.14, S.m('wood_light'), 'table_s2')
    sphere(-0.22, 0.20, 0.16, 0.03, S.m('crop'), 'spice_yellow')
    sphere(-0.14, 0.20, 0.16, 0.03, S.m('crop2'), 'spice_green')
    S.sack(-0.04, 0.26)

    # Canopy Stall 3 (front-left: x=0.18, y=-0.18) - Pottery & Curios
    for px, py in ((0.06, -0.30), (0.30, -0.30), (0.06, -0.06), (0.30, -0.06)):
        box(px, py, 0.0, 0.025, 0.025, 0.36, S.m('wood_dark'), 'post_s3')
    c3 = box(0.18, -0.18, 0.40, 0.26, 0.26, 0.015, S.m('accent2'), 'canopy3')
    c3.rotation_euler = (0, 0.25, 0)
    # Display table with urns and pottery
    box(0.18, -0.18, 0.0, 0.18, 0.18, 0.14, S.m('wood'), 'table_s3')
    cyl(0.16, -0.22, 0.14, 0.025, 0.06, S.m('stone_dark'), seg=8, name='urn1')
    cyl(0.20, -0.14, 0.14, 0.022, 0.05, S.m('wall2'), seg=8, name='urn2')

    # Front-right corner: Market cross flagpole with fluttering flag
    S.flag(0.24, 0.22, 0.0, h=0.55)

    # Surrounding market props: crates, barrels, lanterns
    S.crate(0.32, -0.04, s=0.07, rng=rng)
    S.barrel(-0.02, -0.32, r=0.045, h=0.09)
    S.lamp(0.28, 0.32)


def tradeguild(S, rng):
    # Large civic hall with a bell/clock tower and merchant carts
    # Stately two-storey civic hall
    S.footing(-0.06, -0.04, 0.52, 0.46, 0.12, rng)
    # Ground floor stone masonry
    S.stone_walls(-0.06, -0.04, 0.12, 0.52, 0.46, 0.38, rng)
    # Upper floor with jettied belt course
    S.walls(-0.06, -0.04, 0.50, 0.54, 0.48, 0.34, rng)
    # Steep civic hall gable roof
    S.roof(-0.06, -0.04, 0.84, 0.54, 0.48, 0.36, rng, shape='gable', along='x', over=0.06)

    # Grand civic double door entrance
    S.door('x', 0.20, -0.06, 0.12, w=0.16, h=0.26)
    # Guild coat of arms / emblem above the portal
    S.emblem('x', 0.22, -0.06, 0.44, 0.12)

    # Hall windows on ground and upper floors
    S.window('x', 0.20, -0.20, 0.24, w=0.10, h=0.13)
    S.window('x', 0.20, 0.10, 0.24, w=0.10, h=0.13)
    S.window('x', 0.21, -0.18, 0.62, w=0.10, h=0.13)
    S.window('y', -0.20, 0.19, 0.24, w=0.10, h=0.13)
    S.window('y', -0.20, 0.20, 0.62, w=0.10, h=0.13)

    # Clock / Bell Tower rising from the ridge (x=0.08, y=0.08)
    # Tower shaft
    box(0.08, 0.08, 0.70, 0.22, 0.22, 0.65, S.m('stone_light'), 'tower_shaft', bevel=0.01)
    # Open belfry / clock chamber
    box(0.08, 0.08, 1.35, 0.24, 0.24, 0.16, S.m('trim'), 'belfry_frame')
    # Clock dial on +x and +y faces
    cyl(0.20, 0.08, 1.42, 0.055, 0.01, S.m('emblem'), seg=12, name='clock_x').rotation_euler = (0, 1.57, 0)
    cyl(0.08, 0.20, 1.42, 0.055, 0.01, S.m('emblem'), seg=12, name='clock_y').rotation_euler = (1.57, 0, 0)
    # Golden bell hanging inside belfry
    cone(0.08, 0.08, 1.36, 0.045, 0.08, S.m('accent2'), seg=8, name='guild_bell')

    # Tower spire roof
    cone(0.08, 0.08, 1.51, 0.15, 0.28, S.m('roof'), seg=6, name='tower_spire')
    # Fluttering guild flag on spire peak
    S.flag(0.08, 0.08, 1.78, h=0.20)

    # Merchant freight cart in the loading yard (+x, -y area)
    # Cart bed
    box(0.26, -0.22, 0.08, 0.14, 0.24, 0.03, S.m('wood'), 'cart_bed')
    box(0.26, -0.22, 0.11, 0.14, 0.24, 0.04, S.m('wood_dark'), 'cart_sides')
    # 2 spoke wheels
    w1 = cyl(0.18, -0.22, 0.07, 0.07, 0.016, S.m('wood_dark'), seg=10, name='cwheel1')
    w1.rotation_euler = (0, 1.57, 0)
    w2 = cyl(0.34, -0.22, 0.07, 0.07, 0.016, S.m('wood_dark'), seg=10, name='cwheel2')
    w2.rotation_euler = (0, 1.57, 0)
    # Cart drawbar shafts extending out
    box(0.24, -0.36, 0.06, 0.015, 0.10, 0.015, S.m('wood_light'), 'shaft1')
    box(0.28, -0.36, 0.06, 0.015, 0.10, 0.015, S.m('wood_light'), 'shaft2')
    # Cargo loaded on the cart: crate, sack, barrel
    box(0.26, -0.25, 0.14, 0.08, 0.08, 0.08, S.m('wood_light'), 'cargo_crate')
    S.barrel(0.26, -0.16, z=0.13, r=0.04, h=0.08)

    # Grand waving civic banner on the upper floor
    S.banner('y', 0.10, 0.20, 0.60, w=0.10, h=0.24)

    # Hall chimney on the rear gable
    S.chimney(-0.25, -0.20, 1.10, 0.36, rng)

    # Ground props: street lamp, cargo barrel
    S.lamp(0.28, 0.28)
    S.barrel(0.36, 0.10, r=0.05, h=0.10)
    S.crate(0.34, 0.18, s=0.08, rng=rng)


RECIPES = {
    'tavern': tavern, 'shop': shop, 'stall': stall, 'bank': bank,
    'bakery': bakery, 'teahouse': teahouse, 'tailor': tailor,
    'bazaar': bazaar, 'tradeguild': tradeguild
}
