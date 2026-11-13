# PM rewrites of wonders that need more presence; loaded after wonders.py, so these entries win.
# Standing Stones (caveman, height 1.8): a full ring of huge rough megaliths with lintels, glowing carved
# runes that pulse, a big bonfire in the middle and bones, totems and torches around it.
import math
import kit
from kit import box, cyl, cone, sphere, mat

TAU = 2 * math.pi


def _megalith(S, x, y, w, d, h, ang, lean, rng):
    s = box(0, 0, 0, w, d, h, S.m(rng.choice(['stone', 'stone_light', 'stone'])), 'megalith', bevel=0.012)
    s.location = (x, y, 0)
    s.rotation_euler = (lean[0], lean[1], ang)
    # a chunk of rough cap so the top is not a clean box
    c = sphere(0, 0, h, w * 0.55, S.m('stone_dark'), 'megacap', squash=0.6)
    c.parent = s
    return s


def stones(S, rng):
    R = 0.34
    n = 8
    runes = []
    tops = []
    for i in range(n):
        a = TAU * i / n + rng.uniform(-0.08, 0.08)
        if i == 1:  # the gap that faces the camera: the way in, and a view of the fire
            tops.append(None)
            continue
        x, y = R * math.cos(a), R * math.sin(a)
        tall = i % 2 == 0
        h = rng.uniform(0.72, 0.85) if tall else rng.uniform(0.5, 0.62)
        w = rng.uniform(0.22, 0.26)
        lean = (rng.uniform(-0.06, 0.06), rng.uniform(-0.06, 0.06))
        _megalith(S, x, y, w, 0.1, h, a + math.pi / 2, lean, rng)
        tops.append((x, y, h, a))
        # a glowing rune on the face that looks at the camera side (outward)
        rx, ry = (R + 0.065) * math.cos(a), (R + 0.065) * math.sin(a)
        r = box(0, 0, 0, 0.045, 0.012, 0.09, mat('#2fb8ff', emit=2.2), 'noink_rune')
        r.location = (rx, ry, h * 0.45)
        r.rotation_euler = (0, 0, a + math.pi / 2)
        runes.append(r)
    # lintels across neighbouring tall stones
    for i in range(0, n, 2):
        if tops[i] is None or tops[(i + 2) % n] is None:
            continue
        x1, y1, h1, a1 = tops[i]
        x2, y2, h2, a2 = tops[(i + 2) % n]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        L = math.hypot(x2 - x1, y2 - y1) + 0.14
        z = min(h1, h2) - 0.02
        l = box(0, 0, 0, L, 0.14, 0.11, S.m('stone'), 'lintel', bevel=0.02)
        l.location = (mx, my, z)
        l.rotation_euler = (0, rng.uniform(-0.05, 0.05), math.atan2(y2 - y1, x2 - x1))
    # the heel stone: one giant monolith behind the ring, the landmark that makes it a wonder
    hs = _megalith(S, -0.3, -0.3, 0.34, 0.14, 1.35, math.pi / 4 + math.pi / 2, (0.04, -0.03), rng)
    big = box(0, 0, 0, 0.09, 0.012, 0.3, mat('#2fb8ff', emit=2.6), 'noink_rune')
    big.location = (-0.22, -0.22, 0.75)
    big.rotation_euler = (0, 0, math.pi / 4 + math.pi / 2)
    runes.append(big)
    # pulsing runes: brightness by scale (the material is shared, so scale the glyphs)
    kit.anim(lambda f, k: [setattr(r, 'scale', ((1.0, 1.25, 0.85)[(f + j) % 3],) * 3) for j, r in enumerate(runes)])

    # the bonfire (the people's own fire: caveman adds its stone ring and logs) and sparks
    S.fire(0, 0, 0.04, s=2.6)
    sparks = [sphere(0, 0, 0, 0.012, mat('#ffcf6a', emit=8), 'noink_spark') for _ in range(5)]

    def fly(f, k):
        for j, sp in enumerate(sparks):
            t = ((j / 5) + f / 3) % 1
            sp.location = (0.05 * math.cos(j * 2.1 + t * 3), 0.05 * math.sin(j * 2.1 + t * 3), 0.3 + t * 0.5)
    kit.anim(fly)

    # totems, bones and torches outside the ring
    for (x, y) in ((0.43, -0.12), (-0.12, 0.43)):
        cyl(x, y, 0, 0.03, 0.42, S.m('wood'), seg=6, name='totem')
        sphere(x, y, 0.46, 0.05, mat('#e8dfc6'), 'skull', squash=0.9)
    for (x, y) in ((0.44, -0.3), (-0.3, 0.44)):
        S.lamp(x, y)
    for (x, y) in ((0.36, -0.36), (-0.38, 0.32)):
        b = cyl(x, y, 0.01, 0.012, 0.16, mat('#e8dfc6'), seg=5, name='bone')
        b.rotation_euler = (math.pi / 2, 0, rng.uniform(0, 3))


RECIPES = {'stones': stones}
