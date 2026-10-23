// In-memory substring search over the pages listed in menu.json.
const CONTEXT = 40

// Markdown -> plain text: drop fence lines and markers, keep the code itself searchable.
export function strip(md) {
  return md
    .replace(/^\s*```.*$/gm, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|`/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// -> [{ page, label, category, text }]
export async function buildIndex(menu, url) {
  const entries = menu.flatMap((c) => c.items.filter((i) => i.page).map((i) => ({ ...i, category: c.label })))
  return Promise.all(
    entries.map(async ({ page, label, category }) => {
      const res = await fetch(url(`${page}.md`))
      return { page, label, category, text: res.ok ? strip(await res.text()) : '' }
    }),
  )
}

// -> [{ page, label, category, before, match, after }], label matches first
export function search(index, query) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits = []
  for (const e of index) {
    const inLabel = e.label.toLowerCase().includes(q)
    const at = e.text.toLowerCase().indexOf(q)
    if (!inLabel && at < 0) continue
    const start = Math.max(0, at - CONTEXT)
    const hit = {
      page: e.page,
      label: e.label,
      category: e.category,
      before: at < 0 ? e.text.slice(0, CONTEXT * 2) : (start > 0 ? '…' : '') + e.text.slice(start, at),
      match: at < 0 ? '' : e.text.slice(at, at + q.length),
      after: at < 0 ? '' : e.text.slice(at + q.length, at + q.length + CONTEXT) + (at + q.length + CONTEXT < e.text.length ? '…' : ''),
    }
    hits.push({ hit, inLabel })
  }
  return hits.sort((a, b) => b.inLabel - a.inLabel).map((h) => h.hit)
}
