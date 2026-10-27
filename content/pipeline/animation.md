# Animation: Blender to Godot

Considering: Blender 4.5 → Godot 4 (glTF 2.0).

## Summary

Blender stores one **Action** per object and has no `AnimationPlayer`. Godot's glTF importer creates a single `AnimationPlayer` per imported scene, holding every clip in its default `AnimationLibrary`. To get one clip that animates several objects, name things consistently in Blender and pick the right export mode.

## Details

- **Merge several objects into one clip (usual way)**:
  1. Give each object's Action the same animation name, e.g. `Open`.
  2. In the **Nonlinear Animation** editor, push each Action down onto an NLA track and rename the **track** `Open`.
  3. `File > Export > glTF 2.0 (.glb)`, **Animation > Mode = NLA Tracks**. Same-named tracks across objects merge into one animation.
- **Single clip**: export mode **Scene** exports one animation covering the timeline, with all objects' keyframes together.
- **Godot side**: double-click the `.glb` to open the import dock, **Animation** tab: loop, split, rename. Clips appear in the instanced scene's `AnimationPlayer`.
- **Several `AnimationPlayer`s** (a `.glb` always gives one):
  - One `.glb` per group of objects (export with **Include > Selected Objects**).
  - Or right-click the `.glb` > **New Inherited Scene**, add your own `AnimationPlayer`s and move clips into them as `AnimationLibrary` resources (**Animation > Save As**).
  - Or keep one player and call `play()` on the right clip (the usual choice).

## Snippet

```gdscript
$Model/AnimationPlayer.play("Open")
$Model/AnimationPlayer.play("Close")
```

## Pitfalls

- The merge depends on identical track names: a typo creates two separate animations.
- One Action can't hold keys for several objects (except shape keys or material properties of the same object).
- A clip's tracks target nodes by path relative to the player's `root_node`. If you move a clip to another player, set `root_node` so paths still resolve.
- The `.glb` import is overwritten on re-import: edit in an inherited scene, never in the imported one.

## Links

- [Importing 3D scenes: animation options](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_scenes.html)
- [AnimationPlayer](https://docs.godotengine.org/en/stable/classes/class_animationplayer.html)
- [Blender glTF 2.0 exporter](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
