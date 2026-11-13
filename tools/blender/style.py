# Style layer: a recipe (recipes/*.py) says WHAT a building is (a house: footing, two floors, a gable
# roof, a door, windows, a chimney); a Style says what it is made of and how each people dresses it
# (Goblin timber and mossy shingles, Elf white stone and leaf roofs...). Every recipe runs with every
# style, so one recipe makes the building for all five peoples.
#
# Coordinates: the tile is the unit square centred on the origin, z up. The game camera sees the +X face
# (left front) and the +Y face (right front): put doors, windows and signs on those faces.
import math
import bpy
import kit
from kit import box, poly, cyl, cone, sphere, mat

# Semantic palette keys every style must define (hex colours).
KEYS = (
    'wall', 'wall2', 'trim', 'wood', 'wood_light', 'wood_dark',
    'stone', 'stone_dark', 'stone_light', 'roof', 'roof2', 'roof3', 'roof_under',
    'metal', 'accent', 'accent2', 'cloth', 'emblem', 'glow', 'water',
    'foliage', 'foliage2', 'foliage_dark', 'trunk', 'crop', 'crop2', 'dirt', 'smoke',
)


class Style:
    name = 'base'
    P = {}
    # recipes a people draws its own way: {kind: fn(S, rng)}
    overrides = {}

    def m(self, key, **kw):
        return mat(self.P[key], **kw)

    def pick(self, rng, *keys):
        return self.m(rng.choice(keys))

    # ------------------------------------------------------------ structure
    def footing(self, x, y, sx, sy, h, rng):
        """Base course the walls stand on."""
        box(x, y, 0, sx, sy, h, self.m('stone'), 'footing', bevel=0.01)
        for face in ('x', 'y'):
            n = max(3, int((sy if face == 'x' else sx) * 9))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                sz = rng.uniform(0.045, 0.075)
                z = rng.uniform(0.01, max(0.012, h - sz))
                c = self.pick(rng, 'stone_dark', 'stone_light', 'stone')
                if face == 'x':
                    box(x + sx / 2 + 0.006, y + u * sy, z, 0.02, sz * 1.3, sz, c, 'stone')
                else:
                    box(x + u * sx, y + sy / 2 + 0.006, z, sz * 1.3, 0.02, sz, c, 'stone')

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        """kind: 'main' (the people's usual wall), 'plank', 'stone', 'plain'."""
        if kind == 'stone':
            return self.stone_walls(x, y, z, sx, sy, h, rng)
        if kind == 'plank':
            return self.plank_walls(x, y, z, sx, sy, h, rng)
        box(x, y, z, sx, sy, h, self.m('wall'), 'wall')
        t = 0.03
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, z, t * 1.2, t * 1.2, h, self.m('trim'), 'corner')
        box(x + sx / 2 + 0.004, y, z + h - t, t, sy + t, t, self.m('trim'), 'beam')
        box(x, y + sy / 2 + 0.004, z + h - t, sx + t, t, t, self.m('trim'), 'beam')

    def stone_walls(self, x, y, z, sx, sy, h, rng):
        box(x, y, z, sx, sy, h, self.m('stone'), 'swall', bevel=0.006)
        rows = max(2, int(h / 0.07))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.5) * h / rows
                n = max(2, int(span / 0.1))
                for i in range(n):
                    if rng.random() < 0.55:
                        continue
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.5) / n
                    if abs(u) > 0.47:
                        continue
                    c = self.pick(rng, 'stone_dark', 'stone_light')
                    if face == 'x':
                        box(x + sx / 2 + 0.004, y + u * span, zz - 0.025, 0.012, span / n * 0.8, 0.05, c, 'block')
                    else:
                        box(x + u * span, y + sy / 2 + 0.004, zz - 0.025, span / n * 0.8, 0.012, 0.05, c, 'block')

    def plank_walls(self, x, y, z, sx, sy, h, rng):
        box(x, y, z, sx, sy, h, self.m('wood'), 'pwall')
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(4, int(span * 14))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                hh = h * rng.uniform(0.95, 1.02)
                c = self.pick(rng, 'wood', 'wood_light', 'wood_dark')
                if face == 'x':
                    box(x + sx / 2 + 0.004, y + u * span, z, 0.012, span / n * 0.9, hh, c, 'plank')
                else:
                    box(x + u * span, y + sy / 2 + 0.004, z, span / n * 0.9, 0.012, hh, c, 'plank')

    def roof(self, x, y, z, sx, sy, h, rng, shape='gable', along='x', over=0.07):
        """shape: gable, hip, cone (round footprint radius max(sx,sy)/2), spire, flat, dome."""
        if shape == 'gable':
            return self.gable(x, y, z, sx, sy, h, rng, along=along, over=over)
        if shape == 'hip':
            # stacked courses: each a smaller hip that sits proud of the slope, so the roof reads as
            # rows of tiles/thatch with a small step and a colour shift between them
            o = kit.hip(x, y, z, sx, sy, h, self.m('roof_under'), overhang=over)
            n = 4 if h > 0.12 else 3
            for i in range(n):
                f = i / n
                lip = 0.018 * (1 - f)
                kit.hip(x, y, z + h * f + 0.004, (sx + 2 * over) * (1 - f) + 2 * lip - 2 * over, (sy + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        h * (1 - f), self.pick(rng, 'roof', 'roof2', 'roof3') if i else self.m('roof'), overhang=over)
            sphere(x, y, z + h, 0.03, self.m('trim'), 'roofcap', squash=0.8)
            return o
        if shape in ('cone', 'spire'):
            r = max(sx, sy) / 2 + over
            return cone(x, y, z, r, h, self.m('roof'), seg=8 if shape == 'cone' else 6, name='roofcone')
        if shape == 'flat':
            box(x, y, z, sx + over, sy + over, 0.04, self.m('roof'), 'flatroof')
            for (px, py) in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                box(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.04, (sx + over) if py else 0.03, (sy + over) if px else 0.03, 0.05, self.m('trim'), 'parapet')
            return
        if shape == 'dome':
            d = sphere(x, y, z, max(sx, sy) / 2, self.m('roof'), 'dome', squash=h / (max(sx, sy) / 2))
            for p in d.data.polygons:
                p.use_smooth = True
            return d

    def gable(self, x, y, z, sx, sy, h, rng, along='x', over=0.07, rows=9):
        """Gable roof of overlapping tabs, staggered and colour-jittered, with a gentle sag."""
        if along == 'x':
            half, length = sy / 2 + over, sx + 2 * over
        else:
            half, length = sx / 2 + over, sy + 2 * over
        ang = math.atan2(h, half - over)
        L = math.hypot(half, h * half / (half - over))
        for side in (1, -1):
            d0 = 0.5 * half
            u = box(0, 0, -0.02, *((length, L * 1.02) if along == 'x' else (L * 1.02, length)), 0.02, self.m('roof_under'), 'roofbed')
            if along == 'x':
                u.location = (x, y + side * d0, z + h * (1 - d0 / (half - over)))
                u.rotation_euler = (-side * ang, 0, 0)
            else:
                u.location = (x + side * d0, y, z + h * (1 - d0 / (half - over)))
                u.rotation_euler = (0, side * ang, 0)
            for i in range(rows):
                t = (i + 0.5) / rows
                d = (1 - t) * half
                zz = z + h * (1 - d / (half - over))
                seg = int(length / 0.11) + 1
                stagger = (i % 2) * 0.5
                for k in range(seg):
                    uu = -length / 2 + ((k + stagger) % seg + 0.5) * length / seg
                    c = self.pick(rng, 'roof', 'roof2', 'roof3')
                    w = L / rows * 1.5
                    tw = length / seg * 0.94
                    b = box(0, 0, -0.008, *((tw, w) if along == 'x' else (w, tw)), 0.018, c, 'shingle')
                    sag = 0.02 * math.sin(math.pi * (uu + length / 2) / length)
                    lift = 0.01 * (rows - i) / rows
                    if along == 'x':
                        b.location = (x + uu, y + side * d, zz - sag + lift)
                        b.rotation_euler = (-side * ang + rng.uniform(-0.06, 0.06), rng.uniform(-0.05, 0.05), rng.uniform(-0.05, 0.05))
                    else:
                        b.location = (x + side * d, y + uu, zz - sag + lift)
                        b.rotation_euler = (rng.uniform(-0.05, 0.05), side * ang + rng.uniform(-0.06, 0.06), rng.uniform(-0.05, 0.05))
            if side == 1:
                self.roof_dressing(x, y, z, h, half, over, length, along, rng)
        if along == 'x':
            box(x, y, z + h - 0.01, length, 0.06, 0.05, self.m('trim'), 'ridge')
            for gx in (x + sx / 2, x - sx / 2):
                poly([(gx, y - sy / 2, z), (gx, y + sy / 2, z), (gx, y, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
        else:
            box(x, y, z + h - 0.01, 0.06, length, 0.05, self.m('trim'), 'ridge')
            for gy in (y + sy / 2, y - sy / 2):
                poly([(x - sx / 2, gy, z), (x + sx / 2, gy, z), (x, gy, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        """Extra bits on the visible roof slope (moss, snow, leaves...). Default: nothing."""
        return

    # ------------------------------------------------------------ openings
    def window(self, face, x, y, z, w=0.11, h=0.13, lit=True):
        pane = self.m('glow', emit=2.2) if lit else self.m('stone_dark')
        if face == 'x':
            box(x + 0.012, y, z - 0.015, 0.02, w + 0.04, h + 0.03, self.m('trim'), 'wframe')
            box(x + 0.024, y, z, 0.01, w, h, pane, 'noink_pane')
            box(x + 0.03, y, z + h / 2 - 0.006, 0.012, w, 0.012, self.m('trim'), 'mullion')
        else:
            box(x, y + 0.012, z - 0.015, w + 0.04, 0.02, h + 0.03, self.m('trim'), 'wframe')
            box(x, y + 0.024, z, w, 0.01, h, pane, 'noink_pane')
            box(x, y + 0.03, z + h / 2 - 0.006, w, 0.012, 0.012, self.m('trim'), 'mullion')

    def door(self, face, x, y, z, w=0.16, h=0.26):
        if face == 'x':
            box(x + 0.01, y, z, 0.03, w + 0.05, h + 0.04, self.m('trim'), 'dframe')
            box(x + 0.022, y, z, 0.02, w, h, self.m('wood_light'), 'door')
            box(x + 0.04, y + w * 0.3, z + h * 0.45, 0.02, 0.025, 0.025, self.m('metal'), 'knob')
        else:
            box(x, y + 0.01, z, w + 0.05, 0.03, h + 0.04, self.m('trim'), 'dframe')
            box(x, y + 0.022, z, w, 0.02, h, self.m('wood_light'), 'door')
            box(x + w * 0.3, y + 0.04, z + h * 0.45, 0.025, 0.02, 0.025, self.m('metal'), 'knob')

    # ------------------------------------------------------------ dressing
    def chimney(self, x, y, z, h, rng, smoke=True):
        c = box(x, y, z, 0.11, 0.11, h, self.m('stone'), 'chimney', bevel=0.01)
        c.rotation_euler = (rng.uniform(-0.06, 0.06), rng.uniform(-0.06, 0.06), 0)
        box(x, y, z + h, 0.15, 0.15, 0.035, self.m('stone_dark'), 'chimcap')
        # not every hearth is lit: a town where every roof smokes reads as white polka dots
        if smoke and (smoke == 'always' or rng.random() < 0.45):
            self.smoke(x, y, z + h + 0.05)

    def smoke(self, x, y, z):
        """A soft wisp: see-through puffs that rise, drift, grow and fade over the animation frames."""
        puffs = [sphere(x, y, z, 0.04, self.m('smoke', rough=1.0, alpha=0.55 - 0.15 * i), 'noink_smoke', squash=0.8) for i in range(3)]

        def step(f, n):
            for i, p in enumerate(puffs):
                t = ((i + f / n) / 3)
                p.location = (x + 0.06 * t, y - 0.04 * t, z + 0.03 + t * 0.26)
                s = 0.55 + t * 1.0
                p.scale = (s, s, s * 0.8)
        kit.anim(step)

    def banner(self, face, x, y, z, w=0.1, h=0.2):
        cloth = self.m('cloth')
        if face == 'x':
            box(x + 0.02, y, z + h, 0.02, w + 0.04, 0.02, self.m('trim'), 'pole')
            b = box(x + 0.02, y, z, 0.012, w, h, cloth, 'banner')
            self.emblem('x', x + 0.03, y, z + h * 0.6, w * 0.5)
        else:
            box(x, y + 0.02, z + h, w + 0.04, 0.02, 0.02, self.m('trim'), 'pole')
            b = box(x, y + 0.02, z, w, 0.012, h, cloth, 'banner')
            self.emblem('y', x, y + 0.03, z + h * 0.6, w * 0.5)
        kit.anim(lambda f, n: setattr(b, 'rotation_euler', ((0.06 * math.sin(2 * math.pi * f / n), 0, 0) if face == 'x' else (0, 0.06 * math.sin(2 * math.pi * f / n), 0))))

    def emblem(self, face, x, y, z, s):
        """The people's sign on banners and shields (default: a disc)."""
        sphere(x, y, z, s * 0.5, self.m('emblem'), 'emblem', squash=0.9)

    def flag(self, x, y, z, h=0.22):
        box(x, y, z, 0.015, 0.015, h, self.m('trim'), 'flagpole')
        f = box(0, 0.07, 0, 0.012, 0.13, 0.08, self.m('cloth'), 'flag')
        f.location = (x, y, z + h - 0.09)
        kit.anim(lambda fr, n: setattr(f, 'rotation_euler', (0, 0, 0.25 * math.sin(2 * math.pi * fr / n))))

    def lamp(self, x, y, z=0.0):
        box(x, y, z, 0.012, 0.012, 0.2, self.m('trim'), 'lpost')
        box(x, y, z + 0.2, 0.05, 0.05, 0.06, self.m('glow', emit=4), 'noink_lamp')
        cone(x, y, z + 0.26, 0.045, 0.04, self.m('metal'), seg=4, name='lroof')

    def barrel(self, x, y, z=0.0, r=0.05, h=0.1):
        cyl(x, y, z, r, h, self.m('wood'), seg=10, name='barrel')
        for zz in (z + h * 0.2, z + h * 0.75):
            cyl(x, y, zz, r * 1.04, 0.012, self.m('metal'), seg=10, name='hoop')

    def crate(self, x, y, z=0.0, s=0.08, rng=None):
        b = box(x, y, z, s, s, s, self.m('wood_light'), 'crate', bevel=0.006)
        if rng:
            b.rotation_euler.z = rng.uniform(-0.4, 0.4)

    def sack(self, x, y, z=0.0):
        sphere(x, y, z + 0.035, 0.04, self.m('crop'), 'sack', squash=0.9)

    def fence(self, points, rng, h=0.1):
        for (x0, y0), (x1, y1) in zip(points, points[1:]):
            n = max(2, int(math.hypot(x1 - x0, y1 - y0) / 0.07))
            for i in range(n + 1):
                t = i / n
                hh = h * rng.uniform(0.85, 1.15)
                p = box(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0, 0.022, 0.022, hh, self.m('wood'), 'picket')
                p.rotation_euler = (rng.uniform(-0.1, 0.1), rng.uniform(-0.1, 0.1), 0)
            rail = poly([(x0, y0, h * 0.5), (x1, y1, h * 0.5), (x1, y1, h * 0.7), (x0, y0, h * 0.7)], [(0, 1, 2, 3)], self.m('wood_dark'), 'rail')
            kit.solid(rail, 0.015)

    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        """The people's tree (default: round broadleaf)."""
        cyl(x, y, z, 0.03 * s, 0.22 * s, self.m('trunk'), seg=6, name='trunk')
        for i, (dx, dy, dz, r) in enumerate(((0, 0, 0.3, 0.13), (0.06, -0.03, 0.24, 0.09), (-0.05, 0.05, 0.26, 0.09))):
            sphere(x + dx * s, y + dy * s, z + dz * s, r * s, self.m(('foliage', 'foliage2', 'foliage_dark')[i]), 'leaves')

    def bush(self, x, y, r=0.06):
        sphere(x, y, r * 0.6, r, self.m('foliage2'), 'bush', squash=0.75)

    def rock(self, x, y, r=0.06, rng=None):
        o = sphere(x, y, r * 0.3, r, self.m('stone'), 'rock', squash=0.6)
        if rng:
            o.rotation_euler.z = rng.uniform(0, 3)

    def water(self, x, y, z, sx, sy):
        """A flat water surface that shimmers over the frames."""
        w = box(x, y, z, sx, sy, 0.01, self.m('water', rough=0.1), 'noink_water')
        # glints drift and blink (hide_render is ignored by these headless renders, so blink by scale)
        n_g = 3 if max(sx, sy) < 0.25 else 5
        glints = []
        for i in range(n_g):
            gx, gy = x + (i / max(1, n_g - 1) - 0.5) * sx * 0.6, y + ((i * 7) % 3 - 1) * sy * 0.25
            g = box(0, 0, 0, 0.045, 0.014, 0.003, mat('#ffffff', emit=2.0), 'noink_glint')
            g.location = (gx, gy, z + 0.011)
            glints.append((g, gx, gy))

        def step(f, n):
            for i, (g, gx, gy) in enumerate(glints):
                on = (i + f) % 3 != 0
                g.scale = (1, 1, 1) if on else (0, 0, 0)
                g.location = (gx + 0.015 * ((f + i) % 3 - 1), gy - 0.01 * ((f + i) % 3 - 1), z + 0.011)
        kit.anim(step)
        return w

    def fire(self, x, y, z, s=1.0):
        """A small flame that flickers over the frames."""
        fl = cone(x, y, z, 0.04 * s, 0.1 * s, mat('#ff9a2a', emit=5), seg=6, name='noink_fire')
        core = cone(x, y, z, 0.022 * s, 0.07 * s, mat('#fff0a0', emit=6), seg=6, name='noink_fire')
        kit.anim(lambda f, n: [setattr(fl, 'scale', (1, 1, (1.0, 1.25, 0.85)[f % 3])), setattr(core, 'scale', (1, 1, (1.1, 0.9, 1.2)[f % 3]))])
