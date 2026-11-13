# Wonders: one per people, one per city.
# Height from sim BUILDINGS. Animate moving parts (water, fire, glow, motes).
import math
import kit
from kit import box, poly, cyl, cone, sphere, mat


def suntemple(S, rng):
    # Sunken Temple (lizard, height 2.0): stepped ziggurat half sunk in a sacred pool,
    # jade serpent heads spouting water, and altar fire on top.

    # 1. Clear irregular water moat / pool around the base
    # Low pool curb stones around the outer boundary (|x|, |y| ~ 0.44)
    # The water surface is prominent at z=0.045 with glints and ripples
    S.water(0.22, 0.0, 0.045, 0.40, 0.78)
    S.water(0.0, 0.22, 0.045, 0.78, 0.40)
    S.water(-0.20, -0.20, 0.045, 0.42, 0.42)
    # Outer stone curbs holding the pool (z=0.04, low so water is visible)
    box(0.44, 0.0, 0.0, 0.04, 0.88, 0.04, S.m('stone_dark'), 'moat_rim_x')
    box(0.0, 0.44, 0.0, 0.88, 0.04, 0.04, S.m('stone_dark'), 'moat_rim_y')
    box(-0.44, 0.0, 0.0, 0.04, 0.88, 0.04, S.m('stone_dark'), 'moat_rim_nx')
    box(0.0, -0.44, 0.0, 0.88, 0.04, 0.04, S.m('stone_dark'), 'moat_rim_ny')

    # Stepping stone causeway / entrance steps approaching across the water on +X and +Y
    for st_i in range(3):
        sx_pos = 0.32 + st_i * 0.05
        box(sx_pos, 0.0, 0.045, 0.05, 0.18, 0.03, S.m('stone_light'), f'causeway_x_{st_i}', bevel=0.005)
        box(0.0, sx_pos, 0.045, 0.18, 0.05, 0.03, S.m('stone_light'), f'causeway_y_{st_i}', bevel=0.005)

    # 2. Stepped ziggurat tiers (centered, compact enough for moat to breathe)
    # Tier 1: from z=0.04 to z=0.36 (size 0.52)
    box(0.0, 0.0, 0.04, 0.52, 0.52, 0.32, S.m('stone'), 'ziggurat_t1', bevel=0.01)
    # Tier 2: from z=0.36 to z=0.70 (size 0.40)
    box(0.0, 0.0, 0.36, 0.40, 0.40, 0.34, S.m('stone_dark'), 'ziggurat_t2', bevel=0.01)
    # Tier 3: from z=0.70 to z=1.04 (size 0.30)
    box(0.0, 0.0, 0.70, 0.30, 0.30, 0.34, S.m('stone_light'), 'ziggurat_t3', bevel=0.01)
    # Tier 4: from z=1.04 to z=1.36 (size 0.22)
    box(0.0, 0.0, 1.04, 0.22, 0.22, 0.32, S.m('stone'), 'ziggurat_t4', bevel=0.008)
    # Tier 5 (Summit altar dais): from z=1.36 to z=1.52 (size 0.16)
    box(0.0, 0.0, 1.36, 0.16, 0.16, 0.16, S.m('stone_dark'), 'summit_platform', bevel=0.008)
    box(0.0, 0.0, 1.50, 0.18, 0.18, 0.025, S.m('accent'), 'summit_cornice')

    # Ceremonial staircases climbing front +X and +Y faces
    for st_i in range(6):
        sz = 0.20 + st_i * 0.20
        spos = 0.30 - st_i * 0.035
        box(spos, 0.0, sz, 0.06, 0.12, 0.05, S.m('stone_light'), f'stair_x_{st_i}')
        box(0.0, spos, sz, 0.12, 0.06, 0.05, S.m('stone_light'), f'stair_y_{st_i}')

    # 3. Jade serpent heads spouting water
    spout_droplets = []
    def serpent_head_spout(hx, hy, hz, facing):
        s = 1.15
        if facing == 'x':
            box(hx + 0.025 * s, hy, hz, 0.06 * s, 0.04 * s, 0.035 * s, S.m('accent'), 'serpent_snout')
            box(hx + 0.04 * s, hy, hz + 0.01 * s, 0.03 * s, 0.035 * s, 0.02 * s, S.m('emblem'), 'serpent_brow')
            sphere(hx + 0.025 * s, hy - 0.022 * s, hz + 0.012 * s, 0.012 * s, S.m('glow', emit=4), 'serpent_eye')
            sphere(hx + 0.025 * s, hy + 0.022 * s, hz + 0.012 * s, 0.012 * s, S.m('glow', emit=4), 'serpent_eye')
            # Water jet arching out and down into the pool
            stream = cyl(hx + 0.07, hy, 0.05 + (hz - 0.05) / 2, 0.012, hz - 0.05, S.m('water', rough=0.1), seg=6, name='noink_spout_stream')
            stream.rotation_euler = (0, 0.22, 0)
            # Splash drops at impact in pool
            for di in range(2):
                drop = sphere(hx + 0.10 + di * 0.02, hy, 0.06, 0.016, mat('#ffffff', emit=2.0), f'noink_spout_drop_{hx}_{hy}_{di}')
                spout_droplets.append((drop, hx + 0.10 + di * 0.02, hy, 0.06))
        else:
            box(hx, hy + 0.025 * s, hz, 0.04 * s, 0.06 * s, 0.035 * s, S.m('accent'), 'serpent_snout')
            box(hx, hy + 0.04 * s, hz + 0.01 * s, 0.035 * s, 0.03 * s, 0.02 * s, S.m('emblem'), 'serpent_brow')
            sphere(hx - 0.022 * s, hy + 0.025 * s, hz + 0.012 * s, 0.012 * s, S.m('glow', emit=4), 'serpent_eye')
            sphere(hx + 0.022 * s, hy + 0.025 * s, hz + 0.012 * s, 0.012 * s, S.m('glow', emit=4), 'serpent_eye')
            stream = cyl(hx, hy + 0.07, 0.05 + (hz - 0.05) / 2, 0.012, hz - 0.05, S.m('water', rough=0.1), seg=6, name='noink_spout_stream')
            stream.rotation_euler = (-0.22, 0, 0)
            for di in range(2):
                drop = sphere(hx, hy + 0.10 + di * 0.02, 0.06, 0.016, mat('#ffffff', emit=2.0), f'noink_spout_drop_{hx}_{hy}_{di}')
                spout_droplets.append((drop, hx, hy + 0.10 + di * 0.02, 0.06))

    # Jade serpent heads spouting water into moat from tier 2 (z=0.42)
    serpent_head_spout(0.20, -0.12, 0.42, 'x')
    serpent_head_spout(0.20, 0.12, 0.42, 'x')
    serpent_head_spout(-0.12, 0.20, 0.42, 'y')
    serpent_head_spout(0.12, 0.20, 0.42, 'y')

    # 4. Summit altar fire
    cyl(0.0, 0.0, 1.52, 0.055, 0.08, S.m('stone_dark'), seg=8, name='altar_base')
    cyl(0.0, 0.0, 1.60, 0.075, 0.03, S.m('metal'), seg=8, name='altar_bowl')
    for px, py in ((-0.06, -0.06), (-0.06, 0.06), (0.06, -0.06), (0.06, 0.06)):
        cone(px, py, 1.52, 0.015, 0.18, S.m('stone_light'), seg=4, r_top=0.012, name='altar_pillar')
        sphere(px, py, 1.70, 0.015, S.m('accent'), 'pillar_jade_cap')

    S.fire(0.0, 0.0, 1.63, s=1.6)

    # Animated motes and water splashes
    motes = [sphere(0.0, 0.0, 1.72, 0.018, S.m('glow', emit=6.0), f'noink_ember_{mi}') for mi in range(4)]

    def step_suntemple(f, n):
        for mi, m in enumerate(motes):
            phase = (mi / 4 + f / n) % 1.0
            mx = 0.03 * math.sin(2 * math.pi * (phase + mi * 0.25))
            my = 0.03 * math.cos(2 * math.pi * (phase + mi * 0.25))
            mz = 1.68 + phase * 0.26
            m.location = (mx, my, mz)
            s = 0.6 + 0.6 * math.sin(math.pi * phase)
            m.scale = (s, s, s)
        for di, (drop, dx, dy, dz) in enumerate(spout_droplets):
            phase = (di * 0.2 + f / n) % 1.0
            scale = 0.6 + 0.8 * math.sin(math.pi * phase)
            drop.scale = (scale, scale, scale * 0.7)
            drop.location = (dx, dy, dz + 0.02 * math.sin(math.pi * phase))

    kit.anim(step_suntemple)

    # 5. Props: banners, urns, water plants
    S.banner('x', 0.38, -0.28, 0.06, w=0.08, h=0.20)
    S.banner('y', -0.28, 0.38, 0.06, w=0.08, h=0.20)
    sphere(0.24, 0.24, 0.06, 0.04, S.m('accent2'), 'lily_cluster', squash=0.3)
    sphere(-0.24, 0.26, 0.06, 0.035, S.m('accent2'), 'lily_cluster_2', squash=0.3)
    sphere(0.16, 0.14, 0.72, 0.028, S.m('accent'), 'offering_urn', squash=1.2)
    sphere(-0.14, 0.16, 0.72, 0.026, S.m('accent'), 'offering_urn_2', squash=1.2)


def moontree(S, rng):
    # Moon Tree (elf, height 2.6): giant glowing tree with visible pale trunk with roots,
    # lush layered crown (many overlapping sphere clusters in foliage/foliage2 + silver-teal glow),
    # floating light motes that drift and pulse, small ring of lanterns.

    # 1. Sacred plinth & sprawling roots
    cyl(0.0, 0.0, 0.0, 0.44, 0.03, S.m('stone_light'), seg=24, name='plinth')
    cyl(0.0, 0.0, 0.025, 0.45, 0.012, S.m('trim'), seg=24, name='plinth_rim')

    # Sprawling roots spreading out from trunk base
    cone(0.0, 0.0, 0.03, 0.22, 0.42, S.m('wall'), seg=12, r_top=0.12, name='root_bell')
    for i in range(7):
        ang = 2 * math.pi * i / 7 + 0.2
        rx, ry = math.cos(ang) * 0.24, math.sin(ang) * 0.24
        r_flange = box(rx, ry, 0.03, 0.05, 0.18, 0.07, S.m('wall'), f'root_{i}', bevel=0.01)
        r_flange.rotation_euler.z = ang

    # Glowing sanctuary flora around base
    for sh_i, (sh_x, sh_y) in enumerate(((0.24, 0.14), (-0.16, 0.22), (-0.22, -0.14), (0.14, -0.24))):
        sphere(sh_x, sh_y, 0.05, 0.024, S.m('accent2', emit=3.5), f'noink_flora_{sh_i}', squash=0.7)

    # 2. Visible pale trunk with ornamental bands
    cyl(0.0, 0.0, 0.38, 0.11, 0.65, S.m('wall'), seg=12, name='trunk_lower')
    cyl(0.0, 0.0, 0.65, 0.116, 0.02, S.m('trim'), seg=12, name='trunk_band_1')
    cyl(0.0, 0.0, 0.88, 0.108, 0.018, S.m('trim'), seg=12, name='trunk_band_2')

    # Heavy boughs branching outward to hold the canopy
    boughs = (
        (0.12, 0.08, 0.98, 0.065, 0.50, 0.35, 0.25),
        (-0.10, 0.12, 1.00, 0.06, 0.48, -0.25, 0.35),
        (0.08, -0.11, 0.98, 0.06, 0.48, 0.30, -0.28),
        (-0.09, -0.09, 1.02, 0.055, 0.46, -0.28, -0.25),
        (0.0, 0.0, 1.25, 0.075, 0.45, 0.05, 0.05),
    )
    for bi, (bx, by, bz, br, bh, rx, ry) in enumerate(boughs):
        b = cyl(bx, by, bz, br, bh, S.m('wall'), seg=8, name=f'bough_{bi}')
        b.rotation_euler = (rx, ry, 0)

    # 3. Lush layered crown (many overlapping sphere clusters in foliage/foliage2 + silver-teal glow)
    foliage_mats = [S.m('foliage'), S.m('foliage2'), S.m('foliage_dark')]
    glow_teal = mat('#5eead4', emit=2.5)

    lower_spheres = (
        (0.18, 0.14, 1.40, 0.20, foliage_mats[0]),
        (-0.16, 0.16, 1.42, 0.20, foliage_mats[1]),
        (0.16, -0.16, 1.40, 0.20, foliage_mats[2]),
        (-0.15, -0.14, 1.44, 0.19, foliage_mats[0]),
        (0.26, 0.02, 1.46, 0.18, foliage_mats[1]),
        (-0.25, -0.02, 1.48, 0.18, foliage_mats[2]),
        (0.02, 0.26, 1.45, 0.18, foliage_mats[0]),
        (-0.02, -0.26, 1.47, 0.17, foliage_mats[1]),
    )
    for si, (sx, sy, sz, sr, sm) in enumerate(lower_spheres):
        sphere(sx, sy, sz, sr, sm, f'crown_low_{si}', squash=0.85)

    # Mid tier (z ~ 1.65 to 2.05): thick core with interspersed silver-teal glow
    mid_spheres = (
        (0.12, 0.10, 1.75, 0.24, foliage_mats[1]),
        (-0.11, 0.12, 1.78, 0.23, foliage_mats[0]),
        (0.10, -0.12, 1.76, 0.24, foliage_mats[2]),
        (-0.10, -0.10, 1.80, 0.22, foliage_mats[1]),
        (0.0, 0.0, 1.82, 0.28, glow_teal),
        (0.18, -0.04, 1.80, 0.20, glow_teal),
        (-0.04, 0.18, 1.82, 0.20, foliage_mats[0]),
        (-0.18, 0.04, 1.84, 0.19, foliage_mats[2]),
        (0.04, -0.18, 1.82, 0.19, glow_teal),
    )
    for si, (sx, sy, sz, sr, sm) in enumerate(mid_spheres):
        sphere(sx, sy, sz, sr, sm, f'crown_mid_{si}', squash=0.88)

    # Upper crown & peak (z ~ 2.05 to 2.55): tapering to summit
    upper_spheres = (
        (0.08, 0.06, 2.10, 0.22, foliage_mats[0]),
        (-0.07, 0.08, 2.12, 0.21, foliage_mats[1]),
        (0.06, -0.08, 2.10, 0.21, foliage_mats[2]),
        (-0.06, -0.06, 2.14, 0.20, foliage_mats[1]),
        (0.0, 0.0, 2.26, 0.24, glow_teal),
        (0.0, 0.0, 2.45, 0.18, S.m('glow', emit=3.0)),
    )
    for si, (sx, sy, sz, sr, sm) in enumerate(upper_spheres):
        sphere(sx, sy, sz, sr, sm, f'crown_up_{si}', squash=0.85)

    # Hanging wisteria / luminous tendrils below the crown
    for vi, (vx, vy, vz, vh) in enumerate((
        (0.24, 0.12, 1.25, 0.22), (-0.20, 0.16, 1.28, 0.20),
        (0.14, -0.22, 1.26, 0.22), (-0.16, -0.18, 1.30, 0.18),
        (0.20, -0.14, 1.28, 0.19), (-0.12, 0.22, 1.25, 0.20)
    )):
        cyl(vx, vy, vz, 0.007, vh, S.m('foliage'), seg=4, name=f'vine_{vi}')
        sphere(vx, vy, vz - 0.01, 0.016, glow_teal, f'vine_tip_{vi}')

    # 4. Small ring of hanging lanterns
    lantern_objs = []
    num_lanterns = 6
    for li in range(num_lanterns):
        lang = 2 * math.pi * li / num_lanterns + 0.3
        lx, ly = math.cos(lang) * 0.24, math.sin(lang) * 0.24
        lz = 1.15
        cyl(lx, ly, lz + 0.08, 0.003, 0.08, S.m('trim'), seg=4, name=f'cord_{li}')
        cone(lx, ly, lz + 0.06, 0.026, 0.025, S.m('trim'), seg=6, name=f'lcap_{li}')
        lant = sphere(lx, ly, lz + 0.035, 0.022, S.m('glow', emit=5.5), f'noink_lant_{li}', squash=1.1)
        lantern_objs.append(lant)

    # 5. Floating light motes that drift and pulse
    num_motes = 8
    mote_objs = [
        sphere(0.0, 0.0, 1.8, 0.020, S.m('glow', emit=6.0), f'noink_mote_{mi}')
        for mi in range(num_motes)
    ]

    def step_moontree(f, n):
        for mi, m in enumerate(mote_objs):
            phase = (mi / num_motes + f / n) % 1.0
            ang = 2 * math.pi * phase * 1.5 + mi * 0.8
            rad = 0.22 + 0.12 * math.sin(math.pi * phase)
            mx = rad * math.cos(ang)
            my = rad * math.sin(ang)
            mz = 1.35 + phase * 1.15
            m.location = (mx, my, mz)
            pulse = 0.65 + 0.55 * math.sin(2 * math.pi * ((mi * 0.25) + f / n))
            m.scale = (pulse, pulse, pulse)
        for li, l in enumerate(lantern_objs):
            flicker = 0.9 + 0.2 * math.sin(2 * math.pi * (f / n + li * 0.3))
            l.scale = (flicker, flicker, flicker * 1.1)

    kit.anim(step_moontree)

    # 6. Props: sanctuary lamps and bench
    S.lamp(0.34, -0.20, 0.03)
    S.lamp(-0.20, 0.34, 0.03)
    box(0.24, 0.22, 0.03, 0.07, 0.16, 0.05, S.m('stone_light'), 'bench', bevel=0.005)


def stones(S, rng):
    # Standing Stones (caveman, height 1.8): full RING of 7-9 huge rough standing stones
    # (chunky, tilted, varied) with 3-4 lintels, big bonfire in the middle (S.fire, scaled up, flickering),
    # glowing carved runes on the stones (emissive, pulsing over frames), skulls/bones/totems around.

    # 1. Outer ritual ground circle
    cyl(0.0, 0.0, 0.0, 0.44, 0.025, S.m('dirt'), seg=24, name='sanctuary_ground')
    for ri in range(12):
        ra = 2 * math.pi * ri / 12
        rx, ry = math.cos(ra) * 0.42, math.sin(ra) * 0.42
        sphere(rx, ry, 0.012, rng.uniform(0.025, 0.038), S.pick(rng, 'stone_dark', 'stone'), 'kerb_stone', squash=0.6)

    # 2. Full RING of 8 huge rough standing stones (chunky, tilted, varied)
    num_stones = 8
    stone_data = []
    rune_objs = []
    r_ring = 0.31

    for i in range(num_stones):
        ang = 2 * math.pi * i / num_stones + rng.uniform(-0.06, 0.06)
        sx_pos = math.cos(ang) * r_ring
        sy_pos = math.sin(ang) * r_ring
        # Vary stone dimensions - chunky and varied
        w = rng.uniform(0.12, 0.15)
        d = rng.uniform(0.10, 0.13)
        # Rear stones taller (~1.45-1.55), front stones slightly lower (~1.20-1.35) for camera visibility
        base_h = 1.48 if (sy_pos < 0 or sx_pos < 0) else 1.25
        h = base_h + rng.uniform(-0.08, 0.08)

        st = box(sx_pos, sy_pos, 0.0, w, d, h, S.pick(rng, 'stone', 'stone_dark', 'stone_light'), f'standing_stone_{i}', bevel=0.018)
        # Tilted
        tilt_x = rng.uniform(-0.08, 0.08)
        tilt_y = rng.uniform(-0.08, 0.08)
        st.rotation_euler = (tilt_x, tilt_y, ang + rng.uniform(-0.1, 0.1))
        stone_data.append((sx_pos, sy_pos, h, ang))

        # Glowing carved runes on the stones (emissive, visible faces)
        for r_level in (0.45, 0.75):
            rz = h * r_level
            # Outward visible face
            r_ang = ang
            rox = sx_pos + math.cos(r_ang) * (w * 0.42)
            roy = sy_pos + math.sin(r_ang) * (d * 0.42)
            rune = sphere(rox, roy, rz, 0.018, S.m('glow', emit=5.5), f'noink_rune_{i}_{r_level}', squash=0.4)
            rune_objs.append(rune)
            # An accent carved groove
            box(rox, roy, rz + 0.04, 0.012, 0.012, 0.024, S.m('accent', emit=3.0), f'noink_runemark_{i}_{r_level}')

    # 3. 3-4 heavy stone lintels spanning across pairs of standing stones
    lintel_pairs = ((0, 1), (2, 3), (4, 5), (6, 7))
    for li, (i1, i2) in enumerate(lintel_pairs):
        x1, y1, h1, _ = stone_data[i1]
        x2, y2, h2, _ = stone_data[i2]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        lz = max(h1, h2)
        span = math.hypot(x2 - x1, y2 - y1) + 0.09
        lang = math.atan2(y2 - y1, x2 - x1)
        lint = box(mx, my, lz, 0.13, span, 0.11, S.pick(rng, 'stone_light', 'stone'), f'lintel_{li}', bevel=0.016)
        lint.rotation_euler = (rng.uniform(-0.03, 0.03), rng.uniform(-0.03, 0.03), lang)

    # 4. Big bonfire in the middle (S.fire, scaled up, flickering)
    box(0.0, 0.0, 0.0, 0.18, 0.18, 0.05, S.m('stone_dark'), 'firepit_slab', bevel=0.01)
    cyl(0.0, 0.0, 0.02, 0.12, 0.05, S.m('stone'), seg=8, name='firepit_rim')
    # Charred wood logs in the pit
    for log_i, log_ang in enumerate((0.3, 1.3, 2.3)):
        log = cyl(0.0, 0.0, 0.06, 0.025, 0.16, S.m('wood_dark'), seg=6, name=f'fire_log_{log_i}')
        log.rotation_euler = (0.35 * math.sin(log_ang), 0.35 * math.cos(log_ang), log_ang)

    S.fire(0.0, 0.0, 0.06, s=2.4)

    # 5. Embers & pulsing rune glow
    n_embers = 6
    embers = [
        sphere(0.0, 0.0, 0.35, 0.020, S.m('glow', emit=6.0), f'noink_ember_{ei}')
        for ei in range(n_embers)
    ]

    def step_stones(f, n):
        for ri, r in enumerate(rune_objs):
            pulse = (1.0, 1.35, 0.75)[(f + ri) % 3]
            r.scale = (pulse, pulse, pulse)
        for ei, em in enumerate(embers):
            phase = (ei / n_embers + f / n) % 1.0
            ang = 2 * math.pi * (phase + ei * 0.35)
            rad = 0.06 + 0.10 * phase
            ex = rad * math.cos(ang)
            ey = rad * math.sin(ang)
            ez = 0.28 + phase * 1.10
            em.location = (ex, ey, ez)
            es = 0.7 + 0.5 * math.sin(math.pi * phase)
            em.scale = (es, es, es)

    kit.anim(step_stones)

    # 6. Props around: skulls, bones, totems
    # Totem poles
    for ti, (tx, ty) in enumerate(((0.34, -0.16), (-0.16, 0.34))):
        cyl(tx, ty, 0.0, 0.022, 0.65, S.m('wood'), seg=6, name=f'totem_pole_{ti}')
        box(tx, ty, 0.50, 0.02, 0.14, 0.02, S.m('wood_dark'), f'totem_cross_{ti}')
        # Beast skull with horns crowning the totem
        sphere(tx, ty, 0.66, 0.034, S.m('stone_light'), f'totem_skull_{ti}', squash=0.8)
        cone(tx + 0.02, ty - 0.03, 0.67, 0.012, 0.10, S.m('accent2'), seg=4, name=f'totem_horn_l_{ti}')
        cone(tx + 0.02, ty + 0.03, 0.67, 0.012, 0.10, S.m('accent2'), seg=4, name=f'totem_horn_r_{ti}')

    # Skulls and bone offerings on the ground
    sphere(0.16, -0.14, 0.03, 0.030, S.m('stone_light'), 'skull_prop_1', squash=0.85)
    sphere(-0.14, 0.16, 0.03, 0.028, S.m('stone_light'), 'skull_prop_2', squash=0.85)
    cone(0.18, 0.12, 0.02, 0.018, 0.25, S.m('accent2'), seg=4, name='tusk_bone_1')
    cone(-0.12, -0.18, 0.02, 0.018, 0.25, S.m('accent2'), seg=4, name='tusk_bone_2')
    S.banner('x', 0.38, 0.05, 0.08, w=0.08, h=0.20)
    S.banner('y', 0.05, 0.38, 0.08, w=0.08, h=0.20)


def emberthrone(S, rng):
    # Ember Throne (height 2.4): towering obsidian throne-hall with a hoard of gold,
    # lava falls and a big flickering fire crown.

    # 1. Volcanic basalt and dark obsidian foundation terrace
    box(0.0, 0.0, 0.0, 0.86, 0.86, 0.08, S.m('stone_dark'), 'plinth', bevel=0.015)
    # Molten lava channels encircling the front approach (+X and +Y)
    box(0.12, -0.34, 0.04, 0.55, 0.12, 0.04, S.m('stone'), 'trench_rim_x')
    S.water(0.12, -0.34, 0.065, 0.50, 0.08)
    box(-0.34, 0.12, 0.04, 0.12, 0.55, 0.04, S.m('stone'), 'trench_rim_y')
    S.water(-0.34, 0.12, 0.065, 0.08, 0.50)

    # Ceremonial steps approaching the throne dais along the visible diagonal (+X/+Y)
    for st_i in range(4):
        sz = 0.04 + st_i * 0.035
        spos = 0.38 - st_i * 0.06
        box(spos, spos, 0.0, 0.14, 0.14, sz, S.m('stone_light'), f'throne_step_{st_i}', bevel=0.006)

    # 2. Towering Obsidian Throne-Hall Structure
    box(-0.06, -0.06, 0.08, 0.62, 0.62, 0.88, S.m('wall'), 'hall_body', bevel=0.015)
    # Heavy basalt corner buttresses with brass dragon crests
    for cx, cy in ((0.22, 0.22), (0.22, -0.34), (-0.34, 0.22), (-0.34, -0.34)):
        box(cx, cy, 0.08, 0.11, 0.11, 0.95, S.m('trim'), 'hall_buttress')
        sphere(cx, cy, 1.02, 0.03, S.m('accent'), 'buttress_gold_boss')
        cone(cx, cy, 1.04, 0.022, 0.12, S.m('accent2'), seg=4, name='buttress_horn')

    # Hall archway opening onto the visible front-right (+X/+Y)
    box(0.14, 0.14, 0.18, 0.30, 0.30, 0.55, S.m('stone_dark'), 'throne_alcove')
    # Glowing lava fissure lines along the hall facade
    for face in ('x', 'y'):
        for fz in (0.35, 0.65):
            if face == 'x':
                box(0.252, -0.06, fz, 0.01, 0.40, 0.015, S.m('glow', emit=4.0), 'noink_hall_lava_seam')
            else:
                box(-0.06, 0.252, fz, 0.40, 0.01, 0.015, S.m('glow', emit=4.0), 'noink_hall_lava_seam')

    # 3. The Ember Throne & Hoard of Gold
    # Elevated obsidian dais inside/front of alcove
    box(0.06, 0.06, 0.22, 0.26, 0.26, 0.16, S.m('stone_dark'), 'throne_dais', bevel=0.008)
    box(0.06, 0.06, 0.38, 0.28, 0.28, 0.025, S.m('accent'), 'dais_gold_rim')

    # The colossal Ember Throne carved from black obsidian with gold inlay
    box(0.02, 0.02, 0.40, 0.16, 0.16, 0.14, S.m('wall'), 'throne_seat')
    # High throne backrest with curved dragon horns
    box(-0.03, -0.03, 0.40, 0.06, 0.20, 0.48, S.m('trim'), 'throne_back')
    sphere(-0.03, -0.03, 0.88, 0.035, S.m('accent'), 'throne_crest')
    cone(-0.03, -0.12, 0.88, 0.02, 0.18, S.m('accent2'), seg=4, name='throne_horn_l')
    cone(-0.03, 0.06, 0.88, 0.02, 0.18, S.m('accent2'), seg=4, name='throne_horn_r')
    sphere(0.04, 0.04, 0.55, 0.04, S.m('glow', emit=5.0), 'noink_throne_ember')

    # The Hoard of Gold: glittering mounds of dragon gold spilling around the dais
    sphere(0.24, 0.08, 0.12, 0.09, S.m('accent'), 'gold_hoard_1', squash=0.6)
    sphere(0.08, 0.24, 0.12, 0.08, S.m('accent'), 'gold_hoard_2', squash=0.6)
    sphere(0.20, 0.22, 0.14, 0.07, S.m('emblem'), 'gold_hoard_3', squash=0.55)
    for g_pos in ((0.26, 0.09, 0.18), (0.10, 0.25, 0.17), (0.22, 0.23, 0.19), (0.17, 0.15, 0.24)):
        box(g_pos[0], g_pos[1], g_pos[2], 0.025, 0.04, 0.02, S.m('accent2'), 'gold_ingot')
        sphere(g_pos[0] + 0.02, g_pos[1] - 0.02, g_pos[2] + 0.015, 0.015, S.m('cloth', emit=3.0), 'noink_ruby_gem')

    # 4. Lava Falls (Twin cascading molten lava falls from gargoyle mouths)
    box(0.27, -0.16, 0.80, 0.08, 0.06, 0.06, S.m('accent2'), 'gargoyle_x')
    box(-0.16, 0.27, 0.80, 0.06, 0.08, 0.06, S.m('accent2'), 'gargoyle_y')

    # Cascading lava streams
    n_stream_seg = 6
    lava_segs = []
    for si in range(n_stream_seg):
        sz = 0.22 + si * 0.10
        sx_box = box(0.285, -0.16, sz, 0.025, 0.045, 0.10, S.m('water', emit=4.0), f'noink_lavafall_x_{si}')
        sy_box = box(-0.16, 0.285, sz, 0.045, 0.025, 0.10, S.m('water', emit=4.0), f'noink_lavafall_y_{si}')
        lava_segs.append((sx_box, sy_box, si))

    def step_lavafalls(f, n):
        for sx_box, sy_box, si in lava_segs:
            pulse = (1.0, 1.25, 0.85)[(f + si) % 3]
            sx_box.scale = (pulse, 1.0, 1.0)
            sy_box.scale = (1.0, pulse, 1.0)

    # 5. Soaring Upper Spire and Summit Fire Crown (z = 0.95 to 2.25)
    box(-0.06, -0.06, 0.95, 0.44, 0.44, 0.65, S.m('stone_dark'), 'upper_tower', bevel=0.012)
    box(-0.06, -0.06, 1.58, 0.48, 0.48, 0.04, S.m('trim'), 'upper_cornice')

    cone(-0.06, -0.06, 1.62, 0.26, 0.25, S.m('roof'), seg=8, r_top=0.18, name='crown_plinth')
    box(-0.06, -0.06, 1.85, 0.34, 0.34, 0.035, S.m('accent'), 'crown_ring_gold')

    # Big Flickering Fire Crown: 8 curved dragon horns forming the crown rim
    num_crown_horns = 8
    for chi in range(num_crown_horns):
        c_ang = chi * 2 * math.pi / num_crown_horns
        ch_r = 0.15
        chx = -0.06 + math.cos(c_ang) * ch_r
        chy = -0.06 + math.sin(c_ang) * ch_r
        h_len = 0.32 if chi % 2 == 0 else 0.24
        horn = cone(chx, chy, 1.88, 0.028, h_len, S.m('accent2'), seg=4, name=f'crown_horn_{chi}')
        horn.rotation_euler = (math.sin(c_ang) * 0.45, -math.cos(c_ang) * 0.45, c_ang)

    # Central dragonfire crown flame
    flame_main = cone(-0.06, -0.06, 1.88, 0.11, 0.38, mat('#ff6d00', emit=6.5), seg=8, name='noink_crown_flame')
    flame_core = cone(-0.06, -0.06, 1.88, 0.06, 0.28, mat('#fff176', emit=8.0), seg=8, name='noink_crown_core')
    flame_spire = cone(-0.06, -0.06, 2.05, 0.035, 0.25, mat('#ffe57f', emit=7.0), seg=6, name='noink_flame_tip')

    # Floating ember sparks rising from the fire crown
    num_embers = 6
    crown_embers = [
        sphere(-0.06, -0.06, 2.10, 0.022, S.m('glow', emit=7.0), f'noink_crown_spark_{ei}')
        for ei in range(num_embers)
    ]

    def step_fire_crown(f, n):
        step_lavafalls(f, n)
        s_main = (1.0, 1.25, 0.9)[f % 3]
        s_core = (1.2, 0.95, 1.15)[f % 3]
        flame_main.scale = (s_main, s_main, s_main * 1.1)
        flame_core.scale = (s_core, s_core, s_core * 1.15)
        flame_spire.scale = (1.0, 1.0, (1.1, 0.85, 1.3)[f % 3])

        for ei, em in enumerate(crown_embers):
            phase = (ei / num_embers + f / n) % 1.0
            ang = 2 * math.pi * (phase + ei * 0.33)
            rad = 0.06 + 0.10 * phase
            ex = -0.06 + rad * math.cos(ang)
            ey = -0.06 + rad * math.sin(ang)
            ez = 2.00 + phase * 0.38
            em.location = (ex, ey, ez)
            sp_s = 0.6 + 0.5 * math.sin(math.pi * phase)
            em.scale = (sp_s, sp_s, sp_s)

    kit.anim(step_fire_crown)

    # 6. Props & banners: crimson dragon banners, braziers
    S.banner('x', 0.28, -0.28, 0.10, w=0.10, h=0.24)
    S.banner('y', -0.28, 0.28, 0.10, w=0.10, h=0.24)
    S.lamp(0.36, -0.10, 0.08)
    S.lamp(-0.10, 0.36, 0.08)


RECIPES = {
    'suntemple': suntemple,
    'moontree': moontree,
    'stones': stones,
    'emberthrone': emberthrone,
}
