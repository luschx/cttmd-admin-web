const GPS_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:\(GPS\))?\s*$/i
const geoCache = new Map<string, string>()
const geoQueue = new Set<string>()
let geoRunning = false

async function drainGeoQueue() {
  if (geoRunning) return
  geoRunning = true
  while (geoQueue.size) {
    const raw = geoQueue.values().next().value as string
    geoQueue.delete(raw)
    const m = raw.match(GPS_RE)
    if (!m) continue
    try {
      const res: any = await $fetch('https://nominatim.openstreetmap.org/reverse', {
        params: { lat: m[1], lon: m[2], format: 'jsonv2', zoom: 18, addressdetails: 1 },
        headers: { 'User-Agent': 'CTTMD-Admin/1.0 (school project)' },
      })
      const a = res?.address ?? {}
      const name = [
        a.road,
        a.neighbourhood || a.suburb || a.quarter,
        a.city || a.town || a.municipality,
      ].filter(Boolean).join(', ') || res?.display_name
      geoCache.set(raw, name || raw)
    } catch {
      geoCache.set(raw, raw)
    }
    await new Promise((r) => setTimeout(r, 1100))
  }
  geoRunning = false
}

export function displayLocation(loc: any) {
  const raw = String(loc ?? '')
  if (!GPS_RE.test(raw)) return loc
  const hit = geoCache.get(raw)
  if (hit) return hit
  geoQueue.add(raw)
  drainGeoQueue()
  return raw
}