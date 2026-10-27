# Scene switching and transitions 

## Switch scene

```gdscript
get_tree().change_scene_to_file("res://scenes/level_1.tscn")
# or with a PackedScene:
get_tree().change_scene_to_packed(preload("res://scenes/level_1.tscn"))
```

The change is deferred: the old scene is freed and the new one loaded at the end of the frame. The load is **synchronous** (main thread), so a heavy scene freezes the game briefly.

## Fade transition: `SceneTransition` autoload

Setup:
- Scene with a root `CanvasLayer` (high `layer`, e.g. 100) containing a full-rect black `ColorRect` (`modulate:a = 0`, `mouse_filter = Ignore`).
- Register it in Project Settings → Globals → Autoload as `SceneTransition`. An autoload survives the scene change, which is why it works.

```gdscript
extends CanvasLayer

@onready var rect: ColorRect = $ColorRect

func change_scene(path: String) -> void:
	rect.mouse_filter = Control.MOUSE_FILTER_STOP   # block clicks during fade
	var tween := create_tween()
	tween.tween_property(rect, "modulate:a", 1.0, 0.3)
	await tween.finished
	get_tree().change_scene_to_file(path)
	await get_tree().process_frame   # change is deferred; may need two frames
	tween = create_tween()
	tween.tween_property(rect, "modulate:a", 0.0, 0.3)
	await tween.finished
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
```

Usage: `SceneTransition.change_scene("res://scenes/level_1.tscn")`.

Note: the black rect only **hides** the swap; it does not remove the load freeze. The fade-in cannot animate while the main thread is blocked loading.

## Background loading: `ResourceLoader`

```gdscript
ResourceLoader.load_threaded_request(path)
# poll until done (e.g. in _process), then:
var scene: PackedScene = ResourceLoader.load_threaded_get(path)
get_tree().change_scene_to_packed(scene)
```

- Progress: `ResourceLoader.load_threaded_get_status(path, progress_array)` to drive a loading bar (`progress_array[0]` is 0.0..1.0).
- Status values: `THREAD_LOAD_IN_PROGRESS`, `THREAD_LOAD_LOADED`, `THREAD_LOAD_FAILED`, `THREAD_LOAD_INVALID_RESOURCE`.
- `load_threaded_get()` blocks if called before the load has finished.
- Instantiation still happens on the main thread, so a small hitch can remain.
- `use_sub_threads = true` loads dependencies in parallel (faster, less accurate progress).

### No signal: you must poll

`ResourceLoader` has no signal for threaded loads. Polling `load_threaded_get_status()` is the intended API, and it is cheap to call every frame. To get an await-style API, wrap the loop once:

```gdscript
func load_scene_async(path: String) -> PackedScene:
	ResourceLoader.load_threaded_request(path)
	while ResourceLoader.load_threaded_get_status(path) == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
		await get_tree().process_frame
	return ResourceLoader.load_threaded_get(path) as PackedScene
```

Usage: `var scene := await load_scene_async("res://scenes/level_1.tscn")`.

- This wrapper does not handle failure: check the final status for `THREAD_LOAD_FAILED` before returning.
- To poll less often: `await get_tree().create_timer(0.1).timeout` inside the loop.
- Emit your own signal (e.g. `scene_loaded`) from the wrapper if several nodes need to react.

## Other leads

- Custom transitions: `ShaderMaterial` on the `ColorRect`, tween a uniform (e.g. `cutoff`) with `tween_property(rect.material, "shader_parameter/cutoff", 1.0, 0.5)`.
- `AnimationPlayer` in the autoload scene (fade_in / fade_out animations) instead of tweens.
- Manual swap: `add_child(scene.instantiate())` + `queue_free()` on the old one, to keep both alive during the transition.
- Community addons (Scene Manager, Transitions) if you don't want to build it.

## Docs

`SceneTree.change_scene_to_file`, `ResourceLoader`, `CanvasLayer`, Autoload (Project Settings → Globals).
