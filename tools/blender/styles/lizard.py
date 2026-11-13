# Lizardfolk: swamp raiders. Sun-baked adobe and mud-brick walls in ochre and terracotta,
# reed thatch roofs (thick, shaggy, drooping), stilts and boardwalks over wet ground,
# turquoise and jade tile accents, bone ornaments, totem poles, clay pots.
import math
import kit
from kit import box, poly, cyl, cone, sphere, mat
from style import Style


class LizardStyle(Style):
    name = 'lizard'
    P = {
        'wall': '#c99352', 'wall2': '#b85736', 'trim': '#4f351f',
        'wood': '#5c4328', 'wood_light': '#917147', 'wood_dark': '#382716',
        'stone': '#5a6452', 'stone_dark': '#3a4235', 'stone_light': '#86917c',
        'roof': '#8a7642', 'roof2': '#a38f55', 'roof3': '#63542f', 'roof_under': '#3d311c',
        'metal': '#755732', 'accent': '#289e95', 'accent2': '#c25832',
        'cloth': '#1b6e67', 'emblem': '#4de2cf', 'glow': '#ffaa2b', 'water': '#2d7875',
        'foliage': '#587a2d', 'foliage2': '#789c36', 'foliage_dark': '#354c1b', 'trunk': '#4c3a23',
        'crop': '#c79634', 'crop2': '#689436', 'dirt': '#3d2f21', 'smoke': '#d4d8ce',
    }

    def footing(self, x, y, sx, sy, h, rng):
        """Swamp mud-brick base with dark stilt pilings and boardwalk trim."""
        box(x, y, 0, sx, sy, h, self.m('stone_dark'), 'footing', bevel=0.008)
        # Boardwalk / stilt timber pilings driven into the wet ground
        pw = 0.035
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            cyl(px, py, 0, pw * 0.7, h + 0.015, self.m('wood_dark'), seg=8, name='piling')
        # Placed sun-baked mud blocks and terracotta bricks
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(3, int(span * 8))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                sz = rng.uniform(0.04, 0.065)
                z = rng.uniform(0.008, max(0.01, h - sz))
                c = self.pick(rng, 'wall2', 'stone', 'stone_dark')
                if face == 'x':
                    box(x + sx / 2 + 0.005, y + u * span, z, 0.016, span / n * 0.85, sz, c, 'footstone')
                else:
                    box(x + u * span, y + sy / 2 + 0.005, z, span / n * 0.85, 0.016, sz, c, 'footstone')

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        """Sun-baked adobe and mud-brick with terracotta bands, turquoise inlays and timber lintels."""
        if kind == 'stone':
            return self.stone_walls(x, y, z, sx, sy, h, rng)
        if kind == 'plank':
            return self.plank_walls(x, y, z, sx, sy, h, rng)

        # Core sun-baked ochre adobe wall
        box(x, y, z, sx, sy, h, self.m('wall'), 'wall')

        # Terracotta mud-brick base band
        band_h = min(0.09, h * 0.3)
        box(x, y, z, sx + 0.006, sy + 0.006, band_h, self.m('wall2'), 'terra_band')

        # Heavy swamp timber corner posts and upper eaves lintels
        t = 0.032
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, z, t * 1.15, t * 1.15, h, self.m('wood'), 'post')
        # Eaves beam
        box(x + sx / 2 + 0.004, y, z + h - t, t, sy + t, t, self.m('trim'), 'beam')
        box(x, y + sy / 2 + 0.004, z + h - t, sx + t, t, t, self.m('trim'), 'beam')

        # Staggered mud-brick relief blocks on visible faces
        rows = max(2, int(h / 0.09))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.4) * (h / rows)
                if zz > z + h - 0.05:
                    continue
                n = max(2, int(span / 0.12))
                for i in range(n):
                    if rng.random() < 0.4:
                        continue
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.5) / n
                    if abs(u) > 0.44:
                        continue
                    c = self.pick(rng, 'wall2', 'wall', 'dirt')
                    bw = span / n * 0.75
                    bh = min(0.045, h / rows * 0.6)
                    if face == 'x':
                        box(x + sx / 2 + 0.005, y + u * span, zz, 0.012, bw, bh, c, 'adobe_brick')
                    else:
                        box(x + u * span, y + sy / 2 + 0.005, zz, bw, 0.012, bh, c, 'adobe_brick')

        # Turquoise / jade decorative tile frieze inlay
        if h > 0.25 and max(sx, sy) > 0.3:
            frieze_z = z + h * 0.65
            for face in ('x', 'y'):
                span = sy if face == 'x' else sx
                n_tiles = max(2, int(span / 0.14))
                for k in range(n_tiles):
                    tu = -0.5 + (k + 0.5) / n_tiles
                    if abs(tu) > 0.42:
                        continue
                    tile_s = 0.03
                    if face == 'x':
                        t_ob = box(0, 0, -tile_s / 2, 0.008, tile_s, tile_s, self.m('accent'), 'jade_tile')
                        t_ob.location = (x + sx / 2 + 0.007, y + tu * span, frieze_z)
                        t_ob.rotation_euler.x = math.pi / 4
                    else:
                        t_ob = box(0, 0, -tile_s / 2, tile_s, 0.008, tile_s, self.m('accent'), 'jade_tile')
                        t_ob.location = (x + tu * span, y + sy / 2 + 0.007, frieze_z)
                        t_ob.rotation_euler.y = math.pi / 4

        # Clay pot / urn prop resting at corner (accent2)
        if rng.random() < 0.65 and max(sx, sy) > 0.35:
            pot_r = rng.uniform(0.035, 0.05)
            pot_h = pot_r * 2.0
            pot_x = x + sx / 2 + pot_r * 0.6
            pot_y = y - sy / 2 - pot_r * 0.6
            if abs(pot_x) < 0.46 and abs(pot_y) < 0.46:
                sphere(pot_x, pot_y, z + pot_h * 0.45, pot_r, self.m('accent2'), 'clay_pot', squash=1.2)
                cyl(pot_x, pot_y, z + pot_h * 0.8, pot_r * 0.55, 0.015, self.m('trim'), seg=8, name='pot_rim')

    def gable(self, x, y, z, sx, sy, h, rng, along='x', over=0.07, rows=5):
        """Thick, shaggy reed thatch roof with drooping fringe and bound bamboo ridge cross-spars."""
        if along == 'x':
            half, length = sy / 2 + over, sx + 2 * over
        else:
            half, length = sx / 2 + over, sy + 2 * over
        ang = math.atan2(h, half - over)
        L = math.hypot(half, h * half / (half - over))

        for side in (1, -1):
            d0 = 0.5 * half
            # Dark underlying reed/mud bed
            u = box(0, 0, -0.025, *((length, L * 1.03) if along == 'x' else (L * 1.03, length)), 0.035, self.m('roof_under'), 'thatchbed')
            if along == 'x':
                u.location = (x, y + side * d0, z + h * (1 - d0 / (half - over)))
                u.rotation_euler = (-side * ang, 0, 0)
            else:
                u.location = (x + side * d0, y, z + h * (1 - d0 / (half - over)))
                u.rotation_euler = (0, side * ang, 0)

            # Stepped thick thatch courses
            n_courses = max(3, rows)
            for i in range(n_courses):
                t = (i + 0.5) / n_courses
                d = (1 - t) * half
                zz = z + h * (1 - d / (half - over))
                n_bundles = int(length / 0.12) + 1
                course_w = L / n_courses * 1.35
                for k in range(n_bundles):
                    uu = -length / 2 + (k + 0.5) * length / n_bundles
                    c = self.pick(rng, 'roof', 'roof2', 'roof3')
                    b_len = length / n_bundles * 1.04
                    b = box(0, 0, -0.012, *((b_len, course_w) if along == 'x' else (course_w, b_len)), 0.032, c, 'thatch_tier')
                    sag = 0.015 * math.sin(math.pi * (uu + length / 2) / length)
                    if along == 'x':
                        b.location = (x + uu, y + side * d, zz - sag + 0.01)
                        b.rotation_euler = (-side * ang + rng.uniform(-0.04, 0.04), rng.uniform(-0.03, 0.03), rng.uniform(-0.03, 0.03))
                    else:
                        b.location = (x + side * d, y + uu, zz - sag + 0.01)
                        b.rotation_euler = (rng.uniform(-0.03, 0.03), side * ang + rng.uniform(-0.04, 0.04), rng.uniform(-0.03, 0.03))

            # Drooping shaggy thatch fringe along the visible eave (side == 1)
            if side == 1:
                n_fringe = max(4, int(length / 0.06))
                for k in range(n_fringe):
                    uu = -length / 2 + (k + 0.5 + rng.uniform(-0.2, 0.2)) * length / n_fringe
                    flen = rng.uniform(0.045, 0.08)
                    fth = rng.uniform(0.02, 0.032)
                    fc = self.pick(rng, 'roof', 'roof2', 'roof3')
                    f_ob = box(0, 0, -flen, *((fth, 0.025) if along == 'x' else (0.025, fth)), flen, fc, 'thatch_droop')
                    if along == 'x':
                        f_ob.location = (x + uu, y + half - 0.01, z + 0.01)
                        f_ob.rotation_euler = (rng.uniform(-0.15, 0.05), rng.uniform(-0.08, 0.08), rng.uniform(-0.1, 0.1))
                    else:
                        f_ob.location = (x + half - 0.01, y + uu, z + 0.01)
                        f_ob.rotation_euler = (rng.uniform(-0.08, 0.08), rng.uniform(-0.05, 0.15), rng.uniform(-0.1, 0.1))

                self.roof_dressing(x, y, z, h, half, over, length, along, rng)

        # Ridge pole & cross-spars
        rw = 0.07
        if along == 'x':
            box(x, y, z + h + 0.01, length, rw, 0.05, self.m('roof2'), 'thatch_ridge')
            n_spars = max(2, int(length / 0.18))
            for s_idx in range(n_spars):
                su = -length / 2 + (s_idx + 0.5) * length / n_spars
                for ang_sign in (-1, 1):
                    spar = box(0, 0, -0.06, 0.02, 0.02, 0.13, self.m('wood_light'), 'ridge_spar')
                    spar.location = (x + su, y, z + h + 0.03)
                    spar.rotation_euler = (ang_sign * 0.55, 0, 0)
            for gx in (x + sx / 2, x - sx / 2):
                poly([(gx, y - sy / 2, z), (gx, y + sy / 2, z), (gx, y, z + h * 0.96)], [(0, 1, 2)], self.m('wall'), 'gableend')
                box(gx, y, z, 0.015, sy, 0.04, self.m('wall2'), 'gable_trim')
        else:
            box(x, y, z + h + 0.01, rw, length, 0.05, self.m('roof2'), 'thatch_ridge')
            n_spars = max(2, int(length / 0.18))
            for s_idx in range(n_spars):
                su = -length / 2 + (s_idx + 0.5) * length / n_spars
                for ang_sign in (-1, 1):
                    spar = box(0, 0, -0.06, 0.02, 0.02, 0.13, self.m('wood_light'), 'ridge_spar')
                    spar.location = (x, y + su, z + h + 0.03)
                    spar.rotation_euler = (0, ang_sign * 0.55, 0)
            for gy in (y + sy / 2, y - sy / 2):
                poly([(x - sx / 2, gy, z), (x + sx / 2, gy, z), (x, gy, z + h * 0.96)], [(0, 1, 2)], self.m('wall'), 'gableend')
                box(x, gy, z, sx, 0.015, 0.04, self.m('wall2'), 'gable_trim')

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        """Swamp moss clumps and dried reed tufts on thatch."""
        for _ in range(max(2, int(length * 5))):
            t = rng.uniform(0.2, 0.8)
            d = (1 - t) * half
            uu = rng.uniform(-length / 2 + 0.04, length / 2 - 0.04)
            zz = z + h * (1 - d / (half - over)) + 0.025
            pos = (x + uu, y + d, zz) if along == 'x' else (x + d, y + uu, zz)
            sphere(*pos, rng.uniform(0.025, 0.042), self.m(rng.choice(['roof3', 'foliage_dark', 'crop'])), 'thatch_tuft', squash=0.45)

    def roof(self, x, y, z, sx, sy, h, rng, shape='gable', along='x', over=0.07):
        """Handle gable, hip, cone, flat and dome with thatched/adobe vernacular."""
        if shape == 'gable':
            return self.gable(x, y, z, sx, sy, h, rng, along=along, over=over)
        if shape == 'hip':
            o = kit.hip(x, y, z, sx, sy, h, self.m('roof_under'), overhang=over)
            n = 4 if h > 0.12 else 3
            for i in range(n):
                f = i / n
                lip = 0.022 * (1 - f)
                kit.hip(x, y, z + h * f + 0.005, (sx + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        (sy + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        h * (1 - f), self.pick(rng, 'roof', 'roof2', 'roof3'), overhang=over)
            sphere(x, y, z + h + 0.015, 0.038, self.m('roof2'), 'thatch_finial', squash=0.9)
            for fx in (-1, 1):
                if fx == 1:
                    for k in range(int(sy / 0.08)):
                        yu = y - sy / 2 + (k + 0.5) * sy / max(1, int(sy / 0.08))
                        box(x + sx / 2 + over, yu, z, 0.015, 0.03, rng.uniform(0.03, 0.06), self.m('roof'), 'hip_droop')
            for fy in (-1, 1):
                if fy == 1:
                    for k in range(int(sx / 0.08)):
                        xu = x - sx / 2 + (k + 0.5) * sx / max(1, int(sx / 0.08))
                        box(xu, y + sy / 2 + over, z, 0.03, 0.015, rng.uniform(0.03, 0.06), self.m('roof'), 'hip_droop')
            return o
        if shape in ('cone', 'spire'):
            r = max(sx, sy) / 2 + over
            c_base = cone(x, y, z, r, h, self.m('roof_under'), seg=12, name='thatch_cone_base')
            n_rings = 4 if h > 0.18 else 3
            for i in range(n_rings):
                f = i / n_rings
                cr = r * (1 - f * 0.9)
                cone(x, y, z + h * f * 0.85, cr, h * (1 - f) * 0.9 + 0.02, self.pick(rng, 'roof', 'roof2', 'roof3'), seg=10, name='thatch_tier')
            sphere(x, y, z + h + 0.01, 0.035, self.m('accent2'), 'pot_finial', squash=1.1)
            return c_base
        if shape == 'flat':
            box(x, y, z, sx + over, sy + over, 0.04, self.m('wall'), 'flatroof')
            for (px, py) in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                box(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.04,
                    (sx + over) if py else 0.035, (sy + over) if px else 0.035, 0.06, self.m('wall2'), 'parapet')
            sphere(x + (sx + over) * 0.45, y + (sy + over) * 0.45, z + 0.11, 0.032, self.m('accent2'), 'terrace_pot')
            return
        if shape == 'dome':
            d = sphere(x, y, z, max(sx, sy) / 2, self.m('wall2'), 'adobedome', squash=h / (max(sx, sy) / 2))
            for p in d.data.polygons:
                p.use_smooth = True
            sphere(x, y, z + h * 0.95, 0.035, self.m('accent'), 'dome_crown')
            return d

    # ------------------------------------------------------------ openings & emblem
    def emblem(self, face, x, y, z, s):
        """Coiled serpent / reptilian slitted eye emblem."""
        sphere(x, y, z, s * 0.52, self.m('accent'), 'serpent_disc', squash=0.35 if face == 'z' else 0.85)
        if face == 'x':
            sphere(x + 0.008, y, z, s * 0.38, self.m('glow'), 'reptile_eye', squash=0.6)
            box(x + 0.012, y, z, 0.008, s * 0.08, s * 0.5, mat('#141d18'), 'noink_pupil')
            cyl(x + 0.006, y, z + s * 0.28, s * 0.22, 0.012, self.m('emblem'), seg=8, name='crest')
        else:
            sphere(x, y + 0.008, z, s * 0.38, self.m('glow'), 'reptile_eye', squash=0.6)
            box(x, y + 0.012, z, s * 0.08, 0.008, s * 0.5, mat('#141d18'), 'noink_pupil')
            cyl(x, y + 0.006, z + s * 0.28, s * 0.22, 0.012, self.m('emblem'), seg=8, name='crest')

    def banner(self, face, x, y, z, w=0.1, h=0.2):
        """Teal/jade banner with serpent emblem and bone bead tassels."""
        cloth = self.m('cloth')
        if face == 'x':
            box(x + 0.02, y, z + h, 0.02, w + 0.04, 0.02, self.m('wood'), 'pole')
            b = box(0, 0, -h, 0.012, w, h, cloth, 'banner')
            b.location = (x + 0.02, y, z + h)
            self.emblem('x', x + 0.03, y, z + h * 0.58, w * 0.52)
            for by in (-w * 0.35, w * 0.35):
                sphere(x + 0.02, y + by, z - 0.015, 0.016, self.m('stone_light'), 'bone_bead')
        else:
            box(x, y + 0.02, z + h, w + 0.04, 0.02, 0.02, self.m('wood'), 'pole')
            b = box(0, 0, -h, w, 0.012, h, cloth, 'banner')
            b.location = (x, y + 0.02, z + h)
            self.emblem('y', x, y + 0.03, z + h * 0.58, w * 0.52)
            for bx in (-w * 0.35, w * 0.35):
                sphere(x + bx, y + 0.02, z - 0.015, 0.016, self.m('stone_light'), 'bone_bead')
        kit.anim(lambda f, n: setattr(b, 'rotation_euler', ((0.05 * math.sin(2 * math.pi * f / n), 0, 0) if face == 'x' else (0, 0.05 * math.sin(2 * math.pi * f / n), 0))))

    def window(self, face, x, y, z, w=0.11, h=0.13, lit=True):
        """Terracotta arched adobe opening with dark slatted grille and warm amber glow."""
        pane = self.m('glow', emit=2.8) if lit else self.m('stone_dark')
        if face == 'x':
            box(x + 0.01, y, z - 0.015, 0.022, w + 0.04, h + 0.03, self.m('wall2'), 'wframe')
            box(x + 0.022, y, z, 0.012, w, h, pane, 'noink_pane')
            box(x + 0.028, y - w * 0.22, z, 0.01, 0.012, h, self.m('trim'), 'bar')
            box(x + 0.028, y + w * 0.22, z, 0.01, 0.012, h, self.m('trim'), 'bar')
            box(x + 0.018, y, z - 0.02, 0.016, w + 0.02, 0.015, self.m('accent'), 'sill')
        else:
            box(x, y + 0.01, z - 0.015, w + 0.04, 0.022, h + 0.03, self.m('wall2'), 'wframe')
            box(x, y + 0.022, z, w, 0.012, h, pane, 'noink_pane')
            box(x - w * 0.22, y + 0.028, z, 0.012, 0.01, h, self.m('trim'), 'bar')
            box(x + w * 0.22, y + 0.028, z, 0.012, 0.01, h, self.m('trim'), 'bar')
            box(x, y + 0.018, z - 0.02, w + 0.02, 0.016, 0.015, self.m('accent'), 'sill')

    def door(self, face, x, y, z, w=0.16, h=0.26):
        """Heavy adobe terracotta arch with dark timber plank door and beaten bronze boss."""
        if face == 'x':
            box(x + 0.008, y, z, 0.03, w + 0.06, h + 0.04, self.m('wall2'), 'darch')
            box(x + 0.022, y, z, 0.02, w, h, self.m('wood_dark'), 'door')
            for dz in (z + h * 0.25, z + h * 0.75):
                box(x + 0.032, y, dz, 0.01, w * 0.9, 0.02, self.m('metal'), 'dstrap')
            sphere(x + 0.042, y + w * 0.25, z + h * 0.48, 0.018, self.m('metal'), 'boss')
        else:
            box(x, y + 0.008, z, w + 0.06, 0.03, h + 0.04, self.m('wall2'), 'darch')
            box(x, y + 0.022, z, w, 0.02, h, self.m('wood_dark'), 'door')
            for dz in (z + h * 0.25, z + h * 0.75):
                box(x, y + 0.032, dz, w * 0.9, 0.01, 0.02, self.m('metal'), 'dstrap')
            sphere(x + w * 0.25, y + 0.042, z + h * 0.48, 0.018, self.m('metal'), 'boss')

    def chimney(self, x, y, z, h, rng, smoke=True):
        """Sun-baked terracotta clay chimney pot with flue cap."""
        c = cone(x, y, z, 0.075, h, self.m('wall2'), seg=8, r_top=0.055, name='clay_chimney')
        c.rotation_euler = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04), 0)
        cyl(x, y, z + h, 0.08, 0.025, self.m('wall'), seg=8, name='chimcap')
        if smoke:
            self.smoke(x, y, z + h + 0.04)

    def lamp(self, x, y, z=0.0):
        """Swamp totem stake with hanging amber oil urn lantern."""
        cyl(x, y, z, 0.02, 0.24, self.m('wood_dark'), seg=6, name='totem_post')
        cyl(x, y, z + 0.14, 0.024, 0.03, self.m('accent'), seg=6, name='totem_band')
        box(x + 0.025, y, z + 0.22, 0.05, 0.015, 0.015, self.m('wood'), 'hook')
        sphere(x + 0.05, y, z + 0.16, 0.032, self.m('glow', emit=4.5), 'noink_lamp', squash=1.1)
        cone(x + 0.05, y, z + 0.19, 0.025, 0.02, self.m('accent2'), seg=6, name='lamp_cap')

    # ------------------------------------------------------------ foliage
    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        """Swamp mangrove with arching aerial stilt roots, broad canopy and hanging vines."""
        n_roots = 6
        for k in range(n_roots):
            ang = k * (2 * math.pi / n_roots) + (rng.uniform(-0.12, 0.12) if rng else 0.0)
            r_out = 0.09 * s
            rx, ry = math.cos(ang) * r_out, math.sin(ang) * r_out
            r1 = box(0, 0, 0, 0.016 * s, 0.016 * s, 0.075 * s, self.m('trunk'), 'mangrove_root')
            r1.location = (x + rx, y + ry, z)
            r1.rotation_euler = (-math.sin(ang) * 0.45, math.cos(ang) * 0.45, 0)
            r2 = box(0, 0, 0, 0.022 * s, 0.022 * s, 0.065 * s, self.m('trunk'), 'mangrove_root')
            r2.location = (x + rx * 0.52, y + ry * 0.52, z + 0.045 * s)
            r2.rotation_euler = (-math.sin(ang) * 0.25, math.cos(ang) * 0.25, 0)

        cyl(x, y, z + 0.05 * s, 0.04 * s, 0.22 * s, self.m('trunk'), seg=8, name='trunk')
        canopy = [
            (0.0, 0.0, 0.28, 0.16, 'foliage', 0.65),
            (0.08, -0.05, 0.25, 0.12, 'foliage2', 0.6),
            (-0.07, 0.06, 0.26, 0.12, 'foliage_dark', 0.6),
            (0.04, 0.07, 0.24, 0.10, 'foliage', 0.55),
            (-0.06, -0.06, 0.23, 0.11, 'foliage2', 0.55),
        ]
        for dx, dy, dz, cr, mat_key, sq in canopy:
            sphere(x + dx * s, y + dy * s, z + dz * s, cr * s, self.m(mat_key), 'mangrove_leaves', squash=sq)

        for vx, vy, vlen in ((0.06, -0.07, 0.08), (-0.07, 0.05, 0.09), (0.08, 0.06, 0.07), (-0.05, -0.06, 0.075)):
            cyl(x + vx * s, y + vy * s, z + (0.22 - vlen) * s, 0.007 * s, vlen * s, self.m('foliage_dark'), seg=6, name='vine')


STYLE = LizardStyle()
