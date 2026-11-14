"""Extra Blender 3D icons (module icons_b.py) for the Metropolix game UI."""
import math
from icons import pal, box, cyl, rod, frustum, cone, sphere, torus, prism_xz


def icon_chart():
    """chart: Ascending 4-bar demand chart (blue, green, sky-blue, red) on a dark L-shaped axis frame."""
    # Dark slate L-axis frame (vertical left post + horizontal bottom base)
    box(-0.42, 0.0, -0.44, 0.11, 0.28, 0.88, pal('S', metal=0.22, rough=0.34), bevel=0.025)
    box(0.02, 0.0, -0.44, 0.96, 0.30, 0.12, pal('S', metal=0.22, rough=0.34), bevel=0.025)
    box(0.02, -0.02, -0.43, 0.90, 0.26, 0.08, pal('k', rough=0.38), name='noink_axis_dk', bevel=0.015)

    # Bar 1 (leftmost, short blue)
    box(-0.27, 0.0, -0.33, 0.16, 0.24, 0.28, pal('b', rough=0.25), bevel=0.025)
    box(-0.25, 0.01, -0.33, 0.11, 0.22, 0.20, pal('B', rough=0.30), name='noink_b1_sh', bevel=0.02)

    # Bar 2 (medium-short green)
    box(-0.08, 0.0, -0.33, 0.16, 0.24, 0.45, pal('g', rough=0.25), bevel=0.025)
    box(-0.06, 0.01, -0.33, 0.11, 0.22, 0.34, pal('G', rough=0.30), name='noink_b2_sh', bevel=0.02)

    # Bar 3 (medium-tall sky-blue)
    box(0.11, 0.0, -0.33, 0.16, 0.24, 0.62, pal('b', rough=0.24), bevel=0.025)
    box(0.13, 0.01, -0.33, 0.11, 0.22, 0.46, pal('B', rough=0.30), name='noink_b3_sh', bevel=0.02)

    # Bar 4 (rightmost, tallest coral-red with deep red shade and cream glint)
    box(0.30, 0.0, -0.33, 0.17, 0.24, 0.80, pal('r', rough=0.24), bevel=0.025)
    box(0.32, 0.01, -0.33, 0.12, 0.22, 0.62, pal('R', rough=0.30), name='noink_b4_sh', bevel=0.02)
    box(0.26, -0.11, 0.32, 0.055, 0.04, 0.14, pal('w', emit=0.38, rough=0.18), name='noink_glint', bevel=0.012, center_z=True)


def icon_flame():
    """flame: Plump blazing fire icon with coral-red outer tongues, golden-yellow inner flame, and cream hot core."""
    # Outer flame silhouette polygon with 3 bold licking tips
    pts = [
        (0.0, -0.45),
        (-0.25, -0.39),
        (-0.39, -0.20),
        (-0.41, 0.02),
        (-0.35, 0.24),
        (-0.19, 0.08),
        (-0.13, 0.30),
        (-0.01, 0.48),
        (0.13, 0.26),
        (0.19, 0.08),
        (0.34, 0.22),
        (0.41, 0.00),
        (0.37, -0.22),
        (0.24, -0.39),
    ]
    # Main red outer flame (front face at y=-0.09, apex at y=-0.14)
    prism_xz(pts, 0.18, pal('r', rough=0.22, emit=0.10), dome=0.05, apex=(-0.02, -0.08))
    # Darker red 3D rim/side shade slightly behind and right (no front-face clipping)
    prism_xz(pts, 0.16, pal('R', rough=0.28), loc=(0.03, 0.03, -0.02), dome=0.03, apex=(0.0, -0.08), name='noink_r_sh')

    # Golden-yellow inner flame tongue cleanly in front (front perimeter y=-0.15, apex y=-0.19)
    inner_pts = [
        (0.0, -0.37),
        (-0.19, -0.28),
        (-0.23, -0.08),
        (-0.14, 0.12),
        (-0.01, 0.26),
        (0.12, 0.10),
        (0.21, -0.08),
        (0.17, -0.28),
    ]
    prism_xz(inner_pts, 0.06, pal('y', emit=0.45, rough=0.18), y=-0.12, dome=0.04, apex=(-0.01, -0.10), name='noink_inner')

    # Bright cream hot core cleanly in front of yellow tongue (front perimeter y=-0.19, apex y=-0.22)
    core_pts = [
        (0.0, -0.30),
        (-0.10, -0.22),
        (-0.11, -0.07),
        (-0.01, 0.08),
        (0.09, -0.07),
        (0.09, -0.22),
    ]
    prism_xz(core_pts, 0.04, pal('w', emit=0.75, rough=0.14), y=-0.17, dome=0.03, apex=(0.0, -0.13), name='noink_core')


def icon_heart():
    """heart: Plump glossy coral-red 3D heart with deep-red lower-right shading and top-left cream glint."""
    pts = [
        (0.0, 0.19),
        (-0.10, 0.35),
        (-0.24, 0.41),
        (-0.38, 0.34),
        (-0.45, 0.17),
        (-0.42, -0.03),
        (-0.29, -0.22),
        (-0.14, -0.36),
        (0.0, -0.46),
        (0.14, -0.36),
        (0.29, -0.22),
        (0.42, -0.03),
        (0.45, 0.17),
        (0.38, 0.34),
        (0.24, 0.41),
        (0.10, 0.35),
    ]
    prism_xz(pts, 0.22, pal('r', rough=0.22), dome=0.10, apex=(-0.04, 0.05))
    # Darker crimson 3D side/bottom rim behind the main dome so front facets stay 100% clean
    prism_xz(pts, 0.20, pal('R', rough=0.28), loc=(0.035, 0.03, -0.025), dome=0.06, apex=(0.0, 0.04), name='noink_shR')
    # Bright cream highlight bar on upper-left lobe
    rod((-0.27, -0.15, 0.06), (-0.22, -0.15, 0.24), 0.058, pal('w', emit=0.45, rough=0.16), seg=12, name='noink_glint')


def icon_ram():
    """ram: Heavy siege battering ram with steel ram snout on left, brown timber log on right, and 3 wheels."""
    # Heavy horizontal brown timber log body on right
    rod((-0.10, 0.0, 0.06), (0.44, 0.0, 0.06), 0.21, pal('n', rough=0.38), seg=16, bevel=0.025)
    rod((-0.08, 0.02, 0.00), (0.42, 0.02, 0.00), 0.19, pal('N', rough=0.45), seg=14, name='noink_log_sh', bevel=0.02)
    # Dark iron reinforcing bands around timber
    torus(0.10, 0.0, 0.06, 0.20, 0.035, pal('N', rough=0.42), seg_maj=18, seg_min=10, rot=(0, math.radians(90), 0))
    torus(0.30, 0.0, 0.06, 0.20, 0.035, pal('N', rough=0.42), seg_maj=18, seg_min=10, rot=(0, math.radians(90), 0))

    # Chunky steel battering head on the left
    rod((-0.34, 0.0, 0.06), (-0.08, 0.0, 0.06), 0.26, pal('s', metal=0.30, rough=0.22), seg=14, bevel=0.03)
    frustum((-0.47, 0.0, 0.06), (-0.31, 0.0, 0.06), 0.16, 0.26, pal('s', metal=0.32, rough=0.20), seg=14)
    rod((-0.33, 0.02, 0.00), (-0.09, 0.02, 0.00), 0.24, pal('S', metal=0.28, rough=0.28), seg=12, name='noink_head_sh', bevel=0.02)
    # Top-left cream glint on steel head
    rod((-0.34, -0.20, 0.20), (-0.15, -0.20, 0.20), 0.045, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_glint')

    # Three sturdy carriage wheels along the bottom
    for i, wx in enumerate((-0.26, 0.04, 0.32)):
        cyl(wx, 0.0, -0.23, 0.115, 0.14, pal('N', rough=0.42), seg=14, bevel=0.02, rot=(math.radians(90), 0, 0), center_z=True)
        cyl(wx, -0.065, -0.23, 0.055, 0.04, pal('s', metal=0.28, rough=0.24), seg=12, name=f'noink_hub{i}', bevel=0.01, rot=(math.radians(90), 0, 0), center_z=True)


def icon_crown():
    """crown: Chunky golden royal crown with 3 bold front peaks, darker gold base rim, and red & blue gems."""
    # Main golden crown body with 3 bold peaks and deep V-notches
    pts = [
        (-0.40, -0.32),
        (-0.45, 0.28),
        (-0.21, -0.02),
        (0.0, 0.35),
        (0.21, -0.02),
        (0.45, 0.28),
        (0.40, -0.32),
    ]
    prism_xz(pts, 0.28, pal('y', metal=0.28, rough=0.22), bevel=0.035)
    # Darker gold right-side shading on front wall
    box(0.22, -0.01, -0.26, 0.36, 0.25, 0.22, pal('Y', metal=0.25, rough=0.28), name='noink_cr_sh', bevel=0.025)
    # Darker gold base rim along the bottom
    box(0.0, 0.0, -0.36, 0.86, 0.32, 0.15, pal('Y', metal=0.26, rough=0.28), bevel=0.03)
    # Golden pearl tips atop the 3 peaks
    for px, pz in ((-0.43, 0.30), (0.0, 0.37), (0.43, 0.30)):
        sphere(px, 0.0, pz, 0.078, pal('y', metal=0.30, rough=0.20), seg=2, smooth=True)
    # Ruby (left) and sapphire (right) jewels set prominently into the front band
    sphere(-0.16, -0.15, -0.09, 0.095, pal('r', emit=0.32, rough=0.16), name='noink_gem_r', seg=2, scale=(1.05, 0.55, 1.15), smooth=True)
    sphere(0.16, -0.15, -0.09, 0.095, pal('b', emit=0.32, rough=0.16), name='noink_gem_b', seg=2, scale=(1.05, 0.55, 1.15), smooth=True)
    # Top-left cream highlight on left peak
    rod((-0.38, -0.15, -0.06), (-0.41, -0.15, 0.21), 0.045, pal('w', emit=0.42, rough=0.18), seg=10, name='noink_glint')


def icon_star():
    """star: Plump 5-pointed faceted golden XP star with warm top-left cream glint."""
    pts = []
    for i in range(10):
        ang = math.radians(90 + i * 36)
        r = 0.48 if i % 2 == 0 else 0.21
        pts.append((-r * math.cos(ang), r * math.sin(ang)))
    prism_xz(pts, 0.18, pal('y', metal=0.28, rough=0.20), dome=0.11, apex=(-0.02, -0.02))
    prism_xz(pts, 0.16, pal('Y', metal=0.26, rough=0.28), loc=(0.025, 0.025, -0.02), dome=0.07, apex=(0.0, -0.02), name='noink_star_sh')
    # Top-left cream highlight along upper-left ray
    rod((-0.26, -0.13, 0.11), (-0.07, -0.15, 0.26), 0.042, pal('w', emit=0.45, rough=0.16), seg=10, name='noink_glint')


def icon_food():
    """food: Plump golden-crust baked bread loaf with toasted brown base and diagonal cream score slashes."""
    # Toasted golden-brown bottom crust base
    cyl(0.0, 0.0, -0.30, 0.40, 0.22, pal('Y', rough=0.34), seg=22, bevel=0.05, scale=(1.15, 0.82, 1.0))
    # Plump golden upper loaf dome
    sphere(0.0, 0.0, -0.04, 0.41, pal('y', rough=0.26), seg=3, scale=(1.16, 0.84, 0.78), smooth=True)
    # Darker golden-brown lower-right shading
    sphere(0.05, 0.02, -0.11, 0.38, pal('Y', rough=0.34), name='noink_loaf_sh', seg=3, scale=(1.12, 0.80, 0.64), smooth=True)
    # Three diagonal cream baker's score marks across the top crust
    rod((-0.24, -0.22, 0.12), (-0.11, -0.13, 0.24), 0.048, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_sc1')
    rod((-0.03, -0.26, 0.14), (0.10, -0.16, 0.26), 0.048, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_sc2')
    rod((0.17, -0.22, 0.10), (0.28, -0.13, 0.21), 0.044, pal('w', emit=0.36, rough=0.18), seg=10, name='noink_sc3')


def icon_moonleaf():
    """moonleaf: Diagonal botanical leaf split into luminous pale-mint upper-left half and deep-green lower-right half."""
    # Upper-left mint half (m)
    ul_pts = [
        (-0.24, -0.24),
        (-0.32, -0.02),
        (-0.24, 0.21),
        (-0.03, 0.37),
        (0.21, 0.43),
        (0.43, 0.43),
    ]
    # Lower-right forest-green half (G)
    lr_pts = [
        (-0.24, -0.24),
        (0.43, 0.43),
        (0.39, 0.18),
        (0.27, -0.07),
        (0.06, -0.24),
        (-0.12, -0.29),
    ]
    prism_xz(ul_pts, 0.16, pal('m', rough=0.22, emit=0.18), dome=0.07, apex=(-0.05, 0.18))
    prism_xz(lr_pts, 0.16, pal('G', rough=0.28), dome=0.07, apex=(0.14, 0.01))
    # Sturdy curved green stem at bottom-left
    rod((-0.43, 0.0, -0.41), (-0.20, 0.0, -0.20), 0.068, pal('G', rough=0.30), seg=12, bevel=0.015)
    # Central midrib vein in bright green (g) + top-left cream glint
    rod((-0.22, -0.09, -0.22), (0.37, -0.09, 0.37), 0.038, pal('g', rough=0.24), seg=10, name='noink_vein')
    rod((-0.15, -0.11, 0.14), (0.07, -0.11, 0.30), 0.042, pal('w', emit=0.40, rough=0.16), seg=10, name='noink_glint')


def icon_spice():
    """spice: Plump crimson-red spice jar with vertical dark-red fluting, cream shoulder glint, and brown cork."""
    # Flat jar base in deep red
    cyl(0.0, 0.0, -0.41, 0.32, 0.14, pal('R', rough=0.30), seg=20, bevel=0.03)
    # Plump crimson-red belly
    sphere(0.0, 0.0, -0.11, 0.38, pal('r', rough=0.24), seg=3, scale=(1.08, 0.86, 0.88), smooth=True)
    # Deep red lower/right shading + vertical fluted ribs
    sphere(0.04, 0.02, -0.18, 0.35, pal('R', rough=0.30), name='noink_jar_sh', seg=3, scale=(1.04, 0.82, 0.70), smooth=True)
    for rx in (-0.13, 0.0, 0.13):
        rod((rx, -0.31, -0.33), (rx, -0.30, -0.06), 0.040, pal('R', rough=0.30), seg=10, name=f'noink_rib_{rx}')
    # Red jar neck rim
    cyl(0.0, 0.0, 0.14, 0.20, 0.11, pal('r', rough=0.24), seg=18, bevel=0.025)
    # Chunky brown wooden cork stopper at the top
    frustum((0.0, 0.0, 0.22), (0.0, 0.0, 0.42), 0.14, 0.20, pal('n', rough=0.38), seg=16)
    cyl(0.0, 0.0, 0.36, 0.205, 0.06, pal('N', rough=0.42), seg=16, name='noink_cork_sh', bevel=0.015)
    # Upper-left cream highlight on shoulder
    sphere(-0.18, -0.28, 0.02, 0.078, pal('w', emit=0.42, rough=0.16), name='noink_glint', scale=(0.85, 0.50, 1.30), rot=(0, math.radians(-22), 0), smooth=True)


def icon_hides():
    """hides: Stretched brown leather animal pelt with 4 corner limb tabs and tan hide markings."""
    pts = [
        (0.0, 0.27),
        (-0.18, 0.30),
        (-0.34, 0.44),
        (-0.45, 0.35),
        (-0.32, 0.18),
        (-0.30, 0.0),
        (-0.32, -0.18),
        (-0.45, -0.35),
        (-0.34, -0.44),
        (-0.18, -0.30),
        (0.0, -0.27),
        (0.18, -0.30),
        (0.34, -0.44),
        (0.45, -0.35),
        (0.32, -0.18),
        (0.30, 0.0),
        (0.32, 0.18),
        (0.45, 0.35),
        (0.34, 0.44),
        (0.18, 0.30),
    ]
    prism_xz(pts, 0.18, pal('n', rough=0.36), bevel=0.03)
    prism_xz(pts, 0.16, pal('N', rough=0.42), loc=(0.03, 0.025, -0.02), bevel=0.02, name='noink_hide_sh')
    # Tan/fawn (P and p) hide spots across the front leather face
    spots = [
        (-0.08, 0.14, 0.085, 'P'),
        (-0.16, -0.04, 0.075, 'p'),
        (0.12, 0.04, 0.090, 'P'),
        (-0.04, -0.15, 0.080, 'P'),
        (0.16, -0.16, 0.070, 'p'),
    ]
    for i, (sx, sz, sr, col) in enumerate(spots):
        cyl(sx, -0.08, sz, sr, 0.04, pal(col, rough=0.28), seg=12, name=f'noink_spot{i}', bevel=0.01, rot=(math.radians(90), 0, 0), center_z=True)


def icon_emberstone():
    """emberstone: Glowing faceted volcanic ember crystal split in fiery orange (upper-left), golden vein, and deep crimson (lower-right)."""
    # Left/upper fiery orange crystal half (e)
    left_pts = [
        (0.0, 0.46),
        (-0.23, 0.32),
        (-0.37, 0.06),
        (-0.34, -0.20),
        (-0.17, -0.40),
        (0.0, -0.45),
    ]
    # Right/lower deep crimson ember half (R)
    right_pts = [
        (0.0, 0.46),
        (0.0, -0.45),
        (0.19, -0.40),
        (0.35, -0.20),
        (0.37, 0.06),
        (0.23, 0.32),
    ]
    prism_xz(left_pts, 0.22, pal('e', rough=0.20, emit=0.22), dome=0.10, apex=(-0.11, 0.04))
    prism_xz(right_pts, 0.22, pal('R', rough=0.26, emit=0.06), dome=0.10, apex=(0.11, -0.04))
    # Central vertical crystal ridge & glowing golden-yellow (y) + cream (w) magma vein on upper-left facet
    rod((0.0, -0.12, -0.42), (0.0, -0.12, 0.43), 0.038, pal('E', rough=0.24, emit=0.12), seg=10, name='noink_ridge')
    rod((-0.17, -0.16, -0.05), (-0.09, -0.16, 0.27), 0.055, pal('y', emit=0.55, rough=0.16), seg=10, name='noink_vein')
    rod((-0.20, -0.18, 0.02), (-0.14, -0.18, 0.21), 0.036, pal('w', emit=0.70, rough=0.14), seg=10, name='noink_glint')


def icon_gears():
    """gears: Chunky 8-tooth steel cogwheel with recessed inner rim, dark axle bore, and bright top-left glint."""
    # Main steel cogwheel disc
    cyl(0.0, 0.0, 0.0, 0.34, 0.20, pal('s', metal=0.30, rough=0.22), seg=24, bevel=0.03, rot=(math.radians(90), 0, 0), center_z=True)
    # Darker steel shading on lower-right
    cyl(0.03, 0.01, -0.03, 0.33, 0.18, pal('S', metal=0.28, rough=0.28), seg=24, name='noink_gear_sh', bevel=0.025, rot=(math.radians(90), 0, 0), center_z=True)
    # 8 bold chunky gear teeth around perimeter
    for i in range(8):
        ang = math.radians(22.5 + i * 45.0)
        tx = 0.37 * math.cos(ang)
        tz = 0.37 * math.sin(ang)
        is_dark = (tx - tz) > 0.05
        t_mat = pal('S' if is_dark else 's', metal=0.30, rough=0.24)
        box(tx, 0.0, tz, 0.15, 0.19, 0.15, t_mat, bevel=0.025, rot=(0, -ang, 0), center_z=True)
    # Raised inner collar ring and dark center axle bore
    cyl(0.0, -0.02, 0.0, 0.21, 0.22, pal('S', metal=0.26, rough=0.28), seg=20, name='noink_collar', bevel=0.02, rot=(math.radians(90), 0, 0), center_z=True)
    cyl(0.0, -0.04, 0.0, 0.115, 0.24, pal('o', rough=0.38), seg=18, name='noink_bore', bevel=0.01, rot=(math.radians(90), 0, 0), center_z=True)
    # Upper-left cream highlight bar
    rod((-0.24, -0.11, 0.12), (-0.12, -0.11, 0.24), 0.042, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_glint')


def icon_scale():
    """scale: Golden merchant balance scale with stepped base, central pillar, wide crossbar, and twin hanging pans."""
    # Stepped golden base at bottom
    box(0.0, 0.0, -0.45, 0.48, 0.30, 0.11, pal('Y', metal=0.26, rough=0.28), bevel=0.025)
    cyl(0.0, 0.0, -0.35, 0.18, 0.09, pal('y', metal=0.28, rough=0.24), seg=18, bevel=0.02)
    # Central vertical pillar + top finial sphere
    rod((0.0, 0.0, -0.28), (0.0, 0.0, 0.36), 0.068, pal('Y', metal=0.26, rough=0.26), seg=14, bevel=0.015)
    sphere(0.0, 0.0, 0.40, 0.085, pal('y', metal=0.30, rough=0.20), seg=2, smooth=True)
    # Wide horizontal golden balance beam near the top
    box(0.0, 0.0, 0.23, 0.88, 0.14, 0.10, pal('y', metal=0.28, rough=0.22), bevel=0.025)
    rod((-0.36, -0.08, 0.28), (-0.12, -0.08, 0.28), 0.035, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_glint')
    # Left and right hanging scale pans
    for side, px in ((-1, -0.34), (1, 0.34)):
        sphere(px, 0.0, 0.28, 0.065, pal('y', metal=0.28, rough=0.22), seg=2, smooth=True)
        # Sturdy suspension rod from beam down to pan
        rod((px, 0.0, -0.04), (px, 0.0, 0.25), 0.044, pal('Y', metal=0.25, rough=0.28), seg=10, bevel=0.01)
        # Golden weighing bowl/pan
        pan_mat = pal('y' if side < 0 else 'Y', metal=0.28, rough=0.23)
        frustum((px, 0.0, -0.15), (px, 0.0, -0.02), 0.10, 0.19, pan_mat, seg=16)
        torus(px, 0.0, -0.03, 0.18, 0.034, pal('y', metal=0.30, rough=0.20), seg_maj=18, seg_min=10)


def icon_box():
    """box: Sturdy brown wooden crate with overhanging top lid, cream lid highlight strip, and golden front clasp."""
    # Main wooden crate body
    box(0.0, 0.0, -0.42, 0.80, 0.50, 0.56, pal('n', rough=0.38), bevel=0.035)
    # Darker brown right and bottom shading
    box(0.18, 0.01, -0.42, 0.42, 0.48, 0.54, pal('N', rough=0.44), name='noink_box_sh', bevel=0.03)
    box(0.0, -0.01, -0.42, 0.78, 0.48, 0.12, pal('N', rough=0.45), name='noink_box_bot', bevel=0.02)
    # Dark brown shadow seam under lid
    box(0.0, -0.01, 0.08, 0.80, 0.50, 0.08, pal('N', rough=0.46), name='noink_seam', bevel=0.015)
    # Overhanging wooden top lid
    box(0.0, 0.0, 0.14, 0.86, 0.54, 0.22, pal('n', rough=0.36), bevel=0.035)
    box(0.20, 0.01, 0.14, 0.44, 0.52, 0.20, pal('N', rough=0.42), name='noink_lid_sh', bevel=0.025)
    # Cream highlight strip across upper-left of lid
    box(-0.05, -0.26, 0.21, 0.56, 0.04, 0.075, pal('w', emit=0.38, rough=0.18), name='noink_glint', bevel=0.015)
    # Central dark-bordered golden clasp on front face
    box(0.0, -0.245, -0.18, 0.24, 0.04, 0.24, pal('o', rough=0.38), name='noink_lock_bg', bevel=0.02)
    box(0.0, -0.26, -0.14, 0.16, 0.05, 0.16, pal('y', metal=0.28, rough=0.20, emit=0.15), name='noink_lock_gold', bevel=0.02)


ICONS = {
    'chart': icon_chart,
    'flame': icon_flame,
    'heart': icon_heart,
    'ram': icon_ram,
    'crown': icon_crown,
    'star': icon_star,
    'food': icon_food,
    'moonleaf': icon_moonleaf,
    'spice': icon_spice,
    'hides': icon_hides,
    'emberstone': icon_emberstone,
    'gears': icon_gears,
    'scale': icon_scale,
    'box': icon_box,
}
