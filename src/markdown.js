// Single entry point for Markdown: parsing and highlighting.
import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import gdscript from './gdscript.js'
import python from 'highlight.js/lib/languages/python'
import glsl from 'highlight.js/lib/languages/glsl'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import ini from 'highlight.js/lib/languages/ini'

Object.entries({ gdscript, python, glsl, bash, json, ini }).forEach(([n, l]) => hljs.registerLanguage(n, l))

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      const body = lang && hljs.getLanguage(lang) ? hljs.highlight(text, { language: lang }).value : escape(text)
      return `<pre><code class="hljs">${body}</code></pre>`
    },
  },
})

export const renderMarkdown = (raw) => marked.parse(raw)
