# The goblin wonder, kept apart from wonders.py (other workers edit that file).
# Scrap Spire (height 2.6): a crooked tower of stacked salvage on a stone footing. Big gears turn, a crane
# swings its hook, furnace windows glow, a propeller spins on the top and sparks fly from the lightning rod.
import math
import bpy
import kit
from kit import box, cyl, cone, sphere, mat

TAU = 2 * math.pi


def _gear(S, x, y, z, r, face, teeth=10, key='metal', spin=1.0):
    """A toothed wheel on a building face ('x' faces +X, 'y' faces +Y) that turns over the frames."""
    hub = cyl(x, y, z - 0.015, r, 0.03, S.m(key, metal=0.6, rough=0.45), seg=16, name='gear')
    hub.location = (x, y, z)
    for i in range(teeth):
        a = TAU * i / teeth
        t = box(0, 0, -0.015, r * 0.22, r * 0.22, 0.03, S.m(key, metal=0.6, rough=0.45), 'tooth')
        t.location = (math.cos(a) * r * 1.08, math.sin(a) * r * 1.08, 0)
        t.rotation_euler = (0, 0, a)
        t.parent = hub
    cyl(0, 0, -0.02, r * 0.28, 0.045, S.m('accent2', metal=0.5), seg=8, name='axle').parent = hub
    hub.rotation_mode = 'ZYX'
    tilt = (0, math.pi / 2, 0) if face == 'x' else (math.pi / 2, 0, 0)
    step = TAU / teeth / 3  # a third of a tooth per frame: the 3-frame loop is seamless
    if face == 'x':
        kit.anim(lambda f, n: setattr(hub, 'rotation_euler', (0, math.pi / 2, spin * step * f)))
    else:
        kit.anim(lambda f, n: setattr(hub, 'rotation_euler', (math.pi / 2, 0, spin * step * f)))
    hub.rotation_euler = (*tilt[:2], 0)
    return hub


def _plate(S, x, y, z, w, h, face, rng):
    """A rusty tin patch with rivets, nailed on a face."""
    key = rng.choice(['accent', 'metal', 'roof3'])
    if face == 'x':
        p = box(x, y, z, 0.012, w, h, S.m(key, metal=0.35, rough=0.6), 'tin')
        p.rotation_euler = (rng.uniform(-0.12, 0.12), 0, 0)
        for dy in (-w * 0.4, w * 0.4):
            sphere(x + 0.008, y + dy, z + h * 0.85, 0.009, S.m('stone_light', metal=0.5), 'rivet')
    else:
        p = box(x, y, z, w, 0.012, h, S.m(key, metal=0.35, rough=0.6), 'tin')
        p.rotation_euler = (0, rng.uniform(-0.12, 0.12), 0)
        for dx in (-w * 0.4, w * 0.4):
            sphere(x + dx, y + 0.008, z + h * 0.85, 0.009, S.m('stone_light', metal=0.5), 'rivet')


def scrapspire(S, rng):
    # stone footing and a heap of salvage round the base
    S.footing(0, 0, 0.62, 0.62, 0.08, rng)
    # the spire: five crooked storeys, each smaller and twisted a little from the one below
    z = 0.08
    storeys = [(0.56, 0.42), (0.48, 0.40), (0.40, 0.36), (0.32, 0.34), (0.24, 0.30)]
    for i, (s, h) in enumerate(storeys):
        ox, oy = rng.uniform(-0.03, 0.03), rng.uniform(-0.03, 0.03)
        before = set(bpy.context.scene.objects)
        kind = 'stone' if i == 0 else ('plank' if i % 2 else 'main')
        S.walls(ox, oy, z, s, s, h, rng, kind=kind)
        # a ledge of planks between storeys
        ledge = box(ox, oy, z + h, s + 0.07, s + 0.07, 0.03, S.m('wood_dark'), 'ledge')
        ledge.rotation_euler = (0, 0, rng.uniform(-0.08, 0.08))
        # glowing furnace windows and tin patches on both visible faces
        for face in ('x', 'y'):
            for k in range(1 if s < 0.35 else 2):
                u = (k - 0.5) * s * 0.45 if s >= 0.35 else 0
                if face == 'x':
                    S.window('x', ox + s / 2, oy + u, z + h * 0.35, w=0.09, h=0.12)
                else:
                    S.window('y', ox + u, oy + s / 2, z + h * 0.35, w=0.09, h=0.12)
            if rng.random() < 0.8:
                if face == 'x':
                    _plate(S, ox + s / 2 + 0.01, oy + rng.uniform(-s * 0.3, s * 0.3), z + h * 0.1, rng.uniform(0.08, 0.13), rng.uniform(0.08, 0.14), 'x', rng)
                else:
                    _plate(S, ox + rng.uniform(-s * 0.3, s * 0.3), oy + s / 2 + 0.01, z + h * 0.1, rng.uniform(0.08, 0.13), rng.uniform(0.08, 0.14), 'y', rng)
        # twist the storey a little on the one below and lean it: built from salvage, never square
        twist = bpy.data.objects.new('noink_twist', None)
        bpy.context.scene.collection.objects.link(twist)
        twist.location = (ox, oy, z)
        bpy.context.view_layer.update()  # matrix_world is stale until the depsgraph updates
        for o in set(bpy.context.scene.objects) - before - {twist}:
            if o.parent is None:
                o.parent = twist
                o.matrix_parent_inverse = twist.matrix_world.inverted()
        twist.rotation_euler = (rng.uniform(-0.035, 0.035), rng.uniform(-0.035, 0.035), (0.12 if i % 2 else -0.1) * (i > 0))
        bpy.context.view_layer.update()
        z += h + 0.03
    top = z

    # big turning gears on the two faces the camera sees, a small one turning the other way
    _gear(S, 0.29, -0.05, 0.42, 0.13, 'x', teeth=10)
    _gear(S, 0.29, 0.14, 0.58, 0.07, 'x', teeth=8, spin=-1.6)
    _gear(S, 0.08, 0.25, 1.05, 0.10, 'y', teeth=9, key='accent2')

    # door with a skull banner either side
    S.door('x', 0.31, 0.12, 0.08, w=0.14, h=0.24)
    S.banner('x', 0.31, -0.2, 0.62, w=0.09, h=0.18)
    S.banner('y', -0.15, 0.27, 0.95, w=0.08, h=0.16)

    # side smoke stack bolted on, always smoking
    sx_, sy_ = -0.24, 0.34
    cyl(sx_, sy_, 0.08, 0.05, 1.3, S.m('metal', metal=0.4, rough=0.5), seg=10, name='stack')
    for zz in (0.45, 0.85, 1.2):
        cyl(sx_, sy_, zz, 0.062, 0.03, S.m('accent', metal=0.4), seg=10, name='band')
    cone(sx_, sy_, 1.38, 0.075, 0.06, S.m('metal', metal=0.4), seg=10, r_top=0.05, name='stackcap')
    box(sx_ + 0.05, sy_ - 0.12, 0.62, 0.03, 0.2, 0.03, S.m('metal', metal=0.4), 'pipe')
    S.smoke(sx_, sy_, 1.48)

    # crane arm sticking out of the fourth storey with a hook that swings
    arm = box(0.0, 0.0, 0.0, 0.42, 0.035, 0.035, S.m('wood_dark'), 'crane')
    arm.location = (0.2, -0.08, 1.42)
    brace = box(0, 0, 0, 0.03, 0.03, 0.3, S.m('wood_dark'), 'brace')
    brace.location = (0.14, -0.08, 1.15)
    brace.rotation_euler = (0, 0.75, 0)
    rope = box(0, 0, -0.26, 0.008, 0.008, 0.26, S.m('trim'), 'rope')
    hook = sphere(0, 0, -0.28, 0.035, S.m('metal', metal=0.6), 'hook', squash=1.2)
    load = box(0, 0, -0.34, 0.07, 0.07, 0.06, S.m('wood'), 'crate_load')
    pivot = bpy.data.objects.new('noink_pivot', None)
    bpy.context.scene.collection.objects.link(pivot)
    pivot.location = (0.38, -0.08, 1.42)
    for o in (rope, hook, load):
        o.parent = pivot
    kit.anim(lambda f, n: setattr(pivot, 'rotation_euler', (0.18 * math.sin(TAU * f / n), 0, 0)))

    # crooked tin cone roof, lightning rod, spinning propeller and sparks on top
    roof = cone(0.0, 0.0, top, 0.22, 0.34, S.m('roof3', metal=0.3, rough=0.6), seg=7, name='roofcone')
    roof.rotation_euler = (0.05, -0.04, 0)
    cyl(0.0, 0.0, top + 0.3, 0.012, 0.28, S.m('metal', metal=0.7), seg=6, name='rod')
    prop = bpy.data.objects.new('noink_prop', None)
    bpy.context.scene.collection.objects.link(prop)
    prop.location = (0.0, 0.0, top + 0.5)
    for i in range(3):
        b = box(0.07, 0, 0, 0.14, 0.03, 0.008, S.m('wood_light'), 'blade')
        b.rotation_euler = (0.3, 0, 0)
        piv = bpy.data.objects.new('noink_blade', None)
        bpy.context.scene.collection.objects.link(piv)
        piv.parent = prop
        piv.rotation_euler = (0, 0, TAU * i / 3)
        b.parent = piv
    kit.anim(lambda f, n: setattr(prop, 'rotation_euler', (0, 0, TAU / 9 * f)))
    spark = sphere(0.0, 0.0, top + 0.6, 0.03, mat('#bfe8ff', emit=6), 'noink_spark')
    kit.anim(lambda f, n: setattr(spark, 'scale', ((0.6, 1.4, 0.9)[f % 3],) * 3))
    S.flag(0.0, 0.0, top + 0.58, h=0.14)

    # the salvage heap: barrels, crates, sacks, loose gears and a cart
    for (x, y) in ((0.36, -0.34), (-0.4, 0.2), (0.38, 0.36)):
        S.barrel(x, y)
    for (x, y) in ((0.4, 0.0), (-0.1, 0.4), (0.0, -0.4)):
        S.crate(x, y, rng=rng)
    S.sack(-0.38, -0.05)
    for (x, y, r) in ((0.42, -0.18, 0.05), (-0.3, 0.42, 0.04)):
        g = cyl(x, y, 0.0, r, 0.02, S.m('metal', metal=0.6, rough=0.45), seg=10, name='loose_gear')
        g.rotation_euler = (rng.uniform(-0.4, 0.4), rng.uniform(-0.4, 0.4), 0)
    S.lamp(0.42, 0.22)
    S.lamp(0.2, 0.43)
    S.fire(-0.4, -0.4, 0.0, s=1.2)


RECIPES = {'scrapspire': scrapspire}
