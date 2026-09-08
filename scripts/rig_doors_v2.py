"""
Door Animation Script v2 — HKH Hookah Website
Uses object-level animation via Empty pivot (no armature/skinning).
Each door panel rotates around an Empty placed at its hinge edge.
Exports clean GLB with working open/close/hold animation.

Paste into Blender Scripting tab and Run.
"""

import bpy
import bmesh
import mathutils
import os
import math

MODELS_DIR = r"\\wsl$\Ubuntu\home\shannara\Hookah\public\models"
if not os.path.exists(MODELS_DIR):
    MODELS_DIR = "/home/shannara/Hookah/public/models"

DOORS = {
    "door_solo":      {"type": "single", "file": "door_solo_rigged.glb"},
    "door_duo":       {"type": "single", "file": "door_duo_rigged.glb"},
    "door_rooftop":   {"type": "single", "file": "door_rooftop_rigged.glb"},
    "door_wedding":   {"type": "double", "file": "door_wedding_rigged.glb"},
    "door_custom":    {"type": "double", "file": "door_custom_rigged.glb"},
    "door_vip":       {"type": "double", "file": "door_vip_rigged.glb"},
    "door_squad":     {"type": "double", "file": "door_squad_rigged.glb"},
    "door_corporate": {"type": "double", "file": "door_corporate_rigged.glb"},
}

FPS           = 24
OPEN_ANGLE    = math.radians(105)   # how far door opens
F_CLOSED      = 1                   # frame: door closed
F_OPEN        = 36                  # frame: door fully open (1.5s)
F_HOLD        = 96                  # frame: still open (2.5s hold)
F_SHUT        = 130                 # frame: door closed again

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for d in [bpy.data.meshes, bpy.data.armatures, bpy.data.objects,
              bpy.data.actions, bpy.data.curves]:
        for b in list(d): d.remove(b)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    return list(bpy.context.selected_objects)

def get_mesh(objects):
    return next((o for o in objects if o.type == 'MESH'), None)

def world_bounds(obj):
    corners = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
    xs = [c.x for c in corners]
    ys = [c.y for c in corners]
    zs = [c.z for c in corners]
    return (min(xs),max(xs)), (min(ys),max(ys)), (min(zs),max(zs))

def center_at_origin(obj):
    (xmin,xmax),(ymin,ymax),(zmin,zmax) = world_bounds(obj)
    obj.location.x -= (xmin+xmax)/2
    obj.location.y -= (ymin+ymax)/2
    obj.location.z -= (zmin+zmax)/2
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True)

def split_left_right(obj):
    """Split mesh at X=0 into two separate objects."""
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.duplicate()
    right = bpy.context.active_object
    right.name = "right_panel"

    # Left: delete verts with X > 0
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x > 0.005], context='VERTS')
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.name = "left_panel"

    # Right: delete verts with X < 0
    bpy.ops.object.select_all(action='DESELECT')
    right.select_set(True)
    bpy.context.view_layer.objects.active = right
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(right.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x < -0.005], context='VERTS')
    bmesh.update_edit_mesh(right.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    return obj, right

def make_pivot_empty(name, location):
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=location)
    e = bpy.context.active_object
    e.name = name
    return e

def parent_to_pivot(mesh_obj, pivot_empty):
    """Parent mesh to pivot empty, keeping current transform."""
    bpy.ops.object.select_all(action='DESELECT')
    mesh_obj.select_set(True)
    pivot_empty.select_set(True)
    bpy.context.view_layer.objects.active = pivot_empty
    bpy.ops.object.parent_set(type='OBJECT', keep_transform=True)

def animate_pivot(pivot, axis, open_angle, action_name):
    """Keyframe the pivot Empty's Z rotation: closed → open → hold → closed."""
    bpy.context.scene.render.fps = FPS
    bpy.context.scene.frame_start = F_CLOSED
    bpy.context.scene.frame_end   = F_SHUT

    pivot.rotation_mode = 'XYZ'

    def key(frame, angle):
        bpy.context.scene.frame_set(frame)
        if axis == 'Z':
            pivot.rotation_euler = mathutils.Euler((0, 0, angle), 'XYZ')
        else:
            pivot.rotation_euler = mathutils.Euler((0, 0, angle), 'XYZ')
        pivot.keyframe_insert(data_path="rotation_euler", frame=frame)

    key(F_CLOSED, 0)
    key(F_OPEN,   open_angle)
    key(F_HOLD,   open_angle)
    key(F_SHUT,   0)

    # Polish the fcurves
    if pivot.animation_data and pivot.animation_data.action:
        for fc in pivot.animation_data.action.fcurves:
            kps = fc.keyframe_points
            if len(kps) >= 4:
                # Open swing: ease out with slight overshoot
                kps[0].interpolation = 'BEZIER'
                kps[1].interpolation = 'BACK'
                kps[1].easing = 'EASE_OUT'
                # Hold
                kps[2].interpolation = 'BEZIER'
                # Close: elastic bounce
                kps[3].interpolation = 'BOUNCE'
                kps[3].easing = 'EASE_OUT'
        pivot.animation_data.action.name = action_name

def export_glb(door_name, out_dir):
    out = os.path.join(out_dir, door_name + "_rigged.glb")
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format='GLB',
        export_animations=True,
        export_skins=False,          # no skinning — object animation only
        export_morph=False,
        export_apply=False,
        export_yup=True,
        export_image_format='JPEG',
        export_jpeg_quality=82,
        use_selection=False,
        export_animation_mode='ACTIONS',
    )
    mb = os.path.getsize(out) / 1024 / 1024
    print(f"  -> {out} ({mb:.1f}MB)")

def process(door_name, cfg):
    print(f"\n{'='*50}\n{door_name} ({cfg['type']})")
    clear_scene()

    src = os.path.join(MODELS_DIR, cfg['file'])
    objs = import_glb(src)
    mesh = get_mesh(objs)
    if not mesh:
        print("  ERROR: no mesh"); return

    # Strip any existing armature modifiers
    for mod in list(mesh.modifiers):
        mesh.modifiers.remove(mod)

    print(f"  verts: {len(mesh.data.vertices)}")
    center_at_origin(mesh)

    (xmin,xmax),(ymin,ymax),(zmin,zmax) = world_bounds(mesh)

    if cfg['type'] == 'single':
        # Hinge on left edge (xmin), pivot at that X, mid Y, bottom Z
        hinge_x = xmin
        pivot = make_pivot_empty("pivot_main", (hinge_x, (ymin+ymax)/2, 0))
        parent_to_pivot(mesh, pivot)
        # Single door opens counter-clockwise (negative Z when viewed from top)
        animate_pivot(pivot, 'Z', -OPEN_ANGLE, f"{door_name}_open")

    else:
        left, right = split_left_right(mesh)

        (lxmin,lxmax),(lymin,lymax),(lzmin,lzmax) = world_bounds(left)
        (rxmin,rxmax),(rymin,rymax),(rzmin,rzmax) = world_bounds(right)

        # Left panel hinges on its left edge
        pivot_l = make_pivot_empty("pivot_left",  (lxmin, (lymin+lymax)/2, 0))
        parent_to_pivot(left, pivot_l)
        animate_pivot(pivot_l, 'Z', -OPEN_ANGLE, f"{door_name}_left_open")

        # Right panel hinges on its right edge
        pivot_r = make_pivot_empty("pivot_right", (rxmax, (rymin+rymax)/2, 0))
        parent_to_pivot(right, pivot_r)
        animate_pivot(pivot_r, 'Z', +OPEN_ANGLE, f"{door_name}_right_open")

    export_glb(door_name, MODELS_DIR)

print("\n Starting batch...")
bpy.context.scene.render.fps = FPS

for name, cfg in DOORS.items():
    try:
        process(name, cfg)
    except Exception as e:
        import traceback
        print(f"\n FAILED {name}: {e}")
        traceback.print_exc()

print("\n All done! Check _rigged.glb files.")
