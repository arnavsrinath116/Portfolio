"""
Builds the Music room in Blender, bakes its sunset light, and exports it for the web.

  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python tools/room/build_room.py -- [--quick]

Everything static is modelled here, lit by a low sun through the window, and baked (Cycles,
Metal) into one texture per surface group, so the browser shows real bounce light and soft
shadows for the cost of an unlit texture. The things that move in the browser (the record
player's platter and arm, the sleeves, the toys) are built in three.js instead.

Out: public/room/room.glb (Draco), and tools/room/room.blend for editing.
Coordinates: Blender Z up; the glTF exporter converts to Y up. 1 unit = 1 m.
"""
import math
import os
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector

HERE = Path(__file__).parent
TEX = HERE / 'textures'
ROOT = HERE.parent.parent
OUT = ROOT / 'public' / 'room'
OUT.mkdir(parents=True, exist_ok=True)
BAKED = HERE / 'baked'
BAKED.mkdir(exist_ok=True)
args = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []
QUICK = '--quick' in args

# ------------------------------------------------------------------------------------------- reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'


# ------------------------------------------------------------------------------------------- materials
def image(name):
    return bpy.data.images.load(str(TEX / name), check_existing=True)


def material(name, color=None, tex=None, rough=0.8, metal=0.0, scale=None, emit=None, alpha=None, mapping='UV'):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if color:
        c = [int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
        # sRGB to linear
        c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        b.inputs['Base Color'].default_value = (*c, 1)
    if tex:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = image(tex)
        if scale:
            mp = nt.nodes.new('ShaderNodeMapping')
            tc = nt.nodes.new('ShaderNodeTexCoord')
            nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
            mp.inputs['Scale'].default_value = (scale[0], scale[1], 1)
            nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
        nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if emit:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = image(emit[0])
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emit[1]
    if alpha is not None:
        b.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


MAT = {
    'plaster': material('plaster', tex='plaster.jpg', rough=0.95, scale=(3, 3)),
    'trim': material('trim', color='#f2ece0', rough=0.6),
    'floor': material('floor', tex='floor.jpg', rough=0.55, scale=(2, 2)),
    'oak': material('oak', tex='oak.jpg', rough=0.5),
    'walnut': material('walnut', tex='walnut.jpg', rough=0.55),
    'black': material('black', color='#151516', rough=0.45),
    'spines': material('spines', tex='spines.jpg', rough=0.7),
    'books': material('books', tex='books.jpg', rough=0.75),
    'poster': material('poster', tex='poster.jpg', rough=0.85),
    'photo0': material('photo0', tex='photo0.jpg', rough=0.3),
    'photo1': material('photo1', tex='photo1.jpg', rough=0.3),
    'sleeve0': material('sleeve0', tex='sleeve0.jpg', rough=0.75),
    'sleeve1': material('sleeve1', tex='sleeve1.jpg', rough=0.75),
    'sleeve2': material('sleeve2', tex='sleeve2.jpg', rough=0.75),
    'sleeve3': material('sleeve3', tex='sleeve3.jpg', rough=0.75),
    'leaf': material('leaf', color='#3f6b34', rough=0.6),
    'pot': material('pot', color='#c47a4f', rough=0.8),
    'brass': material('brass', color='#c9a06a', rough=0.3, metal=0.9),
    'lampshade': material('lampshade', color='#f3e2c0', rough=0.9),
    # the view out: emissive, so it lights the room a little itself and never shades
    'sky': material('sky', color='#000000', rough=1, emit=('sky.jpg', 1.6)),
}


# ------------------------------------------------------------------------------------------- helpers
def link(obj, coll=None):
    (coll or scene.collection).objects.link(obj)
    return obj


def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.0):
    """A box; size and loc in metres, loc is its centre. UVs by cube projection, scaled to metres."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(MAT[mat] if isinstance(mat, str) else mat)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
    cube_uv(o)
    return o


def cube_uv(o, s=1.0):
    """World-scaled box-projected UVs, so textures keep their size on any box."""
    me = o.data
    if not me.uv_layers:
        me.uv_layers.new(name='UVMap')
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            v = Vector((v.x * o.scale.x, v.y * o.scale.y, v.z * o.scale.z))
            if ax == 0:
                uv[li].uv = (v.y * s, v.z * s)
            elif ax == 1:
                uv[li].uv = (v.x * s, v.z * s)
            else:
                uv[li].uv = (v.x * s, v.y * s)


def cyl(name, r, h, loc, mat, verts=48, rot=(0, 0, 0), r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r2 is None else r2, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(MAT[mat] if isinstance(mat, str) else mat)
    bpy.ops.object.shade_smooth()
    return o


def plane(name, w, h, loc, rot, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = (w, h, 1)
    o.data.materials.append(MAT[mat] if isinstance(mat, str) else mat)
    return o


# ------------------------------------------------------------------------------------------- the room
# Floor 0..; back wall (with the window) at y = 2.0, facing -y; left wall at x = -2.2.
# The camera stands near (0.4, -3.6, 1.35), looking at the table.
W_Y = 2.0
L_X = -2.2
R_X = 2.6
H = 2.9

box('Floor', (R_X - L_X + 0.4, 6.2, 0.04), ((L_X + R_X) / 2, -1.0, -0.02), 'floor')
# the back wall: built around a window opening 2.3 m wide, 0.95 to 2.55 m high
WX0, WX1, WZ0, WZ1 = -0.85, 1.45, 0.95, 2.55
box('WallBack_L', (WX0 - L_X, 0.12, H), ((L_X + WX0) / 2, W_Y + 0.06, H / 2), 'plaster')
box('WallBack_R', (R_X - WX1, 0.12, H), ((WX1 + R_X) / 2, W_Y + 0.06, H / 2), 'plaster')
box('WallBack_B', (WX1 - WX0, 0.12, WZ0), ((WX0 + WX1) / 2, W_Y + 0.06, WZ0 / 2), 'plaster')
box('WallBack_T', (WX1 - WX0, 0.12, H - WZ1), ((WX0 + WX1) / 2, W_Y + 0.06, (WZ1 + H) / 2), 'plaster')
box('WallLeft', (0.12, 6.2, H), (L_X - 0.06, -1.0, H / 2), 'plaster')
box('WallRight', (0.12, 6.2, H), (R_X + 0.06, -1.0, H / 2), 'plaster')
box('Skirt_R', (0.02, 6.2, 0.12), (R_X - 0.01, -1.0, 0.06), 'trim')
None if '--top' in args else box('Ceiling', (R_X - L_X + 0.4, 6.2, 0.04), ((L_X + R_X) / 2, -1.0, H + 0.02), 'trim')
# skirting
box('Skirt_B', (R_X - L_X, 0.02, 0.12), ((L_X + R_X) / 2, W_Y - 0.01, 0.06), 'trim')
box('Skirt_L', (0.02, 6.2, 0.12), (L_X + 0.01, -1.0, 0.06), 'trim')

# the window: two sashes per half, white frames, a deep sill; the view behind
fw = 0.06
box('Sill', (WX1 - WX0 + 0.16, 0.24, 0.04), ((WX0 + WX1) / 2, W_Y - 0.06, WZ0 - 0.02), 'trim', bevel=0.006)
# the parts butt together rather than overlap, each at its own depth: overlapping boxes with
# coplanar faces flicker in the browser and bake dark speckles at the joints
mid = (WX0 + WX1) / 2
mw = fw * 1.6  # mullion width
for nm, size, loc in [
    ('Frame_L', (fw, 0.1, WZ1 - WZ0), (WX0 + fw / 2, W_Y, (WZ0 + WZ1) / 2)),
    ('Frame_R', (fw, 0.1, WZ1 - WZ0), (WX1 - fw / 2, W_Y, (WZ0 + WZ1) / 2)),
    ('Frame_T', (WX1 - WX0 - 2 * fw, 0.1, fw), (mid, W_Y, WZ1 - fw / 2)),
    ('Frame_B', (WX1 - WX0 - 2 * fw, 0.1, fw), (mid, W_Y, WZ0 + fw / 2)),
    ('Mullion', (mw, 0.086, WZ1 - WZ0 - 2 * fw), (mid, W_Y, (WZ0 + WZ1) / 2)),
]:
    box(nm, size, loc, 'trim')
zmid = WZ0 + (WZ1 - WZ0) * 0.48
rail = 0.05
for x0, x1 in [(WX0 + fw, mid - mw / 2), (mid + mw / 2, WX1 - fw)]:
    box(f'Rail_{x0:.2f}', (x1 - x0, 0.07, rail), ((x0 + x1) / 2, W_Y, zmid), 'trim')
    # glazing bars, recessed behind the rail: the top sash 3 x 2, the bottom 2 x 1
    zt0, zt1 = zmid + rail / 2, WZ1 - fw
    for k in (1, 2):
        x = x0 + (x1 - x0) * k / 3
        box(f'BarT_{x:.2f}', (0.025, 0.04, zt1 - zt0), (x, W_Y, (zt0 + zt1) / 2), 'trim')
    zh = zt0 + (zt1 - zt0) / 2
    for a, b in [(x0, x0 + (x1 - x0) / 3 - 0.0125), (x0 + (x1 - x0) / 3 + 0.0125, x0 + 2 * (x1 - x0) / 3 - 0.0125), (x0 + 2 * (x1 - x0) / 3 + 0.0125, x1)]:
        box(f'BarTH_{a:.2f}', (b - a, 0.032, 0.025), ((a + b) / 2, W_Y, zh), 'trim')
    zb0, zb1 = WZ0 + fw, zmid - rail / 2
    box(f'BarB_{x0:.2f}', (0.025, 0.04, zb1 - zb0), ((x0 + x1) / 2, W_Y, (zb0 + zb1) / 2), 'trim')
# the outside: one big emissive card a little way back, so it parallaxes as the camera moves
view_card = plane('View', 6.4, 3.2, (mid, W_Y + 1.8, 1.8), (math.radians(90), 0, 0), 'sky')
# it's a picture, not a wall: the sun passes straight through it
view_card.visible_shadow = False

# the table: oak top, square legs, an apron
TX, TY, TZ = 0.25, 1.25, 0.76
tw, td = 2.0, 0.8
box('TableTop', (tw, td, 0.05), (TX, TY, TZ - 0.025), 'oak', bevel=0.006)
for sx in (-1, 1):
    for sy in (-1, 1):
        box(f'Leg_{sx}{sy}', (0.07, 0.07, TZ - 0.05), (TX + sx * (tw / 2 - 0.08), TY + sy * (td / 2 - 0.08), (TZ - 0.05) / 2), 'oak')
box('Apron_F', (tw - 0.16, 0.025, 0.1), (TX, TY - td / 2 + 0.09, TZ - 0.1), 'oak')
box('Apron_B', (tw - 0.16, 0.025, 0.1), (TX, TY + td / 2 - 0.09, TZ - 0.1), 'oak')

# the record player's body (its platter and arm are live in the browser): a walnut plinth on a
# black base, set back on the table; a smoked dust cover hinged open behind it
PX, PY = TX + 0.1, TY + 0.05
box('TT_Base', (0.46, 0.36, 0.05), (PX, PY, TZ + 0.025), 'black', bevel=0.004)
box('TT_Plinth', (0.46, 0.36, 0.035), (PX, PY, TZ + 0.0675), 'walnut', bevel=0.003)
cyl('TT_Knob', 0.018, 0.012, (PX - 0.19, PY - 0.14, TZ + 0.091), 'black')

# record stacks on the table: a lean against the wall, a flat pile, books
for i in range(6):
    box(f'Lean_{i}', (0.31, 0.012, 0.31), (TX - 0.72 + i * 0.012, TY + 0.25, TZ + 0.155), f'sleeve{i % 4}', rot=(math.radians(-14 - i * 1.5), 0, 0))
for i in range(5):
    box(f'Flat_{i}', (0.31, 0.31, 0.009), (TX - 0.52 + (i % 2) * 0.01, TY - 0.12 + (i % 3) * 0.008, TZ + 0.0045 + i * 0.009), f'sleeve{(i + 1) % 4}', rot=(0, 0, math.radians(4 - i * 2)))
for i, (w, h) in enumerate([(0.22, 0.04), (0.2, 0.035), (0.21, 0.03), (0.18, 0.045)]):
    box(f'Book_{i}', (w, 0.15, h), (TX - 0.32, TY + 0.22, TZ + 0.02 + sum(x[1] for x in [(0, 0.04), (0, 0.035), (0, 0.03)][:i]) + h / 2), 'books', rot=(0, 0, math.radians(-3 + i * 2)))

# frames on the left of the window: the drawing-sheet poster and two photos
def frame(name, w, h, loc, mat, tilt=0):
    box(name + '_F', (w + 0.04, 0.025, h + 0.04), loc, 'black', rot=(0, 0, 0))
    o = plane(name, w, h, (loc[0], loc[1] - 0.014, loc[2]), (math.radians(90), 0, 0), mat)
    return o


frame('Poster', 0.48, 0.67, (-1.35, W_Y - 0.02, 1.85), 'poster')
frame('Photo0', 0.42, 0.32, (-1.85, W_Y - 0.02, 2.2), 'photo0')
frame('Photo1', 0.36, 0.27, (-1.95, W_Y - 0.02, 1.55), 'photo1')

# the record shelf on the right: a walnut case, three bays of spines
SX, SY = 2.05, 1.55
sw, sd, sh = 0.95, 0.4, 2.0
box('Shelf_L', (0.03, sd, sh), (SX - sw / 2, SY, sh / 2), 'walnut')
box('Shelf_R', (0.03, sd, sh), (SX + sw / 2, SY, sh / 2), 'walnut')
box('Shelf_Back', (sw, 0.02, sh), (SX, SY + sd / 2 - 0.01, sh / 2), 'walnut')
for k, z in enumerate([0.05, 0.6, 1.15, 1.7, sh - 0.015]):
    box(f'Shelf_{k}', (sw, sd, 0.03), (SX, SY, z), 'walnut')
for k, z in enumerate([0.065, 0.615, 1.165]):
    s = box(f'Spines_{k}', (sw - 0.04, sd - 0.05, 0.33), (SX, SY - 0.01, z + 0.18), 'spines')
    # spines face the room: map the texture across the front, a third of it per bay
    me = s.data
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv[li].uv = ((co.x + 0.5) / 3 + k / 3, co.z + 0.5)

# a lamp on the shelf, a plant on top, trailing down
cyl('Lamp_Base', 0.07, 0.02, (SX - 0.22, SY - 0.05, 1.725), 'brass')
cyl('Lamp_Stem', 0.008, 0.3, (SX - 0.22, SY - 0.05, 1.88), 'brass', verts=12)
cyl('Lamp_Shade', 0.07, 0.14, (SX - 0.22, SY - 0.05, 2.06), 'lampshade', r2=0.13)
cyl('Pot', 0.13, 0.22, (SX + 0.15, SY, sh + 0.11), 'pot', r2=0.11)
import random

rnd = random.Random(4)
leaves = []
for i in range(46):
    # a crown on the pot, then two vines hanging down the shelf's left side
    if i < 18:
        p = (SX + 0.15 + rnd.uniform(-0.18, 0.18), SY + rnd.uniform(-0.15, 0.12), sh + 0.25 + rnd.uniform(0, 0.2))
    else:
        t = (i - 18) / 28
        vine = i % 2
        p = (SX - 0.2 - vine * 0.28 + math.sin(t * 9 + vine) * 0.06, SY - 0.22 + rnd.uniform(-0.03, 0.03), sh + 0.15 - t * (1.4 if vine else 1.0))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.045, location=p)
    lf = bpy.context.active_object
    lf.scale = (1.0, 0.35, 0.7)
    lf.rotation_euler = (rnd.uniform(-0.6, 0.6), rnd.uniform(-0.6, 0.6), rnd.uniform(0, 3.1))
    lf.data.materials.append(MAT['leaf'])
    leaves.append(lf)
bpy.ops.object.select_all(action='DESELECT')
for lf in leaves:
    lf.select_set(True)
bpy.context.view_layer.objects.active = leaves[0]
bpy.ops.object.join()
bpy.context.active_object.name = 'Plant'
bpy.ops.object.shade_smooth()

# ------------------------------------------------------------------------------------------- light
world = bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.9, 0.55, 0.42, 1)
bg.inputs['Strength'].default_value = 0.12

# the sun, low and warm, coming in through the window from the right
sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
link(sun)
sun.data.energy = 11
sun.data.color = (1.0, 0.62, 0.36)
sun.data.angle = math.radians(2.5)
# aimed explicitly: golden hour, in through the window from the left, so the panes fall across the table
SUN_DIR = Vector((0.28, -0.55, -0.82)).normalized()
sun.rotation_euler = SUN_DIR.to_track_quat('-Z', 'Y').to_euler()
# soft sky light from the window opening
win = bpy.data.objects.new('WindowLight', bpy.data.lights.new('WindowLight', 'AREA'))
link(win)
win.data.shape = 'RECTANGLE'
win.data.size, win.data.size_y = WX1 - WX0, WZ1 - WZ0
win.data.energy = 90
win.data.color = (1.0, 0.72, 0.6)
win.location = (mid, W_Y - 0.08, (WZ0 + WZ1) / 2)
win.rotation_euler = (math.radians(-90), 0, 0)
# the lamp, warm and small
lamp = bpy.data.objects.new('LampLight', bpy.data.lights.new('LampLight', 'POINT'))
link(lamp)
lamp.data.energy = 40
lamp.data.color = (1.0, 0.7, 0.42)
lamp.data.shadow_soft_size = 0.05
lamp.location = (SX - 0.22, SY - 0.05, 2.0)

# ------------------------------------------------------------------------------------------- bake
if '--preview' in args:
    # a straight Cycles render from the browser's viewpoint, to judge the light before baking
    cam = bpy.data.objects.new('PreviewCam', bpy.data.cameras.new('PreviewCam'))
    link(cam)
    cam.data.lens = 30
    cam.location = (0.35, -2.9, 1.35) if '--top' not in args else (0.3, -1.6, 4.2)
    aim = Vector((0.3, 1.25, 1.05)) if '--top' not in args else Vector((0.3, 0.6, 0.6))
    cam.rotation_euler = (aim - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'GPU'
    scene.cycles.samples = 48
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.view_settings.view_transform = 'Standard'
    if '--no-view' in args:
        view_card.hide_render = True
    scene.render.filepath = args[args.index('--preview') + 1]
    bpy.ops.render.render(write_still=True)
    sys.exit(0)
scene.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as e:  # noqa: BLE001
    print('cycles: CPU', e)
scene.cycles.samples = 24 if QUICK else 160
scene.cycles.use_denoising = True
scene.render.bake.margin = 6

# merge everything static into a few groups, one baked texture each
GROUPS = {
    'room': ['Floor', 'WallBack', 'WallLeft', 'WallRight', 'Ceiling', 'Skirt'],
    'window': ['Sill', 'Frame', 'Mullion', 'Rail', 'Bar'],
    'table': ['TableTop', 'Leg', 'Apron', 'TT_', 'Lean', 'Flat', 'Book'],
    'wall': ['Poster', 'Photo'],
    'shelf': ['Shelf', 'Spines', 'Lamp_', 'Pot', 'Plant'],
}
RES = {'room': 2048, 'window': 1024, 'table': 2048, 'wall': 1024, 'shelf': 2048}
if QUICK:
    RES = {k: v // 2 for k, v in RES.items()}

for o in list(scene.objects):
    if o.type == 'MESH':
        for m in o.modifiers:
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=m.name)

baked = []
for g, prefixes in GROUPS.items():
    objs = [o for o in scene.objects if o.type == 'MESH' and any(o.name.startswith(p) for p in prefixes)]
    if not objs:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = g
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # a second UV set, laid out for the bake
    me = obj.data
    me.uv_layers.active = me.uv_layers[0]
    bake_uv = me.uv_layers.new(name='Bake')
    me.uv_layers.active = bake_uv
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004, area_weight=1.0)
    bpy.ops.uv.pack_islands(margin=0.004)
    bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images.new(f'bake_{g}', RES[g], RES[g])
    for mat in me.materials:
        nt = mat.node_tree
        node = nt.nodes.new('ShaderNodeTexImage')
        node.image = img
        uvn = nt.nodes.new('ShaderNodeUVMap')
        uvn.uv_map = 'Bake'
        nt.links.new(uvn.outputs['UV'], node.inputs['Vector'])
        for n in nt.nodes:
            n.select = False
        node.select = True
        nt.nodes.active = node
    # the sky card shouldn't shade the bake of anything behind it; it's a light source
    print('baking', g, RES[g])
    bpy.ops.object.bake(type='COMBINED', use_clear=True, margin=6)
    path = BAKED / f'{g}.png'
    img.filepath_raw = str(path)
    img.file_format = 'PNG'
    img.save()
    baked.append((obj, img))

# swap every baked group to one flat material showing its bake (shading in the browser is free)
for obj, img in baked:
    m = bpy.data.materials.new(f'baked_{obj.name}')
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = img
    nt.links.new(t.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    obj.data.materials.clear()
    obj.data.materials.append(m)
    # only the bake UVs ship
    me = obj.data
    for uvl in list(me.uv_layers):
        if uvl.name != 'Bake':
            me.uv_layers.remove(uvl)

# the view keeps its own picture
view = scene.objects['View']
view.data.materials.clear()
vm = bpy.data.materials.new('baked_view')
vm.use_nodes = True
nt = vm.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
out = nt.nodes.new('ShaderNodeOutputMaterial')
em = nt.nodes.new('ShaderNodeEmission')
t = nt.nodes.new('ShaderNodeTexImage')
t.image = image('sky.jpg')
nt.links.new(t.outputs['Color'], em.inputs['Color'])
nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
view.data.materials.append(vm)

# markers for the live parts: where the platter, the arm and the sleeve stand go
for name, loc in [('M_Platter', (PX - 0.05, PY, TZ + 0.095)), ('M_Arm', (PX + 0.16, PY + 0.11, TZ + 0.1)), ('M_Stand', (PX - 0.46, PY + 0.22, TZ)), ('M_Lamp', (SX - 0.22, SY - 0.05, 2.0))]:
    e = bpy.data.objects.new(name, None)
    link(e)
    e.location = loc

for o in [sun, win, lamp]:
    bpy.data.objects.remove(o)

bpy.ops.wm.save_as_mainfile(filepath=str(HERE / 'room.blend'))
bpy.ops.export_scene.gltf(
    filepath=str(OUT / 'room.glb'),
    export_format='GLB',
    export_apply=True,
    export_image_format='JPEG',
    export_jpeg_quality=86,
    export_texcoords=True,
    export_normals=False,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
print('exported', OUT / 'room.glb', os.path.getsize(OUT / 'room.glb') // 1024, 'KB')
