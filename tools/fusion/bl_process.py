# blender -b -P bl_process.py -- <in_dir> <out.glb> <target_tris> <preview.png>
import bpy, sys, os, glob, math, bmesh
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
src, out, target, preview = argv[0], argv[1], int(argv[2]), argv[3]

bpy.ops.wm.read_factory_settings(use_empty=True)
files = sorted(glob.glob(os.path.join(src, '*.stl')))
import json
from mathutils import Matrix
tf_path = os.path.join(src, 'transforms.json')
placed = json.load(open(tf_path)) if os.path.exists(tf_path) else {}
parts = []
for f in files:
    bpy.ops.wm.stl_import(filepath=f)
    o = bpy.context.selected_objects[0]
    o.name = os.path.splitext(os.path.basename(f))[0]
    a = placed.get(os.path.basename(f))
    if a:
        # Fusion matrix: row-major, translation in cm; the STL is in mm
        m = Matrix([a[0:4], a[4:8], a[8:12], a[12:16]])
        for i in range(3):
            m[i][3] *= 10
        o.data.transform(m)
    parts.append(o)

def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)
total = sum(tris(o) for o in parts)
print('parts', len(parts), 'tris in', total)

# share the budget so big smooth shells keep enough triangles: every part keeps
# at least FLOOR (or all it has), the rest is shared in proportion
FLOOR = 4000
counts = [tris(o) for o in parts]
def alloc(r):
    return [min(c, max(int(c * r), FLOOR)) for c in counts]
lo, hi = 0.0, 1.0
for _ in range(40):
    mid = (lo + hi) / 2
    if sum(alloc(mid)) > target: hi = mid
    else: lo = mid
budget = alloc(lo)
for o, c, b in zip(parts, counts, budget):
    bpy.context.view_layer.objects.active = o
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bm.to_mesh(o.data); bm.free()
    if b < c:
        m = o.modifiers.new('dec', 'DECIMATE')
        m.ratio = b / c
        m.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=m.name)
# smooth curved surfaces, keep CAD edges sharp
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(32))
print('tris out', sum(tris(o) for o in parts))

# centre on origin, scale so the longest side is 2 units (the viewer frames it)
mins = Vector((1e18,) * 3); maxs = Vector((-1e18,) * 3)
for o in parts:
    for v in o.data.vertices:
        w = o.matrix_world @ v.co
        mins = Vector(map(min, mins, w)); maxs = Vector(map(max, maxs, w))
centre = (mins + maxs) / 2; size = max(maxs - mins)
print('bbox', tuple(round(x, 2) for x in (maxs - mins)))
for o in parts:
    o.data.transform(__import__('mathutils').Matrix.Translation(-centre))
    o.data.transform(__import__('mathutils').Matrix.Scale(2 / size, 4))

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_normals=True, export_materials='NONE', export_yup=True, export_apply=True)
print('glb', os.path.getsize(out))

# quick check render
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.show_cavity = True
scene.render.resolution_x, scene.render.resolution_y = 700, 520
scene.render.filepath = preview
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam); scene.camera = cam
cam.location = (3.2, -3.2, 2.4)
cam.rotation_euler = (math.radians(62), 0, math.radians(45))
cam.data.lens = 50
bpy.ops.render.render(write_still=True)
