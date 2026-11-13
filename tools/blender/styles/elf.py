# Elves: forest guardians. Graceful white/ivory stone and pale wood, slender proportions,
# curved leaf-shaped or swept roofs in deep green and teal with gold trim, round moon windows,
# lanterns with cool silver-blue and warm gold glow, vines and moss, glowing mushrooms.
# Banners: deep green with a silver crescent moon or leaf emblem.
import math
import kit
from kit import box, sphere, cone, cyl, poly, mat
from style import Style


class ElfStyle(Style):
    name = 'elf'
    P = {
        'wall': '#eae4d5', 'wall2': '#dcd5c2', 'trim': '#c9a44c',
        'wood': '#bfae99', 'wood_light': '#dbd0c0', 'wood_dark': '#7d6b58',
        'stone': '#e2ded5', 'stone_dark': '#b0a99c', 'stone_light': '#f4f1ea',
        'roof': '#1a5948', 'roof2': '#247a63', 'roof3': '#164336', 'roof_under': '#0f2d24',
        'metal': '#b8c5cc', 'accent': '#d4af37', 'accent2': '#4ecdc4',
        'cloth': '#134735', 'emblem': '#e8f4f8', 'glow': '#7ce0f7', 'water': '#38bdf8',
        'foliage': '#2e7d4d', 'foliage2': '#3eb06d', 'foliage_dark': '#194d2e', 'trunk': '#7a6858',
        'crop': '#e6ca65', 'crop2': '#52b788', 'dirt': '#544338', 'smoke': '#e0f2f1',
    }

    # ------------------------------------------------------------ structure
    def footing(self, x, y, sx, sy, h, rng):
        """Graceful ivory stone plinth with a refined gold accent band."""
        box(x, y, 0, sx, sy, h, self.m('stone'), 'footing', bevel=0.008)
        # Gold trim band along top of plinth
        t = 0.012
        box(x + sx / 2 + 0.003, y, h - t, t, sy + 0.01, t, self.m('trim'), 'fband')
        box(x, y + sy / 2 + 0.003, h - t, sx + 0.01, t, t, self.m('trim'), 'fband')
        # Elegant ashlar coursing
        for face in ('x', 'y'):
            n = max(2, int((sy if face == 'x' else sx) * 6))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                c = self.pick(rng, 'stone_light', 'stone')
                if face == 'x':
                    box(x + sx / 2 + 0.004, y + u * sy, 0.01, 0.012, sy / n * 0.85, h - 0.02, c, 'stone_block')
                else:
                    box(x + u * sx, y + sy / 2 + 0.004, 0.01, sx / n * 0.85, 0.012, h - 0.02, c, 'stone_block')

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        """Slender ivory walls with fluted pilasters, gold mouldings and clinging vines."""
        if kind == 'stone':
            return self.stone_walls(x, y, z, sx, sy, h, rng)
        if kind == 'plank':
            return self.plank_walls(x, y, z, sx, sy, h, rng)

        # Smooth ivory base wall
        box(x, y, z, sx, sy, h, self.m('wall'), 'wall')

        # Slender pilasters at visible corners
        t = 0.028
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, z, t * 1.1, t * 1.1, h, self.m('wall2'), 'pilaster', bevel=0.004)
            # Capital and base in gold trim
            box(px, py, z + h - 0.02, t * 1.3, t * 1.3, 0.02, self.m('trim'), 'cap')
            box(px, py, z, t * 1.25, t * 1.25, 0.018, self.m('trim'), 'base')

        # Upper entablature and delicate mid stringcourse
        box(x + sx / 2 + 0.004, y, z + h - t, t, sy + t * 1.2, t, self.m('trim'), 'cornice')
        box(x, y + sy / 2 + 0.004, z + h - t, sx + t * 1.2, t, t, self.m('trim'), 'cornice')
        box(x + sx / 2 + 0.003, y, z + h * 0.5, 0.008, sy + 0.01, 0.012, self.m('trim'), 'stringcourse')
        box(x, y + sy / 2 + 0.003, z + h * 0.5, sx + 0.01, 0.008, 0.012, self.m('trim'), 'stringcourse')

        # Intermediate slender wall pilasters on broader faces
        posts = 3 if max(sx, sy) < 0.6 else 4
        for i in range(1, posts):
            u = -0.5 + i / posts
            box(x + sx / 2 + 0.004, y + u * sy, z, 0.016, 0.016, h, self.m('wall2'), 'rib')
            box(x + u * sx, y + sy / 2 + 0.004, z, 0.016, 0.016, h, self.m('wall2'), 'rib')

        # Clinging elven ivy / vines
        for face in ('x', 'y'):
            if rng.random() < 0.6:
                vn = rng.randint(2, 4)
                base_u = rng.uniform(-0.35, 0.35)
                for vi in range(vn):
                    vz = z + (vi + 0.3) * (h * 0.55 / vn)
                    vu = base_u + rng.uniform(-0.06, 0.06)
                    r_leaf = rng.uniform(0.022, 0.038)
                    c_leaf = self.pick(rng, 'foliage', 'foliage2', 'foliage_dark')
                    if face == 'x':
                        sphere(x + sx / 2 + 0.008, y + vu * sy, vz, r_leaf, c_leaf, 'vine', squash=0.5)
                    else:
                        sphere(x + vu * sx, y + sy / 2 + 0.008, vz, r_leaf, c_leaf, 'vine', squash=0.5)

    def stone_walls(self, x, y, z, sx, sy, h, rng):
        """Polished ivory stone ashlar with fine gold accents."""
        box(x, y, z, sx, sy, h, self.m('stone'), 'swall', bevel=0.005)
        rows = max(2, int(h / 0.06))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.5) * h / rows
                n = max(2, int(span / 0.09))
                for i in range(n):
                    if rng.random() < 0.4:
                        continue
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.5) / n
                    if abs(u) > 0.46:
                        continue
                    c = self.pick(rng, 'stone_light', 'stone_dark', 'trim')
                    is_gold = (c == self.m('trim'))
                    w_block = span / n * (0.4 if is_gold else 0.85)
                    h_block = 0.015 if is_gold else 0.04
                    if face == 'x':
                        box(x + sx / 2 + 0.004, y + u * span, zz - 0.015, 0.01, w_block, h_block, c, 'ashlar')
                    else:
                        box(x + u * span, y + sy / 2 + 0.004, zz - 0.015, w_block, 0.01, h_block, c, 'ashlar')

    def plank_walls(self, x, y, z, sx, sy, h, rng):
        """Pale elven wood planks with neat vertical lines."""
        box(x, y, z, sx, sy, h, self.m('wood'), 'pwall')
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(4, int(span * 16))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                c = self.pick(rng, 'wood', 'wood_light')
                if face == 'x':
                    box(x + sx / 2 + 0.003, y + u * span, z, 0.008, span / n * 0.9, h, c, 'plank')
                else:
                    box(x + u * span, y + sy / 2 + 0.003, z, span / n * 0.9, 0.008, h, c, 'plank')

    # ------------------------------------------------------------ roofs
    def roof(self, x, y, z, sx, sy, h, rng, shape='gable', along='x', over=0.07):
        """Curved, swept roofs in emerald/teal with gold trim."""
        if shape == 'gable':
            return self.gable(x, y, z, sx, sy, h, rng, along=along, over=over)
        if shape == 'hip':
            o = kit.hip(x, y, z, sx, sy, h, self.m('roof_under'), overhang=over)
            n = 4 if h > 0.12 else 3
            for i in range(n):
                f = i / n
                lip = 0.02 * (1 - f)
                kit.hip(x, y, z + h * f + 0.004, (sx + 2 * over) * (1 - f) + 2 * lip - 2 * over, (sy + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        h * (1 - f), self.pick(rng, 'roof', 'roof2') if i else self.m('roof'), overhang=over)
            sphere(x, y, z + h + 0.01, 0.032, self.m('trim'), 'roofcap', squash=0.8)
            cone(x, y, z + h + 0.03, 0.015, 0.05, self.m('trim'), seg=4, name='finial_tip')
            return o
        if shape in ('cone', 'spire'):
            r = max(sx, sy) / 2 + over
            rc = cone(x, y, z, r, h, self.m('roof'), seg=12, name='roofcone')
            cyl(x, y, z, r * 1.02, 0.02, self.m('trim'), seg=16, name='roof_eave_gold')
            sphere(x, y, z + h + 0.015, 0.028, self.m('trim'), 'spire_ball')
            cone(x, y, z + h + 0.035, 0.012, 0.06, self.m('trim'), seg=4, name='spire_tip')
            return rc
        if shape == 'flat':
            box(x, y, z, sx + over, sy + over, 0.035, self.m('roof'), 'flatroof')
            for (px, py) in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                box(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.035,
                    (sx + over) if py else 0.025, (sy + over) if px else 0.025, 0.05, self.m('trim'), 'parapet')
                if px and py:
                    sphere(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.09, 0.016, self.m('trim'), 'pfinial')
            return
        if shape == 'dome':
            r = max(sx, sy) / 2 + over
            d = sphere(x, y, z, r, self.m('roof'), 'dome', squash=h / r)
            for p in d.data.polygons:
                p.use_smooth = True
            cyl(x, y, z, r * 1.02, 0.02, self.m('trim'), seg=16, name='dome_ring')
            sphere(x, y, z + h + 0.01, 0.03, self.m('trim'), 'dome_finial')
            return d

    def gable(self, x, y, z, sx, sy, h, rng, along='x', over=0.07, rows=9):
        """Swept elven gable roof with graceful curves, leaf-cut shingles and gold ridges."""
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
                seg = int(length / 0.1) + 1
                stagger = (i % 2) * 0.5
                for k in range(seg):
                    uu = -length / 2 + ((k + stagger) % seg + 0.5) * length / seg
                    c = self.pick(rng, 'roof', 'roof2', 'roof3')
                    w = L / rows * 1.45
                    tw = length / seg * 0.95
                    b = box(0, 0, -0.007, *((tw, w) if along == 'x' else (w, tw)), 0.016, c, 'shingle')
                    eave_sweep = 0.022 * ((1 - t) ** 2.2)
                    tip_lift = 0.015 * ((2 * abs(uu) / length) ** 2)
                    if along == 'x':
                        b.location = (x + uu, y + side * d, zz + eave_sweep + tip_lift)
                        b.rotation_euler = (-side * ang + rng.uniform(-0.02, 0.02), rng.uniform(-0.02, 0.02), 0)
                    else:
                        b.location = (x + side * d, y + uu, zz + eave_sweep + tip_lift)
                        b.rotation_euler = (rng.uniform(-0.02, 0.02), side * ang + rng.uniform(-0.02, 0.02), 0)

            if side == 1:
                self.roof_dressing(x, y, z, h, half, over, length, along, rng)

        if along == 'x':
            box(x, y, z + h - 0.005, length, 0.05, 0.04, self.m('trim'), 'ridge')
            for ex in (-length / 2, length / 2):
                cone(x + ex, y, z + h + 0.02, 0.02, 0.05, self.m('trim'), seg=4, name='ridge_horn')
            for gx in (x + sx / 2, x - sx / 2):
                poly([(gx, y - sy / 2, z), (gx, y + sy / 2, z), (gx, y, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
                box(gx, y, z + h * 0.45, 0.015, sy * 0.9, 0.015, self.m('trim'), 'gabletrim')
        else:
            box(x, y, z + h - 0.005, 0.05, length, 0.04, self.m('trim'), 'ridge')
            for ey in (-length / 2, length / 2):
                cone(x, y + ey, z + h + 0.02, 0.02, 0.05, self.m('trim'), seg=4, name='ridge_horn')
            for gy in (y + sy / 2, y - sy / 2):
                poly([(x - sx / 2, gy, z), (x + sx / 2, gy, z), (x, gy, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
                box(x, gy, z + h * 0.45, sx * 0.9, 0.015, 0.015, self.m('trim'), 'gabletrim')

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        """Trailing vines and glowing spore blossoms on the visible roof slope."""
        for _ in range(max(2, int(length * 5))):
            t = rng.uniform(0.15, 0.85)
            d = (1 - t) * half
            uu = rng.uniform(-length / 2 + 0.04, length / 2 - 0.04)
            zz = z + h * (1 - d / (half - over)) + 0.02
            pos = (x + uu, y + d, zz) if along == 'x' else (x + d, y + uu, zz)
            c = self.m(rng.choice(['foliage', 'foliage2', 'accent2']))
            sphere(*pos, rng.uniform(0.025, 0.042), c, 'roof_vine', squash=0.45)

    # ------------------------------------------------------------ openings
    def window(self, face, x, y, z, w=0.11, h=0.13, lit=True):
        """Round moon window with gold frame and glowing silver-blue glass."""
        r = min(w, h) * 0.55
        pane_mat = self.m('glow', emit=2.8) if lit else self.m('stone_dark')
        cz = z + h * 0.5

        if face == 'x':
            wf = cyl(0, 0, 0, r + 0.018, 0.022, self.m('trim'), seg=16, name='wframe')
            wf.location = (x + 0.014, y, cz)
            wf.rotation_euler = (0, math.pi / 2, 0)
            wp = cyl(0, 0, 0, r, 0.012, pane_mat, seg=16, name='noink_pane')
            wp.location = (x + 0.024, y, cz)
            wp.rotation_euler = (0, math.pi / 2, 0)
            box(x + 0.028, y, cz, 0.008, r * 1.85, 0.012, self.m('trim'), 'mullion')
            box(x + 0.028, y, cz, 0.008, 0.012, r * 1.85, self.m('trim'), 'mullion')
        else:
            wf = cyl(0, 0, 0, r + 0.018, 0.022, self.m('trim'), seg=16, name='wframe')
            wf.location = (x, y + 0.014, cz)
            wf.rotation_euler = (math.pi / 2, 0, 0)
            wp = cyl(0, 0, 0, r, 0.012, pane_mat, seg=16, name='noink_pane')
            wp.location = (x, y + 0.024, cz)
            wp.rotation_euler = (math.pi / 2, 0, 0)
            box(x, y + 0.028, cz, r * 1.85, 0.008, 0.012, self.m('trim'), 'mullion')
            box(x, y + 0.028, cz, 0.012, 0.008, r * 1.85, self.m('trim'), 'mullion')

    def door(self, face, x, y, z, w=0.16, h=0.26):
        """Slender arched elven door with pale wood and gold filigree."""
        if face == 'x':
            box(x + 0.01, y, z, 0.026, w + 0.04, h + 0.03, self.m('trim'), 'dframe')
            box(x + 0.022, y, z, 0.018, w, h, self.m('wood_light'), 'door')
            box(x + 0.028, y, z + h * 0.45, 0.01, w * 0.65, h * 0.65, self.m('wood'), 'dpanel')
            sphere(x + 0.038, y + w * 0.3, z + h * 0.45, 0.016, self.m('glow', emit=2.0), 'noink_knob')
            cone(x + 0.012, y, z + h + 0.015, w * 0.38, 0.06, self.m('trim'), seg=4, name='dpediment')
        else:
            box(x, y + 0.01, z, w + 0.04, 0.026, h + 0.03, self.m('trim'), 'dframe')
            box(x, y + 0.022, z, w, 0.018, h, self.m('wood_light'), 'door')
            box(x, y + 0.028, z + h * 0.45, w * 0.65, 0.01, h * 0.65, self.m('wood'), 'dpanel')
            sphere(x + w * 0.3, y + 0.038, z + h * 0.45, 0.016, self.m('glow', emit=2.0), 'noink_knob')
            cone(x, y + 0.012, z + h + 0.015, w * 0.38, 0.06, self.m('trim'), seg=4, name='dpediment')

    # ------------------------------------------------------------ dressing
    def chimney(self, x, y, z, h, rng, smoke=True):
        """Slender ivory chimney with gold rim."""
        cyl(x, y, z, 0.045, h, self.m('stone_light'), seg=8, name='chimney')
        cone(x, y, z + h, 0.065, 0.035, self.m('trim'), seg=6, name='chimcap')
        if smoke:
            self.smoke(x, y, z + h + 0.04)

    def emblem(self, face, x, y, z, s):
        """Silver crescent moon with star emblem on deep green banner."""
        if face == 'x':
            m = sphere(x, y, z, s * 0.45, self.m('emblem'), 'crescent', squash=1.0)
            m.scale = (0.2, 1.0, 1.0)
            cut = sphere(x + 0.005, y + s * 0.16, z + s * 0.08, s * 0.36, self.m('cloth'), 'cutout', squash=1.0)
            cut.scale = (0.25, 1.0, 1.0)
            sphere(x + 0.006, y - s * 0.12, z - s * 0.06, s * 0.12, self.m('accent'), 'star', squash=0.4)
        else:
            m = sphere(x, y, z, s * 0.45, self.m('emblem'), 'crescent', squash=1.0)
            m.scale = (1.0, 0.2, 1.0)
            cut = sphere(x + s * 0.16, y + 0.005, z + s * 0.08, s * 0.36, self.m('cloth'), 'cutout', squash=1.0)
            cut.scale = (1.0, 0.25, 1.0)
            sphere(x - s * 0.12, y + 0.006, z - s * 0.06, s * 0.12, self.m('accent'), 'star', squash=0.4)

    def lamp(self, x, y, z=0.0):
        """Slender gold street lantern with cool silver-blue glowing core."""
        cyl(x, y, z, 0.012, 0.22, self.m('trim'), seg=8, name='lpost')
        sphere(x, y, z + 0.23, 0.035, self.m('glow', emit=4.5), 'noink_lamp', squash=1.2)
        cone(x, y, z + 0.27, 0.05, 0.045, self.m('trim'), seg=6, name='lroof')
        sphere(x, y, z + 0.315, 0.012, self.m('accent'), 'lfinial')

    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        """Tall elegant oak/broadleaf with lush layered crowns and glowing mushrooms."""
        # Graceful flaring pale trunk
        cyl(x, y, z, 0.024 * s, 0.28 * s, self.m('trunk'), seg=8, name='trunk')
        cone(x, y, z, 0.046 * s, 0.06 * s, self.m('trunk'), seg=6, name='root')
        # Lush layered crown clusters
        sphere(x, y, z + 0.38 * s, 0.15 * s, self.m('foliage2'), 'leaves_top')
        sphere(x + 0.06 * s, y - 0.03 * s, z + 0.3 * s, 0.11 * s, self.m('foliage'), 'leaves_r')
        sphere(x - 0.05 * s, y + 0.05 * s, z + 0.31 * s, 0.10 * s, self.m('foliage_dark'), 'leaves_l')
        sphere(x - 0.02 * s, y - 0.06 * s, z + 0.27 * s, 0.09 * s, self.m('foliage'), 'leaves_b')
        # Bioluminescent azure mushrooms at the roots
        cyl(x + 0.048 * s, y + 0.025 * s, z, 0.004 * s, 0.025 * s, self.m('wood_light'), seg=4, name='shroom_stem')
        sphere(x + 0.048 * s, y + 0.025 * s, z + 0.028 * s, 0.014 * s, self.m('accent2', emit=4.0), 'noink_shroom', squash=0.6)

    def bush(self, x, y, r=0.06):
        """Layered emerald bush with glowing teal berry blossom."""
        sphere(x, y, r * 0.6, r, self.m('foliage'), 'bush', squash=0.75)
        sphere(x + r * 0.2, y - r * 0.2, r * 0.8, r * 0.6, self.m('foliage2'), 'bush_top', squash=0.75)
        sphere(x, y + r * 0.2, r * 0.85, r * 0.2, self.m('accent2', emit=2.5), 'noink_berry')

    def fire(self, x, y, z, s=1.0):
        """Enchanted sacred flame: warm golden flame with cool azure core."""
        fl = cone(x, y, z, 0.04 * s, 0.1 * s, mat('#ffd166', emit=5), seg=6, name='noink_fire')
        core = cone(x, y, z, 0.022 * s, 0.075 * s, mat('#7ce0f7', emit=6), seg=6, name='noink_fire')
        kit.anim(lambda f, n: [
            setattr(fl, 'scale', (1, 1, (1.0, 1.25, 0.85)[f % 3])),
            setattr(core, 'scale', (1, 1, (1.1, 0.9, 1.2)[f % 3]))
        ])


STYLE = ElfStyle()
