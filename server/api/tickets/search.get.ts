export default defineEventHandler(async (event) => {
  const { q = '', status = '' } = getQuery(event)
  const query = new URLSearchParams({
    q: String(q),
    status: String(status).toLowerCase(),
  }).toString()
  const data = await djangoFetch(event, `/api/admin/tickets/search/?${query}`)

  const base = String(useRuntimeConfig(event).djangoBaseUrl ?? '').replace(/\/$/, '')

  const OLD_HOSTS = /^(localhost|127\.|10\.|192\.168\.)/

  const fix = (v: any): any => {
    if (typeof v === 'string') {
      if (!/^https?:\/\//.test(v)) return v
      try {
        const p = new URL(v)
        if (OLD_HOSTS.test(p.hostname)) return `${base}${p.pathname}${p.search}`
      } catch {}
      return v
    }
    if (Array.isArray(v)) return v.map(fix)
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, fix(val)]))
    }
    return v
  }

  const out = fix(data)
  return Array.isArray(out)
    ? out.map((t: any) => ({ ...t, location: displayLocation(t.location) }))
    : out
})