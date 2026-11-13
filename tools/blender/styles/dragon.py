# Dragonkin: volcanic lords with endless ore and NOT A SINGLE FOREST: no wood anywhere.
# Black obsidian and dark basalt walls, red-hot seams and lava channels that glow (emissive orange),
# gold and brass ornaments, horned and spiked roofs (curved spikes, dragon horns on ridges),
# braziers with fire, chains, crimson cloth.
# Wood mapped to dark iron/basalt/bronze; plank walls read as riveted iron plates; fences as iron spikes.
# Banners: crimson with gold dragon claw emblem.
# Trees: obsidian crystal spires or charred stumps, never green.
import math
import kit
from kit import box, poly, cyl, cone, sphere, mat
from style import Style

TAU = 2 * math.pi


# Dragonkin: volcanic lords with endless ore and NOT A SINGLE FOREST: no wood anywhere.
# Black obsidian and dark basalt walls, red-hot seams and lava channels that glow (emissive orange),
# gold and brass ornaments, horned and spiked roofs (curved spikes, dragon horns on ridges),
# braziers with fire, chains, crimson cloth.
# Wood mapped to dark iron/basalt/bronze; plank walls read as riveted iron plates; fences as iron spikes.
# Banners: crimson with gold dragon claw emblem.
# Trees: obsidian crystal spires or charred stumps, never green.
import math
import kit
from kit import box, poly, cyl, cone, sphere, mat
from style import Style

TAU = 2 * math.pi


def _dragon_horn(x, y, z, h=0.18, curve_x=0.04, curve_y=0.0, base_r=0.025, m=None, seg=6):
    """A sharp curved draconic horn made of two connected tapered segments."""
    m_horn = m
    # Base segment tilting slightly
    h1 = h * 0.5
    b1 = cone(0, 0, 0, base_r, h1, m_horn, seg=seg, r_top=base_r * 0.65, name='horn_base')
    ang_x = math.atan2(curve_x * 0.5, h1)
    ang_y = math.atan2(curve_y * 0.5, h1)
    b1.location = (x, y, z)
    b1.rotation_euler = (-ang_y, ang_x, 0)

    # Sharp tip segment curving further
    h2 = h * 0.55
    b2 = cone(0, 0, 0, base_r * 0.65, h2, m_horn, seg=seg, r_top=0.0, name='horn_tip')
    tip_ang_x = math.atan2(curve_x, h1)
    tip_ang_y = math.atan2(curve_y, h1)
    b2.location = (x + curve_x * 0.45, y + curve_y * 0.45, z + h1 * 0.95)
    b2.rotation_euler = (-tip_ang_y * 1.5, tip_ang_x * 1.5, 0)
    return b1, b2


class DragonStyle(Style):
    name = 'dragon'
    P = {
        'wall': '#26202b',          # deep obsidian / ash basalt
        'wall2': '#3d2024',         # blood basalt / dark crimson volcanic rock
        'trim': '#18141d',          # dark iron / black obsidian trim
        'wood': '#2b2930',          # dark cast iron (replaces wood)
        'wood_light': '#5e4e3c',    # burnished bronze / brass-iron (replaces wood_light)
        'wood_dark': '#151319',     # blackened wrought iron (replaces wood_dark)
        'stone': '#36303c',         # volcanic basalt stone
        'stone_dark': '#1b1720',    # midnight obsidian
        'stone_light': '#554c5c',   # ash stone / lustrous obsidian facet
        'roof': '#1d1722',          # black obsidian tiles
        'roof2': '#381c1c',         # charred volcanic slate / dark bloodstone
        'roof3': '#5c2222',         # deep crimson iron / fire-baked tile
        'roof_under': '#110e14',    # deep obsidian shadow
        'metal': '#2c2930',         # wrought iron / dark steel
        'accent': '#ffc107',        # bright hoard gold
        'accent2': '#b26a00',       # burnished brass / bronze
        'cloth': '#8b1818',         # rich dragon crimson
        'emblem': '#ffe066',        # radiant dragon gold
        'glow': '#ff6d00',          # molten lava / dragonfire orange (emissive)
        'water': '#e64a19',         # bubbling magma / molten lava channel
        'foliage': '#28202b',       # obsidian crystal / dark ash shard
        'foliage2': '#3d242c',      # charred ember rock / dark sulfur
        'foliage_dark': '#17121b',  # black volcanic glass / deep basalt
        'trunk': '#1c1820',         # charred petrified stump / cast iron spire
        'crop': '#ff8f00',          # emberstone crystals / fiery sulfur blooms
        'crop2': '#d84315',         # molten ore veins / blood crystals
        'dirt': '#211b24',          # volcanic ash / black cinder bed
        'smoke': '#3e3840',         # volcanic ash plume / dark soot
    }

    # ------------------------------------------------------------ structure
    def footing(self, x, y, sx, sy, h, rng):
        """Heavy volcanic basalt and midnight obsidian base course."""
        box(x, y, 0, sx, sy, h, self.m('stone_dark'), 'footing', bevel=0.012)
        # Basalt ashlar blocks and glowing lava seams along the footing perimeter
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(3, int(span * 8))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                sz = rng.uniform(0.045, 0.075)
                z = rng.uniform(0.01, max(0.012, h - sz))
                c = self.pick(rng, 'stone_dark', 'stone', 'wall2')
                bw = span / n * 0.85
                if face == 'x':
                    box(x + sx / 2 + 0.006, y + u * span, z, 0.02, bw, sz, c, 'basalt_block')
                    # Occasional glowing magma fissure peeking through foundation cracks
                    if rng.random() < 0.25:
                        box(x + sx / 2 + 0.008, y + u * span, z + sz * 0.4, 0.012, bw * 0.6, 0.012, self.m('glow', emit=4.0), 'noink_heat_seam')
                else:
                    box(x + u * span, y + sy / 2 + 0.006, z, bw, 0.02, sz, c, 'basalt_block')
                    if rng.random() < 0.25:
                        box(x + u * span, y + sy / 2 + 0.008, z + sz * 0.4, bw * 0.6, 0.012, 0.012, self.m('glow', emit=4.0), 'noink_heat_seam')
        # Heavy wrought iron corner cramps with brass rivets
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, 0, 0.04, 0.04, h * 0.95, self.m('trim'), 'iron_corner_bracket')
            sphere(px, py, h * 0.82, 0.012, self.m('accent2'), 'brass_cramp_rivet')

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        """Black obsidian & dark basalt masonry, iron pilasters, glowing lava seams."""
        if kind == 'stone':
            return self.stone_walls(x, y, z, sx, sy, h, rng)
        if kind == 'plank':
            return self.plank_walls(x, y, z, sx, sy, h, rng)

        # Base obsidian / dark basalt wall
        box(x, y, z, sx, sy, h, self.m('wall'), 'obsidian_wall')
        t = 0.035
        # Heavy wrought iron corner pilasters with burnished brass collars & rivets
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, z, t * 1.25, t * 1.25, h, self.m('trim'), 'corner_iron')
            box(px, py, z + h - t, t * 1.35, t * 1.35, t * 0.8, self.m('accent2'), 'brass_collar')
            sphere(px, py, z + h * 0.5, 0.012, self.m('accent'), 'gold_boss')
        # Top iron cornice beam
        box(x + sx / 2 + 0.005, y, z + h - t, t, sy + t, t, self.m('trim'), 'iron_cornice')
        box(x, y + sy / 2 + 0.005, z + h - t, sx + t, t, t, self.m('trim'), 'iron_cornice')

        # Basalt block relief with glowing red-hot seams on visible faces
        rows = max(2, int(h / 0.10))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.45) * (h / rows)
                if zz > z + h - 0.06:
                    continue
                n = max(2, int(span / 0.12))
                for i in range(n):
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.5) / n
                    if abs(u) > 0.44:
                        continue
                    c = self.pick(rng, 'wall2', 'stone_dark', 'stone')
                    bw = span / n * 0.82
                    bh = 0.055
                    if face == 'x':
                        box(x + sx / 2 + 0.005, y + u * span, zz - bh / 2, 0.012, bw, bh, c, 'basalt_ashlar')
                        # Glowing red-hot magma fissure between blocks
                        if rng.random() < 0.35:
                            box(x + sx / 2 + 0.007, y + u * span, zz - bh / 2, 0.01, bw * 0.8, 0.008, self.m('glow', emit=3.5), 'noink_lava_seam')
                    else:
                        box(x + u * span, y + sy / 2 + 0.005, zz - bh / 2, bw, 0.012, bh, c, 'basalt_ashlar')
                        if rng.random() < 0.35:
                            box(x + u * span, y + sy / 2 + 0.007, zz - bh / 2, bw * 0.8, 0.01, 0.008, self.m('glow', emit=3.5), 'noink_lava_seam')

    def stone_walls(self, x, y, z, sx, sy, h, rng):
        """Massive volcanic basalt masonry with red-hot seams."""
        box(x, y, z, sx, sy, h, self.m('stone_dark'), 'swall', bevel=0.008)
        rows = max(2, int(h / 0.075))
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            for r in range(rows):
                zz = z + (r + 0.5) * h / rows
                n = max(2, int(span / 0.11))
                for i in range(n):
                    u = -0.5 + (i + 0.5 + (r % 2) * 0.5) / n
                    if abs(u) > 0.46:
                        continue
                    c = self.pick(rng, 'stone', 'wall2', 'stone_light')
                    bw = span / n * 0.84
                    bh = 0.05
                    if face == 'x':
                        box(x + sx / 2 + 0.005, y + u * span, zz - 0.025, 0.014, bw, bh, c, 'basalt_ashlar')
                        if (i + r) % 3 == 0:
                            box(x + sx / 2 + 0.007, y + u * span, zz - 0.025, 0.01, bw * 0.85, 0.008, self.m('glow', emit=4.0), 'noink_heat_seam')
                    else:
                        box(x + u * span, y + sy / 2 + 0.005, zz - 0.025, bw, 0.014, bh, c, 'basalt_ashlar')
                        if (i + r) % 3 == 0:
                            box(x + u * span, y + sy / 2 + 0.007, zz - 0.025, bw * 0.85, 0.01, 0.008, self.m('glow', emit=4.0), 'noink_heat_seam')

    def plank_walls(self, x, y, z, sx, sy, h, rng):
        """Riveted heavy iron armor plates replacing wood planks."""
        box(x, y, z, sx, sy, h, self.m('wood_dark'), 'iron_plate_wall')
        for face in ('x', 'y'):
            span = sy if face == 'x' else sx
            n = max(3, int(span * 8))
            for i in range(n):
                u = -0.5 + (i + 0.5) / n
                c = self.pick(rng, 'metal', 'wood', 'wood_light')
                pw = span / n * 0.90
                if face == 'x':
                    box(x + sx / 2 + 0.004, y + u * span, z, 0.012, pw, h, c, 'iron_plate')
                    for fz in (0.18, 0.5, 0.82):
                        sphere(x + sx / 2 + 0.012, y + u * span, z + h * fz, 0.008, self.m('accent2'), 'rivet')
                else:
                    box(x + u * span, y + sy / 2 + 0.004, z, pw, 0.012, h, c, 'iron_plate')
                    for fz in (0.18, 0.5, 0.82):
                        sphere(x + u * span, y + sy / 2 + 0.012, z + h * fz, 0.008, self.m('accent2'), 'rivet')
        # Horizontal iron reinforcing strapping band with brass studs
        for hf in (0.22, 0.78):
            bz = z + h * hf
            box(x + sx / 2 + 0.007, y, bz, 0.014, sy + 0.01, 0.025, self.m('trim'), 'iron_strap')
            box(x, y + sy / 2 + 0.007, bz, sx + 0.01, 0.014, 0.025, self.m('trim'), 'iron_strap')
            for face in ('x', 'y'):
                span = sy if face == 'x' else sx
                for k in (-0.35, 0.0, 0.35):
                    if face == 'x':
                        sphere(x + sx / 2 + 0.015, y + k * span, bz + 0.012, 0.009, self.m('accent'), 'strap_rivet')
                    else:
                        sphere(x + k * span, y + sy / 2 + 0.015, bz + 0.012, 0.009, self.m('accent'), 'strap_rivet')

    # ------------------------------------------------------------ roof
    def roof(self, x, y, z, sx, sy, h, rng, shape='gable', along='x', over=0.07):
        """Horned and spiked draconic roofs."""
        if shape == 'gable':
            return self.gable(x, y, z, sx, sy, h, rng, along=along, over=over)
        if shape == 'hip':
            o = kit.hip(x, y, z, sx, sy, h, self.m('roof_under'), overhang=over)
            n = 4 if h > 0.12 else 3
            for i in range(n):
                f = i / n
                lip = 0.018 * (1 - f)
                kit.hip(x, y, z + h * f + 0.004, (sx + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        (sy + 2 * over) * (1 - f) + 2 * lip - 2 * over,
                        h * (1 - f), self.pick(rng, 'roof', 'roof2', 'roof3') if i else self.m('roof'), overhang=over)
            # Spiked draconic finial & crest at summit
            sphere(x, y, z + h, 0.035, self.m('accent2'), 'roof_boss', squash=0.8)
            cone(x, y, z + h + 0.025, 0.028, 0.10, self.m('accent'), seg=4, name='summit_spike')
            # Curved corner horns on the hip eave corners
            for cx, cy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
                hx = x + cx * (sx / 2 + over * 0.8)
                hy = y + cy * (sy / 2 + over * 0.8)
                _dragon_horn(hx, hy, z + 0.01, h=0.12, curve_x=cx * 0.04, curve_y=cy * 0.04, base_r=0.02, m=self.m('accent2'))
            return o
        if shape in ('cone', 'spire'):
            r = max(sx, sy) / 2 + over
            c = cone(x, y, z, r, h, self.m('roof'), seg=8 if shape == 'cone' else 6, name='roofcone')
            # Sharp crowning spike with glowing dragon-eye orb
            sphere(x, y, z + h, 0.028, self.m('glow', emit=4.0), 'noink_spire_orb')
            cone(x, y, z + h + 0.02, 0.022, 0.12, self.m('accent'), seg=4, name='spire_needle')
            # Radiating curved horn spikes at the spire base
            num_spikes = 4
            for si in range(num_spikes):
                ang = si * TAU / num_spikes + 0.2
                spx = x + math.cos(ang) * (r * 0.95)
                spy = y + math.sin(ang) * (r * 0.95)
                _dragon_horn(spx, spy, z + 0.02, h=0.14, curve_x=math.cos(ang) * 0.05, curve_y=math.sin(ang) * 0.05, base_r=0.022, m=self.m('accent2'))
            return c
        if shape == 'flat':
            # Flat basalt roof with spiked iron parapet & corner braziers
            box(x, y, z, sx + over, sy + over, 0.04, self.m('roof'), 'flatroof')
            for (px, py) in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                box(x + px * (sx + over) / 2, y + py * (sy + over) / 2, z + 0.04,
                    (sx + over) if py else 0.035, (sy + over) if px else 0.035, 0.055, self.m('trim'), 'parapet')
                # Iron spikes along the parapet
                span = (sx + over) if py else (sy + over)
                for si in (-0.35, 0.0, 0.35):
                    sp_pos = (x + px * (sx + over) / 2 + (si * span if py else 0),
                              y + py * (sy + over) / 2 + (si * span if px else 0),
                              z + 0.095)
                    cone(sp_pos[0], sp_pos[1], sp_pos[2], 0.016, 0.06, self.m('metal'), seg=4, name='parapet_spike')
            # Corner braziers with flickering flame
            for cx, cy in ((1, 1), (-1, 1), (1, -1)):
                bx = x + cx * (sx + over) / 2
                by = y + cy * (sy + over) / 2
                cyl(bx, by, z + 0.04, 0.032, 0.06, self.m('trim'), seg=6, name='c_brazier')
                self.fire(bx, by, z + 0.10, s=0.7)
            return
        if shape == 'dome':
            d = sphere(x, y, z, max(sx, sy) / 2, self.m('roof'), 'dome', squash=h / (max(sx, sy) / 2))
            for p in d.data.polygons:
                p.use_smooth = True
            # Crown of spikes around the dome apex
            sphere(x, y, z + h, 0.035, self.m('accent'), 'dome_crown_boss')
            cone(x, y, z + h + 0.03, 0.024, 0.12, self.m('accent'), seg=4, name='dome_apex_spike')
            return d

    def gable(self, x, y, z, sx, sy, h, rng, along='x', over=0.07, rows=9):
        """Obsidian shingle gable with curved dragon horns and jagged spine on the ridge."""
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
                    lift = 0.012 * (rows - i) / rows
                    if along == 'x':
                        b.location = (x + uu, y + side * d, zz + lift)
                        b.rotation_euler = (-side * ang + rng.uniform(-0.04, 0.04), rng.uniform(-0.03, 0.03), rng.uniform(-0.03, 0.03))
                    else:
                        b.location = (x + side * d, y + uu, zz + lift)
                        b.rotation_euler = (rng.uniform(-0.03, 0.03), side * ang + rng.uniform(-0.04, 0.04), rng.uniform(-0.03, 0.03))
            if side == 1:
                self.roof_dressing(x, y, z, h, half, over, length, along, rng)

        # Ridge beam with jagged dragon dorsal spines
        if along == 'x':
            box(x, y, z + h - 0.01, length, 0.06, 0.05, self.m('trim'), 'ridge')
            for gx in (x + sx / 2, x - sx / 2):
                poly([(gx, y - sy / 2, z), (gx, y + sy / 2, z), (gx, y, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
            # Curved dragon horns at ridge ends
            for dir_x, ex in ((1, x + length / 2 - 0.02), (-1, x - length / 2 + 0.02)):
                _dragon_horn(ex, y, z + h + 0.03, h=0.18, curve_x=dir_x * 0.06, curve_y=0.0, base_r=0.028, m=self.m('accent2'))
            # Jagged dorsal spines along the ridge
            n_spines = max(3, int(length / 0.12))
            for si in range(1, n_spines - 1):
                su = -length / 2 + (si + 0.5) * length / n_spines
                cone(x + su, y, z + h + 0.035, 0.018, 0.07, self.m('accent2'), seg=4, name='ridge_spine')
        else:
            box(x, y, z + h - 0.01, 0.06, length, 0.05, self.m('trim'), 'ridge')
            for gy in (y + sy / 2, y - sy / 2):
                poly([(x - sx / 2, gy, z), (x + sx / 2, gy, z), (x, gy, z + h * 0.97)], [(0, 1, 2)], self.m('wall'), 'gableend')
            for dir_y, ey in ((1, y + length / 2 - 0.02), (-1, y - length / 2 + 0.02)):
                _dragon_horn(x, ey, z + h + 0.03, h=0.18, curve_x=0.0, curve_y=dir_y * 0.06, base_r=0.028, m=self.m('accent2'))
            n_spines = max(3, int(length / 0.12))
            for si in range(1, n_spines - 1):
                su = -length / 2 + (si + 0.5) * length / n_spines
                cone(x, y + su, z + h + 0.035, 0.018, 0.07, self.m('accent2'), seg=4, name='ridge_spine')

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        """Obsidian crystal shards and glowing ember veins on the roof slope."""
        for _ in range(max(2, int(length * 5))):
            t = rng.uniform(0.2, 0.8)
            d = (1 - t) * half
            uu = rng.uniform(-length / 2 + 0.05, length / 2 - 0.05)
            zz = z + h * (1 - d / (half - over)) + 0.02
            pos = (x + uu, y + d, zz) if along == 'x' else (x + d, y + uu, zz)
            cone(pos[0], pos[1], pos[2], rng.uniform(0.016, 0.026), rng.uniform(0.04, 0.08), self.m('trim'), seg=4, name='roof_shard')
            # Glowing ember glint
            if rng.random() < 0.4:
                sphere(pos[0], pos[1], pos[2] + 0.01, 0.012, self.m('glow', emit=4.0), 'noink_roof_ember')

    # ------------------------------------------------------------ openings
    def window(self, face, x, y, z, w=0.11, h=0.13, lit=True):
        pane = self.m('glow', emit=4.5) if lit else self.m('stone_dark')
        if face == 'x':
            # Dark basalt frame with pointed peak
            box(x + 0.012, y, z - 0.015, 0.02, w + 0.04, h + 0.03, self.m('trim'), 'wframe')
            box(x + 0.024, y, z, 0.01, w, h, pane, 'noink_pane')
            # Iron grate bars & brass rivets
            box(x + 0.03, y, z + h / 2 - 0.006, 0.012, w, 0.012, self.m('metal'), 'mullion')
            box(x + 0.03, y, z + h * 0.25, 0.012, w * 0.9, 0.008, self.m('metal'), 'iron_grate')
            box(x + 0.03, y, z + h * 0.75, 0.012, w * 0.9, 0.008, self.m('metal'), 'iron_grate')
            cone(x + 0.025, y, z + h + 0.015, 0.014, 0.045, self.m('accent2'), seg=4, name='w_peak')
        else:
            box(x, y + 0.012, z - 0.015, w + 0.04, 0.02, h + 0.03, self.m('trim'), 'wframe')
            box(x, y + 0.024, z, w, 0.01, h, pane, 'noink_pane')
            box(x, y + 0.03, z + h / 2 - 0.006, w, 0.012, 0.012, self.m('metal'), 'mullion')
            box(x, y + 0.03, z + h * 0.25, w * 0.9, 0.012, 0.008, self.m('metal'), 'iron_grate')
            box(x, y + 0.03, z + h * 0.75, w * 0.9, 0.012, 0.008, self.m('metal'), 'iron_grate')
            cone(x, y + 0.025, z + h + 0.015, 0.014, 0.045, self.m('accent2'), seg=4, name='w_peak')

    def door(self, face, x, y, z, w=0.16, h=0.26):
        if face == 'x':
            # Heavy dark basalt arch frame with pointed top
            box(x + 0.01, y, z, 0.03, w + 0.05, h + 0.04, self.m('trim'), 'dframe')
            # Iron-plated vault door
            box(x + 0.022, y, z, 0.02, w, h, self.m('metal'), 'door')
            # Horizontal iron reinforcing straps & brass studs
            for dy in (-w * 0.35, 0, w * 0.35):
                for fz in (0.2, 0.5, 0.8):
                    sphere(x + 0.034, y + dy, z + h * fz, 0.008, self.m('accent'), 'door_rivet')
            # Draconic brass ring pull knocker
            sphere(x + 0.036, y + w * 0.25, z + h * 0.45, 0.016, self.m('accent'), 'ring_mount')
            cyl(x + 0.042, y + w * 0.25, z + h * 0.42, 0.018, 0.008, self.m('accent2'), seg=8, name='ring_pull')
        else:
            box(x, y + 0.01, z, w + 0.05, 0.03, h + 0.04, self.m('trim'), 'dframe')
            box(x, y + 0.022, z, w, 0.02, h, self.m('metal'), 'door')
            for dx in (-w * 0.35, 0, w * 0.35):
                for fz in (0.2, 0.5, 0.8):
                    sphere(x + dx, y + 0.034, z + h * fz, 0.008, self.m('accent'), 'door_rivet')
            sphere(x + w * 0.25, y + 0.036, z + h * 0.45, 0.016, self.m('accent'), 'ring_mount')
            cyl(x + w * 0.25, y + 0.042, z + h * 0.42, 0.018, 0.008, self.m('accent2'), seg=8, name='ring_pull')

    # ------------------------------------------------------------ dressing
    def chimney(self, x, y, z, h, rng, smoke=True):
        """Basalt chimney flue with jagged spiked iron rim and dark volcanic soot."""
        c = box(x, y, z, 0.12, 0.12, h, self.m('stone_dark'), 'chimney', bevel=0.01)
        c.rotation_euler = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04), 0)
        # Spiked flared iron cap
        box(x, y, z + h, 0.16, 0.16, 0.04, self.m('trim'), 'chimcap')
        for cx, cy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
            cone(x + cx * 0.065, y + cy * 0.065, z + h + 0.04, 0.014, 0.04, self.m('accent2'), seg=4, name='chim_spike')
        if smoke and (smoke == 'always' or rng.random() < 0.55):
            self.smoke(x, y, z + h + 0.06)

    def smoke(self, x, y, z):
        """Dark billowing volcanic soot wisp rising and dissipating."""
        puffs = [sphere(x, y, z, 0.042, self.m('smoke', rough=1.0, alpha=0.60 - 0.15 * i), 'noink_smoke', squash=0.85) for i in range(3)]

        def step(f, n):
            for i, p in enumerate(puffs):
                t = ((i + f / n) / 3)
                p.location = (x + 0.05 * t, y - 0.03 * t, z + 0.03 + t * 0.28)
                s = 0.55 + t * 1.1
                p.scale = (s, s, s * 0.85)
        kit.anim(step)

    def banner(self, face, x, y, z, w=0.1, h=0.2):
        """Crimson silk banner with brass finials and golden dragon claw emblem."""
        cloth = self.m('cloth')
        if face == 'x':
            box(x + 0.02, y, z + h, 0.02, w + 0.04, 0.02, self.m('trim'), 'pole')
            cone(x + 0.02, y - (w + 0.04) / 2, z + h + 0.01, 0.015, 0.03, self.m('accent2'), seg=4, name='pole_finial')
            cone(x + 0.02, y + (w + 0.04) / 2, z + h + 0.01, 0.015, 0.03, self.m('accent2'), seg=4, name='pole_finial')
            b = box(x + 0.02, y, z, 0.012, w, h, cloth, 'banner')
            self.emblem('x', x + 0.032, y, z + h * 0.55, w * 0.55)
        else:
            box(x, y + 0.02, z + h, w + 0.04, 0.02, 0.02, self.m('trim'), 'pole')
            cone(x - (w + 0.04) / 2, y + 0.02, z + h + 0.01, 0.015, 0.03, self.m('accent2'), seg=4, name='pole_finial')
            cone(x + (w + 0.04) / 2, y + 0.02, z + h + 0.01, 0.015, 0.03, self.m('accent2'), seg=4, name='pole_finial')
            b = box(x, y + 0.02, z, w, 0.012, h, cloth, 'banner')
            self.emblem('y', x, y + 0.032, z + h * 0.55, w * 0.55)
        kit.anim(lambda f, n: setattr(b, 'rotation_euler', ((0.06 * math.sin(TAU * f / n), 0, 0) if face == 'x' else (0, 0.06 * math.sin(TAU * f / n), 0))))

    def emblem(self, face, x, y, z, s):
        """Gold dragon claw emblem: golden circular disc with three sharp claw talons."""
        sphere(x, y, z, s * 0.48, self.m('emblem'), 'emblem_disc', squash=0.85)
        # 3 golden sharp claw talons pointing downwards
        claw_len = s * 0.45
        claw_r = s * 0.12
        for ci, c_off in enumerate((-s * 0.20, 0.0, s * 0.20)):
            ang_spread = (ci - 1) * 0.25
            if face == 'x':
                c = cone(x + 0.015, y + c_off, z - s * 0.1, claw_r, claw_len, self.m('accent'), seg=4, name='dragon_claw')
                c.rotation_euler = (ang_spread, 0, 0)
            else:
                c = cone(x + c_off, y + 0.015, z - s * 0.1, claw_r, claw_len, self.m('accent'), seg=4, name='dragon_claw')
                c.rotation_euler = (0, -ang_spread, 0)

    def flag(self, x, y, z, h=0.22):
        """Iron pole with crimson dragon pennant."""
        box(x, y, z, 0.015, 0.015, h, self.m('trim'), 'flagpole')
        cone(x, y, z + h, 0.02, 0.04, self.m('accent'), seg=4, name='pole_spear')
        f = box(0, 0.07, 0, 0.012, 0.14, 0.08, self.m('cloth'), 'flag')
        f.location = (x, y, z + h - 0.09)
        # Gold emblem disc on the flag
        sphere(x, y + 0.05, z + h - 0.09, 0.025, self.m('emblem'), 'flag_boss')
        kit.anim(lambda fr, n: setattr(f, 'rotation_euler', (0, 0, 0.25 * math.sin(TAU * fr / n))))

    def lamp(self, x, y, z=0.0):
        """Brazier on a wrought-iron tripod with chains and open flickering fire."""
        # Iron tripod stand
        cyl(x, y, z, 0.022, 0.12, self.m('trim'), seg=6, name='brazier_pedestal')
        for leg_i in range(3):
            ang = leg_i * TAU / 3
            lx, ly = x + math.cos(ang) * 0.04, y + math.sin(ang) * 0.04
            cone(lx, ly, z, 0.012, 0.12, self.m('trim'), seg=4, r_top=0.008, name='brazier_leg')
        # Flared iron bowl with side chains
        cone(x, y, z + 0.10, 0.065, 0.05, self.m('metal'), seg=8, r_top=0.04, name='brazier_bowl')
        box(x, y, z + 0.14, 0.09, 0.09, 0.015, self.m('trim'), 'brazier_rim')
        # Hanging decorative iron chains
        for ci in range(3):
            ang = ci * TAU / 3 + 0.5
            cx_pos, cy_pos = x + math.cos(ang) * 0.045, y + math.sin(ang) * 0.045
            cyl(cx_pos, cy_pos, z + 0.06, 0.005, 0.06, self.m('metal'), seg=4, name='b_chain')
        # Glowing coal bed & flickering dragon flame
        sphere(x, y, z + 0.13, 0.038, self.m('glow', emit=4.0), 'noink_brazier_coals')
        self.fire(x, y, z + 0.14, s=0.9)

    def barrel(self, x, y, z=0.0, r=0.05, h=0.1):
        """Cast iron & bronze cauldron/keg with brass hoops and rivets."""
        cyl(x, y, z, r, h, self.m('wood'), seg=10, name='iron_barrel')
        for zz in (z + h * 0.2, z + h * 0.8):
            cyl(x, y, zz, r * 1.05, 0.014, self.m('accent2'), seg=10, name='brass_hoop')
            sphere(x + r * 1.06, y, zz + 0.007, 0.007, self.m('accent'), 'hoop_rivet')

    def crate(self, x, y, z=0.0, s=0.08, rng=None):
        """Heavy iron-bound basalt ore strongbox with brass lockplate."""
        b = box(x, y, z, s, s, s, self.m('stone_dark'), 'ore_chest', bevel=0.006)
        # Heavy iron corner strapping
        for px, py in ((x + s / 2, y + s / 2), (x + s / 2, y - s / 2), (x - s / 2, y + s / 2), (x - s / 2, y - s / 2)):
            box(px, py, z, 0.018, 0.018, s, self.m('trim'), 'chest_iron_edge')
        # Brass lock plate on front face
        box(x + s / 2 + 0.004, y, z + s * 0.5, 0.008, 0.024, 0.024, self.m('accent'), 'chest_lock')
        if rng:
            b.rotation_euler.z = rng.uniform(-0.35, 0.35)

    def sack(self, x, y, z=0.0):
        """Crimson dragon-cloth ore bag tied with golden wire."""
        sphere(x, y, z + 0.035, 0.042, self.m('cloth'), 'ore_sack', squash=0.9)
        cyl(x, y, z + 0.065, 0.012, 0.016, self.m('accent'), seg=6, name='sack_gold_cinch')

    def fence(self, points, rng, h=0.1):
        """Fences become heavy wrought iron spikes."""
        for (x0, y0), (x1, y1) in zip(points, points[1:]):
            dist = math.hypot(x1 - x0, y1 - y0)
            n = max(2, int(dist / 0.065))
            for i in range(n + 1):
                t = i / n
                px = x0 + (x1 - x0) * t
                py = y0 + (y1 - y0) * t
                hh = h * rng.uniform(0.92, 1.08)
                # Square iron picket
                box(px, py, 0, 0.02, 0.02, hh, self.m('metal'), 'iron_picket')
                # Sharp pointed spearhead tip
                cone(px, py, hh, 0.018, 0.04, self.m('accent2'), seg=4, name='iron_spear_tip')
            # Twin horizontal wrought iron rails
            for rz in (h * 0.35, h * 0.72):
                rail = poly([(x0, y0, rz), (x1, y1, rz), (x1, y1, rz + 0.018), (x0, y0, rz + 0.018)],
                            [(0, 1, 2, 3)], self.m('trim'), 'iron_rail')
                kit.solid(rail, 0.014)

    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        """Obsidian crystal spires or dead charred stumps, never green."""
        use_spire = (rng.random() < 0.55) if rng else True
        if use_spire:
            # Towering faceted obsidian crystal spire cluster
            # Cracked basalt base ring
            cyl(x, y, z, 0.07 * s, 0.03 * s, self.m('stone_dark'), seg=8, name='spire_base')
            # Glowing magma vein at the crystal roots
            sphere(x, y, z + 0.015, 0.05 * s, self.m('glow', emit=3.5), 'noink_root_glow', squash=0.3)
            # Main central towering obsidian shard
            c1 = cone(x, y, z + 0.02 * s, 0.042 * s, 0.36 * s, self.m('trim'), seg=6, name='obsidian_spire_main')
            c1.rotation_euler = (0.05, -0.05, 0.3)
            # Flanking sharp crystal shards
            for ang, h_sub, r_sub in ((1.2, 0.22, 0.028), (3.4, 0.26, 0.030), (5.1, 0.18, 0.025)):
                sx_pos = x + math.cos(ang) * 0.045 * s
                sy_pos = y + math.sin(ang) * 0.045 * s
                cs = cone(sx_pos, sy_pos, z + 0.01 * s, r_sub * s, h_sub * s, self.m('stone_light'), seg=5, name='crystal_shard')
                cs.rotation_euler = (math.sin(ang) * 0.12, -math.cos(ang) * 0.12, ang)
        else:
            # Dead charred petrified stump with bare angular branches and glowing embers
            cyl(x, y, z, 0.035 * s, 0.24 * s, self.m('trunk'), seg=6, name='charred_trunk')
            # Gnarled bare branches
            for ang, bz, blen in ((0.5, 0.15, 0.12), (2.8, 0.19, 0.10), (4.8, 0.12, 0.09)):
                bx = x + math.cos(ang) * 0.02 * s
                by = y + math.sin(ang) * 0.02 * s
                br = cyl(bx, by, z + bz * s, 0.014 * s, blen * s, self.m('trunk'), seg=4, name='charred_bough')
                br.rotation_euler = (math.sin(ang) * 0.7, -math.cos(ang) * 0.7, ang)
            # Glowing ember crack in the stump
            sphere(x + 0.018 * s, y, z + 0.08 * s, 0.015 * s, self.m('glow', emit=4.0), 'noink_stump_ember')

    def bush(self, x, y, r=0.06):
        """Obsidian crystal cluster / basalt shards (never green)."""
        cyl(x, y, 0, r * 0.9, 0.02, self.m('stone_dark'), seg=6, name='shards_base')
        for i, (dx, dy, sh_h) in enumerate(((0, 0, r * 1.6), (r * 0.45, -r * 0.2, r * 1.2), (-r * 0.4, r * 0.35, r * 1.0))):
            cone(x + dx, y + dy, 0.01, r * 0.35, sh_h, self.m(('trim', 'stone_light', 'wall2')[i]), seg=5, name='crystal_bush')
        # Ember glint
        sphere(x, y, 0.02, r * 0.22, self.m('glow', emit=3.5), 'noink_bush_ember')

    def rock(self, x, y, r=0.06, rng=None):
        """Sharp faceted volcanic basalt boulder with a glowing heat vein."""
        o = sphere(x, y, r * 0.35, r, self.m('stone_dark'), 'basalt_rock', squash=0.65)
        # Red-hot seam across the rock
        box(x, y, r * 0.25, r * 1.2, 0.01, 0.01, self.m('glow', emit=3.5), 'noink_rock_seam')
        if rng:
            o.rotation_euler.z = rng.uniform(0, TAU)

    def water(self, x, y, z, sx, sy):
        """Molten bubbling lava channel with glowing magma crusts (animates 3 frames)."""
        w = box(x, y, z, sx, sy, 0.012, self.m('water', emit=3.2), 'noink_lava_surface')
        # Floating hot crusts / bright yellow flare bubbles
        n_g = 3 if max(sx, sy) < 0.25 else 5
        flares = []
        for i in range(n_g):
            gx = x + (i / max(1, n_g - 1) - 0.5) * sx * 0.65
            gy = y + ((i * 7) % 3 - 1) * sy * 0.28
            f_box = box(0, 0, 0, 0.05, 0.018, 0.004, mat('#fff176', emit=5.0), 'noink_lava_bubble')
            f_box.location = (gx, gy, z + 0.013)
            flares.append((f_box, gx, gy))

        def step_lava(f, n):
            for i, (g, gx, gy) in enumerate(flares):
                on = (i + f) % 3 != 0
                g.scale = (1, 1, 1) if on else (0, 0, 0)
                g.location = (gx + 0.012 * ((f + i) % 3 - 1), gy - 0.008 * ((f + i) % 3 - 1), z + 0.013)
        kit.anim(step_lava)
        return w

    def fire(self, x, y, z, s=1.0):
        """A roaring dragonfire flame that flickers over the frames."""
        fl = cone(x, y, z, 0.045 * s, 0.12 * s, mat('#ff6d00', emit=5.5), seg=6, name='noink_fire')
        core = cone(x, y, z, 0.024 * s, 0.08 * s, mat('#fff176', emit=7.0), seg=6, name='noink_fire_core')
        # Dragonfire sparks
        spark = sphere(x, y, z + 0.13 * s, 0.012 * s, mat('#ffe57f', emit=6.0), 'noink_fire_spark')
        kit.anim(lambda f, n: [
            setattr(fl, 'scale', (1, 1, (1.0, 1.3, 0.8)[f % 3])),
            setattr(core, 'scale', (1, 1, (1.15, 0.85, 1.25)[f % 3])),
            setattr(spark, 'location', (x + 0.015 * math.sin(TAU * f / 3), y + 0.015 * math.cos(TAU * f / 3), z + 0.12 * s + 0.02 * (f % 3)))
        ])



STYLE = DragonStyle()

