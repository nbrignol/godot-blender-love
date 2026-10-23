# Signals

## Summary

Signals are Godot's built-in observer pattern: a node declares a signal, other objects connect a `Callable` to it, and the emitter fires it without knowing who listens. Use them for "call down, signal up" communication between nodes.

## Details

- Declare with `signal name(args)`, emit with `name.emit(args)`.
- Connect in code with `signal.connect(callable)`, or in the editor via `Node` dock > `Signals` tab.
- In Godot 4 signals are first-class `Signal` objects, so there is no more string-based `connect("name", obj, "method")` as in Godot 3.
- Useful flags: `CONNECT_ONE_SHOT` (auto-disconnect after first emit), `CONNECT_DEFERRED` (run at idle time).
- `await signal` pauses a function until the signal is emitted.

## Snippet

```gdscript
# enemy.gd
extends Node2D

signal died(score: int)

func take_hit() -> void:
	died.emit(100)

# main.gd
func _ready() -> void:
	$Enemy.died.connect(_on_enemy_died)

func _on_enemy_died(score: int) -> void:
	print("Enemy down, +%d" % score)
```

## Pitfalls

- Connecting the same callable twice raises an error; guard with `is_connected()` when connecting from code that may run more than once.

## Links

- [Using signals](https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html)
- `Signal` class reference: https://docs.godotengine.org/en/stable/classes/class_signal.html
