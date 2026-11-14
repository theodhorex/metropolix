"""Blender 3D icons — slice D (titanbone..goldenseed)."""
import math
from icons import pal, box, cyl, rod, cone, sphere, prism_xz


def _gear_poly(n_teeth, r_in, r_out, tooth_frac=0.45):
    """Build a 2D gear polygon in (X, Z) so prism_xz gets one clean outer silhouette."""
    pts = []
    step = 2.0 * math.pi / n_teeth
    half_t = step * tooth_frac * 0.5
    half_g = step * (1.0 - tooth_frac) * 0.5
    for i in range(n_teeth):
        c = i * step
        for a, r in (
            (c - half_t - half_g * 0.35, r_in),
            (c - half_t, r_out),
            (c + half_t, r_out),
            (c + half_t + half_g * 0.35, r_in),
        ):
            pts.append((math.cos(a) * r, math.sin(a) * r))
    return pts


def icon_titanbone():
    """titanbone: a giant bleached bone lying on the diagonal, two round knuckles at each end, cracked shaft."""
    ivory, shade = pal('p', rough=0.3), pal('P', rough=0.34)
    rod((-0.24, 0, -0.24), (0.24, 0, 0.24), 0.12, ivory, seg=16, bevel=0.03)
    for (x, z, m) in ((-0.36, -0.20, ivory), (-0.20, -0.36, shade), (0.20, 0.36, ivory), (0.36, 0.20, shade)):
        sphere(x, 0, z, 0.15, m, name='knuckle', seg=3, smooth=True)
    rod((-0.12, -0.11, -0.04), (0.10, -0.11, 0.18), 0.03, pal('w', emit=0.3, rough=0.2), seg=8, name='noink_hi')
    rod((0.02, -0.12, 0.06), (0.06, -0.12, -0.02), 0.022, pal('k', rough=0.4), seg=6, name='noink_crack1')
    rod((0.06, -0.12, -0.02), (0.02, -0.12, -0.08), 0.02, pal('k', rough=0.4), seg=6, name='noink_crack2')
    sphere(-0.40, -0.12, -0.14, 0.05, pal('w', emit=0.45, rough=0.18), name='noink_glint', scale=(1.2, 0.5, 0.8), smooth=True)


def icon_wardenbanner():
    """wardenbanner: Torn royal-blue swallowtail war banner on a wooden crossbar with a golden crest."""
    # Steel spear finial at top
    cone(0, 0, 0.34, 0.09, 0.16, pal('s', metal=0.30, rough=0.22), seg=12, r_top=0.01)
    cyl(0, 0, 0.29, 0.10, 0.06, pal('S', metal=0.28, rough=0.28), seg=14, bevel=0.01)
    # Horizontal brown wooden crossbar
    rod((-0.44, 0, 0.26), (0.44, 0, 0.26), 0.068, pal('n', rough=0.38), seg=14, bevel=0.015)
    rod((0.05, -0.015, 0.245), (0.43, -0.015, 0.245), 0.055, pal('N', rough=0.44), seg=12, name='noink_bar_sh')
    # Hanging royal-blue swallowtail banner cloth (asymmetric torn bottom: shorter left, longer right)
    cloth_pts = [
        (-0.35, 0.24), (0.35, 0.24), (0.35, -0.46),
        (0.24, -0.46), (0.04, -0.14), (-0.22, -0.36), (-0.35, -0.36),
    ]
    prism_xz(cloth_pts, 0.11, pal('B', rough=0.28), bevel=0.02)
    # Sky-blue highlight on upper-left of cloth
    hi_pts = [(-0.33, 0.22), (0.02, 0.22), (-0.08, -0.08), (-0.33, -0.24)]
    prism_xz(hi_pts, 0.04, pal('b', rough=0.24), y=-0.045, bevel=0.012, name='noink_cloth_hi')
    # Steel-grey weathered border along right side of banner
    trim_pts = [(0.19, 0.22), (0.34, 0.22), (0.34, -0.44), (0.24, -0.44), (0.16, -0.25)]
    prism_xz(trim_pts, 0.04, pal('S', metal=0.20, rough=0.32), y=-0.045, bevel=0.012, name='noink_cloth_trim')
    # Golden Warden diamond emblem cleanly in front of cloth with cream glint
    crest_pts = [(0.0, 0.17), (-0.17, 0.03), (0.0, -0.11), (0.17, 0.03)]
    prism_xz(crest_pts, 0.05, pal('y', metal=0.28, rough=0.22), y=-0.075, dome=0.035, name='noink_crest')
    prism_xz([(0.0, 0.16), (0.0, -0.10), (0.16, 0.03)], 0.045, pal('Y', metal=0.26, rough=0.26), y=-0.08, dome=0.03, name='noink_crest_sh')
    sphere(-0.04, -0.115, 0.05, 0.052, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(1.0, 0.45, 1.0), smooth=True)


def icon_clockheart():
    """clockheart: Golden mechanical clockwork heart with steel gear bezel and glowing ruby-aether core."""
    # Plump golden heart body
    heart_pts = [
        (0.0, 0.24), (-0.13, 0.39), (-0.30, 0.39), (-0.43, 0.23), (-0.42, 0.01),
        (-0.23, -0.23), (0.0, -0.45), (0.23, -0.23), (0.42, 0.01), (0.43, 0.23),
        (0.30, 0.39), (0.13, 0.39),
    ]
    prism_xz(heart_pts, 0.18, pal('y', metal=0.28, rough=0.22), dome=0.03, apex=(0.0, 0.03))
    # Darker gold shading on right lobe and lower tip
    right_pts = [
        (0.02, 0.23), (0.02, -0.43), (0.22, -0.22), (0.40, 0.01),
        (0.41, 0.22), (0.29, 0.37), (0.12, 0.37),
    ]
    prism_xz(right_pts, 0.14, pal('Y', metal=0.26, rough=0.28), y=-0.03, dome=0.03, apex=(0.14, 0.03), name='noink_heart_sh')
    # Small winding key / gear stem on lower right
    rod((0.18, 0.0, -0.24), (0.34, 0.0, -0.32), 0.055, pal('Y', metal=0.26, rough=0.26), seg=10)
    sphere(0.35, -0.02, -0.33, 0.065, pal('w', emit=0.35, rough=0.20), seg=2, smooth=True)
    # Top-left cream highlight on left heart lobe
    sphere(-0.24, -0.11, 0.25, 0.085, pal('w', emit=0.45, rough=0.18), name='noink_glint', scale=(1.2, 0.45, 0.85), smooth=True)
    # Mechanical steel bezel and gear teeth cleanly raised on front face
    cyl(0, -0.125, 0.02, 0.23, 0.05, pal('s', metal=0.32, rough=0.22), seg=20, name='noink_bezel', rot=(math.radians(90), 0, 0), center_z=True)
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        box(math.cos(rad) * 0.22, -0.125, 0.02 + math.sin(rad) * 0.22, 0.068, 0.05, 0.068, pal('S', metal=0.30, rough=0.26), name=f'noink_bt{ang}', bevel=0.01, center_z=True)
    cyl(0, -0.145, 0.02, 0.17, 0.04, pal('k', rough=0.38), seg=18, name='noink_well', rot=(math.radians(90), 0, 0), center_z=True)
    # Glowing ruby, magenta, and white-hot clockwork core
    sphere(0, -0.16, 0.02, 0.135, pal('r', emit=0.65, rough=0.18), name='noink_core_r', scale=(1.05, 0.35, 1.05), smooth=True)
    sphere(-0.08, -0.17, 0.05, 0.062, pal('u', emit=0.60, rough=0.20), name='noink_core_u1', scale=(1.0, 0.35, 1.0), smooth=True)
    sphere(0.08, -0.17, -0.01, 0.062, pal('u', emit=0.60, rough=0.20), name='noink_core_u2', scale=(1.0, 0.35, 1.0), smooth=True)
    sphere(0, -0.18, 0.02, 0.072, pal('w', emit=0.95, rough=0.12), name='noink_core_w', scale=(1.1, 0.35, 1.1), smooth=True)


def icon_geode():
    """geode: Cracked grey stone boulder revealing a wide-open glowing cavity of cyan, teal, and mint crystals."""
    # Outer cracked stone shell (cleft at top, rounded bottom)
    rock_pts = [
        (0.0, 0.24), (-0.15, 0.38), (-0.32, 0.34), (-0.43, 0.14), (-0.42, -0.14),
        (-0.28, -0.36), (0.0, -0.44), (0.28, -0.36), (0.42, -0.14), (0.43, 0.14),
        (0.32, 0.34), (0.15, 0.38),
    ]
    prism_xz(rock_pts, 0.22, pal('S', rough=0.40), bevel=0.04)
    # Lighter stone left rim & top-left highlight
    left_rim = [(-0.02, 0.23), (-0.15, 0.36), (-0.31, 0.32), (-0.41, 0.13), (-0.40, -0.13), (-0.26, -0.33), (-0.08, -0.38)]
    prism_xz(left_rim, 0.16, pal('s', rough=0.35), y=-0.04, bevel=0.03, name='noink_rim_l')
    sphere(-0.23, -0.12, 0.26, 0.075, pal('w', emit=0.40, rough=0.18), name='noink_glint_rock', scale=(1.1, 0.45, 0.85), smooth=True)
    # Wide open deep-teal crystal cavity bed on the front face
    cav_pts = [
        (0.0, 0.18), (-0.14, 0.29), (-0.28, 0.22), (-0.33, 0.02), (-0.28, -0.20),
        (0.0, -0.31), (0.28, -0.20), (0.33, 0.02), (0.28, 0.22), (0.14, 0.29),
    ]
    prism_xz(cav_pts, 0.08, pal('C', rough=0.22, metal=0.18), y=-0.09, bevel=0.02, name='noink_cav_C')
    # Bright cyan (c) and mint (m) faceted crystal zones inside the cavity
    mid_pts = [(-0.02, 0.16), (-0.14, 0.26), (-0.25, 0.18), (-0.27, -0.02), (-0.18, -0.18), (0.08, -0.20), (0.22, -0.04), (0.20, 0.18)]
    prism_xz(mid_pts, 0.06, pal('c', emit=0.35, rough=0.18), y=-0.12, dome=0.04, apex=(-0.03, 0.02), name='noink_cav_c')
    mint_pts = [(-0.05, 0.16), (-0.14, 0.25), (-0.24, 0.18), (-0.24, 0.02), (-0.10, -0.04)]
    prism_xz(mint_pts, 0.05, pal('m', emit=0.45, rough=0.16), y=-0.14, dome=0.035, apex=(-0.15, 0.12), name='noink_cav_m')
    # Chunky 3D crystal shards jutting out of the cavity
    cone(-0.12, -0.15, -0.06, 0.11, 0.28, pal('m', emit=0.40, rough=0.16), seg=5, r_top=0.015, name='noink_sh1', rot=(math.radians(-16), math.radians(-10), 0))
    cone(0.04, -0.15, -0.12, 0.12, 0.30, pal('c', emit=0.45, rough=0.16), seg=5, r_top=0.015, name='noink_sh2', rot=(math.radians(-14), math.radians(8), 0))
    cone(0.16, -0.14, -0.14, 0.11, 0.25, pal('C', emit=0.20, rough=0.20), seg=5, r_top=0.015, name='noink_sh3', rot=(math.radians(-12), math.radians(18), 0))
    # Bright white crystal core highlight
    sphere(-0.06, -0.185, 0.05, 0.072, pal('w', emit=0.80, rough=0.12), name='noink_glint_cr', scale=(0.85, 0.45, 1.25), smooth=True)


def icon_starmetal():
    """starmetal: Jagged dark-iron meteorite crag veined with glowing sky-blue starmetal and a falling-star spark."""
    # Chunky faceted meteoric iron & steel boulder
    crag_pts = [
        (0.10, 0.42), (-0.06, 0.28), (-0.26, 0.10), (-0.36, -0.14),
        (-0.24, -0.38), (0.06, -0.42), (0.32, -0.34), (0.40, -0.08), (0.28, 0.26),
    ]
    prism_xz(crag_pts, 0.22, pal('k', metal=0.38, rough=0.28), dome=0.06, apex=(0.04, -0.04))
    # Steel-grey base & mid facets (S and s)
    base_pts = [(-0.32, -0.16), (-0.22, -0.37), (0.06, -0.41), (0.31, -0.33), (0.36, -0.12), (0.04, -0.22)]
    prism_xz(base_pts, 0.16, pal('S', metal=0.32, rough=0.30), y=-0.04, bevel=0.02, name='noink_st_base')
    facet_s = [(-0.18, 0.06), (-0.02, 0.20), (0.22, 0.12), (0.26, -0.14), (-0.06, -0.22)]
    prism_xz(facet_s, 0.08, pal('s', metal=0.36, rough=0.22), y=-0.10, dome=0.03, name='noink_st_mid')
    # Glowing sky-blue (b) and white-hot (w) starmetal crystal veins bursting across the meteorite
    cone(0.02, -0.15, -0.20, 0.13, 0.50, pal('b', emit=0.50, rough=0.16), seg=5, r_top=0.02, name='noink_vein1', rot=(math.radians(-10), math.radians(16), math.radians(-18)))
    cone(-0.12, -0.15, -0.16, 0.10, 0.36, pal('b', emit=0.45, rough=0.18), seg=5, r_top=0.02, name='noink_vein2', rot=(math.radians(-12), math.radians(-14), math.radians(15)))
    rod((-0.03, -0.20, -0.14), (0.09, -0.18, 0.18), 0.052, pal('w', emit=0.85, rough=0.12), seg=8, name='noink_vein_w')
    # Bright 4-point falling-star spark at top-left
    star_pts = [(-0.27, 0.40), (-0.32, 0.30), (-0.41, 0.25), (-0.32, 0.20), (-0.27, 0.10), (-0.22, 0.20), (-0.13, 0.25), (-0.22, 0.30)]
    prism_xz(star_pts, 0.07, pal('w', emit=0.70, rough=0.15), dome=0.03)


def icon_voidheart():
    """voidheart: Faceted deep-indigo void crystal heart with dark slate rim and glowing magenta-white core."""
    # Angular faceted crystal heart silhouette in deep void indigo (U)
    vh_pts = [
        (0.0, 0.22), (-0.14, 0.40), (-0.30, 0.38), (-0.43, 0.20), (-0.40, -0.04),
        (-0.22, -0.25), (0.0, -0.45), (0.22, -0.25), (0.40, -0.04), (0.43, 0.20),
        (0.30, 0.38), (0.14, 0.40),
    ]
    prism_xz(vh_pts, 0.20, pal('U', metal=0.22, rough=0.24), dome=0.04, apex=(0.0, 0.02))
    # Dark charcoal (k) shadow facet along right edge
    k_pts = [(0.12, 0.38), (0.29, 0.37), (0.42, 0.19), (0.39, -0.04), (0.21, -0.24), (0.02, -0.43), (0.16, -0.10)]
    prism_xz(k_pts, 0.14, pal('k', metal=0.25, rough=0.32), y=-0.04, bevel=0.015, name='noink_vh_k')
    # Upper-left lavender (v) facet & cream glint (w)
    v_rim = [(-0.08, 0.34), (-0.14, 0.39), (-0.29, 0.37), (-0.41, 0.19), (-0.26, 0.12)]
    prism_xz(v_rim, 0.10, pal('v', emit=0.25, rough=0.20), y=-0.06, bevel=0.015, name='noink_vh_v')
    sphere(-0.22, -0.13, 0.29, 0.068, pal('w', emit=0.55, rough=0.15), name='noink_glint', scale=(1.1, 0.45, 0.85), smooth=True)
    # Inner royal-purple (V) and lavender (v) crystal heart layer
    mid_pts = [
        (0.0, 0.15), (-0.14, 0.26), (-0.28, 0.14), (-0.25, -0.06),
        (0.0, -0.29), (0.25, -0.06), (0.28, 0.14), (0.14, 0.26),
    ]
    prism_xz(mid_pts, 0.06, pal('V', emit=0.25, rough=0.20), y=-0.10, dome=0.03, name='noink_vh_mid')
    # Glowing magenta-pink (u) inner crystal heart
    u_pts = [
        (0.0, 0.11), (-0.11, 0.19), (-0.21, 0.10), (-0.18, -0.06),
        (0.0, -0.21), (0.18, -0.06), (0.21, 0.10), (0.11, 0.19),
    ]
    prism_xz(u_pts, 0.05, pal('u', emit=0.60, rough=0.16), y=-0.125, dome=0.03, name='noink_vh_u')
    # Blazing cream-white (w) void core with central magenta pupil
    w_pts = [(-0.13, 0.08), (0.13, 0.08), (0.11, -0.05), (0.0, -0.13), (-0.11, -0.05)]
    prism_xz(w_pts, 0.04, pal('w', emit=0.95, rough=0.12), y=-0.145, dome=0.02, name='noink_vh_w')
    sphere(0.0, -0.17, 0.01, 0.048, pal('u', emit=0.75, rough=0.15), name='noink_vh_pupil', scale=(1.1, 0.35, 1.0), smooth=True)


def icon_cog():
    """cog: Chunky 8-toothed golden perpetual gear with a glowing violet-magenta arcane core."""
    # Single unified 8-tooth golden gear mesh
    pts = _gear_poly(8, 0.31, 0.44, tooth_frac=0.44)
    prism_xz(pts, 0.18, pal('y', metal=0.28, rough=0.22), bevel=0.022)
    # Darker gold shading on lower-right half of gear
    sh_pts = [p for p in pts if p[0] - p[1] > -0.08]
    if len(sh_pts) >= 3:
        prism_xz(sh_pts, 0.12, pal('Y', metal=0.26, rough=0.28), y=-0.04, bevel=0.015, name='noink_cog_sh')
    # Raised golden inner rim & top-left tooth glint
    cyl(0, -0.08, 0, 0.25, 0.06, pal('y', metal=0.28, rough=0.22), seg=24, name='noink_rim', rot=(math.radians(90), 0, 0), center_z=True)
    sphere(-0.27, -0.11, 0.26, 0.072, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(1.15, 0.45, 0.85), smooth=True)
    # Perpetual glowing arcane core (deep purple V, lavender v, magenta u, and cream-white w spark)
    cyl(0, -0.105, 0, 0.19, 0.05, pal('V', emit=0.30, rough=0.20), seg=20, name='noink_core_V', rot=(math.radians(90), 0, 0), center_z=True)
    sphere(-0.03, -0.12, 0.03, 0.14, pal('v', emit=0.50, rough=0.18), name='noink_core_v', scale=(1.0, 0.35, 1.0), smooth=True)
    sphere(-0.06, -0.135, 0.05, 0.095, pal('u', emit=0.65, rough=0.16), name='noink_core_u', scale=(1.0, 0.35, 1.0), smooth=True)
    sphere(-0.04, -0.15, 0.06, 0.065, pal('w', emit=0.95, rough=0.12), name='noink_core_w', scale=(1.1, 0.35, 0.95), smooth=True)


def icon_sunengine():
    """sunengine: Golden solar containment furnace with dark iron cage and blazing orange-white sun core."""
    # Golden furnace housing with 4 bold cardinal flanges (top, bottom, left, right)
    pts = _gear_poly(4, 0.36, 0.44, tooth_frac=0.38)
    prism_xz(pts, 0.20, pal('y', metal=0.28, rough=0.22), bevel=0.025)
    # Darker gold shading on lower-right half
    sh_pts = [p for p in pts if p[0] - p[1] > -0.05]
    if len(sh_pts) >= 3:
        prism_xz(sh_pts, 0.14, pal('Y', metal=0.26, rough=0.28), y=-0.04, bevel=0.015, name='noink_sun_sh')
    # Top-left cream highlight on golden housing
    sphere(-0.20, -0.12, 0.29, 0.075, pal('w', emit=0.45, rough=0.16), name='noink_glint', scale=(1.2, 0.45, 0.80), smooth=True)
    # Dark charcoal iron (k) furnace chamber & 4 diagonal containment struts
    cyl(0, -0.095, 0, 0.29, 0.05, pal('k', metal=0.35, rough=0.34), seg=24, name='noink_chamber', rot=(math.radians(90), 0, 0), center_z=True)
    for sx, sz in ((-1, 1), (1, 1), (-1, -1), (1, -1)):
        rod((sx * 0.15, -0.125, sz * 0.15), (sx * 0.25, -0.11, sz * 0.25), 0.042, pal('k', metal=0.35, rough=0.34), seg=8, name=f'noink_strut_{sx}_{sz}')
    # Blazing fuel-less solar core (deep orange E, bright orange e, gold y, white-hot w center)
    sphere(0.0, -0.115, -0.02, 0.22, pal('E', emit=0.45, rough=0.20), name='noink_sun_E', scale=(1.0, 0.30, 1.0), smooth=True)
    sphere(0.0, -0.13, 0.02, 0.18, pal('e', emit=0.70, rough=0.16), name='noink_sun_e', scale=(1.05, 0.28, 1.0), smooth=True)
    sphere(-0.02, -0.148, 0.02, 0.125, pal('y', emit=0.80, rough=0.14), name='noink_sun_y', scale=(1.05, 0.28, 1.0), smooth=True)
    sphere(0.0, -0.17, 0.01, 0.082, pal('w', emit=0.98, rough=0.10), name='noink_sun_w', scale=(1.1, 0.30, 1.05), smooth=True)


def icon_whetstone():
    """whetstone: Beveled rectangular stone slab carved with glowing sky-blue and royal-blue runes."""
    rot = (math.radians(14), 0, 0)
    # Main beveled stone slab (light stone s with dark stone S lower/right shading)
    box(0.0, 0.0, -0.28, 0.84, 0.26, 0.56, pal('s', rough=0.34, metal=0.12), bevel=0.055, rot=rot)
    box(0.04, 0.01, -0.28, 0.78, 0.24, 0.26, pal('S', rough=0.38, metal=0.12), name='noink_ws_bot', bevel=0.04, rot=rot)
    box(0.24, 0.01, -0.26, 0.34, 0.24, 0.50, pal('S', rough=0.38, metal=0.12), name='noink_ws_rt', bevel=0.04, rot=rot)
    # Top-left cream highlight strip along upper stone edge
    rod((-0.28, -0.15, 0.20), (-0.08, -0.15, 0.20), 0.048, pal('w', emit=0.45, rough=0.16), seg=10, name='noink_glint')
    # Royal-blue (B) engraved rune channel & glowing sky-blue (b) / white (w) rune glyphs across front face
    box(0.0, -0.115, 0.02, 0.62, 0.05, 0.24, pal('B', emit=0.25, rough=0.22), name='noink_rune_bed', bevel=0.02, rot=rot, center_z=True)
    for x0 in (-0.20, 0.0, 0.20):
        rod((x0 - 0.06, -0.145, -0.05), (x0 + 0.05, -0.155, 0.10), 0.042, pal('b', emit=0.65, rough=0.15), seg=8, name=f'noink_rune_{x0}')
    sphere(-0.15, -0.16, 0.03, 0.048, pal('w', emit=0.90, rough=0.12), name='noink_rw1', scale=(1.0, 0.4, 1.0), smooth=True)
    sphere(0.02, -0.16, 0.07, 0.048, pal('w', emit=0.90, rough=0.12), name='noink_rw2', scale=(1.0, 0.4, 1.0), smooth=True)
    sphere(0.16, -0.16, 0.02, 0.048, pal('w', emit=0.90, rough=0.12), name='noink_rw3', scale=(1.0, 0.4, 1.0), smooth=True)


def icon_masterhammer():
    """masterhammer: Legendary smith's forge-hammer with gilded steel head, golden bands, and ornate pommel."""
    # Brown wooden handle shaft with golden grip rings and flared golden pommel
    rod((0, 0, -0.40), (0, 0, 0.38), 0.095, pal('n', rough=0.38), seg=14, bevel=0.015)
    rod((0.02, 0.01, -0.38), (0.02, 0.01, 0.04), 0.086, pal('N', rough=0.44), seg=12, name='noink_grip_sh')
    # Golden collar below head, middle grip ring, and flared golden pommel
    cyl(0, 0, -0.04, 0.135, 0.08, pal('y', metal=0.28, rough=0.22), seg=16, bevel=0.015)
    cyl(0, 0, -0.22, 0.115, 0.065, pal('Y', metal=0.26, rough=0.26), seg=16, bevel=0.012)
    box(0, 0, -0.46, 0.28, 0.22, 0.11, pal('y', metal=0.28, rough=0.22), bevel=0.025)
    # Top golden crown cap above head
    box(0, 0, 0.34, 0.28, 0.22, 0.09, pal('y', metal=0.28, rough=0.22), bevel=0.02)
    # Heavy beveled steel hammer head block + flared striking faces
    box(0, 0, 0.04, 0.68, 0.32, 0.31, pal('s', metal=0.32, rough=0.22), bevel=0.045)
    box(0.14, 0.01, 0.03, 0.40, 0.30, 0.29, pal('S', metal=0.30, rough=0.28), name='noink_head_sh', bevel=0.04)
    rod((-0.40, 0, 0.195), (-0.30, 0, 0.195), 0.155, pal('s', metal=0.34, rough=0.20), seg=8, bevel=0.02)
    rod((0.30, 0, 0.195), (0.40, 0, 0.195), 0.155, pal('S', metal=0.30, rough=0.26), seg=8, bevel=0.02)
    # Rich golden trim bands across the hammer head (horizontal waist band + left/right vertical straps)
    box(0, -0.025, 0.14, 0.62, 0.31, 0.09, pal('y', metal=0.28, rough=0.22), name='noink_gold_waist', bevel=0.02)
    box(-0.18, -0.025, 0.03, 0.10, 0.31, 0.32, pal('y', metal=0.28, rough=0.22), name='noink_gold_l', bevel=0.02)
    box(0.18, -0.025, 0.03, 0.10, 0.31, 0.32, pal('Y', metal=0.26, rough=0.26), name='noink_gold_r', bevel=0.02)
    # Bright cream glint on upper-left of head
    box(-0.20, -0.17, 0.23, 0.18, 0.04, 0.075, pal('w', emit=0.45, rough=0.16), name='noink_glint', bevel=0.015)


def icon_kingsblade():
    """kingsblade: Upright royal broadsword with sky-blue fuller, sweeping golden crossguard, and crimson ruby."""
    # Brown wooden grip & ornate golden pommel at bottom
    rod((0, 0, -0.34), (0, 0, -0.10), 0.075, pal('n', rough=0.38), seg=12, bevel=0.012)
    rod((0.02, 0.01, -0.34), (0.02, 0.01, -0.10), 0.068, pal('N', rough=0.44), seg=10, name='noink_grip_sh')
    pommel_pts = [(0.0, -0.28), (-0.17, -0.36), (-0.13, -0.46), (0.13, -0.46), (0.17, -0.36)]
    prism_xz(pommel_pts, 0.15, pal('y', metal=0.30, rough=0.22), dome=0.03)
    sphere(-0.04, -0.08, -0.37, 0.048, pal('w', emit=0.45, rough=0.16), name='noink_pom_glint', scale=(1.1, 0.45, 0.9), smooth=True)
    # Wide steel broadsword blade with sky-blue fuller and cream left-edge glint
    blade_pts = [(-0.16, -0.06), (-0.16, 0.28), (0.0, 0.48), (0.16, 0.28), (0.16, -0.06)]
    prism_xz(blade_pts, 0.12, pal('s', metal=0.34, rough=0.20), dome=0.04, apex=(0.0, 0.16))
    blade_r = [(0.0, -0.06), (0.0, 0.46), (0.15, 0.27), (0.15, -0.06)]
    prism_xz(blade_r, 0.09, pal('S', metal=0.32, rough=0.26), y=-0.02, dome=0.03, apex=(0.06, 0.15), name='noink_blade_sh')
    rod((-0.09, -0.075, 0.02), (-0.09, -0.075, 0.28), 0.036, pal('w', emit=0.55, rough=0.15), seg=10, name='noink_blade_glint')
    rod((0.0, -0.085, 0.0), (0.0, -0.085, 0.26), 0.042, pal('b', emit=0.55, rough=0.16), seg=10, name='noink_fuller')
    # Sweeping golden royal crossguard with central crimson ruby cabochon
    guard_pts = [
        (0.0, 0.02), (-0.22, -0.01), (-0.42, -0.04), (-0.38, -0.14), (-0.18, -0.14),
        (0.0, -0.20), (0.18, -0.14), (0.38, -0.14), (0.42, -0.04), (0.22, -0.01),
    ]
    prism_xz(guard_pts, 0.18, pal('y', metal=0.30, rough=0.22), bevel=0.025)
    guard_r = [(0.0, 0.01), (0.0, -0.19), (0.18, -0.13), (0.37, -0.13), (0.40, -0.04), (0.21, -0.01)]
    prism_xz(guard_r, 0.14, pal('Y', metal=0.28, rough=0.26), y=-0.03, bevel=0.02, name='noink_guard_sh')
    sphere(-0.24, -0.10, -0.07, 0.055, pal('w', emit=0.45, rough=0.16), name='noink_guard_glint', scale=(1.3, 0.45, 0.75), smooth=True)
    # Central crimson ruby gem on crossguard
    gem_pts = [(0.0, -0.01), (-0.11, -0.09), (0.0, -0.17), (0.11, -0.09)]
    prism_xz(gem_pts, 0.06, pal('r', emit=0.45, rough=0.16), y=-0.095, dome=0.035, name='noink_ruby')
    prism_xz([(0.0, -0.02), (0.0, -0.16), (0.10, -0.09)], 0.05, pal('R', rough=0.22), y=-0.10, dome=0.03, name='noink_ruby_sh')


def icon_aetheranvil():
    """aetheranvil: a smith's anvil cut from glowing aether crystal (horn, face, waist, feet) with sparks above."""
    cr = pal('c', emit=0.35, rough=0.18, metal=0.15)
    dk = pal('C', emit=0.18, rough=0.22, metal=0.2)
    box(0, 0, -0.42, 0.62, 0.36, 0.12, dk, name='foot', bevel=0.03)
    box(0, 0, -0.30, 0.34, 0.24, 0.16, dk, name='waist', bevel=0.03)
    box(0.06, 0, -0.14, 0.56, 0.32, 0.18, cr, name='face', bevel=0.03)
    cone(-0.36, 0, -0.05, 0.10, 0.36, cr, seg=10, rot=(0, math.radians(-90), 0), center_z=True, name='horn')
    box(0.06, -0.01, 0.04, 0.5, 0.28, 0.02, pal('m', emit=0.55, rough=0.15), name='noink_top', bevel=0.005)
    for (x, z, k) in ((-0.12, 0.30, 'u'), (0.16, 0.38, 'v'), (0.30, 0.22, 'u')):
        sphere(x, 0, z, 0.055, pal(k, emit=0.9, rough=0.15), name='spark', seg=1)
    sphere(-0.10, -0.17, -0.06, 0.05, pal('w', emit=0.6, rough=0.12), name='noink_glint', scale=(1.4, 0.5, 0.6), smooth=True)


def icon_amber():
    """amber: Translucent-looking golden-orange tree resin cabochon with a fossilized bug trapped inside."""
    # Plump teardrop amber gem silhouette
    amb_pts = [
        (0.0, 0.44), (-0.16, 0.34), (-0.31, 0.14), (-0.39, -0.10),
        (-0.32, -0.32), (-0.16, -0.43), (0.16, -0.43), (0.32, -0.32),
        (0.39, -0.10), (0.31, 0.14), (0.16, 0.34),
    ]
    prism_xz(amb_pts, 0.22, pal('e', emit=0.30, rough=0.18), dome=0.05, apex=(0.0, -0.04))
    # Deep burnt-amber (E) lower-right shading
    e_dark = [
        (0.08, 0.28), (0.29, 0.12), (0.38, -0.10), (0.31, -0.31),
        (0.15, -0.42), (-0.15, -0.42), (-0.26, -0.32), (0.04, -0.22),
    ]
    prism_xz(e_dark, 0.16, pal('E', emit=0.15, rough=0.22), y=-0.04, dome=0.04, apex=(0.12, -0.18), name='noink_amb_E')
    # Bright golden-yellow (y) upper-left internal glow
    y_glow = [
        (0.0, 0.40), (-0.15, 0.31), (-0.28, 0.12), (-0.32, -0.08),
        (-0.18, -0.22), (0.14, -0.18), (0.20, 0.08), (0.10, 0.28),
    ]
    prism_xz(y_glow, 0.12, pal('y', emit=0.45, rough=0.16), y=-0.08, dome=0.04, apex=(-0.04, 0.06), name='noink_amb_y')
    # Top-left cream specular glint along the amber curve
    rod((-0.24, -0.15, 0.08), (-0.11, -0.14, 0.29), 0.052, pal('w', emit=0.70, rough=0.14), seg=10, name='noink_glint')
    # Fossilized prehistoric bug suspended right in the center (dark k body/legs + brown N abdomen)
    sphere(0.0, -0.155, 0.11, 0.068, pal('k', rough=0.35), name='noink_bug_head', scale=(1.0, 0.35, 0.9), smooth=True)
    sphere(0.0, -0.155, -0.04, 0.095, pal('k', rough=0.35), name='noink_bug_body', scale=(0.95, 0.35, 1.35), smooth=True)
    rod((0.0, -0.175, -0.12), (0.0, -0.175, 0.03), 0.045, pal('N', rough=0.36), seg=8, name='noink_bug_ab')
    for sx in (-1, 1):
        rod((sx * 0.04, -0.16, 0.13), (sx * 0.13, -0.155, 0.21), 0.028, pal('k', rough=0.35), seg=6, name=f'noink_ant_{sx}')
        rod((sx * 0.06, -0.16, 0.03), (sx * 0.18, -0.155, 0.08), 0.030, pal('k', rough=0.35), seg=6, name=f'noink_leg1_{sx}')
        rod((sx * 0.06, -0.16, -0.05), (sx * 0.18, -0.155, -0.11), 0.030, pal('k', rough=0.35), seg=6, name=f'noink_leg2_{sx}')


def _gold_leaf(cx, cz, ang_deg, scale=1.0):
    """Helper for a plump golden leaf with darker Y half and cream w highlight."""
    pts = [(0.0, 0.17 * scale), (-0.11 * scale, 0.04 * scale), (-0.09 * scale, -0.11 * scale), (0.0, -0.16 * scale), (0.09 * scale, -0.11 * scale), (0.11 * scale, 0.04 * scale)]
    rad = math.radians(ang_deg)
    ca, sa = math.cos(rad), math.sin(rad)
    rpts = [(cx + px * ca - pz * sa, cz + px * sa + pz * ca) for px, pz in pts]
    prism_xz(rpts, 0.14, pal('y', metal=0.25, rough=0.22), dome=0.04, apex=(cx, cz))
    r_half = [rpts[0], rpts[3], rpts[4], rpts[5]]
    prism_xz(r_half, 0.11, pal('Y', metal=0.24, rough=0.26), y=-0.02, dome=0.035, apex=(cx + 0.03 * scale, cz), name=f'noink_lf_sh_{cx:.2f}')
    sphere(cx - 0.02 * scale, -0.10, cz + 0.02 * scale, 0.048 * scale, pal('w', emit=0.55, rough=0.15), name=f'noink_lf_gl_{cx:.2f}', scale=(0.9, 0.45, 1.1), smooth=True)


def icon_heartwood():
    """heartwood: Living diagonal emerald-and-mint bough sprouting three radiant golden leaves."""
    # Diagonal living branch curving from bottom-left to upper-center
    bough_pts = [
        (-0.42, -0.42), (-0.28, -0.42), (-0.08, -0.16), (0.12, 0.12),
        (0.02, 0.20), (-0.20, -0.06), (-0.42, -0.30),
    ]
    prism_xz(bough_pts, 0.16, pal('g', rough=0.28), bevel=0.03)
    # Dark green (G) lower-right bark shading & glowing mint (m) upper-left living edge
    rod((-0.32, -0.06, -0.38), (0.08, -0.06, 0.14), 0.055, pal('G', rough=0.34), seg=10, name='noink_hw_G')
    rod((-0.38, -0.08, -0.28), (-0.01, -0.08, 0.17), 0.052, pal('m', emit=0.35, rough=0.20), seg=10, name='noink_hw_m')
    # Three radiant golden leaves (upper-left, top-crown, and mid-right)
    _gold_leaf(-0.22, 0.20, 28, scale=0.95)
    _gold_leaf(0.08, 0.29, -18, scale=1.05)
    _gold_leaf(0.24, -0.07, -55, scale=0.98)


def icon_goldenseed():
    """goldenseed: Plump glossy golden seed at bottom sprouting two lush green cotyledon leaves at top."""
    # Plump golden seed body at bottom
    seed_pts = [
        (0.0, 0.12), (-0.18, 0.04), (-0.30, -0.12), (-0.28, -0.32),
        (-0.14, -0.44), (0.14, -0.44), (0.28, -0.32), (0.30, -0.12), (0.18, 0.04),
    ]
    prism_xz(seed_pts, 0.22, pal('y', metal=0.28, rough=0.22), dome=0.06, apex=(0.0, -0.18))
    seed_r = [(0.0, 0.11), (0.0, -0.43), (0.14, -0.43), (0.27, -0.31), (0.29, -0.12), (0.17, 0.03)]
    prism_xz(seed_r, 0.18, pal('Y', metal=0.26, rough=0.28), y=-0.03, dome=0.05, apex=(0.10, -0.18), name='noink_seed_sh')
    # Central vertical golden ridge & top-left cream glint on seed
    rod((0.0, -0.15, -0.36), (0.0, -0.15, 0.04), 0.038, pal('Y', metal=0.25, rough=0.30), seg=8, name='noink_seed_seam')
    sphere(-0.16, -0.15, -0.10, 0.075, pal('w', emit=0.50, rough=0.16), name='noink_glint', scale=(0.85, 0.45, 1.3), smooth=True)
    # Green stem & two symmetrical arched cotyledon leaves at top
    rod((0.0, 0.0, 0.06), (0.0, 0.0, 0.26), 0.065, pal('G', rough=0.32), seg=10)
    leaf_l = [(0.0, 0.22), (-0.12, 0.38), (-0.30, 0.42), (-0.38, 0.30), (-0.24, 0.18), (-0.04, 0.16)]
    prism_xz(leaf_l, 0.14, pal('g', rough=0.26), dome=0.04, apex=(-0.20, 0.30))
    sphere(-0.24, -0.09, 0.33, 0.065, pal('m', emit=0.35, rough=0.18), name='noink_lf_m', scale=(1.2, 0.45, 0.8), smooth=True)
    leaf_r = [(0.0, 0.22), (0.04, 0.16), (0.24, 0.18), (0.38, 0.30), (0.30, 0.42), (0.12, 0.38)]
    prism_xz(leaf_r, 0.14, pal('g', rough=0.26), dome=0.04, apex=(0.20, 0.30))
    leaf_r_sh = [(0.04, 0.17), (0.24, 0.18), (0.37, 0.30), (0.20, 0.30)]
    prism_xz(leaf_r_sh, 0.11, pal('G', rough=0.32), y=-0.02, dome=0.03, name='noink_lf_G')


ICONS = {
    'titanbone': icon_titanbone,
    'wardenbanner': icon_wardenbanner,
    'clockheart': icon_clockheart,
    'geode': icon_geode,
    'starmetal': icon_starmetal,
    'voidheart': icon_voidheart,
    'cog': icon_cog,
    'sunengine': icon_sunengine,
    'whetstone': icon_whetstone,
    'masterhammer': icon_masterhammer,
    'kingsblade': icon_kingsblade,
    'aetheranvil': icon_aetheranvil,
    'amber': icon_amber,
    'heartwood': icon_heartwood,
    'goldenseed': icon_goldenseed,
}
