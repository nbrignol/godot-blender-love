import Alpine from 'alpinejs'
import './style.css'
import { renderMarkdown } from './markdown.js'

const url = (path) => `${import.meta.env.BASE_URL}${path}`

Alpine.data('docs', () => ({
  menu: [],
  openCats: [],
  current: '',
  cat: '',
  html: '',
  menuOpen: false,
  async init() {
    this.menu = (await (await fetch(url('menu.json'))).json()).categories
    this.openCats = this.menu.map((c) => c.label)
    window.addEventListener('hashchange', () => this.route())
    this.route()
  },
  async route() {
    const key = location.hash.replace(/^#\//, '') || 'index'
    const res = await fetch(url(`${key}.md`))
    this.current = key
    this.cat = this.menu.find((c) => c.items.some((i) => i.page === key))?.label ?? ''
    this.html = res.ok ? renderMarkdown(await res.text()) : '<h1>Not found</h1>'
  },
  toggle(label) {
    this.openCats = this.openCats.includes(label) ? this.openCats.filter((n) => n !== label) : [...this.openCats, label]
  },
}))

window.Alpine = Alpine
Alpine.start()
