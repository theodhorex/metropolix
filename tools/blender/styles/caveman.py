# Cavemen: stone-age brawlers, simple tools. Rough boulders and stacked stones,
# hide-and-log tents, mammoth tusk and bone frames, thatch of grass and furs,
# campfires, crude cave paintings (ochre/red marks), wooden palisades with lashed logs.
# Chunky, heavy, rounded, nothing square or refined.
# Banners: hide with a red hand-print emblem.
# Trees: big dark conifers.
import math
import kit
from kit import box, sphere, cone, cyl, poly, mat
from style import Style


class CavemanStyle(Style):
    name = 'caveman'
    P = {
        'wall': '#c49868', 'wall2': '#8d5e38', 'trim': '#462b1a',
        'wood': '#6d4527', 'wood_light': '#a67c52', 'wood_dark': '#382012',
        'stone': '#7a7268', 'stone_dark': '#4e4842', 'stone_light': '#a89f92',
        'roof': '#9c824c', 'roof2': '#6e5334', 'roof3': '#ba9e5e', 'roof_under': '#2e1b10',
        'metal': '#483c34', 'accent': '#b83a24', 'accent2': '#e8dfce',
        'cloth': '#8f613c', 'emblem': '#b82e18', 'glow': '#ff9626', 'water': '#4fa8c8',
        'foliage': '#2f4f2e', 'foliage2': '#416b3c', 'foliage_dark': '#1d331c', 'trunk': '#442e1e',
        'crop': '#c29a48', 'crop2': '#6a8a3a', 'dirt': '#543e2a', 'smoke': '#d2ccc4',
    }

    # ------------------------------------------------------------ structure
    def footing(self, x, y, sx, sy, h, rng):
        """Heavy cyclopean boulder base: stacked rounded stones."""
        box(x, y, 0, sx, sy, h, self.m('stone_dark'), 'footing', bevel=0.015)
        # Rounded protruding boulders along the perimeter
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(3, int(span * 7))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                r = rng.uniform(0.035, 0.055)
                bz = rng.uniform(r * 0.5, max(r * 0.5, h - r * 0.2))
                c = self.pick(rng, 'stone', 'stone_dark', 'stone_light')
                if face == 'x':
                    sphere(x + sx / 2 + 0.005, y + u * span, bz, r, c, 'boulder', squash=0.65)
                else:
                    sphere(x + u * span, y + sy / 2 + 0.005, bz, r, c, 'boulder', squash=0.65)

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        """Chunky hide tent / stone-age lodge with raw log frame and crude red cave paintings."""
        if kind == 'stone':
            return self.stone_walls(x, y, z, sx, sy, h, rng)
        if kind == 'plank':
            return self.plank_walls(x, y, z, sx, sy, h, rng)

        # Base hide wall
        box(x, y, z, sx, sy, h, self.m('wall'), 'wall', bevel=0.01)

        # Rough raw round log corner posts
        t = 0.036
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            cyl(px, py, z, t * 0.65, h * 1.02, self.m('wood_dark'), seg=8, name='log_post')
            # Lashed sinew binding at top of post
            cyl(px, py, z + h - 0.02, t * 0.72, 0.015, self.m('trim'), seg=8, name='lash_ring')

        # Rough log eaves beam
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            if face == 'x':
                b = cyl(x + sx / 2 + 0.004, y, z + h - t * 0.7, t * 0.5, span + 0.02, self.m('wood_dark'), seg=8, name='eaves_log')
                b.rotation_euler = (math.pi / 2, 0, 0)
            else:
                b = cyl(x, y + sy / 2 + 0.004, z + h - t * 0.7, t * 0.5, span + 0.02, self.m('wood_dark'), seg=8, name='eaves_log')
                b.rotation_euler = (0, math.pi / 2, 0)

        # Mammoth tusk or heavy leaning timber brace at visible corners
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            ang = rng.uniform(0.45, 0.65) * (1 if rng.random() < 0.5 else -1)
            if face == 'x':
                brace = cyl(0, 0, 0, t * 0.45, h * 0.8, self.m('wood'), seg=6, name='log_brace')
                brace.location = (x + sx / 2 + 0.008, y + rng.uniform(-0.15, 0.15) * span, z + h * 0.45)
                brace.rotation_euler = (ang, 0, 0)
            else:
                brace = cyl(0, 0, 0, t * 0.45, h * 0.8, self.m('wood'), seg=6, name='log_brace')
                brace.location = (x + rng.uniform(-0.15, 0.15) * span, y + sy / 2 + 0.008, z + h * 0.45)
                brace.rotation_euler = (0, -ang, 0)

        # Stitched hide thongs / fur patches
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            if rng.random() < 0.75:
                py = y + rng.uniform(-0.25, 0.25) * span
                pz = z + rng.uniform(0.25, 0.75) * h
                c_fur = self.pick(rng, 'roof2', 'wall2')
                if face == 'x':
                    box(x + sx / 2 + 0.006, py, pz, 0.008, span * 0.28, 0.08, c_fur, 'fur_patch')
                else:
                    box(py, y + sy / 2 + 0.006, pz, span * 0.28, 0.008, 0.08, c_fur, 'fur_patch')

        # Crude red ochre cave paintings: hand marks and primitive stick art!
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            paint_u = rng.uniform(-0.2, 0.2)
            paint_z = z + h * rng.uniform(0.35, 0.65)
            if face == 'x':
                sphere(x + sx / 2 + 0.008, y + paint_u * span, paint_z, 0.022, self.m('emblem'), 'cave_art', squash=0.3)
                for f_i in (-0.012, 0.0, 0.012):
                    box(x + sx / 2 + 0.009, y + paint_u * span + f_i, paint_z + 0.02, 0.004, 0.006, 0.014, self.m('emblem'), 'ochre_mark')
            else:
                sphere(x + paint_u * span, y + sy / 2 + 0.008, paint_z, 0.022, self.m('emblem'), 'cave_art', squash=0.3)
                for f_i in (-0.012, 0.0, 0.012):
                    box(x + paint_u * span + f_i, y + sy / 2 + 0.009, paint_z + 0.02, 0.006, 0.004, 0.014, self.m('emblem'), 'ochre_mark')

    def stone_walls(self, x, y, z, sx, sy, h, rng):
        """Cyclopean masonry: huge rough rounded boulders piled with clay mortar."""
        box(x, y, z, sx, sy, h, self.m('stone'), 'swall', bevel=0.012)
        rows = max(2, int(h / 0.08))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.5) * h / rows
                n = max(2, int(span / 0.11))
                for i in range(n):
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.45) / n
                    if abs(u) > 0.45:
                        continue
                    c = self.pick(rng, 'stone_dark', 'stone_light', 'stone')
                    br = rng.uniform(0.038, 0.06)
                    if face == 'x':
                        sphere(x + sx / 2 + 0.006, y + u * span, zz, br, c, 'boulder_wall', squash=0.6)
                    else:
                        sphere(x + u * span, y + sy / 2 + 0.006, zz, br, c, 'boulder_wall', squash=0.6)

    def plank_walls(self, x, y, z, sx, sy, h, rng):
        """Wooden palisade: vertical uneven logs lashed together with sinew."""
        box(x, y, z, sx, sy, h, self.m('wood_dark'), 'pwall')
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(4, int(span * 14))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                hh = h * rng.uniform(0.92, 1.06)
                r_log = (span / n) * 0.52
                c = self.pick(rng, 'wood', 'wood_light', 'wood_dark')
                if face == 'x':
                    log_obj = cyl(x + sx / 2 + 0.004, y + u * span, z, r_log, hh, c, seg=6, name='palisade_log')
                    log_obj.rotation_euler = (rng.uniform(-0.04, 0.04), 0, 0)
                else:
                    log_obj = cyl(x + u * span, y + sy / 2 + 0.004, z, r_log, hh, c, seg=6, name='palisade_log')
                    log_obj.rotation_euler = (0, rng.uniform(-0.04, 0.04), 0)
            cross_z = z + h * 0.55
            if face == 'x':
                rail = cyl(x + sx / 2 + 0.012, y, cross_z, 0.016, span * 1.02, self.m('wood_dark'), seg=6, name='lash_rail')
                rail.rotation_euler = (math.pi / 2, 0, 0)
            else:
                rail = cyl(x, y + sy / 2 + 0.012, cross_z, 0.016, span * 1.02, self.m('wood_dark'), seg=6, name='lash_rail')
                rail.rotation_euler = (0, math.pi / 2, 0)

    # ------------------------------------------------------------ roofs
    def roof(self, x, y, z, sx, sy, h, rng, shape='gable', along='x', over=0.08):
        """Shaggy steppe thatch, fur pelts, and mammoth bone teepee structures."""
        if shape == 'gable':
            return self.gable(x, y, z, sx, sy, h, rng, along=along, over=over)
        if shape == 'hip':
            o = kit.hip(x, y, z, sx, sy, h, self.m('roof_under'), overhang=over)
            n = 4 if h > 0.12 else 3
            for i in range(n):
                f = i / n
                lip = 0.022 * (1 - f)
                kit.hip(x, y, z + h * f + 0.004, (sx + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        (sy + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        h * (1 - f), self.pick(rng, 'roof', 'roof2', 'roof3') if i else self.m('roof'), overhang=over)
            # Bone cap with mammoth tusks
            sphere(x, y, z + h + 0.01, 0.038, self.m('accent2'), 'bone_cap', squash=0.8)
            cone(x, y, z + h + 0.03, 0.016, 0.05, self.m('wood_dark'), seg=4, name='ridge_tip')
            return o
        if shape in ('cone', 'spire'):
            r = max(sx, sy) / 2 + over
            # Teepee / yurt cone of furs and hide
            rc = cone(x, y, z, r, h, self.m('roof'), seg=8 if shape == 'cone' else 6, name='teepee_cone')
            # Exposed timber teepee poles jutting out top
            pole_h = 0.12
            for pi in range(5):
                pa = 2 * math.pi * pi / 5
                p = cyl(0, 0, 0, 0.012, h + pole_h, self.m('wood_dark'), seg=4, name='teepee_pole')
                p.location = (x + math.cos(pa) * 0.02, y + math.sin(pa) * 0.02, z + (h + pole_h) / 2)
                p.rotation_euler = (0.12 * math.sin(pa), -0.12 * math.cos(pa), 0)
            # Lashed sinew collar
            cyl(x, y, z + h - 0.01, 0.045, 0.025, self.m('trim'), seg=8, name='teepee_tie')
            return rc
        if shape == 'flat':
            # Heavy turf, hide, and packed earth flat roof with boulder parapet
            box(x, y, z, sx + over, sy + over, 0.04, self.m('roof2'), 'flatroof')
            for (px, py) in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                span = (sx + over) if py else (sy + over)
                box(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.04,
                    (sx + over) if py else 0.04, (sy + over) if px else 0.04, 0.05, self.m('wood_dark'), 'log_parapet')
                # Stones pinning the flat roof
                sphere(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.08, 0.025, self.m('stone'), 'parapet_stone', squash=0.6)
            return
        if shape == 'dome':
            # Mammoth bone and hide yurt dome
            r = max(sx, sy) / 2 + over
            d = sphere(x, y, z, r, self.m('roof'), 'yurt_dome', squash=h / r)
            for p in d.data.polygons:
                p.use_smooth = True
            # Bone cap at apex
            sphere(x, y, z + h + 0.005, 0.035, self.m('accent2'), 'yurt_boss')
            return d

    def gable(self, x, y, z, sx, sy, h, rng, along='x', over=0.08, rows=8):
        """Thick shaggy thatch & fur roof with heavy log ridge and crossed timber horns."""
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
                seg = int(length / 0.12) + 1
                stagger = (i % 2) * 0.5
                for k in range(seg):
                    uu = -length / 2 + ((k + stagger) % seg + 0.5) * length / seg
                    c = self.pick(rng, 'roof', 'roof2', 'roof3')
                    w = L / rows * 1.55
                    tw = length / seg * 0.95
                    b = box(0, 0, -0.009, *((tw, w) if along == 'x' else (w, tw)), 0.024, c, 'thatch_bundle')
                    # Chunky drooping thatch sag
                    sag = 0.016 * math.sin(math.pi * (uu + length / 2) / length)
                    eave_lip = 0.012 * (1 - t)
                    if along == 'x':
                        b.location = (x + uu, y + side * d, zz - sag + eave_lip)
                        b.rotation_euler = (-side * ang + rng.uniform(-0.06, 0.06), rng.uniform(-0.05, 0.05), rng.uniform(-0.04, 0.04))
                    else:
                        b.location = (x + side * d, y + uu, zz - sag + eave_lip)
                        b.rotation_euler = (rng.uniform(-0.05, 0.05), side * ang + rng.uniform(-0.06, 0.06), rng.uniform(-0.04, 0.04))

            if side == 1:
                self.roof_dressing(x, y, z, h, half, over, length, along, rng)

        # Heavy round raw log ridge pole
        if along == 'x':
            ridge = cyl(x, y, z + h - 0.008, 0.032, length * 1.04, self.m('wood_dark'), seg=8, name='ridge_log')
            ridge.rotation_euler = (0, math.pi / 2, 0)
            # Crossed horns / lashed ridge poles at visible gable ends
            for gx in (x + length / 2 - 0.02, x - length / 2 + 0.02):
                p1 = cyl(gx, y, z + h + 0.03, 0.014, 0.12, self.m('accent2'), seg=4, name='ridge_horn_1')
                p1.rotation_euler = (0.35, 0, 0)
                p2 = cyl(gx, y, z + h + 0.03, 0.014, 0.12, self.m('accent2'), seg=4, name='ridge_horn_2')
                p2.rotation_euler = (-0.35, 0, 0)
            for gx in (x + sx / 2, x - sx / 2):
                poly([(gx, y - sy / 2, z), (gx, y + sy / 2, z), (gx, y, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
                # Horizontal log cross-brace on gable
                b_g = cyl(gx, y, z + h * 0.45, 0.016, sy * 0.92, self.m('wood_dark'), seg=6, name='gable_pole')
                b_g.rotation_euler = (math.pi / 2, 0, 0)
        else:
            ridge = cyl(x, y, z + h - 0.008, 0.032, length * 1.04, self.m('wood_dark'), seg=8, name='ridge_log')
            ridge.rotation_euler = (math.pi / 2, 0, 0)
            for gy in (y + length / 2 - 0.02, y - length / 2 + 0.02):
                p1 = cyl(x, gy, z + h + 0.03, 0.014, 0.12, self.m('accent2'), seg=4, name='ridge_horn_1')
                p1.rotation_euler = (0, 0.35, 0)
                p2 = cyl(x, gy, z + h + 0.03, 0.014, 0.12, self.m('accent2'), seg=4, name='ridge_horn_2')
                p2.rotation_euler = (0, -0.35, 0)
            for gy in (y + sy / 2, y - sy / 2):
                poly([(x - sx / 2, gy, z), (x + sx / 2, gy, z), (x, gy, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
                b_g = cyl(x, gy, z + h * 0.45, 0.016, sx * 0.92, self.m('wood_dark'), seg=6, name='gable_pole')
                b_g.rotation_euler = (0, math.pi / 2, 0)

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        """Heavy weight-stones to pin the thatch against mountain winds, plus mammoth bones."""
        n_stones = max(3, int(length * 6))
        for _ in range(n_stones):
            t = rng.uniform(0.2, 0.82)
            d = (1 - t) * half
            uu = rng.uniform(-length / 2 + 0.05, length / 2 - 0.05)
            zz = z + h * (1 - d / (half - over)) + 0.02
            pos = (x + uu, y + d, zz) if along == 'x' else (x + d, y + uu, zz)
            r_st = rng.uniform(0.026, 0.042)
            c_st = self.pick(rng, 'stone', 'stone_dark')
            sphere(*pos, r_st, c_st, 'weight_stone', squash=0.55)

    # ------------------------------------------------------------ openings
    def window(self, face, x, y, z, w=0.11, h=0.13, lit=True):
        """Rough timber frame with glowing hearth light or animal pelt flap."""
        pane = self.m('glow', emit=2.6) if lit else self.m('stone_dark')
        if face == 'x':
            cyl_f = cyl(x + 0.012, y, z + h * 0.45, 0.014, w + 0.04, self.m('wood_dark'), seg=6, name='wframe_top')
            cyl_f.rotation_euler = (math.pi / 2, 0, 0)
            box(x + 0.024, y, z, 0.01, w, h, pane, 'noink_pane')
            box(x + 0.028, y, z + h / 2 - 0.005, 0.008, w, 0.01, self.m('accent2'), 'mullion')
        else:
            cyl_f = cyl(x, y + 0.012, z + h * 0.45, 0.014, w + 0.04, self.m('wood_dark'), seg=6, name='wframe_top')
            cyl_f.rotation_euler = (0, math.pi / 2, 0)
            box(x, y + 0.024, z, w, 0.01, h, pane, 'noink_pane')
            box(x, y + 0.028, z + h / 2 - 0.005, w, 0.008, 0.01, self.m('accent2'), 'mullion')

    def door(self, face, x, y, z, w=0.16, h=0.26):
        """Mammoth hide curtain doorway framed with raw timber logs."""
        if face == 'x':
            cyl(x + 0.012, y - w * 0.52, z, 0.018, h + 0.03, self.m('wood_dark'), seg=6, name='dpost_l')
            cyl(x + 0.012, y + w * 0.52, z, 0.018, h + 0.03, self.m('wood_dark'), seg=6, name='dpost_r')
            lintel = cyl(x + 0.012, y, z + h + 0.015, 0.02, w + 0.06, self.m('wood_dark'), seg=6, name='dlintel')
            lintel.rotation_euler = (math.pi / 2, 0, 0)
            box(x + 0.022, y, z, 0.018, w, h, self.m('wall2'), 'door')
            sphere(x + 0.035, y + w * 0.28, z + h * 0.45, 0.015, self.m('accent2'), 'bone_toggle')
        else:
            cyl(x - w * 0.52, y + 0.012, z, 0.018, h + 0.03, self.m('wood_dark'), seg=6, name='dpost_l')
            cyl(x + w * 0.52, y + 0.012, z, 0.018, h + 0.03, self.m('wood_dark'), seg=6, name='dpost_r')
            lintel = cyl(x, y + 0.012, z + h + 0.015, 0.02, w + 0.06, self.m('wood_dark'), seg=6, name='dlintel')
            lintel.rotation_euler = (0, math.pi / 2, 0)
            box(x, y + 0.022, z, w, 0.018, h, self.m('wall2'), 'door')
            sphere(x + w * 0.28, y + 0.035, z + h * 0.45, 0.015, self.m('accent2'), 'bone_toggle')

    # ------------------------------------------------------------ dressing
    def emblem(self, face, x, y, z, s):
        """Red ochre hand-print emblem: palm, thumb, and four fingers."""
        c_red = self.m('emblem')
        p_r = s * 0.22
        if face == 'x':
            palm = sphere(x + 0.004, y, z - s * 0.04, p_r, c_red, 'palm', squash=0.3)
            palm.scale = (0.3, 1.0, 1.1)
            th = box(x + 0.005, y - s * 0.14, z - s * 0.04, 0.004, s * 0.10, s * 0.06, c_red, 'thumb')
            th.rotation_euler = (0.4, 0, 0)
            for fi, dy in enumerate((-s * 0.08, -s * 0.025, s * 0.03, s * 0.085)):
                fh = s * (0.16 if fi in (1, 2) else 0.13)
                box(x + 0.005, y + dy, z + s * 0.06 + fh * 0.35, 0.004, s * 0.04, fh, c_red, 'finger')
        else:
            palm = sphere(x, y + 0.004, z - s * 0.04, p_r, c_red, 'palm', squash=0.3)
            palm.scale = (1.0, 0.3, 1.1)
            th = box(x - s * 0.14, y + 0.005, z - s * 0.04, s * 0.10, 0.004, s * 0.06, c_red, 'thumb')
            th.rotation_euler = (0, -0.4, 0)
            for fi, dx in enumerate((-s * 0.08, -s * 0.025, s * 0.03, s * 0.085)):
                fh = s * (0.16 if fi in (1, 2) else 0.13)
                box(x + dx, y + 0.005, z + s * 0.06 + fh * 0.35, s * 0.04, 0.004, fh, c_red, 'finger')

    def banner(self, face, x, y, z, w=0.1, h=0.2):
        """Stitched animal hide banner on a lashed timber pole with red handprint."""
        cloth = self.m('cloth')
        if face == 'x':
            b_pole = cyl(x + 0.02, y, z + h, 0.012, w + 0.06, self.m('wood_dark'), seg=6, name='pole')
            b_pole.rotation_euler = (math.pi / 2, 0, 0)
            b = box(x + 0.022, y, z, 0.01, w, h, cloth, 'banner')
            sphere(x + 0.022, y - w * 0.25, z - 0.02, 0.02, cloth, 'pelt_tail', squash=0.4)
            sphere(x + 0.022, y + w * 0.25, z - 0.02, 0.022, cloth, 'pelt_tail', squash=0.4)
            self.emblem('x', x + 0.028, y, z + h * 0.55, w * 0.6)
        else:
            b_pole = cyl(x, y + 0.02, z + h, 0.012, w + 0.06, self.m('wood_dark'), seg=6, name='pole')
            b_pole.rotation_euler = (0, math.pi / 2, 0)
            b = box(x, y + 0.022, z, w, 0.01, h, cloth, 'banner')
            sphere(x - w * 0.25, y + 0.022, z - 0.02, 0.02, cloth, 'pelt_tail', squash=0.4)
            sphere(x + w * 0.25, y + 0.022, z - 0.02, 0.022, cloth, 'pelt_tail', squash=0.4)
            self.emblem('y', x, y + 0.028, z + h * 0.55, w * 0.6)
        kit.anim(lambda f, n: setattr(b, 'rotation_euler', ((0.06 * math.sin(2 * math.pi * f / n), 0, 0) if face == 'x' else (0, 0.06 * math.sin(2 * math.pi * f / n), 0))))

    def lamp(self, x, y, z=0.0):
        """Primitive fire brazier: rough timber stake with a stone bowl of blazing pitch."""
        cyl(x, y, z, 0.018, 0.22, self.m('wood_dark'), seg=6, name='torch_post')
        cyl(x, y, z + 0.17, 0.024, 0.02, self.m('trim'), seg=6, name='torch_lash')
        cone(x, y, z + 0.20, 0.048, 0.045, self.m('stone_dark'), seg=6, r_top=0.03, name='torch_bowl')
        sphere(x, y, z + 0.24, 0.028, self.m('glow', emit=4.5), 'noink_coal')
        fl = cone(x, y, z + 0.26, 0.038, 0.09, mat('#ff9a2a', emit=5), seg=6, name='noink_torch_flame')
        kit.anim(lambda f, n: setattr(fl, 'scale', (1, 1, (1.0, 1.3, 0.8)[f % 3])))

    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        """Big dark conifer: rugged bark trunk, tiered dark pine needles, boulder at roots."""
        cyl(x, y, z, 0.036 * s, 0.18 * s, self.m('trunk'), seg=7, name='trunk')
        cone(x, y, z, 0.058 * s, 0.05 * s, self.m('trunk'), seg=6, name='roots')
        cone(x, y, z + 0.08 * s, 0.16 * s, 0.15 * s, self.m('foliage_dark'), seg=8, name='pine_tier1')
        cone(x, y, z + 0.18 * s, 0.13 * s, 0.14 * s, self.m('foliage'), seg=8, name='pine_tier2')
        cone(x, y, z + 0.27 * s, 0.095 * s, 0.13 * s, self.m('foliage2'), seg=7, name='pine_tier3')
        cone(x, y, z + 0.35 * s, 0.06 * s, 0.12 * s, self.m('foliage_dark'), seg=6, name='pine_tier4')
        sphere(x + 0.05 * s, y - 0.04 * s, z + 0.02 * s, 0.035 * s, self.m('stone'), 'root_boulder', squash=0.6)

    def bush(self, x, y, r=0.06):
        """Primeval tundra scrub with wild red berries."""
        sphere(x, y, r * 0.6, r, self.m('foliage_dark'), 'bush', squash=0.7)
        sphere(x + r * 0.2, y + r * 0.1, r * 0.75, r * 0.65, self.m('foliage'), 'bush_top', squash=0.75)
        sphere(x + r * 0.25, y - r * 0.2, r * 0.8, r * 0.18, self.m('accent'), 'noink_berry')

    def rock(self, x, y, r=0.06, rng=None):
        """Rough primeval boulder."""
        o = sphere(x, y, r * 0.35, r, self.m('stone'), 'rock', squash=0.6)
        if rng:
            o.rotation_euler.z = rng.uniform(0, 3)

    def fire(self, x, y, z, s=1.0):
        """Stone-age campfire: ring of rough stones, charred logs, and flickering fire."""
        n_stones = 7
        for i in range(n_stones):
            a = 2 * math.pi * i / n_stones
            rx, ry = x + math.cos(a) * 0.07 * s, y + math.sin(a) * 0.07 * s
            sphere(rx, ry, z + 0.015 * s, 0.024 * s, self.m('stone_dark'), 'hearth_stone', squash=0.6)
        l1 = cyl(x, y, z + 0.02 * s, 0.012 * s, 0.11 * s, self.m('wood_dark'), seg=4, name='camp_log1')
        l1.rotation_euler = (0, math.pi / 2, 0.4)
        l2 = cyl(x, y, z + 0.02 * s, 0.012 * s, 0.11 * s, self.m('wood_dark'), seg=4, name='camp_log2')
        l2.rotation_euler = (0, math.pi / 2, -0.4)
        fl = cone(x, y, z + 0.02 * s, 0.045 * s, 0.12 * s, mat('#ff9a2a', emit=5), seg=6, name='noink_fire')
        core = cone(x, y, z + 0.02 * s, 0.025 * s, 0.08 * s, mat('#fff0a0', emit=6), seg=6, name='noink_fire')
        kit.anim(lambda f, n: [
            setattr(fl, 'scale', (1, 1, (1.0, 1.3, 0.8)[f % 3])),
            setattr(core, 'scale', (1, 1, (1.1, 0.85, 1.25)[f % 3]))
        ])

    def chimney(self, x, y, z, h, rng, smoke=True):
        """Rough cyclopean boulder chimney with animated smoke."""
        c = box(x, y, z, 0.13, 0.13, h, self.m('stone'), 'chimney', bevel=0.015)
        c.rotation_euler = (rng.uniform(-0.05, 0.05), rng.uniform(-0.05, 0.05), 0)
        sphere(x, y, z + h + 0.01, 0.08, self.m('stone_dark'), 'chimcap', squash=0.35)
        if smoke and (smoke == 'always' or rng.random() < 0.5):
            self.smoke(x, y, z + h + 0.05)

    def barrel(self, x, y, z=0.0, r=0.05, h=0.1):
        """Hollowed log vat bound with sinew."""
        cyl(x, y, z, r, h, self.m('wood'), seg=8, name='log_vat')
        for zz in (z + h * 0.22, z + h * 0.75):
            cyl(x, y, zz, r * 1.05, 0.015, self.m('trim'), seg=8, name='cord_hoop')

    def crate(self, x, y, z=0.0, s=0.08, rng=None):
        """Rough timber chest bound with leather."""
        b = box(x, y, z, s, s, s, self.m('wood_light'), 'chest', bevel=0.008)
        if rng:
            b.rotation_euler.z = rng.uniform(-0.35, 0.35)
        box(x, y, z, s * 1.02, s * 0.22, s * 1.02, self.m('trim'), 'strap')


STYLE = CavemanStyle()
