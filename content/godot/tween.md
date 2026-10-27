# Tween 

`create_tween()` is a `Node` method. It returns a `Tween` bound to that node: it starts automatically, and is freed with the node. Steps run **sequentially** by default.

## Basics: tween a property

```gdscript
var tween := create_tween()
tween.tween_property(self, "scale", Vector2(1.1, 1.1), 0.15)
```

Signature: `tween_property(object, "property_path", final_value, duration)`.

- Sub-property path: `"modulate:a"`, `"position:x"`.
- On a `Control`, scale grows from the top-left. Set `pivot_offset = size / 2` (Inspector → Layout → Pivot Offset) to scale from the center.
- Inside a `Container`, `scale` is not overridden by the container (`position` / `size` are).
- `modulate` values above 1 brighten the texture (needs *HDR 2D* in Project Settings → Rendering → Viewport on Forward+/Mobile; clamped in Compatibility).

## Several properties at once (parallel)

```gdscript
# Whole tween in parallel
var tween := create_tween().set_parallel(true)
tween.tween_property(self, "scale", Vector2(1.1, 1.1), 0.15)
tween.tween_property(self, "modulate", Color(1.3, 1.3, 1.3), 0.15)

# Or per step
var tween := create_tween()
tween.tween_property(self, "scale", Vector2(1.1, 1.1), 0.15)
tween.parallel().tween_property(self, "modulate", Color(1.3, 1.3, 1.3), 0.15)
```

## Sequencing steps in one tween

Default behavior: each step starts after the previous one ends.

```gdscript
var tween := create_tween()
tween.tween_property(self, "scale", Vector2(1.2, 1.2), 0.1)
tween.tween_interval(0.5)                        # pure wait
tween.tween_property(self, "scale", Vector2.ONE, 0.15)
tween.tween_callback(print.bind("done"))         # run code between steps
```

## `chain()` vs `parallel()`

- `parallel()`: next step runs **alongside** the previous one (in a sequential tween).
- `chain()`: next step starts **after the whole current parallel group** (in a `set_parallel(true)` tween). It starts when the longest step of the group ends.
- Both only affect the next step. In a sequential tween, `chain()` has no visible effect.

```gdscript
var tween := create_tween().set_parallel(true)
tween.tween_property(self, "scale", Vector2(1.2, 1.2), 0.2)    # group 1
tween.tween_property(self, "modulate:a", 0.5, 0.3)             # group 1
tween.chain().tween_property(self, "scale", Vector2.ONE, 0.2)  # group 2, starts at t=0.3s
```

## Go back to normal after a delay

```gdscript
func _on_mouse_entered() -> void:
	var tween := create_tween().set_parallel(true)
	tween.tween_property(self, "scale", Vector2(1.1, 1.1), 0.15)
	tween.tween_property(self, "modulate", Color(1.3, 1.3, 1.3), 0.15)
	tween.chain().tween_property(self, "scale", Vector2.ONE, 0.15).set_delay(0.5)
	tween.tween_property(self, "modulate", Color.WHITE, 0.15).set_delay(0.5)
```

The last line has no `chain()`, so it runs in parallel with the line above.

## Hover pitfall: kill the previous tween

Quick hover in/out creates two tweens fighting over the same property.

```gdscript
var _tween: Tween

func _animate(target_scale: Vector2) -> void:
	if _tween:
		_tween.kill()
	_tween = create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	_tween.tween_property(self, "scale", target_scale, 0.12)
```

## Modifiers

- `set_trans(Tween.TRANS_BACK)` / `set_ease(Tween.EASE_OUT)`: curve (overshoot, bounce...). On the tween = default; on a step = override.
- `.set_delay(sec)` on a step.
- `set_loops()` (infinite) or `set_loops(3)`.
- `tween_callback(callable)`, `tween_interval(sec)`.

## Combining several Tween instances

No `tween_a.chain(tween_b)`. Options:

```gdscript
# Parallel: just create both, they run independently
create_tween().tween_property(self, "scale", Vector2(1.2, 1.2), 0.2)
create_tween().tween_property(self, "modulate:a", 0.5, 0.3)

# Sequential: await / signal (any version)
await tween_a.finished
create_tween().tween_property(...)

# Embed as steps (4.3+, check Tween.tween_subtween docs for auto-start behavior)
var main := create_tween()
main.tween_subtween(sub_a)
main.tween_subtween(sub_b)   # after sub_a; add .parallel() to run alongside
```

Also: `tween_a.finished.connect(start_b)`.

## Docs

`Tween`, `Tween.TransitionType`, `Tween.EaseType`, `PropertyTweener`, `SubtweenTweener`.
