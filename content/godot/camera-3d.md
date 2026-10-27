# Camera 3D

## Summary

`Camera3D` renders the 3D scene. Aim it with `look_at()`, and place objects at the edges or center of what it sees either with `project_position()` (works for both projections) or by computing the visible extents from `fov` (perspective) or `size` (orthographic).

## Details

**Pointing at an object**
- A camera looks down its local **-Z** axis. `Node3D.look_at(target, up = Vector3.UP)` rotates it so -Z faces `target` (global position). The node must be inside the tree.
- `look_at_from_position(position, target, up)` moves and aims in one call.
- To track a moving target, call it every frame in `_process`. For a smooth follow, slerp toward `Basis.looking_at(direction, up)`.

**Perspective camera: edges and center**
- `Camera3D.fov` is **vertical** by default (`keep_aspect = KEEP_HEIGHT`).
- At distance `d` in front of the camera: half-height = `d * tan(deg_to_rad(fov) / 2)`, half-width = half-height * aspect (`viewport.x / viewport.y`).
- Easiest: `project_position(screen_point, z_depth)` returns the world point under a screen pixel at `z_depth` units in front of the camera. Center = `size / 2`, edges = `(0, y/2)`, `(w, y/2)`, `(w/2, 0)`, `(w/2, h)` (see [Screen and viewport](screen)).
- Reverse: `unproject_position(world_pos)` gives the screen pixel of a world point.

**Orthographic camera: edges and center**
- Set `projection = Camera3D.PROJECTION_ORTHOGONAL`. `size` is the **full visible height** in world units (full width if `keep_aspect = KEEP_WIDTH`).
- Half-height = `size / 2`, half-width = half-height * aspect.
- Distance from the camera does **not** change where an object lands on screen. Only `near` / `far` clip it.
- `project_position()` works unchanged; `z_depth` only picks the point along the (parallel) ray.

## Snippet

```gdscript
extends Node3D

@onready var cam: Camera3D = $Camera3D
@onready var target: Node3D = $Target
@onready var marker: Node3D = $Marker

func _ready() -> void:
	# Aim
	cam.look_at_from_position(Vector3(0, 3, 6), target.global_position)

func _process(_delta: float) -> void:
	# Track a moving target
	cam.look_at(target.global_position)

func place_at_screen(point: Vector2, depth: float = 5.0) -> void:
	# Works for perspective and orthographic
	marker.global_position = cam.project_position(point, depth)

func place_center() -> void:
	place_at_screen(get_viewport().get_visible_rect().size / 2.0)

func place_left_edge() -> void:
	var size := get_viewport().get_visible_rect().size
	place_at_screen(Vector2(0, size.y / 2.0))

# Manual maths, perspective (KEEP_HEIGHT)
func perspective_extents(d: float) -> Vector2:
	var half_h := d * tan(deg_to_rad(cam.fov) / 2.0)
	var aspect := get_viewport().get_visible_rect().size.aspect()
	return Vector2(half_h * aspect, half_h)

# Manual maths, orthographic (KEEP_HEIGHT)
func ortho_extents() -> Vector2:
	var half_h := cam.size / 2.0
	var aspect := get_viewport().get_visible_rect().size.aspect()
	return Vector2(half_h * aspect, half_h)
```

## Pitfalls

- `look_at()` before the node is in the tree errors out; call it after `add_child()` or in `_ready()`.
- `up` parallel to the view direction (e.g. looking straight down with `Vector3.UP`) fails; pass another `up`, such as `Vector3.FORWARD`.
- `fov` is vertical and `size` is height unless `keep_aspect` is changed; widescreen math breaks if you assume horizontal.
- The aspect changes on window resize: recompute on `get_viewport().size_changed`.
- A `SubViewport` has its own size; use that viewport's `get_visible_rect()`, not the root's.

## Links

- [Camera3D](https://docs.godotengine.org/en/stable/classes/class_camera3d.html)
- [Node3D.look_at](https://docs.godotengine.org/en/stable/classes/class_node3d.html#class-node3d-method-look-at)
- [Viewport](https://docs.godotengine.org/en/stable/classes/class_viewport.html)
