# Screen, viewport, camera and safe area 

## Two coordinate spaces

- **Physical pixels:** the real screen / window (`DisplayServer.screen_get_size()`, `get_window().size`).
- **Viewport units:** the logical space your nodes live in, after stretch settings (Project Settings → Display → Window → Stretch). `get_viewport().get_visible_rect()` returns the visible area as a `Rect2` in these units.

The two differ whenever the stretch mode is `canvas_items` or `viewport`, or the aspect is not kept as-is. Converting between them is the main pitfall when using `DisplayServer` values to position UI.

```gdscript
var vp_size := get_viewport().get_visible_rect().size   # viewport units
var win_size := Vector2(get_window().size)              # physical pixels
var k := vp_size / win_size                             # pixels -> viewport units
```

## Reacting to resize / rotation

Rotation on mobile and window resize on desktop both change the viewport size. The `size_changed` signal belongs to `Viewport`, so any node can connect to it, with no `Control` needed.

```gdscript
extends Node2D

func _ready() -> void:
	get_viewport().size_changed.connect(_on_size_changed)
	_on_size_changed()   # initial layout

func _on_size_changed() -> void:
	var size := get_viewport_rect().size   # logical size, after stretch
	var is_portrait := size.y > size.x     # the signal gives no orientation
	position = size / 2.0
```

- `get_viewport()` exists on `Node`. `get_viewport_rect()` needs a `CanvasItem`.
- Raw window pixels: `get_window().size`. `Window` has its own `size_changed`.
- Notification alternative: `NOTIFICATION_WM_SIZE_CHANGED` in `_notification()`.
- The size may not be final in `_ready()`, so connect the signal instead of reading it once.

## Project configuration

Project Settings → Display → Window:

- **Stretch → Mode:** `canvas_items` for 2D and UI (sharp text). `viewport` is for pixel art.
- **Stretch → Aspect:** `expand` keeps the scale and adds space instead of black bars.
- **Handheld → Orientation:** `portrait`, `landscape` or `sensor` (the device rotates freely).
- The Android and iOS export presets also have orientation options.
- Runtime change: `DisplayServer.screen_set_orientation()`.

Layout with `Control` nodes: root set to Full Rect, plus containers (`BoxContainer.vertical` to switch row and column, `FlowContainer`, `AspectRatioContainer`).

## Safe area (notch, rounded corners, home indicator)

`DisplayServer.get_display_safe_area()` returns a `Rect2i` in **physical screen pixels**. Works on iOS and Android. On desktop it returns the full screen.

Pattern: a full-rect `MarginContainer` around the UI, with margins taken from the safe area. Background art stays outside the container and fills the whole screen. Only interactive or readable UI goes inside.

```gdscript
extends MarginContainer

func _ready() -> void:
	var safe := DisplayServer.get_display_safe_area()
	var screen := DisplayServer.screen_get_size()
	var win := Vector2(get_window().size)
	var k := get_viewport().get_visible_rect().size / win   # pixels -> viewport units

	add_theme_constant_override("margin_left",   int(safe.position.x * k.x))
	add_theme_constant_override("margin_top",    int(safe.position.y * k.y))
	add_theme_constant_override("margin_right",  int((screen.x - safe.end.x) * k.x))
	add_theme_constant_override("margin_bottom", int((screen.y - safe.end.y) * k.y))
```

Caveat: not tested on a device. The conversion can be off with some stretch modes or aspect settings, so check it on a real phone or on the emulator.

## Other leads

- `DisplayServer.get_display_cutouts()`: notch and camera-hole rectangles (Android only, as far as known).
- Re-run the margin code when the window size or orientation changes: `get_viewport().size_changed` signal (see "Reacting to resize / rotation").
- Android edge-to-edge behavior is set in Project → Export → Android (options depend on the Godot version).

## Docs

`DisplayServer.get_display_safe_area`, `Viewport.get_visible_rect`, `MarginContainer`, Project Settings → Display → Window → Stretch.
