"""Blender 3D bust portraits of the five peoples for Metropolix (480x560 PNG -> WebP q92).

Sources (source-driven-development):
- Species colours, racial features & tools: tools/blender/people.py & apps/web/lib/citizens.ts
- Backdrop gradients, silhouettes & hero motifs: apps/web/components/ArcPortrait.tsx
- Architectural silhouettes & palettes: tools/blender/styles/{elf,lizard,caveman,dragon,goblin}.py
- Materials & inverted-hull ink outline: tools/blender/kit.py

Run in Blender (one or more arcs, or all five):
  blender -b --factory-startup -P tools/blender/portraits.py -- [arc ...]
Install WebP q92 to apps/web/public/art/portrait/<arc>.webp:
  python3 tools/blender/portraits.py [arc ...]
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

OUT_DIR = os.path.join(HERE, 'out', 'portrait')
WEB_DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'art', 'portrait'))
ARCS = ('elf', 'lizard', 'caveman', 'dragon', 'goblin')

W = 480
H = 560

try:
    import bpy
    import bmesh
    from mathutils import Euler, Matrix, Vector
    import kit
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False


def srgb(h):
    h = h.lstrip('#')
    out = []
    for i in (0, 2, 4):
        v = int(h[i:i + 2], 16) / 255.0
        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return out


def shade(hex_col, d):
    n = int(hex_col.lstrip('#'), 16)
    cl = lambda v: max(0, min(255, int(round(v))))
    r = cl((n >> 16) + d)
    g = cl(((n >> 8) & 255) + d)
    b = cl((n & 255) + d)
    return f'#{r:02x}{g:02x}{b:02x}'


_p_mats = {}


def pmat(hex_color, rough=0.42, emit=0.0, metal=0.05, alpha=1.0, coat=0.18, subsurf=0.0):
    """Rich portrait material with specular sheen and optional coat/subsurface."""
    key = (hex_color, round(rough, 3), round(emit, 3), round(metal, 3), round(alpha, 3), round(coat, 2), round(subsurf, 2))
    if key in _p_mats:
        return _p_mats[key]
    m = bpy.data.materials.new(f'pm_{len(_p_mats)}')
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    c = srgb(hex_color)
    b.inputs['Base Color'].default_value = (*c, 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for spec_name in ('Specular IOR Level', 'Specular'):
        if spec_name in b.inputs:
            b.inputs[spec_name].default_value = 0.58
            break
    if coat > 0 and 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.28
    if subsurf > 0 and 'Subsurface Weight' in b.inputs:
        b.inputs['Subsurface Weight'].default_value = subsurf
    if emit > 0:
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
    _p_mats[key] = m
    return m


def grad_mat(stops, radial=False, center=(0.5, 0.22), radius=0.88):
    """Unlit backdrop gradient material matching SVG linearGradient/radialGradient in ArcPortrait.tsx.
    stops: list of (pos_0_to_1, hex_color). For linear, pos=0 is TOP of frame and pos=1 is BOTTOM.
    For radial, pos=0 is center and pos=1 is outer radius.
    """
    m = bpy.data.materials.new(f'grad_{len(_p_mats)}')
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)

    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = 1.0
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    tc = nt.nodes.new('ShaderNodeTexCoord')

    cr = ramp.color_ramp
    cr.interpolation = 'EASE'
    while len(cr.elements) > 1:
        cr.elements.remove(cr.elements[-1])
    for idx, (pos, col) in enumerate(stops):
        el = cr.elements[0] if idx == 0 else cr.elements.new(pos)
        el.position = pos
        el.color = (*srgb(col), 1.0)

    if not radial:
        sep = nt.nodes.new('ShaderNodeSeparateXYZ')
        inv = nt.nodes.new('ShaderNodeMath')
        inv.operation = 'SUBTRACT'
        inv.inputs[0].default_value = 1.0
        nt.links.new(tc.outputs['Generated'], sep.inputs['Vector'])
        # Generated Z on vertical plane runs 0 (bottom) to 1 (top); invert so 0=top, 1=bottom like SVG
        nt.links.new(sep.outputs['Z'], inv.inputs[1])
        nt.links.new(inv.outputs['Value'], ramp.inputs['Fac'])
    else:
        # Radial distance in Generated (X, Z) plane around center=(cx, cz)
        sep = nt.nodes.new('ShaderNodeSeparateXYZ')
        dx = nt.nodes.new('ShaderNodeMath')
        dx.operation = 'SUBTRACT'
        dx.inputs[1].default_value = center[0]
        dz = nt.nodes.new('ShaderNodeMath')
        dz.operation = 'SUBTRACT'
        dz.inputs[1].default_value = center[1]
        dx2 = nt.nodes.new('ShaderNodeMath')
        dx2.operation = 'MULTIPLY'
        dz2 = nt.nodes.new('ShaderNodeMath')
        dz2.operation = 'MULTIPLY'
        add = nt.nodes.new('ShaderNodeMath')
        add.operation = 'ADD'
        sq = nt.nodes.new('ShaderNodeMath')
        sq.operation = 'SQRT'
        div = nt.nodes.new('ShaderNodeMath')
        div.operation = 'DIVIDE'
        div.inputs[1].default_value = radius

        nt.links.new(tc.outputs['Generated'], sep.inputs['Vector'])
        nt.links.new(sep.outputs['X'], dx.inputs[0])
        nt.links.new(sep.outputs['Z'], dz.inputs[0])
        nt.links.new(dx.outputs[0], dx2.inputs[0])
        nt.links.new(dx.outputs[0], dx2.inputs[1])
        nt.links.new(dz.outputs[0], dz2.inputs[0])
        nt.links.new(dz.outputs[0], dz2.inputs[1])
        nt.links.new(dx2.outputs[0], add.inputs[0])
        nt.links.new(dz2.outputs[0], add.inputs[1])
        nt.links.new(add.outputs[0], sq.inputs[0])
        nt.links.new(sq.outputs[0], div.inputs[0])
        nt.links.new(div.outputs[0], ramp.inputs['Fac'])

    nt.links.new(ramp.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    return m


def setup_portrait_scene(rim_hex='#88ffcc', key_hex='#fff2d6', fill_hex='#9ab8ff', ambient_hex='#202838'):
    """Reset scene for a 480x560 portrait with perspective low-angle camera, DoF, warm key & rim light."""
    sc = kit.reset()
    _p_mats.clear()
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)

    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.film_transparent = False

    ee = sc.eevee
    for attr, val in (
        ('taa_render_samples', 48),
        ('use_shadows', True),
        ('use_gtao', True),
        ('gtao_distance', 0.45),
    ):
        if hasattr(ee, attr):
            try:
                setattr(ee, attr, val)
            except Exception:
                pass

    world = sc.world
    bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = (*srgb(ambient_hex), 1.0)
    bg.inputs[1].default_value = 0.45

    # Perspective camera slightly below eye level looking slightly up so the hero looks proud
    cam = bpy.data.cameras.new('p_cam')
    cam.type = 'PERSP'
    cam.lens = 54.0
    cam.sensor_width = 36.0
    cam.sensor_fit = 'HORIZONTAL'
    if hasattr(cam, 'dof'):
        cam.dof.use_dof = True
        cam.dof.focus_distance = 4.45
        cam.dof.aperture_fstop = 1.4
    cam_ob = bpy.data.objects.new('p_cam', cam)
    sc.collection.objects.link(cam_ob)
    cam_ob.location = Vector((0.0, -4.55, -0.36))
    direction = Vector((0.0, 0.0, -0.14)) - cam_ob.location
    cam_ob.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam_ob

    # 1. Warm key light from top-left-front
    key_l = bpy.data.lights.new('p_key', 'SUN')
    key_l.energy = 3.6
    key_l.angle = math.radians(16)
    key_l.color = srgb(key_hex)
    key_ob = bpy.data.objects.new('p_key', key_l)
    sc.collection.objects.link(key_ob)
    key_ob.rotation_euler = (-Vector((-0.85, -0.95, 1.05))).to_track_quat('-Z', 'Y').to_euler()

    # 2. Soft fill light from front-right so shadow side stays rich and readable
    fill_l = bpy.data.lights.new('p_fill', 'SUN')
    fill_l.energy = 1.15
    fill_l.angle = math.radians(30)
    fill_l.color = srgb(fill_hex)
    fill_l.use_shadow = False
    fill_ob = bpy.data.objects.new('p_fill', fill_l)
    sc.collection.objects.link(fill_ob)
    fill_ob.rotation_euler = (-Vector((0.90, -0.70, 0.20))).to_track_quat('-Z', 'Y').to_euler()

    # 3. Soft rim light from behind-top to carve out hair/horns/shoulders against the backdrop
    rim_l = bpy.data.lights.new('p_rim', 'SUN')
    rim_l.energy = 2.6
    rim_l.angle = math.radians(22)
    rim_l.color = srgb(rim_hex)
    rim_l.use_shadow = False
    rim_ob = bpy.data.objects.new('p_rim', rim_l)
    sc.collection.objects.link(rim_ob)
    rim_ob.rotation_euler = (-Vector((0.35, 0.90, 0.65))).to_track_quat('-Z', 'Y').to_euler()

    # 4. Secondary left-back rim light for opposite ear/horn/shoulder edge
    rim2_l = bpy.data.lights.new('p_rim2', 'SUN')
    rim2_l.energy = 1.6
    rim2_l.angle = math.radians(25)
    rim2_l.color = srgb(rim_hex)
    rim2_l.use_shadow = False
    rim2_ob = bpy.data.objects.new('p_rim2', rim2_l)
    sc.collection.objects.link(rim2_ob)
    rim2_ob.rotation_euler = (-Vector((-0.75, 0.80, 0.45))).to_track_quat('-Z', 'Y').to_euler()

    return sc


class Frame:
    """Coordinate frame (pivot + Euler rotation) that places smooth, scale-baked meshes in world space."""
    def __init__(self, origin=(0.0, 0.0, 0.0), rot=(0.0, 0.0, 0.0), parent=None):
        self.origin = Vector(origin)
        self.rot = Euler(rot, 'XYZ')
        self.parent = parent

    def matrix(self):
        m = Matrix.Translation(self.origin) @ self.rot.to_matrix().to_4x4()
        if self.parent is not None:
            return self.parent.matrix() @ m
        return m

    def _finish(self, me, mat_obj, loc, rot, name, smooth=True):
        if smooth:
            for p in me.polygons:
                p.use_smooth = True
        ob = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(ob)
        if mat_obj:
            ob.data.materials.append(mat_obj)
        local_m = Matrix.Translation(Vector(loc))
        if rot is not None:
            local_m = local_m @ Euler(rot, 'XYZ').to_matrix().to_4x4()
        world_m = self.matrix() @ local_m
        ob.matrix_world = world_m
        return ob

    def sphere(self, x, y, z, rx, ry=None, rz=None, mat_obj=None, name='sph', rot=None, sub=3, smooth=True):
        if ry is None:
            ry = rx
        if rz is None:
            rz = rx
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0)
        for v in bm.verts:
            v.co = Vector((v.co.x * rx, v.co.y * ry, v.co.z * rz))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
        return self._finish(me, mat_obj, (x, y, z), rot, name, smooth=smooth)

    def box(self, x, y, z, sx, sy, sz, mat_obj=None, name='box', bevel=0.04, rot=None, center_z=True, smooth=True):
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        dz = 0.0 if center_z else sz * 0.5
        for v in bm.verts:
            v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz + dz))
        if bevel > 0:
            bv = min(bevel, min(sx, sy, sz) * 0.35)
            bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bv, segments=2, affect='EDGES', clamp_overlap=True)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
        return self._finish(me, mat_obj, (x, y, z), rot, name, smooth=smooth)

    def cone(self, x, y, z, r1, r2, h, mat_obj=None, name='cone', rot=None, seg=24, sx=1.0, sy=1.0, center_z=False, smooth=True):
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h)
        dz = 0.0 if center_z else h * 0.5
        for v in bm.verts:
            v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z + dz))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
        return self._finish(me, mat_obj, (x, y, z), rot, name, smooth=smooth)

    def cyl(self, x, y, z, r, h, mat_obj=None, name='cyl', rot=None, seg=24, sx=1.0, sy=1.0, bevel=0.02, center_z=False, smooth=True):
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=h)
        dz = 0.0 if center_z else h * 0.5
        for v in bm.verts:
            v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z + dz))
        if bevel > 0:
            cap_edges = [e for e in bm.edges if len(e.link_faces) == 2 and abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-4]
            if cap_edges:
                bmesh.ops.bevel(bm, geom=cap_edges, offset=min(bevel, r * min(sx, sy) * 0.3, h * 0.3), segments=2, affect='EDGES', clamp_overlap=True)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
        return self._finish(me, mat_obj, (x, y, z), rot, name, smooth=smooth)


def add_sky_plane(mat_obj, y=5.8, w=8.2, h=9.6):
    """Vertical backdrop plane filling the camera frustum at depth y."""
    f = Frame()
    f.box(0.0, y, -0.25, w, 0.04, h, mat_obj=mat_obj, name='noink_bg_sky', bevel=0.0, smooth=False)


def build_eyes(head, x_sep, y_front, z_eye, rx, rz, sclera_hex, iris_hex, pupil_hex='#101218',
               slit=False, brow_mat=None, liner_mat=None, brow_tilt=0.12, brow_thick=0.048,
               gaze_x=-0.018, gaze_z=0.008, eye_emit=0.35):
    """Construct expressive 3D eyes with upper/lower lids, iris, pupil, specular catchlights, and brows."""
    m_sclera = pmat(sclera_hex, rough=0.18, emit=0.18)
    m_iris = pmat(iris_hex, rough=0.15, emit=eye_emit)
    m_pupil = pmat(pupil_hex, rough=0.1, emit=0.0)
    m_glint = pmat('#ffffff', rough=0.05, emit=1.6)
    m_liner = liner_mat or pmat('#14161e', rough=0.6)

    for s in (-1, 1):
        ex = s * x_sep
        # Dark upper eyelid / lash arch for crisp definition at 120x140
        head.sphere(ex, y_front + 0.015, z_eye + rz * 0.18, rx * 1.14, 0.075, rz * 1.05,
                    mat_obj=m_liner, name='noink_eyelid')
        # Sclera
        head.sphere(ex, y_front, z_eye, rx, 0.068, rz, mat_obj=m_sclera, name='noink_sclera')
        # Iris shifted slightly along gaze direction (toward viewer)
        ix = ex + gaze_x
        iz = z_eye + gaze_z
        head.sphere(ix, y_front - 0.036, iz, rx * 0.68, 0.042, rz * 0.82, mat_obj=m_iris, name='noink_iris')
        # Pupil (vertical slit for reptiles/dragons, round for humanoids)
        if slit:
            head.sphere(ix, y_front - 0.056, iz, rx * 0.19, 0.028, rz * 0.78, mat_obj=m_pupil, name='noink_pupil')
        else:
            head.sphere(ix, y_front - 0.056, iz, rx * 0.36, 0.028, rz * 0.48, mat_obj=m_pupil, name='noink_pupil')
        # Dual catchlight glints (upper-left primary + lower-right secondary)
        head.sphere(ix - rx * 0.24, y_front - 0.072, iz + rz * 0.28,
                    rx * 0.19, 0.018, rx * 0.19, mat_obj=m_glint, name='noink_catch1', sub=2)
        head.sphere(ix + rx * 0.20, y_front - 0.068, iz - rz * 0.22,
                    rx * 0.10, 0.015, rx * 0.10, mat_obj=m_glint, name='noink_catch2', sub=2)

        if brow_mat is not None:
            head.box(ex, y_front - 0.02, z_eye + rz + brow_thick * 0.65,
                     rx * 2.25, 0.11, brow_thick, mat_obj=brow_mat, name='brow',
                     bevel=brow_thick * 0.4, rot=(0.0, s * brow_tilt, -s * 0.08))


# ==============================================================================
# 1. ELF PORTRAIT
# ==============================================================================
def build_elf():
    """High/Wood Elf guardian portrait: emerald forest & white-spire backdrop, long silver-gold hair,
    swept pointed ears, emerald-set golden circlet, leaf-clasp forest cloak, and carved recurve bow."""
    setup_portrait_scene(rim_hex='#a8ffca', key_hex='#fff5df', fill_hex='#8cd8b8', ambient_hex='#0f2c1a')

    # --- Backdrop (ArcPortrait.tsx Elf gradient: #10351f -> #1e6a3a -> #0c2a18) ---
    add_sky_plane(grad_mat([(0.0, '#10351f'), (0.58, '#1e6a3a'), (1.0, '#0c2a18')], radial=False))
    bg = Frame()
    m_hill = pmat('#12361f', rough=0.95, coat=0.0)
    m_hill_far = pmat('#164528', rough=0.95, coat=0.0)
    m_trunk = pmat('#2d2218', rough=0.95, coat=0.0)
    m_pine = pmat('#173f26', rough=0.9, coat=0.0)
    m_pine_dk = pmat('#0d2918', rough=0.9, coat=0.0)
    m_spire = pmat('#205038', rough=0.85, coat=0.0)
    m_spire_roof = pmat('#143b2b', rough=0.8, coat=0.0)
    m_win_glow = pmat('#c9ff8a', rough=0.2, emit=2.8)
    m_moon_glow = pmat('#7ce0f7', rough=0.2, emit=2.2)

    # Soft rolling forest hills behind hero
    bg.sphere(-1.2, 4.8, -2.2, 2.8, 0.5, 1.35, mat_obj=m_hill_far, name='noink_bg_hill1')
    bg.sphere(1.4, 4.4, -2.3, 2.9, 0.5, 1.40, mat_obj=m_hill, name='noink_bg_hill2')

    # Blurred elven sanctuary spires & moon-windows in the forest mist (styles/elf.py motif)
    for sx, sy, sz, sc in ((-1.55, 4.6, -0.35, 0.95), (1.45, 4.7, -0.45, 0.85)):
        bg.cyl(sx, sy, sz - 0.9 * sc, 0.26 * sc, 1.35 * sc, mat_obj=m_spire, name='noink_bg_tower', center_z=False)
        bg.cone(sx, sy, sz + 0.42 * sc, 0.36 * sc, 0.02, 0.95 * sc, mat_obj=m_spire_roof, name='noink_bg_roof', center_z=False)
        bg.sphere(sx, sy - 0.22 * sc, sz + 0.05 * sc, 0.09 * sc, 0.04, 0.13 * sc, mat_obj=m_moon_glow, name='noink_bg_win')

    # Layered pine/ancient forest silhouettes on left and right edges (ArcPortrait.tsx lines 83-85)
    for tx, ty, tz, k in ((-2.05, 4.1, -0.55, 1.15), (-1.15, 4.3, -0.30, 0.85),
                          (1.95, 4.0, -0.45, 1.10), (1.10, 4.4, -0.20, 0.82)):
        bg.cyl(tx, ty, tz - 1.2 * k, 0.11 * k, 1.3 * k, mat_obj=m_trunk, name='noink_bg_trunk')
        bg.cone(tx, ty, tz - 0.25 * k, 0.58 * k, 0.03, 0.95 * k, mat_obj=m_pine, name='noink_bg_pine1')
        bg.cone(tx, ty + 0.05, tz + 0.22 * k, 0.46 * k, 0.02, 0.82 * k, mat_obj=m_pine_dk, name='noink_bg_pine2')

    # Glowing forest fireflies / motes (ArcPortrait.tsx line 86)
    for fx, fy, fz, fr in ((-1.55, 3.3, 0.65, 0.055), (1.35, 3.4, 0.82, 0.050),
                           (1.65, 3.2, 0.12, 0.045), (-1.75, 3.2, -0.05, 0.042),
                           (0.65, 3.6, 1.18, 0.048), (-0.68, 3.5, 1.05, 0.044)):
        bg.sphere(fx, fy, fz, fr, fr, fr, mat_obj=m_win_glow, name='noink_bg_mote', sub=2)

    # --- Hero Materials (ArcPortrait.tsx + people.py Wood/High Elf + SOLDIER_STYLES['elf']) ---
    m_skin = pmat('#f6d8b8', rough=0.42, subsurf=0.18)
    m_skin_sh = pmat('#d9a482', rough=0.48)
    m_lip = pmat('#c6735e', rough=0.38)
    m_hair = pmat('#f2ede0', rough=0.34, coat=0.25)
    m_hair_sh = pmat('#cfd5de', rough=0.38, coat=0.20)
    m_cloak = pmat('#216136', rough=0.52)
    m_cloak_hi = pmat('#35884e', rough=0.48)
    m_tunic = pmat('#ecdcae', rough=0.45)
    m_gold = pmat('#ffd866', rough=0.24, metal=0.78, emit=0.08)
    m_silver = pmat('#d8e2ea', rough=0.26, metal=0.72)
    m_gem = pmat('#5ce690', rough=0.15, emit=0.55)
    m_wood = pmat('#7a522c', rough=0.45)
    m_string = pmat('#f0ead8', rough=0.3, emit=0.25)

    # --- Torso & Shoulders (3/4 turn: angled 22 deg) ---
    torso = Frame(origin=(0.0, 0.0, -0.78), rot=(0.0, 0.0, math.radians(22)))

    # Flowing back hair sheet behind shoulders
    torso.sphere(0.0, 0.24, 0.35, 0.62, 0.30, 0.88, mat_obj=m_hair_sh, name='hair_back_mass')

    # Broad sculpted cloak & chest bust
    torso.sphere(0.0, 0.04, -0.42, 0.92, 0.52, 0.72, mat_obj=m_cloak, name='cloak_body')
    # Sunlit shoulder folds & layered mantle
    for s in (-1, 1):
        torso.sphere(s * 0.58, 0.0, -0.14, 0.42, 0.38, 0.32, mat_obj=m_cloak_hi, name='cloak_shoulder')
        # Elven silver-and-gold leaf pauldrons
        torso.sphere(s * 0.64, -0.02, -0.04, 0.32, 0.28, 0.18, mat_obj=m_silver, name='pauldron',
                     rot=(0.0, s * 0.28, 0.0))
        torso.box(s * 0.62, -0.04, -0.11, 0.52, 0.42, 0.045, mat_obj=m_gold, name='pauldron_trim',
                  bevel=0.015, rot=(0.0, s * 0.32, 0.0))

    # High elven cream-gold silk V-collar & inner tunic (ArcPortrait.tsx line 92)
    torso.cone(0.0, -0.14, -0.35, 0.36, 0.22, 0.56, mat_obj=m_tunic, name='tunic_v', sx=1.0, sy=0.72)
    # Swept green cloak lapels framing the neck
    for s in (-1, 1):
        torso.box(s * 0.25, -0.24, -0.12, 0.20, 0.18, 0.48, mat_obj=m_cloak_hi, name='lapel',
                  bevel=0.05, rot=(0.12, -s * 0.32, s * 0.15))
        torso.box(s * 0.21, -0.31, -0.14, 0.05, 0.08, 0.44, mat_obj=m_gold, name='lapel_trim',
                  bevel=0.015, rot=(0.12, -s * 0.32, s * 0.15))

    # Golden leaf brooch clasp at throat (ArcPortrait.tsx line 95)
    torso.sphere(0.0, -0.36, -0.10, 0.12, 0.06, 0.15, mat_obj=m_gold, name='leaf_clasp', rot=(0.15, 0.0, 0.20))
    torso.sphere(0.0, -0.40, -0.10, 0.065, 0.04, 0.085, mat_obj=m_gem, name='noink_clasp_gem')

    # Graceful neck
    torso.cyl(0.0, -0.04, 0.05, 0.20, 0.48, mat_obj=m_skin, name='neck', sx=0.95, sy=0.90)

    # --- Head (turned slightly back toward camera: 12 deg yaw, proud -4 deg pitch) ---
    head = Frame(origin=(0.0, -0.03, 0.05), rot=(math.radians(-4), 0.0, math.radians(12)))

    # Cranium + tapered elven jaw & chin
    head.sphere(0.0, 0.0, 0.08, 0.42, 0.44, 0.46, mat_obj=m_skin, name='head_cranium')
    head.cone(0.0, -0.06, -0.28, 0.22, 0.38, 0.42, mat_obj=m_skin, name='head_jaw', sx=1.02, sy=0.92)
    head.sphere(0.0, -0.18, -0.26, 0.15, 0.16, 0.12, mat_obj=m_skin, name='head_chin')
    # Subtle cheekbones
    for s in (-1, 1):
        head.sphere(s * 0.26, -0.26, -0.04, 0.15, 0.14, 0.12, mat_obj=m_skin, name='noink_cheek')

    # Sculpted nose bridge & tip
    head.box(0.0, -0.41, 0.0, 0.085, 0.11, 0.22, mat_obj=m_skin, name='noink_nose',
             bevel=0.035, rot=(math.radians(-12), 0.0, 0.0))
    head.sphere(0.0, -0.46, -0.08, 0.062, 0.065, 0.052, mat_obj=m_skin, name='nose_tip')
    # Serene proud lips
    head.box(0.0, -0.41, -0.17, 0.17, 0.07, 0.042, mat_obj=m_lip, name='noink_lips', bevel=0.018)

    # Expressive emerald eyes + silver-ash brows (ArcPortrait.tsx lines 111-114)
    build_eyes(head, x_sep=0.175, y_front=-0.365, z_eye=0.055, rx=0.095, rz=0.068,
               sclera_hex='#eaffd8', iris_hex='#26a648', pupil_hex='#0d2814',
               slit=False, brow_mat=pmat('#7a8494', rough=0.45), brow_tilt=0.09,
               gaze_x=-0.014, gaze_z=0.006, eye_emit=0.38)

    # Long swept-back pointed Elven ears (ArcPortrait.tsx lines 99-101)
    for s in (-1, 1):
        head.cone(s * 0.56, 0.02, 0.08, 0.13, 0.018, 0.54, mat_obj=m_skin, name='elf_ear',
                  sx=0.65, sy=1.1, center_z=True,
                  rot=(math.radians(-18), s * math.radians(64), -s * math.radians(14)))
        head.cone(s * 0.55, -0.02, 0.07, 0.075, 0.012, 0.38, mat_obj=m_skin_sh, name='noink_ear_inner',
                  sx=0.45, sy=0.8, center_z=True,
                  rot=(math.radians(-18), s * math.radians(64), -s * math.radians(14)))

    # Flowing silver-ivory hair crown, parted fringe & long side locks (ArcPortrait.tsx lines 89, 105-106)
    head.sphere(0.0, 0.04, 0.24, 0.46, 0.48, 0.36, mat_obj=m_hair, name='hair_crown')
    for s in (-1, 1):
        # Swept fringe locks across forehead
        head.box(s * 0.19, -0.34, 0.24, 0.26, 0.16, 0.16, mat_obj=m_hair, name='hair_fringe',
                 bevel=0.06, rot=(0.15, s * 0.28, -s * 0.35))
        # Long locks framing cheeks and draping over chest
        head.cone(s * 0.39, -0.10, -0.62, 0.14, 0.05, 0.88, mat_obj=m_hair, name='hair_lock_front',
                  sx=0.82, sy=1.05, rot=(math.radians(182), s * 0.08, 0.0))
        head.cone(s * 0.46, 0.08, -0.55, 0.16, 0.07, 0.82, mat_obj=m_hair_sh, name='hair_lock_side',
                  sx=0.85, sy=1.1, rot=(math.radians(178), s * 0.14, 0.0))

    # Golden Elven Circlet with glowing emerald diamond centerpiece (ArcPortrait.tsx lines 108-109)
    head.cyl(0.0, -0.02, 0.21, 0.445, 0.065, mat_obj=m_gold, name='circlet_band',
             sx=1.01, sy=1.04, bevel=0.015, center_z=True, rot=(math.radians(8), 0.0, 0.0))
    # Diamond emerald setting on forehead
    head.box(0.0, -0.45, 0.25, 0.11, 0.06, 0.15, mat_obj=m_gold, name='circlet_setting',
             bevel=0.015, rot=(0.0, math.radians(45), 0.0))
    head.box(0.0, -0.47, 0.25, 0.075, 0.05, 0.105, mat_obj=m_gem, name='noink_circlet_gem',
             bevel=0.012, rot=(0.0, math.radians(45), 0.0))

    # --- Held Item: Carved Elven Recurve Longbow + Nocked Arrow on Right Side ---
    bow_f = Frame(origin=(0.76, -0.38, -0.18), rot=(math.radians(6), math.radians(-14), math.radians(-16)))
    # Sculpted recurve bow stave (upper + grip + lower limbs + gold recurve tips)
    bow_f.cyl(0.0, 0.0, -0.18, 0.055, 0.36, mat_obj=m_gold, name='bow_grip', bevel=0.01)
    bow_f.cone(0.03, 0.0, 0.16, 0.052, 0.032, 0.62, mat_obj=m_wood, name='bow_upper',
               rot=(0.0, math.radians(12), 0.0))
    bow_f.cone(0.14, 0.0, 0.72, 0.034, 0.018, 0.28, mat_obj=m_gold, name='bow_tip_hi',
               rot=(0.0, math.radians(-18), 0.0))
    bow_f.cone(0.03, 0.0, -0.16, 0.052, 0.032, 0.62, mat_obj=m_wood, name='bow_lower',
               rot=(math.radians(180), math.radians(-12), 0.0))
    bow_f.cone(0.14, 0.0, -0.72, 0.034, 0.018, 0.28, mat_obj=m_gold, name='bow_tip_lo',
               rot=(math.radians(180), math.radians(18), 0.0))
    # Taut glowing bowstring
    bow_f.cyl(0.08, 0.0, -0.92, 0.012, 1.84, mat_obj=m_string, name='noink_bowstring', bevel=0.0)
    # Nocked elven arrow with gleaming emerald-silver broadhead
    bow_f.cyl(-0.08, -0.04, -0.45, 0.018, 1.05, mat_obj=m_wood, name='arrow_shaft',
              rot=(0.0, math.radians(-26), 0.0))
    bow_f.cone(-0.54, -0.04, 0.48, 0.065, 0.008, 0.22, mat_obj=m_gem, name='arrow_head',
               sx=1.2, sy=0.45, rot=(0.0, math.radians(-26), 0.0))
    # Gloved elven hand gripping the bow stave
    bow_f.sphere(-0.01, -0.04, -0.02, 0.11, 0.10, 0.12, mat_obj=m_skin, name='bow_hand')
    bow_f.cyl(0.04, 0.02, -0.38, 0.095, 0.32, mat_obj=m_cloak_hi, name='bow_bracer',
              rot=(0.0, math.radians(18), 0.0))

    # Apply inverted-hull ink outline to hero meshes only (noink_* skipped)
    kit.outline_all(width=0.015, color='#0e1a12')


PORTRAIT_BUILDERS = {
    'elf': build_elf,
}


def render_portraits(target_arcs=None):
    bpy.context.preferences.filepaths.save_version = 0
    os.makedirs(OUT_DIR, exist_ok=True)
    arcs = target_arcs or [a for a in ARCS if a in PORTRAIT_BUILDERS]
    for arc in arcs:
        if arc not in PORTRAIT_BUILDERS:
            continue
        PORTRAIT_BUILDERS[arc]()
        out_png = os.path.join(OUT_DIR, f'{arc}.png')
        kit.render(out_png)
        print(f'RENDERED {out_png} ({W}x{H})', flush=True)


def install_portraits(target_arcs=None):
    """Convert 480x560 PNGs in out/portrait/<arc>.png to WebP q92 in apps/web/public/art/portrait/<arc>.webp
    and save 120x140 readability previews in out/portrait/_120x140_<arc>.png."""
    from PIL import Image
    os.makedirs(WEB_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    arcs = target_arcs or [a for a in ARCS if os.path.exists(os.path.join(OUT_DIR, f'{a}.png'))]
    for arc in arcs:
        src = os.path.join(OUT_DIR, f'{arc}.png')
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert('RGB')
        dst = os.path.join(WEB_DIR, f'{arc}.webp')
        im.save(dst, 'WEBP', quality=92, method=6)
        small = im.resize((120, 140), Image.LANCZOS)
        small_path = os.path.join(OUT_DIR, f'_120x140_{arc}.png')
        small.save(small_path)
        print(f'INSTALLED {dst} (q92) + preview {small_path}', flush=True)


if __name__ == '__main__':
    if IN_BLENDER:
        cli_args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
        target = [a for a in cli_args if not a.startswith('-')] or None
        render_portraits(target)
        install_portraits(target)
    else:
        cli_args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
        target = [a for a in cli_args if not a.startswith('-')] or None
        install_portraits(target)
