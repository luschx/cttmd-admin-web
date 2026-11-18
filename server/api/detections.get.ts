export default defineEventHandler(async (event) => {
  const data: any = await djangoFetch(event, '/api/detections/declined/')

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

  const list = Array.isArray(data) ? data : (data?.results ?? [])
  return fix(list)
})