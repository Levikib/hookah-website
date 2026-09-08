"""
Door Rigging Script for HKH Hookah Website
Paste into Blender Scripting tab and Run.
Imports each door GLB, decimates mesh, rigs with armature,
bakes open/close animation, exports compressed GLB.
"""

import bpy
import bmesh
import mathutils
import os
import math

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODELS_DIR = r"\\wsl$\Ubuntu\home\shannara\Hookah\public\models"
if not os.path.exists(MODELS_DIR):
    MODELS_DIR = "/home/shannara/Hookah/public/models"

# Single vs double panel classification
DOORS = {
    "door_solo":      {"type": "single", "file": "door_solo.glb"},
    "door_duo":       {"type": "single", "file": "door_duo.glb"},
    "door_rooftop":   {"type": "single", "file": "door_rooftop.glb"},
    "door_wedding":   {"type": "double", "file": "door_wedding.glb"},
    "door_custom":    {"type": "double", "file": "door_custom.glb"},
    "door_vip":       {"type": "double", "file": "door_vip.glb"},
    "door_squad":     {"type": "double", "file": "door_squad.glb"},
    "door_corporate": {"type": "double", "file": "door_corporate.glb"},
}

# Decimate ratio — keeps 8% of verts, still looks great for a door
DECIMATE_RATIO = 0.08

FPS          = 24
FRAME_CLOSED = 1
FRAME_OPEN   = 36
OPEN_ANGLE   = math.radians(110)
HOLD_FRAMES  = 60
FRAME_CLOSE  = FRAME_OPEN + HOLD_FRAMES
FRAME_END    = FRAME_CLOSE + FRAME_OPEN - 1

# ── HELPERS ───────────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:    bpy.data.meshes.remove(block)
    for block in bpy.data.armatures: bpy.data.armatures.remove(block)
    for block in bpy.data.objects:   bpy.data.objects.remove(block)

def import_glb(filepath):
    bpy.ops.import_scene.gltf(filepath=filepath)
    return list(bpy.context.selected_objects)

def get_mesh_obj(objects):
    for o in objects:
        if o.type == 'MESH':
            return o
    return None

def get_bounds(obj):
    corners = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
    xs = [c.x for c in corners]
    ys = [c.y for c in corners]
    zs = [c.z for c in corners]
    return (min(xs), max(xs)), (min(ys), max(ys)), (min(zs), max(zs))

def center_object(obj):
    (xmin, xmax), (ymin, ymax), (zmin, zmax) = get_bounds(obj)
    obj.location.x -= (xmin + xmax) / 2
    obj.location.y -= (ymin + ymax) / 2
    obj.location.z -= (zmin + zmax) / 2
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

def decimate_mesh(obj, ratio):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new(name="Decimate", type='DECIMATE')
    mod.decimate_type = 'COLLAPSE'
    mod.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=mod.name)
    print(f"  Decimated to {len(obj.data.vertices)} verts")

def split_double_door(obj):
    """Split mesh at X=0 into left and right panels."""
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # Duplicate for right
    bpy.ops.object.duplicate()
    right_obj = bpy.context.active_object
    right_obj.name = obj.name + "_right"

    # Left: remove verts with X > 0
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x > 0.01], context='VERTS')
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.name = obj.name + "_left"

    # Right: remove verts with X < 0
    bpy.ops.object.select_all(action='DESELECT')
    right_obj.select_set(True)
    bpy.context.view_layer.objects.active = right_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(right_obj.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x < -0.01], context='VERTS')
    bmesh.update_edit_mesh(right_obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    return obj, right_obj

def create_armature(door_name):
    bpy.ops.object.armature_add(location=(0, 0, 0))
    arm_obj = bpy.context.active_object
    arm_obj.name = door_name + "_armature"
    arm_obj.data.name = door_name + "_armature"
    return arm_obj

def assign_all_verts(mesh_obj, bone_name):
    if bone_name not in mesh_obj.vertex_groups:
        vg = mesh_obj.vertex_groups.new(name=bone_name)
    else:
        vg = mesh_obj.vertex_groups[bone_name]
    vg.add(list(range(len(mesh_obj.data.vertices))), 1.0, 'REPLACE')

def parent_to_armature(mesh_obj, arm_obj):
    bpy.ops.object.select_all(action='DESELECT')
    mesh_obj.select_set(True)
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.parent_set(type='ARMATURE_NAME')

def rig_single_door(mesh_obj, door_name):
    (xmin, xmax), (ymin, ymax), (zmin, zmax) = get_bounds(mesh_obj)
    hinge_x = xmin
    mid_y   = (ymin + ymax) / 2

    arm_obj = create_armature(door_name)
    bpy.ops.object.mode_set(mode='EDIT')
    bone = arm_obj.data.edit_bones[0]
    bone.name = "door_panel"
    bone.head = mathutils.Vector((hinge_x, mid_y, zmin))
    bone.tail = mathutils.Vector((hinge_x, mid_y, zmax))
    bone.roll = 0
    bpy.ops.object.mode_set(mode='OBJECT')

    parent_to_armature(mesh_obj, arm_obj)
    assign_all_verts(mesh_obj, "door_panel")

    return arm_obj, [("door_panel", -OPEN_ANGLE)]

def rig_double_door(left_obj, right_obj, door_name):
    (lxmin, lxmax), (lymin, lymax), (lzmin, lzmax) = get_bounds(left_obj)
    (rxmin, rxmax), (rymin, rymax), (rzmin, rzmax) = get_bounds(right_obj)
    mid_y = (lymin + lymax) / 2

    arm_obj = create_armature(door_name)
    bpy.ops.object.mode_set(mode='EDIT')

    # Left bone — hinge at left edge of left panel
    lb = arm_obj.data.edit_bones[0]
    lb.name = "door_left"
    lb.head = mathutils.Vector((lxmin, mid_y, lzmin))
    lb.tail = mathutils.Vector((lxmin, mid_y, lzmax))
    lb.roll = 0

    # Right bone — hinge at right edge of right panel
    rb = arm_obj.data.edit_bones.new("door_right")
    rb.head = mathutils.Vector((rxmax, mid_y, rzmin))
    rb.tail = mathutils.Vector((rxmax, mid_y, rzmax))
    rb.roll = 0

    bpy.ops.object.mode_set(mode='OBJECT')

    parent_to_armature(left_obj, arm_obj)
    assign_all_verts(left_obj, "door_left")

    parent_to_armature(right_obj, arm_obj)
    assign_all_verts(right_obj, "door_right")

    # Left opens CCW (negative Z), right opens CW (positive Z)
    return arm_obj, [("door_left", -OPEN_ANGLE), ("door_right", +OPEN_ANGLE)]

def bake_animation(arm_obj, bone_targets):
    bpy.context.scene.render.fps = FPS
    bpy.context.scene.frame_start = FRAME_CLOSED
    bpy.context.scene.frame_end   = FRAME_END

    bpy.ops.object.select_all(action='DESELECT')
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')

    for bone_name, open_angle in bone_targets:
        bone = arm_obj.pose.bones[bone_name]
        bone.rotation_mode = 'XYZ'

        def key(frame, angle):
            bpy.context.scene.frame_set(frame)
            bone.rotation_euler = mathutils.Euler((0, 0, angle), 'XYZ')
            bone.keyframe_insert(data_path="rotation_euler", frame=frame)

        key(FRAME_CLOSED, 0)           # closed
        key(FRAME_OPEN,   open_angle)  # fully open
        key(FRAME_CLOSE,  open_angle)  # hold open
        key(FRAME_END,    0)           # swing back closed

    # Set easing on keyframes
    bpy.ops.object.mode_set(mode='OBJECT')
    action = arm_obj.animation_data.action
    for fc in action.fcurves:
        kps = fc.keyframe_points
        # Open swing: ease out (smooth arrival at open)
        kps[1].interpolation = 'BACK'
        kps[1].easing = 'EASE_OUT'
        # Hold: linear
        kps[2].interpolation = 'LINEAR'
        # Close swing: elastic bounce at end
        kps[3].interpolation = 'ELASTIC'
        kps[3].easing = 'EASE_OUT'

def export_glb(door_name, output_dir):
    out_path = os.path.join(output_dir, door_name + "_rigged.glb")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_animations=True,
        export_skins=True,
        export_morph=False,
        export_apply=False,
        export_yup=True,
        export_image_format='JPEG',
        export_jpeg_quality=80,
        use_selection=False,
    )
    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"  ✓ Exported: {out_path} ({size_mb:.1f}MB)")

# ── MAIN ─────────────────────────────────────────────────────────────────────

def process_door(door_name, config):
    print(f"\n{'='*50}\nProcessing: {door_name} ({config['type']})")
    clear_scene()

    input_path = os.path.join(MODELS_DIR, config['file'])
    imported  = import_glb(input_path)
    mesh_obj  = get_mesh_obj(imported)
    if not mesh_obj:
        print(f"  ERROR: no mesh found"); return

    print(f"  Imported: {len(mesh_obj.data.vertices)} verts")
    center_object(mesh_obj)
    decimate_mesh(mesh_obj, DECIMATE_RATIO)

    if config['type'] == 'single':
        arm_obj, bone_targets = rig_single_door(mesh_obj, door_name)
    else:
        mesh_obj.name = door_name
        left_obj, right_obj = split_double_door(mesh_obj)
        arm_obj, bone_targets = rig_double_door(left_obj, right_obj, door_name)

    bake_animation(arm_obj, bone_targets)
    export_glb(door_name, MODELS_DIR)

print("\n🚀 Starting door rigging batch...")
for door_name, config in DOORS.items():
    try:
        process_door(door_name, config)
    except Exception as e:
        import traceback
        print(f"\n❌ FAILED {door_name}: {e}")
        traceback.print_exc()

print("\n✅ All doors processed!")
