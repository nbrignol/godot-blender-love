# Sharing code

## Summary

Pick the tool by state and tree needs: stateless helper -> `static func`; shared node behavior -> inheritance or component scene; data object -> `RefCounted`/`Resource`; global state with signals -> autoload.

## Details

- **Static helper**: script with `class_name` + `static func`. No instance, no import: `class_name` registers a global class usable from any script.
- **Registry**: global classes are listed in `.godot/global_script_class_cache.cfg` (refreshed by the editor). `class_name` must be unique and not collide with built-in classes.
- **`preload`/`load`**: explicit alternative (`const Helper = preload("res://utils/helper.gd")`); use it to avoid polluting the global namespace. Without `class_name`, this is the only way to reach the script.
- **Non-Node class**: `extends RefCounted` (default if `extends` is omitted, auto-freed). `Resource` adds serialization (`.tres`), `@export`/Inspector editing and sharing between scenes. Raw `Object` needs manual `free()`.
- **Singleton = Autoload**: `Project > Project Settings > Globals > Autoload`. Instantiated at startup under `/root/<Name>`, before the main scene, survives `change_scene_to_*`. Can be a script or a `.tscn`. Has `_ready`, `_process`, signals.
- **Static vars** (4.1+): `static var` in a `class_name` script gives a node-less global, but no signals and no tree access.
- Other options: inheritance (`extends`, *New Inherited Scene*), composition (instance a component scene).

## Snippet

```gdscript
# utils/math_utils.gd
class_name MathUtils

static func wrap_index(i: int, size: int) -> int:
	return posmod(i, size)

# anywhere
var next = MathUtils.wrap_index(current + 1, players.size())
```

```gdscript
# models/player_data.gd
class_name PlayerData
extends RefCounted

var score: int = 0

func add_points(n: int) -> void:
	score += n
```

```gdscript
# game_state.gd (registered as Autoload "GameState")
extends Node

signal score_changed(player: String, value: int)
var scores := {}

func add_score(player: String, pts: int) -> void:
	scores[player] = scores.get(player, 0) + pts
	score_changed.emit(player, scores[player])

# anywhere
GameState.add_score("Alice", 5)
GameState.score_changed.connect(_on_score_changed)
```

## Pitfalls

- No language-level singleton: nothing prevents `GameState.new()`; it is a convention.
- An autoload script must not use a `class_name` identical to its autoload name (error).
- Autoloads are global state: overuse couples scenes. Prefer "call down, signal up"; keep autoloads for game state, settings, audio, transitions.

## Links

- [Singletons (Autoload)](https://docs.godotengine.org/en/stable/tutorials/scripting/singletons_autoload.html)
- [GDScript reference: classes, static](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html#classes)
