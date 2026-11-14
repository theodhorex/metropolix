"""Blender 3D icons for the Metropolix game UI (128x128 transparent renders -> WebP q95).

Usage:
  Render in Blender (all icons in ICONS, or specific names):
    blender -b --factory-startup -P tools/blender/icons.py -- [name ...]
  Install WebP q95 to apps/web/public/art/ui/<name>.webp + icons.json and build contact sheet:
    python3 tools/blender/icons.py [name ...]
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, 'out', 'ui')
UI_ART_DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'art', 'ui'))

SIZE = 128  # 128x128 render resolution

# Exact palette from apps/web/components/Icon.tsx
PAL = {
    'o': '#12151d', 'y': '#f2c14e', 'Y': '#b8862a', 'w': '#fff3c9', 'n': '#9a6a3a', 'N': '#65431f',
    's': '#aab3c2', 'S': '#68728a', 'b': '#6ec8ff', 'B': '#2f7fc0', 'g': '#7fcf6a', 'G': '#3e8a3a',
    'r': '#ea6a55', 'R': '#a13425', 'p': '#f0c8a0', 'P': '#c48a62', 'k': '#2a2f3c', 'v': '#b58cf0',
    'V': '#6c47b8', 'e': '#ff9a3c', 'm': '#a8f0d8', 'c': '#4ef2ea', 'C': '#18989e', 'u': '#e59bff',
    'U': '#3b1d6e', 'E': '#d95b16',
}

try:
    import bpy
    import bmesh
    from mathutils import Vector
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False

_mats = {}
_ink = None


def srgb(h):
    h = h.lstrip('#')
    out = []
    for i in (0, 2, 4):
        v = int(h[i:i + 2], 16) / 255.0
        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return out


def mat(color_or_key, rough=0.32, emit=0.0, metal=0.10, alpha=1.0):
    """Shared glossy-but-soft material from a PAL key or hex string."""
    hex_color = PAL.get(color_or_key, color_or_key)
    key = (hex_color, round(rough, 3), round(emit, 3), round(metal, 3), round(alpha, 3))
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(f'ic_m{len(_mats)}')
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    c = srgb(hex_color)
    b.inputs['Base Color'].default_value = (*c, 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for spec_name in ('Specular IOR Level', 'Specular'):
        if spec_name in b.inputs:
            b.inputs[spec_name].default_value = 0.65
            break
    if 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = 0.25
        b.inputs['Coat Roughness'].default_value = 0.25
    if emit:
        if 'Emission Color' in b.inputs:
            b.inputs['Emission Color'].default_value = (*c, 1.0)
            b.inputs['Emission Strength'].default_value = emit
        elif 'Emission' in b.inputs:
            b.inputs['Emission'].default_value = (*c, 1.0)
    if alpha < 1.0:
        b.inputs['Alpha'].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except (AttributeError, TypeError):
            m.blend_method = 'BLEND'
    _mats[key] = m
    return m


def pal(key, **kw):
    return mat(PAL[key], **kw)


def reset():
    """Empty the scene and configure 128x128 transparent EEVEE icon studio with warm key light and 3/4 camera."""
    sc = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.cameras, bpy.data.lights, bpy.data.curves, bpy.data.materials):
        for d in list(coll):
            if d.users == 0:
                coll.remove(d)
    _mats.clear()
    global _ink
    _ink = None

    try:
        sc.render.engine = 'BLENDER_EEVEE'
    except TypeError:
        sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.render.resolution_x = SIZE
    sc.render.resolution_y = SIZE
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'

    ee = sc.eevee
    for attr, val in (('taa_render_samples', 32), ('use_shadows', True), ('use_gtao', True), ('gtao_distance', 0.35)):
        if hasattr(ee, attr):
            try:
                setattr(ee, attr, val)
            except Exception:
                pass

    world = bpy.data.worlds.get('ic_world') or bpy.data.worlds.new('ic_world')
    sc.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = (0.86, 0.89, 0.96, 1.0)
    bg.inputs[1].default_value = 0.75

    # 3/4 view from slightly above (front is -Y, left is -X, right is +X, up is +Z)
    cam = bpy.data.cameras.new('ic_cam')
    cam.type = 'ORTHO'
    cam.sensor_fit = 'HORIZONTAL'
    cam.ortho_scale = 1.4
    cam_ob = bpy.data.objects.new('ic_cam', cam)
    sc.collection.objects.link(cam_ob)
    view_from = Vector((-0.34, -0.88, 0.40)).normalized() * 10.0
    cam_ob.location = view_from
    cam_ob.rotation_euler = (-view_from).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam_ob

    # Warm key light from upper-left-front (matches top-left highlight convention of Icon.tsx)
    key_light = bpy.data.lights.new('ic_key', 'SUN')
    key_light.energy = 3.8
    key_light.angle = math.radians(18)
    key_light.color = (1.0, 0.95, 0.85)
    key_ob = bpy.data.objects.new('ic_key', key_light)
    sc.collection.objects.link(key_ob)
    key_ob.rotation_euler = (-Vector((-0.75, -0.85, 1.15))).to_track_quat('-Z', 'Y').to_euler()

    # Soft cool fill from right-front so dark faces stay rich and legible at 24px
    fill_light = bpy.data.lights.new('ic_fill', 'SUN')
    fill_light.energy = 1.25
    fill_light.angle = math.radians(25)
    fill_light.color = (0.80, 0.88, 1.0)
    fill_light.use_shadow = False
    fill_ob = bpy.data.objects.new('ic_fill', fill_light)
    sc.collection.objects.link(fill_ob)
    fill_ob.rotation_euler = (-Vector((0.85, -0.55, 0.25))).to_track_quat('-Z', 'Y').to_euler()

    # Subtle top-back rim light for glossy silhouette pop
    rim_light = bpy.data.lights.new('ic_rim', 'SUN')
    rim_light.energy = 0.9
    rim_light.angle = math.radians(22)
    rim_light.color = (1.0, 0.96, 0.90)
    rim_light.use_shadow = False
    rim_ob = bpy.data.objects.new('ic_rim', rim_light)
    sc.collection.objects.link(rim_ob)
    rim_ob.rotation_euler = (-Vector((0.25, 0.85, 0.95))).to_track_quat('-Z', 'Y').to_euler()

    return sc


def _link(name, me, material, loc=(0, 0, 0), rot=None, scale=None):
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if material:
        ob.data.materials.append(material)
    ob.location = loc
    if rot is not None:
        ob.rotation_euler = rot
    if scale is not None:
        ob.scale = scale
    return ob


def box(x, y, z, sx, sy, sz, material, name='box', bevel=0.03, rot=None, center_z=False):
    """Chunky box with (x, y) centre, z bottom (or centre if center_z=True), sizes (sx, sy, sz)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz))
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(bevel, min(sx, sy, sz) * 0.32), segments=1, affect='EDGES', clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    zc = z if center_z else (z + sz / 2.0)
    return _link(name, me, material, loc=(x, y, zc), rot=rot)


def cyl(x, y, z, r, h, material, seg=16, name='cyl', bevel=0.02, rot=None, scale=None, center_z=False):
    """Cylinder with (x, y) centre, z bottom (or centre if center_z=True), radius r, height h."""
    zc = z if center_z else (z + h / 2.0)
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=h, location=(x, y, zc))
    ob = bpy.context.active_object
    ob.name = name
    if bevel > 0:
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        cap_edges = [e for e in bm.edges if len(e.link_faces) == 2 and abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-4]
        if cap_edges:
            bmesh.ops.bevel(bm, geom=cap_edges, offset=min(bevel, r * 0.3, h * 0.3), segments=1, affect='EDGES', clamp_overlap=True)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(ob.data)
        bm.free()
    if material:
        ob.data.materials.append(material)
    if rot is not None:
        ob.rotation_euler = rot
    if scale is not None:
        ob.scale = scale
    return ob


def rod(p0, p1, r, material, seg=16, bevel=0.02, name='rod'):
    """Cylinder connecting 3D point p0 to p1 with radius r."""
    v0, v1 = Vector(p0), Vector(p1)
    diff = v1 - v0
    length = max(diff.length, 1e-4)
    mid = (v0 + v1) * 0.5
    rot = diff.to_track_quat('Z', 'Y').to_euler()
    return cyl(mid.x, mid.y, mid.z, r, length, material, seg=seg, name=name, bevel=bevel, rot=rot, center_z=True)


def frustum(p0, p1, r0, r1, material, seg=16, name='frustum'):
    """Cone/frustum connecting 3D point p0 (radius r0) to p1 (radius r1)."""
    v0, v1 = Vector(p0), Vector(p1)
    diff = v1 - v0
    length = max(diff.length, 1e-4)
    mid = (v0 + v1) * 0.5
    rot = diff.to_track_quat('Z', 'Y').to_euler()
    bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r0, radius2=r1, depth=length, location=mid)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = rot
    if material:
        ob.data.materials.append(material)
    return ob


def cone(x, y, z, r, h, material, seg=14, r_top=0.0, name='cone', rot=None, scale=None, center_z=False):
    """Cone/frustum with (x, y) centre, z bottom, bottom radius r, top radius r_top, height h."""
    zc = z if center_z else (z + h / 2.0)
    bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r_top, depth=h, location=(x, y, zc))
    ob = bpy.context.active_object
    ob.name = name
    if material:
        ob.data.materials.append(material)
    if rot is not None:
        ob.rotation_euler = rot
    if scale is not None:
        ob.scale = scale
    return ob


def sphere(x, y, z, r, material, name='sphere', squash=1.0, seg=2, scale=None, rot=None, smooth=False):
    """Low-poly icosphere centred at (x, y, z)."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=seg, radius=r, location=(x, y, z))
    ob = bpy.context.active_object
    ob.name = name
    if scale is not None:
        ob.scale = scale
    else:
        ob.scale = (1.0, 1.0, squash)
    if rot is not None:
        ob.rotation_euler = rot
    if material:
        ob.data.materials.append(material)
    for p in ob.data.polygons:
        p.use_smooth = smooth
    return ob


def torus(x, y, z, r_maj, r_min, material, seg_maj=22, seg_min=12, name='torus', rot=None, scale=None):
    """Torus centred at (x, y, z)."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=r_maj, minor_radius=r_min,
        major_segments=seg_maj, minor_segments=seg_min,
        location=(x, y, z),
    )
    ob = bpy.context.active_object
    ob.name = name
    if material:
        ob.data.materials.append(material)
    if rot is not None:
        ob.rotation_euler = rot
    if scale is not None:
        ob.scale = scale
    return ob


def prism_xz(pts_xz, depth, material, y=0.0, bevel=0.02, dome=0.0, apex=None, name='prism', loc=(0, 0, 0), rot=None):
    """Extrude a 2D polygon in the (X, Z) plane along Y by `depth`.
    If dome > 0, adds a raised front/back center apex for a faceted 3D gem/star/shield/heart look."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n = len(pts_xz)
    y0, y1 = y - depth / 2.0, y + depth / 2.0
    front = [bm.verts.new((px, y0, pz)) for px, pz in pts_xz]
    back = [bm.verts.new((px, y1, pz)) for px, pz in pts_xz]
    for i in range(n):
        bm.faces.new((front[i], front[(i + 1) % n], back[(i + 1) % n], back[i]))
    if dome > 0:
        cx = apex[0] if apex else sum(p[0] for p in pts_xz) / n
        cz = apex[1] if apex else sum(p[1] for p in pts_xz) / n
        fc = bm.verts.new((cx, y0 - dome, cz))
        bc = bm.verts.new((cx, y1 + dome, cz))
        for i in range(n):
            bm.faces.new((fc, front[(i + 1) % n], front[i]))
            bm.faces.new((bc, back[i], back[(i + 1) % n]))
    else:
        bm.faces.new(front[::-1])
        bm.faces.new(back)
        if bevel > 0:
            perim = [e for e in bm.edges if len(e.link_faces) == 2]
            bmesh.ops.bevel(bm, geom=perim, offset=min(bevel, depth * 0.32), segments=1, affect='EDGES', clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    return _link(name, me, material, loc=loc, rot=rot)


def outline_all(width=0.03, color=PAL['o']):
    """Inverted-hull dark ink outline on every mesh (except 'noink*' details)."""
    global _ink
    if _ink is None:
        _ink = bpy.data.materials.new('ic_ink')
        _ink.use_nodes = True
        nt = _ink.node_tree
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs[0].default_value = (*srgb(color), 1.0)
        nt.links.new(em.outputs[0], out.inputs[0])
        _ink.use_backface_culling = True
    for ob in list(bpy.context.scene.objects):
        if ob.type != 'MESH' or ob.name.startswith('noink'):
            continue
        ob.data.materials.append(_ink)
        m = ob.modifiers.new('ink', 'SOLIDIFY')
        m.thickness = width
        m.offset = 1.0
        m.use_flip_normals = True
        m.material_offset = len(ob.data.materials) - 1


def frame_and_outline(fill=0.85):
    """Auto-center the orthographic camera on the mesh bounds and scale so the object + outline fills ~85%."""
    sc = bpy.context.scene
    bpy.context.view_layer.update()
    cam_ob = sc.camera
    rot_mat = cam_ob.matrix_world.to_3x3()
    cam_x = rot_mat @ Vector((1.0, 0.0, 0.0))
    cam_y = rot_mat @ Vector((0.0, 1.0, 0.0))
    cam_z = rot_mat @ Vector((0.0, 0.0, 1.0))

    deps = bpy.context.evaluated_depsgraph_get()
    us, vs, ws = [], [], []
    for ob in sc.objects:
        if ob.type != 'MESH':
            continue
        ev = ob.evaluated_get(deps)
        me = ev.to_mesh()
        mw = ev.matrix_world
        for v in me.vertices:
            p = mw @ v.co
            us.append(p.dot(cam_x))
            vs.append(p.dot(cam_y))
            ws.append(p.dot(cam_z))
        ev.to_mesh_clear()

    if not us:
        return
    u_min, u_max = min(us), max(us)
    v_min, v_max = min(vs), max(vs)
    w_mid = 0.5 * (min(ws) + max(ws))
    span = max(u_max - u_min, v_max - v_min, 0.1)

    ink_w = span * 0.032
    outline_all(width=ink_w, color=PAL['o'])

    total_span = span + 2.2 * ink_w
    cam_ob.data.ortho_scale = total_span / fill
    u_mid = 0.5 * (u_min + u_max)
    v_mid = 0.5 * (v_min + v_max)
    cam_ob.location = cam_x * u_mid + cam_y * v_mid + cam_z * (w_mid + 10.0)


# ==============================================================================
# ICON BUILDERS (First 29 icons of ICONS in apps/web/components/Icon.tsx)
# ==============================================================================

def icon_coin():
    """1. coin: Chunky upright gold coin with raised rim, warm cream glint, and embossed vertical slot."""
    # Coin stands in (X, Z) plane with thickness along Y (camera naturally views from 3/4 front-left-above)
    torus(0, 0, 0, 0.42, 0.095, pal('y', metal=0.26, rough=0.22), seg_maj=28, seg_min=14, rot=(math.radians(90), 0, 0))
    rod((0, -0.075, 0), (0, 0.075, 0), 0.39, pal('Y', metal=0.22, rough=0.30), seg=28, bevel=0.015)
    rod((0, -0.092, 0), (0, 0.092, 0), 0.30, pal('y', metal=0.25, rough=0.25), seg=24, bevel=0.015)
    # Embossed vertical slot in center
    box(0, -0.095, 0, 0.14, 0.04, 0.32, pal('Y', metal=0.20, rough=0.32), bevel=0.015, center_z=True)
    box(0, -0.112, 0, 0.075, 0.03, 0.23, pal('o', rough=0.38), name='noink_slot', bevel=0.01, center_z=True)
    # Top-left cream specular highlight
    sphere(-0.26, -0.09, 0.27, 0.07, pal('w', emit=0.45, rough=0.18), name='noink_glint', scale=(1.2, 0.55, 0.8), rot=(0, math.radians(-40), 0), smooth=True)


def icon_wood():
    """2. wood: Chunky cut timber log showing golden end-grain rings on left and rich brown bark."""
    p0 = Vector((-0.34, 0.0, -0.04))
    p1 = Vector((0.38, 0.0, 0.05))
    axis = (p1 - p0).normalized()
    # Main brown bark log cylinder
    rod(p0, p1, 0.26, pal('n', rough=0.42), seg=16, bevel=0.03)
    # Darker underside & side bark ridges
    rod(p0 + Vector((0.03, 0.03, -0.05)), p1 + Vector((-0.02, 0.03, -0.05)), 0.23, pal('N', rough=0.48), seg=14, bevel=0.02)
    rod(p0 + Vector((0.08, -0.18, -0.08)), p1 + Vector((-0.06, -0.18, -0.08)), 0.075, pal('N', rough=0.46), seg=10, bevel=0.015)
    # Branch stub sticking up-back
    b0 = Vector((0.10, -0.02, 0.14))
    b1 = Vector((0.17, -0.04, 0.34))
    rod(b0, b1, 0.095, pal('n', rough=0.42), seg=12, bevel=0.015)
    rod(b1 - Vector((0, 0, 0.01)), b1 + Vector((0.01, 0, 0.025)), 0.068, pal('y', rough=0.28), seg=12, name='noink_btop', bevel=0.008)
    # Coaxial golden cut end-grain rings on the left cap (p0)
    rod(p0 - axis * 0.025, p0 + axis * 0.02, 0.215, pal('y', rough=0.28), seg=16, name='noink_end1', bevel=0.01)
    rod(p0 - axis * 0.035, p0 + axis * 0.01, 0.135, pal('Y', rough=0.32), seg=14, name='noink_end2', bevel=0.008)
    rod(p0 - axis * 0.044, p0 + axis * 0.005, 0.06, pal('y', rough=0.26), seg=12, name='noink_end3', bevel=0.005)


def icon_ore():
    """3. ore: Chunky grey stone base with bright blue mineral crystal shards jutting out the top."""
    sphere(0.0, 0.04, -0.16, 0.36, pal('s', rough=0.38), seg=1, scale=(1.25, 0.95, 0.65), rot=(0.15, -0.2, 0.3))
    sphere(0.16, -0.04, -0.20, 0.27, pal('S', rough=0.42), seg=1, scale=(1.1, 0.9, 0.62), rot=(-0.2, 0.3, -0.4))
    sphere(-0.18, -0.06, -0.18, 0.25, pal('s', rough=0.36), seg=1, scale=(1.0, 0.85, 0.6), rot=(0.25, 0.1, 0.5))
    sphere(-0.20, -0.18, -0.12, 0.11, pal('w', rough=0.25), name='noink_rockhi', seg=1, scale=(1.1, 0.5, 0.65), rot=(0.2, 0, 0.3))
    cone(-0.08, -0.02, -0.08, 0.19, 0.56, pal('b', rough=0.20, metal=0.15), seg=6, r_top=0.02, rot=(math.radians(-8), math.radians(-14), math.radians(15)))
    cone(0.17, 0.02, -0.10, 0.16, 0.44, pal('B', rough=0.22, metal=0.15), seg=6, r_top=0.02, rot=(math.radians(-6), math.radians(22), math.radians(-20)))
    cone(-0.22, -0.08, -0.12, 0.12, 0.32, pal('B', rough=0.22, metal=0.15), seg=5, r_top=0.015, rot=(math.radians(-14), math.radians(-28), 0))
    box(-0.14, -0.13, 0.12, 0.045, 0.03, 0.20, pal('w', emit=0.4, rough=0.15), name='noink_glint', bevel=0.008, rot=(math.radians(-8), math.radians(-14), math.radians(15)))


def icon_people():
    """4. people: Chunky citizen bust/figure with peach head, dark eyes, and blue tunic."""
    # Round peach head
    sphere(0, 0, 0.27, 0.26, pal('p', rough=0.32), seg=3, scale=(1.06, 0.94, 0.98), smooth=True)
    # Two dark eyes on front face
    sphere(-0.09, -0.23, 0.27, 0.052, pal('o', rough=0.2), name='noink_eyeL', scale=(0.85, 0.5, 1.2), smooth=True)
    sphere(0.09, -0.23, 0.27, 0.052, pal('o', rough=0.2), name='noink_eyeR', scale=(0.85, 0.5, 1.2), smooth=True)
    # Chunky royal-blue tunic & shoulders
    box(0, 0, -0.26, 0.68, 0.36, 0.32, pal('B', rough=0.30), bevel=0.09)
    frustum((0, 0, -0.28), (0, 0, 0.05), 0.34, 0.24, pal('B', rough=0.30), seg=16)
    # Light-blue chest highlight panel
    box(0, -0.14, -0.22, 0.36, 0.12, 0.22, pal('b', rough=0.26), name='noink_bib', bevel=0.035)
    # Two short stubby legs at bottom
    box(-0.15, 0, -0.40, 0.19, 0.24, 0.18, pal('B', rough=0.34), bevel=0.04)
    box(0.15, 0, -0.40, 0.19, 0.24, 0.18, pal('B', rough=0.34), bevel=0.04)


def icon_smile():
    """5. smile: Plump golden-yellow happy face with dark eyes and wide curved smile."""
    # Plump golden cushion disc in (X, Z)
    sphere(0, 0, 0, 0.48, pal('y', rough=0.26, metal=0.12), seg=3, scale=(1.0, 0.52, 1.0), smooth=True)
    # Top-left cream highlight
    sphere(-0.22, -0.21, 0.25, 0.08, pal('w', emit=0.35, rough=0.18), name='noink_glint', scale=(1.25, 0.5, 0.75), rot=(0, math.radians(-35), 0), smooth=True)
    # Two dark oval eyes
    sphere(-0.15, -0.235, 0.11, 0.075, pal('o', rough=0.2), name='noink_eyeL', scale=(0.82, 0.5, 1.25), smooth=True)
    sphere(0.15, -0.235, 0.11, 0.075, pal('o', rough=0.2), name='noink_eyeR', scale=(0.82, 0.5, 1.25), smooth=True)
    # Cheerful curved smile arc made of overlapping dark segments
    pts = [(-0.21, -0.06), (-0.14, -0.15), (-0.05, -0.20), (0.05, -0.20), (0.14, -0.15), (0.21, -0.06)]
    for (x0, z0), (x1, z1) in zip(pts, pts[1:]):
        rod((x0, -0.235, z0), (x1, -0.235, z1), 0.048, pal('o', rough=0.2), seg=10, bevel=0.01, name='noink_smile')
    for x, z in pts:
        sphere(x, -0.235, z, 0.048, pal('o', rough=0.2), name='noink_smile_pt', smooth=True)


def icon_book():
    """6. book: Open twin-toned research tome — left page royal blue with sky-blue lines, right page violet with lavender lines."""
    # Central dark binding spine
    box(0, 0.03, -0.36, 0.11, 0.15, 0.72, pal('o', rough=0.38), bevel=0.025)
    # Left wing (blue B with light blue b bars)
    l_rot = (0, 0, math.radians(10))
    box(-0.23, 0.0, -0.34, 0.42, 0.13, 0.68, pal('B', rough=0.28), bevel=0.03, rot=l_rot)
    for i, zz in enumerate((0.15, 0.0, -0.15)):
        box(-0.22, -0.055, zz, 0.27, 0.045, 0.075, pal('b', emit=0.25, rough=0.22), name=f'noink_bl{i}', bevel=0.012, rot=l_rot, center_z=True)
    # Right wing (purple V with lavender v bars)
    r_rot = (0, 0, math.radians(-10))
    box(0.23, 0.0, -0.34, 0.42, 0.13, 0.68, pal('V', rough=0.28), bevel=0.03, rot=r_rot)
    for i, zz in enumerate((0.15, 0.0, -0.15)):
        box(0.22, -0.055, zz, 0.27, 0.045, 0.075, pal('v', emit=0.25, rough=0.22), name=f'noink_vr{i}', bevel=0.012, rot=r_rot, center_z=True)


def icon_trophy():
    """7. trophy: Chunky golden goblet trophy with side handles, stem, and stepped base."""
    # Stepped pedestal base
    box(0, 0, -0.46, 0.50, 0.36, 0.11, pal('Y', metal=0.25, rough=0.28), bevel=0.025)
    cyl(0, 0, -0.36, 0.21, 0.09, pal('y', metal=0.26, rough=0.24), seg=18, bevel=0.015)
    # Stem and middle collar ring
    frustum((0, 0, -0.28), (0, 0, -0.06), 0.09, 0.07, pal('Y', metal=0.25, rough=0.28), seg=16)
    torus(0, 0, -0.14, 0.10, 0.038, pal('y', metal=0.28, rough=0.22), seg_maj=18, seg_min=10)
    # Flared golden cup bowl
    frustum((0, 0, -0.08), (0, 0, 0.12), 0.10, 0.30, pal('Y', metal=0.25, rough=0.26), seg=20)
    frustum((0, 0, 0.10), (0, 0, 0.36), 0.29, 0.38, pal('y', metal=0.28, rough=0.22), seg=20)
    torus(0, 0, 0.36, 0.37, 0.048, pal('y', metal=0.28, rough=0.20), seg_maj=22, seg_min=10)
    cyl(0, 0, 0.33, 0.31, 0.05, pal('Y', metal=0.2, rough=0.38), seg=18, name='noink_cup_in')
    # Bold side handles
    torus(-0.33, 0, 0.19, 0.13, 0.045, pal('y', metal=0.26, rough=0.24), seg_maj=16, seg_min=10, rot=(math.radians(90), 0, 0))
    torus(0.33, 0, 0.19, 0.13, 0.045, pal('Y', metal=0.25, rough=0.26), seg_maj=16, seg_min=10, rot=(math.radians(90), 0, 0))
    # Bright cream highlight strip on left of cup
    rod((-0.17, -0.25, 0.02), (-0.23, -0.32, 0.28), 0.045, pal('w', emit=0.4, rough=0.18), seg=10, name='noink_glint')


def icon_shield():
    """8. shield: Knight heater shield split vertically in sky-blue (left) and royal-blue (right)."""
    left_pts = [(0.01, 0.44), (-0.38, 0.39), (-0.40, 0.06), (-0.27, -0.23), (0.01, -0.46)]
    right_pts = [(-0.01, 0.44), (-0.01, -0.46), (0.27, -0.23), (0.40, 0.06), (0.38, 0.39)]
    prism_xz(left_pts, 0.16, pal('b', rough=0.24, metal=0.15), bevel=0.025, dome=0.06, apex=(-0.12, 0.05))
    prism_xz(right_pts, 0.16, pal('B', rough=0.26, metal=0.15), bevel=0.025, dome=0.06, apex=(0.12, 0.05))
    # Central vertical spine ridge & top rim accent
    rod((0, -0.09, -0.44), (0, -0.11, 0.43), 0.042, pal('B', rough=0.25, metal=0.2), seg=10, name='noink_ridge')
    # Top-left cream highlight bar
    rod((-0.24, -0.11, 0.10), (-0.24, -0.11, 0.28), 0.048, pal('w', emit=0.35, rough=0.18), seg=10, name='noink_glint')


def _sword_piece(p_hilt, p_tip, y_off, flip=False):
    """Helper for one broadsword from p_hilt to p_tip."""
    v0 = Vector((p_hilt[0], y_off, p_hilt[1]))
    v1 = Vector((p_tip[0], y_off, p_tip[1]))
    axis = (v1 - v0).normalized()
    perp = Vector((-axis.z, 0, axis.x))
    guard_c = v0 + axis * 0.24
    tip_base = v1 - axis * 0.16
    # Pommel & brown wooden grip
    sphere(v0.x, v0.y, v0.z, 0.065, pal('N', rough=0.38), seg=2, smooth=True)
    rod(v0, guard_c, 0.048, pal('n', rough=0.40), seg=10, bevel=0.01)
    # Chunky crossguard
    rod(guard_c - perp * 0.16, guard_c + perp * 0.16, 0.052, pal('n', rough=0.36), seg=10, bevel=0.015)
    # Steel blade body + pointed tip
    blade_mat = pal('S' if flip else 's', metal=0.28, rough=0.22)
    frustum(guard_c + axis * 0.02, tip_base, 0.085, 0.075, blade_mat, seg=4)
    frustum(tip_base, v1, 0.075, 0.008, pal('s', metal=0.30, rough=0.20), seg=4)
    # Bright blade fuller glint
    rod(guard_c + axis * 0.10 + Vector((0, -0.04, 0)), tip_base - axis * 0.04 + Vector((0, -0.04, 0)), 0.025, pal('w', emit=0.3, rough=0.18), seg=8, name='noink_fuller')


def icon_swords():
    """9. swords: Two crossed steel broadswords with brown wooden hilts at bottom-left and bottom-right."""
    _sword_piece((-0.34, -0.34), (0.36, 0.38), -0.045, flip=False)
    _sword_piece((0.34, -0.34), (-0.36, 0.38), 0.045, flip=True)


def icon_city():
    """10. city: Blue twin-tower city skyline with glowing golden windows."""
    # Base street slab
    box(0, 0, -0.44, 0.90, 0.34, 0.10, pal('B', rough=0.32), bevel=0.02)
    # Left shorter tower
    box(-0.25, 0, -0.36, 0.30, 0.28, 0.54, pal('B', rough=0.28), bevel=0.025)
    box(-0.27, -0.03, -0.34, 0.16, 0.24, 0.50, pal('b', rough=0.24), name='noink_lt_hi', bevel=0.02)
    box(-0.25, 0, 0.16, 0.20, 0.20, 0.11, pal('b', rough=0.26), bevel=0.02)
    # Middle connecting hall
    box(0.0, 0.02, -0.36, 0.24, 0.24, 0.36, pal('B', rough=0.30), bevel=0.02)
    box(0.0, -0.02, -0.10, 0.18, 0.22, 0.12, pal('b', rough=0.26), name='noink_mid_hi', bevel=0.015)
    # Right taller tower
    box(0.24, 0, -0.36, 0.32, 0.30, 0.74, pal('B', rough=0.28), bevel=0.025)
    box(0.21, -0.03, -0.34, 0.18, 0.26, 0.70, pal('b', rough=0.24), name='noink_rt_hi', bevel=0.02)
    box(0.24, 0, 0.36, 0.20, 0.20, 0.12, pal('B', rough=0.28), bevel=0.02)
    # Warm glowing golden windows on left and right towers
    box(-0.25, -0.14, -0.14, 0.10, 0.04, 0.12, pal('y', emit=0.8, rough=0.2), name='noink_win1', bevel=0.01)
    box(0.24, -0.15, -0.14, 0.10, 0.04, 0.12, pal('y', emit=0.8, rough=0.2), name='noink_win2', bevel=0.01)
    box(0.24, -0.15, 0.08, 0.10, 0.04, 0.12, pal('y', emit=0.8, rough=0.2), name='noink_win3', bevel=0.01)


def icon_bag():
    """11. bag: Plump tied golden coin pouch with cinched neck and ruffled top crest."""
    # Plump golden belly
    sphere(0, 0, -0.10, 0.38, pal('y', rough=0.28, metal=0.15), seg=3, scale=(1.06, 0.84, 0.92), smooth=True)
    # Darker gold lower shading lobe
    sphere(0.05, 0.02, -0.18, 0.34, pal('Y', rough=0.34, metal=0.15), name='noink_bag_sh', seg=3, scale=(1.02, 0.80, 0.72), smooth=True)
    # Cinched cord tie at neck
    torus(0, 0, 0.19, 0.16, 0.052, pal('Y', rough=0.35, metal=0.2), seg_maj=18, seg_min=10)
    # Flared ruffled pouch top
    frustum((0, 0, 0.19), (0, 0, 0.38), 0.13, 0.24, pal('y', rough=0.28, metal=0.15), seg=12)
    sphere(-0.11, 0, 0.37, 0.085, pal('y', rough=0.28, metal=0.15), seg=2, smooth=True)
    sphere(0.11, 0, 0.37, 0.085, pal('Y', rough=0.30, metal=0.15), seg=2, smooth=True)
    # Vertical front crease & upper-left cream highlight
    rod((0, -0.31, -0.16), (0, -0.29, 0.08), 0.032, pal('Y', rough=0.38), seg=8, name='noink_crease')
    sphere(-0.18, -0.27, 0.02, 0.075, pal('w', emit=0.35, rough=0.18), name='noink_glint', scale=(0.8, 0.5, 1.3), rot=(0, math.radians(-20), 0), smooth=True)


def icon_hammer():
    """12. hammer: Heavy beveled steel mallet head on a sturdy brown wooden shaft."""
    # Wooden handle shaft
    rod((0, 0, -0.44), (0, 0, 0.38), 0.095, pal('n', rough=0.40), seg=14, bevel=0.015)
    rod((0.02, 0.02, -0.44), (0.02, 0.02, 0.05), 0.085, pal('N', rough=0.45), seg=12, name='noink_grip', bevel=0.01)
    # Collar below head
    cyl(0, 0, 0.0, 0.13, 0.07, pal('S', metal=0.25, rough=0.32), seg=14, bevel=0.015)
    # Heavy steel hammer head block + octagonal striking faces
    box(0, 0, 0.05, 0.64, 0.32, 0.30, pal('s', metal=0.28, rough=0.24), bevel=0.045)
    box(0.14, 0.02, 0.04, 0.38, 0.30, 0.28, pal('S', metal=0.28, rough=0.28), name='noink_hsh', bevel=0.04)
    rod((-0.38, 0, 0.20), (-0.28, 0, 0.20), 0.15, pal('s', metal=0.30, rough=0.22), seg=8, bevel=0.02)
    rod((0.28, 0, 0.20), (0.38, 0, 0.20), 0.15, pal('S', metal=0.28, rough=0.26), seg=8, bevel=0.02)
    # Bright cream highlight bar on upper-left of steel head
    box(-0.18, -0.15, 0.22, 0.22, 0.04, 0.07, pal('w', emit=0.35, rough=0.18), name='noink_glint', bevel=0.015)


# Ordered table of icon builders (first 29 of Icon.tsx ICONS)
ICONS = {
    'coin': icon_coin,
    'wood': icon_wood,
    'ore': icon_ore,
    'people': icon_people,
    'smile': icon_smile,
    'book': icon_book,
    'trophy': icon_trophy,
    'shield': icon_shield,
    'swords': icon_swords,
    'city': icon_city,
    'bag': icon_bag,
    'hammer': icon_hammer,
}


def _load_extra():
    """More icons live in icons_<x>.py next to this file (each defines ICONS = {name: fn} and imports the
    helpers with `from icons import ...`), so several people can add icons at once without touching this file."""
    import importlib
    if HERE not in sys.path:
        sys.path.insert(0, HERE)
    sys.modules.setdefault('icons', sys.modules[__name__])  # run as a script: share this module, do not reload it
    for f in sorted(os.listdir(HERE)):
        if f.startswith('icons_') and f.endswith('.py'):
            ICONS.update(importlib.import_module(f[:-3]).ICONS)


_load_extra()


def render_icons(names=None):
    """Render requested icons (or all in ICONS) to tools/blender/out/ui/<name>.png."""
    os.makedirs(OUT_DIR, exist_ok=True)
    target = names or list(ICONS.keys())
    done = []
    for name in target:
        if name not in ICONS:
            print(f'SKIP unknown icon: {name}', flush=True)
            continue
        reset()
        ICONS[name]()
        frame_and_outline(fill=0.85)
        out_path = os.path.join(OUT_DIR, f'{name}.png')
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        done.append(name)
        print(f'OK ui/{name} -> {out_path}', flush=True)
    return done


def install(names=None):
    """Convert rendered PNGs in out/ui/ to WebP q95 in apps/web/public/art/ui/ and write icons.json."""
    from PIL import Image
    os.makedirs(UI_ART_DIR, exist_ok=True)
    if not os.path.isdir(OUT_DIR):
        print('No out/ui directory found', flush=True)
        return []
    available_pngs = sorted(
        f[:-4] for f in os.listdir(OUT_DIR)
        if f.endswith('.png') and not f.startswith('_')
    )
    target = [n for n in (names or available_pngs) if os.path.exists(os.path.join(OUT_DIR, f'{n}.png'))]
    for name in target:
        src = os.path.join(OUT_DIR, f'{name}.png')
        dst = os.path.join(UI_ART_DIR, f'{name}.webp')
        im = Image.open(src).convert('RGBA')
        if im.size != (SIZE, SIZE):
            im = im.resize((SIZE, SIZE), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=95, alpha_quality=100, method=6)

    # Write icons.json with all installed .webp icons (ordered by ICONS first, then any extras)
    installed_set = {
        f[:-5] for f in os.listdir(UI_ART_DIR)
        if f.endswith('.webp') and not f.startswith('_')
    }
    ordered = [k for k in ICONS if k in installed_set] + sorted(installed_set - set(ICONS))
    manifest_path = os.path.join(UI_ART_DIR, 'icons.json')
    with open(manifest_path, 'w') as f:
        json.dump(ordered, f, indent=2)
        f.write('\n')
    print(f'INSTALLED {len(target)} icons ({len(ordered)} total in {manifest_path})', flush=True)
    return ordered


def make_sheet(names=None):
    """Create contact sheet at out/ui/_sheet.png showing each icon at 128px AND downscaled to 24px."""
    from PIL import Image, ImageDraw
    os.makedirs(OUT_DIR, exist_ok=True)
    target = names or [k for k in ICONS if os.path.exists(os.path.join(OUT_DIR, f'{k}.png'))]
    if not target:
        return None
    cols = 6
    rows = (len(target) + cols - 1) // cols
    cw, ch = 184, 164
    sh = Image.new('RGBA', (cols * cw, rows * ch), (29, 36, 50, 255))  # matches --slab (#1d2432)
    draw = ImageDraw.Draw(sh)
    for idx, name in enumerate(target):
        p = os.path.join(OUT_DIR, f'{name}.png')
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGBA')
        x0, y0 = (idx % cols) * cw, (idx // cols) * ch
        # Dark well card backdrop
        draw.rectangle([x0 + 6, y0 + 6, x0 + cw - 6, y0 + ch - 24], fill=(20, 26, 38, 255), outline=(18, 21, 29, 255))
        # 128x128 full size on the left
        sh.alpha_composite(im, (x0 + 8, y0 + 8))
        # 24x24 actual UI size on the right (both on dark #141a26 and mid #2a3446 chips)
        im24 = im.resize((24, 24), Image.LANCZOS)
        draw.rectangle([x0 + 142, y0 + 16, x0 + 172, y0 + 46], fill=(20, 26, 38, 255), outline=(58, 70, 94, 255))
        sh.alpha_composite(im24, (x0 + 145, y0 + 19))
        draw.rectangle([x0 + 142, y0 + 54, x0 + 172, y0 + 84], fill=(42, 52, 70, 255), outline=(58, 70, 94, 255))
        sh.alpha_composite(im24, (x0 + 145, y0 + 57))
        # Also 2x zoomed view of the 24px icon (nearest-neighbor 48x48) to inspect pixel readability
        im24_zoom = im24.resize((48, 48), Image.NEAREST)
        sh.alpha_composite(im24_zoom, (x0 + 130, y0 + 88))
        draw.text((x0 + 10, y0 + ch - 18), f'{idx + 1}. {name}', fill=(239, 228, 201, 255))

    sheet_path = os.path.join(OUT_DIR, f'_sheet_{target[0]}.png' if names else '_sheet.png')
    sh.save(sheet_path)
    print(f'SHEET: {sheet_path}', flush=True)
    return sheet_path


if __name__ == '__main__':
    if IN_BLENDER:
        cli_args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    else:
        cli_args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    names_arg = [a for a in cli_args if not a.startswith('-')] or None
    if IN_BLENDER:
        render_icons(names_arg)
        try:
            install(names_arg)
            make_sheet()
        except Exception as e:
            print(f'Note: post-render python step in blender: {e}', flush=True)
    else:
        install(names_arg)
        make_sheet(names_arg)
