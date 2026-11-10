export default defineEventHandler(async (event) => {
  const { q = '', status = '' } = getQuery(event)
  const query = new URLSearchParams({
    q: String(q),
    status: String(status).toLowerCase(),
  }).toString()
  const data = await djangoFetch(event, `/api/admin/tickets/search/?${query}`)

  const base = String(useRuntimeConfig(event).djangoBaseUrl ?? '').replace(/\/$/, '')

  // Add your previous domain or IP here if it isn't localhost/private,
  // e.g. /^(localhost|127\.|10\.|192\.168\.|old-domain\.com)/
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

  return fix(data)
})