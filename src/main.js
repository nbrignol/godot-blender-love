import Alpine from 'alpinejs'
import './style.css'
import { renderMarkdown } from './markdown.js'
import { buildIndex, search } from './search.js'

const url = (path) => `${import.meta.env.BASE_URL}${path}`

Alpine.data('docs', () => ({
  menu: [],
  openCats: [],
  current: '',
  cat: '',
  html: '',
  menuOpen: false,
  searchOpen: false,
  searchLoading: false,
  index: null,
  query: '',
  results: [],
  active: 0,
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
  async openSearch() {
    this.searchOpen = true
    this.query = ''
    this.results = []
    this.$nextTick(() => this.$refs.searchInput.focus())
    if (!this.index) {
      this.searchLoading = true
      this.index = await buildIndex(this.menu, url)
      this.searchLoading = false
      this.runSearch()
    }
  },
  closeSearch() {
    this.searchOpen = false
  },
  runSearch() {
    this.results = this.index ? search(this.index, this.query) : []
    this.active = 0
  },
  move(step) {
    if (!this.results.length) return
    this.active = (this.active + step + this.results.length) % this.results.length
    this.$nextTick(() => this.$root.querySelector('[data-active=true]')?.scrollIntoView({ block: 'nearest' }))
  },
  go(page) {
    location.hash = `#/${page}`
    this.menuOpen = false
    this.closeSearch()
  },
  toggle(label) {
    this.openCats = this.openCats.includes(label) ? this.openCats.filter((n) => n !== label) : [...this.openCats, label]
  },
}))

window.Alpine = Alpine
Alpine.start()
