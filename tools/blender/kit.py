# Metropolix building kit for Blender (run headless: blender -b --factory-startup -P make.py -- <args>).
# One tile is the unit square centred on the origin. The orthographic camera looks at it from the game's
# 2:1 isometric angle, so a render lines up with the game's 64x32 tile: the canvas is 256 px wide, the
# tile's left and right corners touch the canvas sides and its bottom corner sits on the canvas bottom.
import math
import bpy
import bmesh
from mathutils import Vector

W = 256          # canvas width in px (shown at 64 px in game: 4x supersampled)
H = 512          # canvas height in px (cropped to the art afterwards)
TILE_PX = W / math.sqrt(2)  # px per world unit along the view's horizontal


def reset():
    """Empty the scene and set it up for a tile render. Safe in a live Blender (no factory reset,
    which would also unload the MCP addon)."""
    sc = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.cameras, bpy.data.lights, bpy.data.curves):
        for d in list(coll):
            if d.users == 0:
                coll.remove(d)
    _mats.clear()
    _anims.clear()
    global _ink
    _ink = None
    try:
        sc.render.engine = 'BLENDER_EEVEE'
    except TypeError:
        sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    ee = sc.eevee
    for attr, val in (('taa_render_samples', 32), ('use_shadows', True), ('use_gtao', True), ('gtao_distance', 0.4)):
        if hasattr(ee, attr):
            try: setattr(ee, attr, val)
            except Exception: pass
    world = bpy.data.worlds.get('mx_world') or bpy.data.worlds.new('mx_world')
    sc.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = (0.78, 0.84, 0.95, 1)
    bg.inputs[1].default_value = 0.55
    camera(sc)
    sun(sc)
    return sc


def camera(sc):
    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.sensor_fit = 'HORIZONTAL'
    cam.ortho_scale = math.sqrt(2)  # the tile's diagonal fills the canvas width
    # the tile centre sits 64 px above the canvas bottom (its bottom corner on the bottom edge)
    cam.shift_y = (H / 2 - 64) / W
    ob = bpy.data.objects.new('cam', cam)
    sc.collection.objects.link(ob)
    elev = math.radians(30)  # 2:1 pixel isometric
    d = 20
    # the viewer stands off the tile's front corner (+x, +y): game x runs down-right on screen, game y down-left
    a = d * math.cos(elev) / math.sqrt(2)
    ob.location = (a, a, d * math.sin(elev))
    direction = Vector((0, 0, 0)) - ob.location
    ob.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    sc.camera = ob


def sun(sc):
    """Warm key sun from the camera's upper left (lights the +X face, grazes the +Y face), cool sky fill."""
    s = bpy.data.lights.new('sun', 'SUN')
    s.energy = 4.0
    s.angle = math.radians(8)
    s.color = (1.0, 0.94, 0.82)
    ob = bpy.data.objects.new('sun', s)
    sc.collection.objects.link(ob)
    ob.rotation_euler = (-Vector((1.0, 0.35, 1.25))).to_track_quat('-Z', 'Y').to_euler()
    f = bpy.data.lights.new('fill', 'SUN')
    f.energy = 0.8
    f.color = (0.75, 0.85, 1.0)
    f.use_shadow = False
    fo = bpy.data.objects.new('fill', f)
    sc.collection.objects.link(fo)
    fo.rotation_euler = (-Vector((0.2, 1.0, 0.6))).to_track_quat('-Z', 'Y').to_euler()


_mats = {}
_anims = []
FRAMES = 3  # the game cycles 3 frames for anything that moves


def anim(fn):
    """Register fn(frame, nframes) that poses moving parts (smoke, sails, flags, water) for one frame."""
    _anims.append(fn)


def pose(frame):
    for fn in _anims:
        fn(frame, FRAMES)


def mat(hex_color, rough=0.85, emit=0.0, metal=0.0, alpha=1.0):
    key = (hex_color, rough, emit, metal, alpha)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(f'm{len(_mats)}')
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    c = srgb(hex_color)
    b.inputs['Base Color'].default_value = (*c, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*c, 1)
        b.inputs['Emission Strength'].default_value = emit
    if alpha < 1:  # see-through (smoke, glass): blended, so it stays soft in the transparent render
        b.inputs['Alpha'].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except (AttributeError, TypeError):
            m.blend_method = 'BLEND'
    _mats[key] = m
    return m


def srgb(h):
    h = h.lstrip('#')
    out = []
    for i in (0, 2, 4):
        v = int(h[i:i + 2], 16) / 255
        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return out


def _obj(name, me, material):
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if material:
        ob.data.materials.append(material)
    return ob


def box(x, y, z, sx, sy, sz, material, name='box', bevel=0.0):
    """Axis-aligned box: (x, y) centre, z bottom, sizes sx, sy, sz."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((x + v.co.x * sx, y + v.co.y * sy, z + (v.co.z + 0.5) * sz))
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=1, affect='EDGES')
    bm.to_mesh(me)
    bm.free()
    return _obj(name, me, material)


def poly(verts, faces, material, name='poly'):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    return _obj(name, me, material)


def gable(x, y, z, sx, sy, h, material, overhang=0.06, along='x'):
    """Gable roof over a sx*sy footprint with its ridge along x (or y), eaves at z, ridge at z+h."""
    ox, oy = sx / 2 + overhang, sy / 2 + overhang
    if along == 'x':
        v = [(x - ox, y - oy, z), (x + ox, y - oy, z), (x + ox, y + oy, z), (x - ox, y + oy, z), (x - ox, y, z + h), (x + ox, y, z + h)]
        f = [(0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5)]
    else:
        v = [(x - ox, y - oy, z), (x + ox, y - oy, z), (x + ox, y + oy, z), (x - ox, y + oy, z), (x, y - oy, z + h), (x, y + oy, z + h)]
        f = [(1, 2, 5, 4), (3, 0, 4, 5), (0, 1, 4), (2, 3, 5)]
    ob = poly(v, f, material, 'roof')
    solid(ob, 0.03)
    return ob


def hip(x, y, z, sx, sy, h, material, overhang=0.06):
    ox, oy = sx / 2 + overhang, sy / 2 + overhang
    v = [(x - ox, y - oy, z), (x + ox, y - oy, z), (x + ox, y + oy, z), (x - ox, y + oy, z), (x, y, z + h)]
    f = [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]
    ob = poly(v, f, material, 'roof')
    solid(ob, 0.03)
    return ob


def cone(x, y, z, r, h, material, seg=12, r_top=0.0, name='cone'):
    bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r_top, depth=h, location=(x, y, z + h / 2))
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(material)
    return ob


def cyl(x, y, z, r, h, material, seg=16, name='cyl'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=h, location=(x, y, z + h / 2))
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(material)
    return ob


def sphere(x, y, z, r, material, name='sphere', squash=1.0, seg=12):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r, location=(x, y, z))
    ob = bpy.context.active_object
    ob.scale.z = squash
    ob.name = name
    ob.data.materials.append(material)
    for p in ob.data.polygons:
        p.use_smooth = False
    return ob


def solid(ob, t):
    m = ob.modifiers.new('solid', 'SOLIDIFY')
    m.thickness = t
    m.offset = 1


_ink = None


def outline_all(width=0.012, color='#1b1410'):
    """Inverted-hull ink outline on every mesh, so the art reads crisp at 64 px like the pixel art."""
    global _ink
    if _ink is None:
        _ink = bpy.data.materials.new('ink')
        _ink.use_nodes = True
        nt = _ink.node_tree
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs[0].default_value = (*srgb(color), 1)
        nt.links.new(em.outputs[0], out.inputs[0])
        _ink.use_backface_culling = True
    for ob in list(bpy.context.scene.objects):
        if ob.type != 'MESH' or ob.name.startswith('noink'):
            continue
        ob.data.materials.append(_ink)
        m = ob.modifiers.new('ink', 'SOLIDIFY')
        m.thickness = width
        m.offset = 1
        m.use_flip_normals = True
        m.material_offset = len(ob.data.materials) - 1


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def render_all(prefix):
    """Render prefix.png, or prefix_0..2.png when something moves. Returns the frame count."""
    if not _anims:
        render(prefix + '.png')
        return 1
    for f in range(FRAMES):
        pose(f)
        render(f'{prefix}_{f}.png')
    pose(0)
    return FRAMES
