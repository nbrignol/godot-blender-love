// Minimal highlight.js grammar for GDScript (not shipped with highlight.js).
export default function gdscript(hljs) {
  return {
    name: 'GDScript',
    aliases: ['gd'],
    keywords: {
      keyword:
        'and as assert await break breakpoint class class_name const continue elif else enum extends for func if in is match not or pass preload return signal static super var while when yield',
      literal: 'true false null PI TAU INF NAN',
      type: 'void bool int float String StringName Vector2 Vector2i Vector3 Vector3i Vector4 Color Rect2 Transform2D Transform3D Basis Quaternion NodePath RID Callable Signal Dictionary Array Variant Object Node',
      built_in: 'print push_error push_warning range len str load self',
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      hljs.C_NUMBER_MODE,
      { className: 'meta', begin: /@[a-z_]+/ }, // annotations: @export, @onready
      { className: 'variable', begin: /[$%]"?[A-Za-z_][\w/]*"?/ }, // $Node, %Unique
      { className: 'title.function', beginKeywords: 'func', end: /\(/, excludeEnd: true, contains: [hljs.UNDERSCORE_TITLE_MODE] },
      { className: 'title.class', beginKeywords: 'class class_name extends', end: /$/, contains: [hljs.UNDERSCORE_TITLE_MODE] },
    ],
  }
}
