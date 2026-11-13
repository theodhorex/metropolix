# Goblins: ramshackle timber-framed houses on stone footings, mossy shingle roofs that sag, crooked
# chimneys, rusty tin and riveted iron, green skull banners, warm lit windows. Cosy, not grim.
import math
import kit
from kit import box, sphere, cone, cyl, mat
from style import Style


class GoblinStyle(Style):
    name = 'goblin'
    P = {
        'wall': '#c4ad82', 'wall2': '#b39a6c', 'trim': '#4a2e1c',
        'wood': '#8a5a36', 'wood_light': '#a8724a', 'wood_dark': '#5e3a22',
        'stone': '#857b6c', 'stone_dark': '#5e564b', 'stone_light': '#a39885',
        'roof': '#5f7a2e', 'roof2': '#7f9a3a', 'roof3': '#7a4a2a', 'roof_under': '#3e2a18',
        'metal': '#3c3a38', 'accent': '#8a4a2a', 'accent2': '#b08a3a',
        'cloth': '#3f7a2a', 'emblem': '#e6dcc0', 'glow': '#ffb347', 'water': '#4aa3c8',
        'foliage': '#5f8a2e', 'foliage2': '#7aa83a', 'foliage_dark': '#3f6222', 'trunk': '#5a3a22',
        'crop': '#c9a640', 'crop2': '#7fae3a', 'dirt': '#8a6a44', 'smoke': '#d8d4cc',
    }

    def walls(self, x, y, z, sx, sy, h, rng, kind='main'):
        if kind != 'main':
            return super().walls(x, y, z, sx, sy, h, rng, kind)
        # plaster with a dark timber frame and one crooked brace per visible face
        box(x, y, z, sx, sy, h, self.m('wall'), 'wall')
        t = 0.035
        for px, py in ((x + sx / 2, y + sy / 2), (x + sx / 2, y - sy / 2), (x - sx / 2, y + sy / 2)):
            box(px, py, z, t * 1.3, t * 1.3, h, self.m('trim'), 'post')
        for zz in (z, z + h - t):
            box(x + sx / 2 + 0.005, y, zz, t, sy + t, t, self.m('trim'), 'beam')
            box(x, y + sy / 2 + 0.005, zz, sx + t, t, t, self.m('trim'), 'beam')
        posts = 3 if max(sx, sy) < 0.6 else 4
        for i in range(1, posts):
            u = -0.5 + i / posts
            box(x + sx / 2 + 0.006, y + u * sy, z, t, t, h, self.m('trim'), 'post')
            box(x + u * sx, y + sy / 2 + 0.006, z, t, t, h, self.m('trim'), 'post')
        for face in ('x', 'y'):
            ang = rng.uniform(0.6, 0.9) * (1 if rng.random() < 0.5 else -1)
            b = box(0, 0, -h * 0.35, t * 0.8, t * 0.8, h * 0.7, self.m('trim'), 'brace')
            if face == 'x':
                b.location = (x + sx / 2 + 0.008, y - sy * 0.3, z + h / 2)
                b.rotation_euler = (ang, 0, 0)
            else:
                b.location = (x + sx * 0.3, y + sy / 2 + 0.008, z + h / 2)
                b.rotation_euler = (0, ang, 0)
        # a rusty tin patch, goblin style
        if rng.random() < 0.6:
            box(x + sx / 2 + 0.01, y + sy * rng.uniform(-0.2, 0.2), z + h * rng.uniform(0.2, 0.5), 0.008, 0.09, 0.08, self.m('accent', metal=0.3, rough=0.6), 'tin')

    def roof_dressing(self, x, y, z, h, half, over, length, along, rng):
        for _ in range(int(length * 7)):
            t = rng.uniform(0.15, 0.85)
            d = (1 - t) * half
            uu = rng.uniform(-length / 2 + 0.05, length / 2 - 0.05)
            zz = z + h * (1 - d / (half - over)) + 0.02
            pos = (x + uu, y + d, zz) if along == 'x' else (x + d, y + uu, zz)
            sphere(*pos, rng.uniform(0.03, 0.05), self.m(rng.choice(['roof2', 'foliage'])), 'moss', squash=0.4)

    def emblem(self, face, x, y, z, s):
        # a little bone-white skull: cranium and two dark eyes
        sphere(x, y, z, s * 0.5, self.m('emblem'), 'skull', squash=0.9)
        for e in (-1, 1):
            if face == 'x':
                sphere(x + s * 0.4, y + e * s * 0.18, z, s * 0.12, mat('#1b1410'), 'noink_eye')
            else:
                sphere(x + e * s * 0.18, y + s * 0.4, z, s * 0.12, mat('#1b1410'), 'noink_eye')

    def tree(self, x, y, z=0.0, s=1.0, rng=None):
        # goblins keep scrubby pines
        cyl(x, y, z, 0.025 * s, 0.1 * s, self.m('trunk'), seg=6, name='trunk')
        for i, (zz, r) in enumerate(((0.08, 0.12), (0.18, 0.095), (0.27, 0.065))):
            cone(x, y, z + zz * s, r * s, 0.14 * s, self.m(('foliage_dark', 'foliage', 'foliage2')[i]), seg=7, name='pine')


STYLE = GoblinStyle()
