# Mesh and material

## Summary

A `MeshInstance3D` renders a `Mesh` with one material per surface. Materials from an imported `.glb` are shared resources: duplicate them into a per-instance override before changing colors, emission or textures from code.

## Details

- `MeshInstance3D.get_active_material(i)` returns the material of surface `i` (override first, then the mesh's own); `null` if the slot is empty.
- `set_surface_override_material(i, mat)` replaces it for this instance only.
- `GeometryInstance3D.material_override` replaces all surfaces; `material_overlay` stacks a second material on top.
- `StandardMaterial3D` color properties: `albedo_color`, `emission` (+ `emission_enabled`, `emission_energy_multiplier`), `emission_texture`.
- Texture slots: `albedo_texture`, `normal_texture`, `roughness_texture`, ... or `set_texture(BaseMaterial3D.TEXTURE_ALBEDO, tex)` / `get_texture()`.
- `uv1_scale` / `uv1_offset` tile or scroll a texture; `texture_filter` toggles pixelated vs smooth.
- 2D content on a mesh: put it in a `SubViewport` and use `vp.get_texture()` as `albedo_texture` of a `material_overlay` (`transparency = TRANSPARENCY_ALPHA`).

## Snippet

```gdscript
@onready var mesh: MeshInstance3D = $Button/MeshInstance3D
var mat: StandardMaterial3D

func _ready() -> void:
	mat = mesh.get_active_material(0).duplicate() as StandardMaterial3D
	mesh.set_surface_override_material(0, mat)  # this instance only

	mat.albedo_color = Color.RED
	mat.emission_enabled = true
	mat.emission = Color.ORANGE
	mat.emission_energy_multiplier = 3.0
	mat.albedo_texture = load("res://Button_rounded-one.png")

func pulse() -> void:
	create_tween().tween_property(mat, "emission_energy_multiplier", 5.0, 0.3)
```

## Pitfalls

- Without `duplicate()`, you modify the material shared by every instance of the `.glb`.
- `emission_enabled` must be `true`, otherwise the energy multiplier has no effect.
- `get_active_material()` can return `null`; a `.glb` can have several surfaces, each with its own index.
- `resource_path` of a texture is empty if it is embedded in the `.glb`.
- Use `load()` with a literal path or `preload()` so exports include the texture.
- Overlay viewport: set `render_target_update_mode` to `Always`; mouse input does not reach the 2D nodes (forward with `push_input()`).

## Links

- [StandardMaterial3D](https://docs.godotengine.org/en/stable/classes/class_standardmaterial3d.html)
- [MeshInstance3D](https://docs.godotengine.org/en/stable/classes/class_meshinstance3d.html)
- [Using the SubViewport](https://docs.godotengine.org/en/stable/tutorials/rendering/viewports.html)
