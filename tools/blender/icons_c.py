"""Blender 3D icons — module C (scroll, gear, chat, tent, dice, chest, goldtimber,
goblinskull, dragonscale, moonpearl, grimoire, mandrake, ironbark, tankard, phoenixfeather).
"""
import math
from icons import pal, box, cyl, rod, frustum, cone, sphere, torus, prism_xz


def icon_scroll():
    """1. scroll: Rolled cream parchment scroll with three dark ink text lines."""
    # Main parchment sheet body (warm cream front, tan shaded right/back)
    box(0.02, 0.03, -0.30, 0.66, 0.14, 0.60, pal('p', rough=0.32), name='noink_scroll_sh', bevel=0.03)
    box(0.0, 0.0, -0.30, 0.66, 0.14, 0.60, pal('w', rough=0.24), bevel=0.035)
    # Rolled parchment cylinders at top and bottom with golden end caps
    for zz in (0.31, -0.31):
        rod((-0.38, -0.02, zz), (0.38, -0.02, zz), 0.105, pal('p', rough=0.28), seg=16, bevel=0.02)
        rod((-0.36, -0.04, zz + (0.015 if zz > 0 else -0.015)), (0.28, -0.04, zz + (0.015 if zz > 0 else -0.015)), 0.085, pal('w', rough=0.22), seg=14, name=f'noink_roll_hi_{zz}', bevel=0.015)
        rod((-0.44, -0.02, zz), (-0.37, -0.02, zz), 0.065, pal('Y', metal=0.25, rough=0.28), seg=12, bevel=0.015)
        rod((0.37, -0.02, zz), (0.44, -0.02, zz), 0.065, pal('Y', metal=0.25, rough=0.28), seg=12, bevel=0.015)
        rod((-0.39, -0.02, zz), (0.39, -0.02, zz), 0.055, pal('P', rough=0.36), seg=12, name=f'noink_curl_{zz}')
    # Three bold dark charcoal text bars on front face (top, middle full, bottom shorter left)
    box(-0.03, -0.075, 0.14, 0.42, 0.04, 0.075, pal('k', rough=0.30), name='noink_txt1', bevel=0.015, center_z=True)
    box(0.0, -0.075, 0.0, 0.48, 0.04, 0.075, pal('k', rough=0.30), name='noink_txt2', bevel=0.015, center_z=True)
    box(-0.08, -0.075, -0.14, 0.32, 0.04, 0.075, pal('k', rough=0.30), name='noink_txt3', bevel=0.015, center_z=True)
    # Top-left bright glint
    sphere(-0.24, -0.09, 0.34, 0.06, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(1.4, 0.5, 0.7), smooth=True)


def icon_gear():
    """2. gear: Heavy 8-toothed steel cogwheel with recessed dark hub and center bore."""
    # Main steel ring in (X, Z)
    torus(0, 0, 0, 0.28, 0.115, pal('s', metal=0.28, rough=0.22), seg_maj=24, seg_min=14, rot=(math.radians(90), 0, 0))
    torus(0.025, 0.015, -0.025, 0.28, 0.11, pal('S', metal=0.26, rough=0.28), name='noink_gear_sh', seg_maj=24, seg_min=12, rot=(math.radians(90), 0, 0))
    # Recessed inner web disc
    rod((0, -0.065, 0), (0, 0.065, 0), 0.27, pal('S', metal=0.25, rough=0.30), seg=24, bevel=0.015)
    # 8 chunky radial teeth
    for i in range(8):
        ang = math.radians(i * 45.0)
        cx = math.sin(ang) * 0.38
        cz = math.cos(ang) * 0.38
        is_lit = (cx <= 0.05 and cz >= -0.05) or (cz > 0.25)
        t_mat = pal('s' if is_lit else 'S', metal=0.28, rough=0.22 if is_lit else 0.28)
        box(cx, 0, cz, 0.16, 0.18, 0.18, t_mat, name=f'tooth_{i}', bevel=0.025, rot=(0, -ang, 0), center_z=True)
    # Dark central axle hole so bore reads clearly at 24px
    rod((0, -0.10, 0), (0, 0.10, 0), 0.125, pal('o', rough=0.35), seg=18, name='noink_bore', bevel=0.01)
    # Upper-left cream glint
    sphere(-0.22, -0.11, 0.22, 0.065, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(1.2, 0.5, 0.8), rot=(0, math.radians(-40), 0), smooth=True)


def icon_chat():
    """3. chat: Chunky sky-blue speech bubble with royal-blue tail and cream message dots."""
    # Royal-blue lower/right shadow layer
    box(0.03, 0.025, -0.16, 0.84, 0.22, 0.58, pal('B', rough=0.28), name='noink_chat_sh', bevel=0.10)
    # Main sky-blue bubble body
    box(0.0, 0.0, -0.14, 0.84, 0.22, 0.58, pal('b', rough=0.24), bevel=0.10)
    # Speech tail pointing down at bottom center-right
    tail_pts = [(-0.12, -0.10), (0.18, -0.10), (-0.02, -0.42)]
    prism_xz(tail_pts, 0.18, pal('B', rough=0.26), bevel=0.025)
    prism_xz([(-0.10, -0.10), (0.10, -0.10), (-0.02, -0.36)], 0.16, pal('b', rough=0.24), y=-0.02, bevel=0.02, name='noink_tail_hi')
    # Two rows of bright cream message dots/pills on front face (3 on top row, 2 on bottom row)
    for i, xx in enumerate((-0.23, 0.0, 0.23)):
        box(xx, -0.115, 0.24, 0.135, 0.04, 0.105, pal('w', emit=0.42, rough=0.18), name=f'noink_dot_t{i}', bevel=0.025, center_z=True)
    for i, xx in enumerate((-0.23, 0.0)):
        box(xx, -0.115, 0.06, 0.135, 0.04, 0.105, pal('w', emit=0.42, rough=0.18), name=f'noink_dot_b{i}', bevel=0.025, center_z=True)


def icon_tent():
    """4. tent: Golden pitched camp tent with dark triangular entrance flap."""
    # Main A-frame tent body (bright gold left slope, rich dark gold right slope)
    full_pts = [(-0.48, -0.36), (0.48, -0.36), (0.0, 0.42)]
    prism_xz(full_pts, 0.48, pal('Y', rough=0.30), bevel=0.03)
    left_pts = [(-0.48, -0.36), (0.06, -0.36), (0.0, 0.42)]
    prism_xz(left_pts, 0.49, pal('y', rough=0.25), bevel=0.025, name='noink_tent_l')
    # Sturdy base trim & ridge pole finial at apex
    box(0, 0, -0.40, 0.96, 0.50, 0.08, pal('Y', rough=0.32), bevel=0.02)
    rod((0, -0.27, 0.41), (0, 0.27, 0.41), 0.055, pal('y', metal=0.22, rough=0.24), seg=12, bevel=0.015)
    # Dark arched/triangular doorway opening on front face
    door_pts = [(-0.18, -0.38), (0.18, -0.38), (0.0, 0.05)]
    prism_xz(door_pts, 0.08, pal('o', rough=0.38), y=-0.23, bevel=0.015, name='noink_door')
    prism_xz([(-0.12, -0.38), (0.12, -0.38), (0.0, -0.02)], 0.06, pal('k', rough=0.36), y=-0.24, bevel=0.01, name='noink_door_in')
    # Bright cream glint along upper-left slope
    rod((-0.26, -0.25, -0.04), (-0.09, -0.25, 0.26), 0.042, pal('w', emit=0.40, rough=0.18), seg=10, name='noink_glint')


def icon_dice():
    """5. dice: Chunky cream die block with steel-grey shaded edge and 5 dark pips in X pattern."""
    # Single solid beveled die block with cream front/top and steel-grey right/bottom shading
    box(0.0, 0.0, -0.38, 0.76, 0.48, 0.76, pal('w', rough=0.22), bevel=0.085)
    box(0.03, 0.01, -0.39, 0.72, 0.45, 0.72, pal('s', rough=0.28), name='noink_dice_s', bevel=0.07)
    box(0.05, 0.02, -0.40, 0.68, 0.43, 0.68, pal('S', rough=0.32), name='noink_dice_S', bevel=0.06)
    box(-0.02, -0.02, -0.35, 0.68, 0.45, 0.68, pal('w', rough=0.22), name='noink_dice_face', bevel=0.065)
    # 5 bold dark charcoal pips in quincunx (X) layout on front face
    pip_coords = [(-0.18, 0.18), (0.15, 0.18), (-0.015, 0.0), (-0.18, -0.18), (0.15, -0.18)]
    for i, (px, pz) in enumerate(pip_coords):
        sphere(px, -0.245, pz, 0.080, pal('k', rough=0.24), name=f'noink_pip_{i}', scale=(1.0, 0.45, 1.0), smooth=True)


def icon_chest():
    """6. chest: Wooden treasure chest bound with heavy gold trim straps and central golden lock."""
    # Lower wooden chest box (warm brown n with dark brown N lower/right shade)
    box(0.0, 0.0, -0.38, 0.80, 0.46, 0.42, pal('N', rough=0.38), bevel=0.035)
    box(-0.02, -0.02, -0.36, 0.74, 0.44, 0.38, pal('n', rough=0.34), name='noink_chest_nl', bevel=0.03)
    # Domed/beveled upper wooden lid
    box(0.0, 0.0, 0.04, 0.80, 0.46, 0.28, pal('n', rough=0.34), bevel=0.06)
    box(0.12, 0.01, 0.04, 0.52, 0.44, 0.25, pal('N', rough=0.38), name='noink_lid_sh', bevel=0.05)
    # Golden perimeter frame straps (left, right, top lid arch, bottom base rail, middle seam)
    box(-0.33, 0.0, -0.39, 0.16, 0.50, 0.72, pal('y', metal=0.26, rough=0.24), bevel=0.025)
    box(0.33, 0.0, -0.39, 0.16, 0.50, 0.72, pal('Y', metal=0.24, rough=0.28), bevel=0.025)
    box(0.0, 0.0, 0.24, 0.82, 0.50, 0.10, pal('y', metal=0.26, rough=0.24), bevel=0.025)
    box(0.0, 0.0, -0.40, 0.82, 0.50, 0.10, pal('Y', metal=0.24, rough=0.28), bevel=0.025)
    # Dark/gold horizontal seam band between lid and body
    box(0.0, -0.01, 0.0, 0.83, 0.51, 0.08, pal('Y', metal=0.22, rough=0.30), bevel=0.015)
    box(0.0, -0.255, 0.01, 0.52, 0.04, 0.045, pal('o', rough=0.38), name='noink_seam')
    # Prominent central golden lock plate with dark frame and cream glint
    box(0.0, -0.24, -0.14, 0.24, 0.10, 0.26, pal('o', rough=0.38), name='noink_lock_bg', bevel=0.02)
    box(0.0, -0.26, -0.11, 0.18, 0.10, 0.20, pal('y', metal=0.28, rough=0.22), bevel=0.02)
    box(-0.03, -0.305, -0.02, 0.08, 0.03, 0.07, pal('w', emit=0.40, rough=0.18), name='noink_lock_hi', bevel=0.01)
    # Top-left cream glint on lid trim
    box(-0.26, -0.25, 0.25, 0.18, 0.04, 0.06, pal('w', emit=0.42, rough=0.16), name='noink_glint', bevel=0.015)


def icon_goldtimber():
    """7. goldtimber: Enchanted golden-grained timber log with radiant gold end-rings and golden bark veins."""
    # Main timber log cylinder (warm brown n with dark brown N underside)
    rod((-0.34, 0.0, -0.04), (0.38, 0.0, 0.04), 0.26, pal('n', rough=0.38), seg=16, bevel=0.03)
    rod((-0.31, 0.03, -0.09), (0.36, 0.03, -0.01), 0.235, pal('N', rough=0.44), seg=14, name='noink_gt_sh', bevel=0.02)
    # Golden bands/veins inlaid along the timber body
    rod((-0.22, -0.16, 0.04), (0.33, -0.16, 0.12), 0.085, pal('y', metal=0.25, rough=0.24), seg=12, name='noink_vein1', bevel=0.015)
    rod((-0.16, -0.19, -0.09), (0.34, -0.19, -0.01), 0.075, pal('Y', metal=0.24, rough=0.26), seg=12, name='noink_vein2', bevel=0.015)
    rod((-0.10, -0.22, -0.01), (0.28, -0.22, 0.07), 0.045, pal('w', emit=0.38, rough=0.18), seg=10, name='noink_vein_hi', bevel=0.01)
    # Golden branch knot sprouting up-right on top
    rod((0.10, -0.02, 0.14), (0.18, -0.04, 0.36), 0.105, pal('Y', metal=0.24, rough=0.26), seg=12, bevel=0.015)
    rod((0.18, -0.04, 0.345), (0.19, -0.04, 0.385), 0.082, pal('y', metal=0.28, rough=0.20), seg=12, name='noink_btop', bevel=0.01)
    # Radiant golden cut end-grain rings on left face with bright cream heartwood glint
    rod((-0.36, 0.0, -0.042), (-0.29, 0.0, -0.035), 0.265, pal('y', metal=0.28, rough=0.22), seg=16, bevel=0.02)
    rod((-0.372, 0.0, -0.044), (-0.32, 0.0, -0.038), 0.19, pal('Y', metal=0.24, rough=0.28), seg=14, name='noink_end1', bevel=0.01)
    rod((-0.382, 0.0, -0.045), (-0.33, 0.0, -0.039), 0.115, pal('w', emit=0.45, rough=0.16), seg=12, name='noink_end2', bevel=0.008)
    sphere(-0.37, -0.14, 0.06, 0.065, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(0.6, 0.8, 1.3), smooth=True)


def icon_goblinskull():
    """8. goblinskull: Green goblin skull with wide pointed ears, crooked gold crown, dark eyes, and tusks."""
    # Green cranium dome + slate/dark-green right-side shadow
    sphere(0.0, 0.0, 0.02, 0.31, pal('g', rough=0.30), seg=3, scale=(1.08, 0.92, 0.92), smooth=True)
    sphere(0.08, 0.02, 0.0, 0.29, pal('G', rough=0.34), name='noink_sk_sh1', seg=3, scale=(1.0, 0.88, 0.88), smooth=True)
    sphere(0.14, 0.03, -0.02, 0.25, pal('S', rough=0.36), name='noink_sk_sh2', seg=2, scale=(0.85, 0.82, 0.85), smooth=True)
    # Mint highlight on upper-left brow
    sphere(-0.14, -0.22, 0.12, 0.11, pal('m', emit=0.25, rough=0.22), name='noink_brow_hi', scale=(1.2, 0.5, 0.8), smooth=True)
    # Wide pointed goblin ears jutting left and right
    frustum((-0.24, 0.0, 0.06), (-0.52, 0.02, 0.14), 0.12, 0.025, pal('g', rough=0.30), seg=8)
    frustum((0.24, 0.0, 0.06), (0.52, 0.02, 0.14), 0.12, 0.025, pal('S', rough=0.34), seg=8)
    rod((-0.26, -0.08, 0.09), (-0.45, -0.05, 0.14), 0.04, pal('m', emit=0.2, rough=0.22), seg=8, name='noink_ear_hi')
    # Narrower lower jaw + two white protruding lower tusks
    box(0.0, -0.04, -0.34, 0.38, 0.34, 0.22, pal('g', rough=0.32), bevel=0.05)
    box(0.06, -0.03, -0.35, 0.26, 0.32, 0.20, pal('G', rough=0.36), name='noink_jaw_sh', bevel=0.04)
    cone(-0.11, -0.21, -0.26, 0.055, 0.15, pal('w', emit=0.25, rough=0.18), seg=8, r_top=0.01, name='noink_tuskL')
    cone(0.11, -0.21, -0.26, 0.055, 0.15, pal('w', emit=0.25, rough=0.18), seg=8, r_top=0.01, name='noink_tuskR')
    # Dark eye sockets and nasal cavity
    sphere(-0.11, -0.27, -0.01, 0.082, pal('o', rough=0.25), name='noink_eyeL', scale=(0.95, 0.45, 1.05), smooth=True)
    sphere(0.11, -0.27, -0.01, 0.082, pal('o', rough=0.25), name='noink_eyeR', scale=(0.95, 0.45, 1.05), smooth=True)
    prism_xz([(-0.045, -0.14), (0.045, -0.14), (0.0, -0.04)], 0.06, pal('k', rough=0.35), y=-0.27, bevel=0.01, name='noink_nose')
    # Crooked golden crown perched on top of skull
    cyl(0.0, 0.0, 0.24, 0.22, 0.11, pal('y', metal=0.28, rough=0.22), seg=14, bevel=0.02)
    cone(-0.09, -0.04, 0.32, 0.09, 0.18, pal('y', metal=0.28, rough=0.22), seg=6, r_top=0.015)
    cone(0.11, 0.0, 0.32, 0.08, 0.15, pal('Y', metal=0.25, rough=0.26), seg=6, r_top=0.015)
    sphere(-0.12, -0.16, 0.36, 0.048, pal('w', emit=0.42, rough=0.16), name='noink_glint', smooth=True)


def icon_dragonscale():
    """9. dragonscale: Layered kite-shaped crimson dragon scale with chevron ribs and warm spine."""
    # Main kite-shaped armored scale (bright red r on left, deep crimson R on right)
    left_pts = [(0.01, 0.46), (-0.30, 0.24), (-0.42, -0.02), (-0.28, -0.28), (0.01, -0.46)]
    right_pts = [(-0.01, 0.46), (-0.01, -0.46), (0.28, -0.28), (0.42, -0.02), (0.30, 0.24)]
    prism_xz(left_pts, 0.16, pal('r', rough=0.24, metal=0.16), bevel=0.025, dome=0.07, apex=(-0.10, 0.0))
    prism_xz(right_pts, 0.16, pal('R', rough=0.28, metal=0.16), bevel=0.025, dome=0.07, apex=(0.10, 0.0))
    # Inner chevron scale plate in warm peach-red (p / r) + dark crimson chevron grooves
    inner_pts = [(0.0, 0.24), (-0.22, -0.02), (0.0, -0.34), (0.22, -0.02)]
    prism_xz(inner_pts, 0.14, pal('p', emit=0.15, rough=0.24), y=-0.03, dome=0.05, apex=(0.0, -0.04), name='noink_scale_in')
    rod((-0.34, -0.10, 0.02), (0.0, -0.14, 0.32), 0.038, pal('R', rough=0.28), seg=10, name='noink_chev1L')
    rod((0.0, -0.14, 0.32), (0.34, -0.10, 0.02), 0.038, pal('R', rough=0.28), seg=10, name='noink_chev1R')
    rod((-0.24, -0.12, -0.14), (0.0, -0.15, 0.10), 0.035, pal('r', rough=0.24), seg=10, name='noink_chev2L')
    rod((0.0, -0.15, 0.10), (0.24, -0.12, -0.14), 0.035, pal('R', rough=0.28), seg=10, name='noink_chev2R')
    # Upper-left cream glint along the outer scale bevel (matches shield & ore convention)
    rod((-0.27, -0.11, 0.08), (-0.11, -0.12, 0.28), 0.046, pal('w', emit=0.45, rough=0.16), seg=10, name='noink_glint')


def icon_moonpearl():
    """10. moonpearl: Iridescent blue-violet moon pearl nestled in a fluted peach-tan oyster shell."""
    # Main iridescent pearl orb (lavender v base, deep purple V shade, sky-blue b & orchid u shimmer)
    sphere(0.0, 0.0, 0.09, 0.33, pal('v', rough=0.18, metal=0.15), seg=3, smooth=True)
    sphere(0.06, 0.02, 0.05, 0.30, pal('V', rough=0.22, metal=0.15), name='noink_pearl_V', seg=3, smooth=True)
    sphere(-0.08, -0.08, 0.14, 0.26, pal('b', emit=0.20, rough=0.16), name='noink_pearl_b', seg=3, smooth=True)
    sphere(-0.02, -0.18, 0.08, 0.18, pal('u', emit=0.25, rough=0.16), name='noink_pearl_u', seg=2, smooth=True)
    # Bright cream moon-glint on upper-left of pearl
    sphere(-0.16, -0.25, 0.24, 0.09, pal('w', emit=0.55, rough=0.12), name='noink_glint', scale=(1.2, 0.55, 0.9), rot=(0, math.radians(-30), 0), smooth=True)
    # Fluted clam/oyster shell cradle at bottom (peach p, warm tan P, brown n grooves)
    frustum((0.0, 0.0, -0.40), (0.0, 0.0, -0.10), 0.22, 0.42, pal('P', rough=0.32), seg=14)
    sphere(-0.32, -0.04, -0.06, 0.11, pal('p', rough=0.28), name='noink_lipL', seg=2, scale=(0.8, 0.9, 1.2), smooth=True)
    sphere(0.32, -0.04, -0.06, 0.11, pal('P', rough=0.32), name='noink_lipR', seg=2, scale=(0.8, 0.9, 1.2), smooth=True)
    # Shell flutes / ribs along front of shell cup
    for i, xx in enumerate((-0.20, -0.07, 0.07, 0.20)):
        c_key = 'p' if xx < 0 else 'P'
        rod((xx * 0.65, -0.22, -0.38), (xx, -0.34, -0.12), 0.052, pal(c_key, rough=0.28), seg=10, name=f'noink_rib_{i}')
    for i, xx in enumerate((-0.13, 0.0, 0.13)):
        rod((xx * 0.65, -0.23, -0.37), (xx, -0.35, -0.14), 0.032, pal('n', rough=0.38), seg=8, name=f'noink_grv_{i}')


def icon_grimoire():
    """11. grimoire: Closed purple arcane tome with glowing orange-gold eye emblem, steel strap, and bottom pages."""
    # Deep indigo back cover & spine + cream page block visible along bottom edge
    box(0.02, 0.03, -0.42, 0.72, 0.26, 0.80, pal('U', rough=0.34), bevel=0.04)
    box(0.03, -0.01, -0.41, 0.64, 0.22, 0.14, pal('w', emit=0.20, rough=0.22), name='noink_pages_w', bevel=0.02)
    box(0.24, -0.01, -0.41, 0.20, 0.22, 0.14, pal('p', rough=0.28), name='noink_pages_p', bevel=0.02)
    # Main royal-purple front cover with light-lavender top/left bevel highlight
    box(0.0, -0.02, -0.30, 0.72, 0.24, 0.68, pal('V', rough=0.28), bevel=0.04)
    box(-0.03, -0.03, -0.26, 0.66, 0.23, 0.64, pal('v', rough=0.24), name='noink_cov_hi', bevel=0.035)
    box(0.02, -0.04, -0.29, 0.64, 0.22, 0.60, pal('V', rough=0.28), name='noink_cov_mid', bevel=0.03)
    # Heavy horizontal steel binding strap across middle + central gold clasp
    box(0.0, -0.02, -0.08, 0.76, 0.28, 0.15, pal('s', metal=0.28, rough=0.22), bevel=0.025)
    box(0.14, -0.02, -0.09, 0.48, 0.28, 0.14, pal('S', metal=0.26, rough=0.28), name='noink_strap_sh', bevel=0.02)
    box(0.0, -0.14, -0.17, 0.22, 0.10, 0.26, pal('o', rough=0.38), name='noink_clasp_bg', bevel=0.02)
    box(0.0, -0.15, -0.14, 0.16, 0.10, 0.20, pal('y', metal=0.28, rough=0.22), bevel=0.02)
    # Glowing orange-gold arcane eye emblem on upper cover with bold dark slit pupil
    sphere(0.0, -0.14, 0.17, 0.16, pal('e', emit=0.35, rough=0.20), name='noink_eye_e', scale=(1.28, 0.35, 0.88), smooth=True)
    sphere(0.0, -0.155, 0.17, 0.115, pal('y', emit=0.45, rough=0.18), name='noink_eye_y', scale=(1.12, 0.35, 0.85), smooth=True)
    sphere(0.0, -0.192, 0.17, 0.062, pal('o', rough=0.20), name='noink_pupil', scale=(0.68, 0.45, 1.25), smooth=True)
    sphere(-0.06, -0.195, 0.21, 0.045, pal('w', emit=0.55, rough=0.14), name='noink_glint', smooth=True)


def icon_mandrake():
    """12. mandrake: Plump screaming tan mandrake root creature with three green leaves on top."""
    # Crown of three lush green leaves sprouting from top of head
    cyl(0.0, 0.0, 0.18, 0.15, 0.08, pal('G', rough=0.34), seg=12, bevel=0.015)
    prism_xz([(-0.06, 0.22), (0.06, 0.22), (0.09, 0.46), (0.0, 0.52), (-0.09, 0.46)], 0.12, pal('g', rough=0.26), bevel=0.02, dome=0.03)
    prism_xz([(-0.08, 0.20), (-0.24, 0.26), (-0.36, 0.42), (-0.22, 0.46), (-0.06, 0.30)], 0.11, pal('g', rough=0.26), bevel=0.02, dome=0.03)
    prism_xz([(0.08, 0.20), (0.06, 0.30), (0.22, 0.46), (0.36, 0.42), (0.24, 0.26)], 0.11, pal('G', rough=0.30), bevel=0.02, dome=0.03)
    # Plump peach/tan root body with warm brown right-side shading
    sphere(0.0, 0.0, -0.02, 0.31, pal('p', rough=0.30), seg=3, scale=(1.02, 0.88, 0.96), smooth=True)
    sphere(0.06, 0.02, -0.05, 0.28, pal('P', rough=0.34), name='noink_md_P', seg=3, scale=(0.98, 0.85, 0.90), smooth=True)
    sphere(0.14, 0.03, -0.06, 0.23, pal('n', rough=0.38), name='noink_md_n', seg=2, scale=(0.82, 0.80, 0.85), smooth=True)
    # Stubby root arms on left and right + forked root legs at bottom
    frustum((-0.24, 0.0, -0.02), (-0.42, 0.0, -0.10), 0.09, 0.04, pal('p', rough=0.32), seg=10)
    frustum((0.24, 0.0, -0.02), (0.42, 0.0, -0.10), 0.09, 0.04, pal('n', rough=0.38), seg=10)
    frustum((-0.12, 0.0, -0.22), (-0.20, 0.0, -0.44), 0.11, 0.045, pal('P', rough=0.34), seg=10)
    frustum((0.12, 0.0, -0.22), (0.20, 0.0, -0.44), 0.11, 0.045, pal('N', rough=0.40), seg=10)
    # Dark eyes and wide-open screaming mouth on front face
    sphere(-0.12, -0.26, 0.09, 0.055, pal('o', rough=0.22), name='noink_eyeL', scale=(0.9, 0.45, 1.1), smooth=True)
    sphere(0.12, -0.26, 0.09, 0.055, pal('o', rough=0.22), name='noink_eyeR', scale=(0.9, 0.45, 1.1), smooth=True)
    sphere(0.0, -0.255, -0.05, 0.13, pal('o', rough=0.35), name='noink_mouth', scale=(1.15, 0.40, 0.88), smooth=True)
    sphere(0.02, -0.265, -0.09, 0.055, pal('P', rough=0.32), name='noink_tongue', scale=(1.0, 0.35, 0.65), smooth=True)


def icon_ironbark():
    """13. ironbark: Upright metallic steel-grey tree trunk with tan heartwood top rings and dark iron bark."""
    tilt = (math.radians(-16), 0, 0)
    # Main rugged metallic trunk cylinder (steel s on left, slate S in middle, dark iron k on right)
    cyl(0.0, 0.0, -0.40, 0.31, 0.70, pal('S', metal=0.28, rough=0.28), seg=16, bevel=0.025, rot=tilt)
    cyl(-0.06, -0.02, -0.39, 0.27, 0.68, pal('s', metal=0.30, rough=0.22), seg=14, name='noink_ib_s', bevel=0.02, rot=tilt)
    cyl(0.08, 0.01, -0.39, 0.26, 0.68, pal('k', metal=0.22, rough=0.36), seg=14, name='noink_ib_k', bevel=0.02, rot=tilt)
    # Stubby metallic branch knots jutting from left and right sides
    frustum((-0.24, -0.02, -0.04), (-0.42, -0.04, 0.04), 0.11, 0.06, pal('s', metal=0.30, rough=0.22), seg=10)
    frustum((0.24, 0.0, -0.06), (0.42, 0.02, 0.02), 0.11, 0.06, pal('k', metal=0.25, rough=0.34), seg=10)
    # Top cut cross-section showing warm peach/tan heartwood rings (p, P, n) inside steel bark rim
    cyl(0.0, 0.09, 0.24, 0.32, 0.10, pal('s', metal=0.30, rough=0.22), seg=16, bevel=0.02, rot=tilt)
    cyl(0.0, 0.095, 0.26, 0.26, 0.09, pal('p', emit=0.18, rough=0.24), seg=16, name='noink_top_p', bevel=0.01, rot=tilt)
    cyl(0.0, 0.10, 0.27, 0.17, 0.09, pal('P', rough=0.28), seg=14, name='noink_top_P', bevel=0.01, rot=tilt)
    cyl(0.0, 0.105, 0.275, 0.08, 0.09, pal('n', rough=0.34), seg=12, name='noink_top_n', bevel=0.008, rot=tilt)
    # Dark vertical bark fissures and bright cream metallic glints on front face
    rod((-0.05, -0.29, -0.30), (-0.05, -0.24, 0.14), 0.038, pal('o', rough=0.38), seg=8, name='noink_fis1')
    rod((0.11, -0.28, -0.34), (0.11, -0.23, 0.10), 0.038, pal('o', rough=0.38), seg=8, name='noink_fis2')
    rod((-0.20, -0.25, -0.18), (-0.20, -0.21, 0.12), 0.044, pal('w', emit=0.42, rough=0.16), seg=10, name='noink_glint')


def icon_tankard():
    """14. tankard: Wooden stave ale mug bound with steel hoops, right D-handle, and overflowing cream foam."""
    cx = -0.06
    # Sturdy D-shaped steel handle on right side
    torus(0.24, 0.0, -0.10, 0.17, 0.055, pal('s', metal=0.28, rough=0.24), seg_maj=18, seg_min=10, rot=(math.radians(90), 0, 0))
    torus(0.26, 0.01, -0.12, 0.16, 0.050, pal('S', metal=0.26, rough=0.28), name='noink_hdl_sh', seg_maj=16, seg_min=10, rot=(math.radians(90), 0, 0))
    # Wooden stave barrel body (brown n with tan P highlight on left and dark brown N on right)
    frustum((cx, 0.0, -0.42), (cx, 0.0, 0.18), 0.29, 0.26, pal('n', rough=0.36), seg=16)
    frustum((cx + 0.05, 0.01, -0.42), (cx + 0.05, 0.01, 0.17), 0.25, 0.22, pal('N', rough=0.42), seg=14, name='noink_mug_N')
    rod((cx - 0.16, -0.20, -0.38), (cx - 0.14, -0.18, 0.14), 0.065, pal('P', rough=0.30), seg=10, name='noink_mug_P')
    # Upper and lower horizontal steel barrel bands
    for zz in (0.04, -0.28):
        r_b = 0.28 if zz > 0 else 0.305
        cyl(cx, 0.0, zz, r_b, 0.09, pal('s', metal=0.30, rough=0.22), seg=18, bevel=0.015)
        cyl(cx + 0.04, 0.01, zz, r_b - 0.02, 0.088, pal('S', metal=0.26, rough=0.28), seg=16, name=f'noink_band_sh_{zz}', bevel=0.01)
    # Billowy head of frothy cream foam overflowing top (with peach-tan right shade and front-left drip)
    sphere(cx - 0.10, -0.02, 0.24, 0.18, pal('w', emit=0.25, rough=0.18), seg=3, scale=(1.1, 0.95, 0.85), smooth=True)
    sphere(cx + 0.06, -0.02, 0.26, 0.19, pal('w', emit=0.25, rough=0.18), seg=3, scale=(1.05, 0.95, 0.90), smooth=True)
    sphere(cx + 0.17, 0.0, 0.22, 0.14, pal('p', rough=0.24), seg=2, scale=(1.0, 0.9, 0.85), smooth=True)
    rod((cx - 0.22, -0.18, 0.04), (cx - 0.20, -0.16, 0.22), 0.065, pal('w', emit=0.28, rough=0.18), seg=10, bevel=0.02)


def icon_phoenixfeather():
    """15. phoenixfeather: Radiant diagonal crimson-orange-gold phoenix plume with cream quill and ember sparks."""
    # Outer crimson feather vane curving from bottom-left to broad upper-right crest
    red_pts = [
        (-0.28, -0.26), (-0.22, 0.04), (-0.02, 0.30), (0.20, 0.44),
        (0.42, 0.42), (0.40, 0.16), (0.24, -0.10), (-0.04, -0.26),
    ]
    prism_xz(red_pts, 0.13, pal('r', rough=0.22), bevel=0.025, dome=0.05, apex=(0.08, 0.12))
    # Deep crimson right/lower edge shading
    dark_pts = [(0.08, 0.12), (0.42, 0.42), (0.40, 0.16), (0.24, -0.10), (-0.04, -0.26)]
    prism_xz(dark_pts, 0.135, pal('R', rough=0.26), bevel=0.02, dome=0.045, apex=(0.20, 0.06), name='noink_pf_R')
    # Fiery orange mid-vane layer
    org_pts = [(-0.26, -0.24), (-0.16, 0.02), (0.04, 0.24), (0.26, 0.30), (0.20, 0.04), (-0.02, -0.20)]
    prism_xz(org_pts, 0.12, pal('e', emit=0.32, rough=0.20), y=-0.02, dome=0.045, apex=(0.02, 0.04), name='noink_pf_e')
    # Bright golden inner flame core
    gold_pts = [(-0.30, -0.30), (-0.18, -0.04), (0.02, 0.14), (0.14, 0.16), (0.08, -0.04), (-0.10, -0.24)]
    prism_xz(gold_pts, 0.11, pal('y', emit=0.40, rough=0.18), y=-0.035, dome=0.04, apex=(-0.06, -0.06), name='noink_pf_y')
    # Glowing cream quill shaft (rachis) on front face from bottom-left tip up into the plume heart
    frustum((-0.42, -0.04, -0.42), (-0.16, -0.06, -0.14), 0.065, 0.052, pal('y', emit=0.35, rough=0.18), seg=10)
    frustum((-0.38, -0.11, -0.38), (0.14, -0.13, 0.16), 0.052, 0.024, pal('w', emit=0.60, rough=0.14), seg=10, name='noink_quill_w')
    # Floating ember sparks at top-left (cream w) and bottom-right (gold y)
    sphere(-0.32, -0.02, 0.26, 0.075, pal('w', emit=0.50, rough=0.15), seg=2, smooth=True)
    sphere(0.26, -0.02, -0.28, 0.068, pal('y', emit=0.40, rough=0.18), seg=2, smooth=True)


ICONS = {
    'scroll': icon_scroll,
    'gear': icon_gear,
    'chat': icon_chat,
    'tent': icon_tent,
    'dice': icon_dice,
    'chest': icon_chest,
    'goldtimber': icon_goldtimber,
    'goblinskull': icon_goblinskull,
    'dragonscale': icon_dragonscale,
    'moonpearl': icon_moonpearl,
    'grimoire': icon_grimoire,
    'mandrake': icon_mandrake,
    'ironbark': icon_ironbark,
    'tankard': icon_tankard,
    'phoenixfeather': icon_phoenixfeather,
}
