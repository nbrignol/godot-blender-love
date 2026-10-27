# SubViewport

## Summary

A `SubViewport` is a separate render target with its own size and, for 3D, its own `World3D`. Show it in a 2D page with a `SubViewportContainer` (3D in 2D) or read it as a `ViewportTexture` to use it anywhere a texture fits (`TextureRect`, `Sprite2D`, a 3D material).

## Details

- **3D in 2D**: the 3D content lives under the `SubViewport`, isolated from the 2D scene tree. Nothing in the main viewport sees it.
- **`SubViewportContainer`** (a `Control`): displays its child `SubViewport` and forwards mouse input to it.
  - `stretch = true`: the viewport follows the container size. With `false` it keeps its own `size`.
  - `stretch_shrink`: renders at a lower resolution (the container scales it back up).
  - `mouse_filter = Ignore` stops it from capturing clicks meant for the 2D UI.
- **`ViewportTexture`**: `subviewport.get_texture()`. Use it in a `TextureRect` / `Sprite2D`, or as a material texture (e.g. `albedo_texture` of a mesh, see Mesh and material).
- `transparent_bg = true` lets the 2D background show around the 3D content.
- `render_target_update_mode`: `When Visible` (default), `Always`, `Once` (static model), `Disabled`.
- `msaa_3d`: anti-aliasing is off by default on a `SubViewport`.
- The 3D part needs its own light (`DirectionalLight3D`) and `Camera3D`, otherwise the model renders black or flat. `Environment` / `WorldEnvironment` sets background and ambient light.
- A flat, UI-like look: `Camera3D.projection = Orthogonal`.

## Snippet

```
Control
└─ SubViewportContainer (stretch = true)
   └─ SubViewport (transparent_bg = true)
      └─ Node3D
         ├─ Button (the .glb instance)
         ├─ Camera3D
         └─ DirectionalLight3D
```

```gdscript
@onready var model: Node3D = $SubViewportContainer/SubViewport/Node3D/Button

func _process(delta: float) -> void:
	model.rotate_y(delta)
```

2D node placed over the 3D model (position is in `SubViewport` pixels):

```gdscript
@onready var container: SubViewportContainer = $SubViewportContainer
@onready var cam: Camera3D = $SubViewportContainer/SubViewport/Camera3D
@onready var target: Node3D = $SubViewportContainer/SubViewport/Node3D/Button

func _process(_delta: float) -> void:
	if cam.is_position_behind(target.global_position):
		$Label.hide()
		return
	$Label.show()
	$Label.global_position = container.global_position + cam.unproject_position(target.global_position)
```

## Pitfalls

- With `stretch = false`, the viewport ignores the container size.
- `unproject_position()` gives coordinates in the `SubViewport`, not the window: add the container's `global_position`, and account for `stretch_shrink` if it is not 1.
- `unproject_position()` returns a garbage position for points behind the camera; check `is_position_behind()` first.
- A `Control` is anchored by its top-left corner: subtract half its `size` to center it.
- A `SubViewport` has its own size: use its own `get_visible_rect()`, not the root's.
- `ViewportTexture` on a mesh: mouse input does not reach the 2D nodes, forward events with `push_input()`.

## Links

- [Using Viewports](https://docs.godotengine.org/en/stable/tutorials/rendering/viewports.html)
- [SubViewport](https://docs.godotengine.org/en/stable/classes/class_subviewport.html)
- [SubViewportContainer](https://docs.godotengine.org/en/stable/classes/class_subviewportcontainer.html)
