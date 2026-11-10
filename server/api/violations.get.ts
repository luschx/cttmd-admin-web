export default defineEventHandler(async (event) => {
  const data: any[] = await djangoFetch(event, '/api/admin/tickets/search/')

  const base = String(useRuntimeConfig(event).djangoBaseUrl ?? '').replace(/\/$/, '')

  // Hosts that are known to be old/local. Add your previous domain or IP here,
  // e.g. /^(localhost|127\.|10\.|192\.168\.|old-domain\.com|203\.0\.113\.5)/
  const OLD_HOSTS = /^(localhost|127\.|10\.|192\.168\.)/

  const STATUS_MAP: Record<string, string> = {
    paid: 'Paid',
    unpaid: 'Unpaid',
    declined: 'Declined',
  }

  const abs = (u: string) => {
    if (/^https?:\/\//.test(u)) {
      try {
        const p = new URL(u)
        // old/local host -> move the same path onto the current Django base
        if (OLD_HOSTS.test(p.hostname)) {
          return `${base}${p.pathname}${p.search}`
        }
      } catch {}
      return u // real external storage (S3, Cloudinary, etc.) stays untouched
    }
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`
  }

  const VIDEO_EXT = /\.(mp4|mov|m4v|webm|avi|mkv|3gp)(\?|#|$)/i

  const media = (t: any) => {
    const images: string[] = []
    const videos: string[] = []

    const add = (raw: any, force = false) => {
      const list = Array.isArray(raw) ? raw : raw ? [raw] : []
      for (const e of list) {
        const isObj = e && typeof e === 'object'
        const url = isObj
          ? e.file ?? e.url ?? e.image ?? e.image_url ?? e.video ?? e.video_url ?? e.photo ?? e.media ?? e.path
          : e
        if (!url || typeof url !== 'string') continue

        const type = isObj
          ? String(e.media_type ?? e.type ?? e.kind ?? e.file_type ?? e.mime_type ?? e.content_type ?? '').toLowerCase()
          : ''
        const isVideo =
          force || type.includes('video') || VIDEO_EXT.test(url) || (isObj && !!(e.video || e.video_url))

        ;(isVideo ? videos : images).push(abs(url))
      }
    }

    add(t.evidence)
    add(t.images)
    add(t.image)
    add(t.photo)
    add(t.video, true)
    add(t.video_url, true)
    add(t.videos, true)
    add(t.proof_video, true)

    return { images: [...new Set(images)], videos: [...new Set(videos)] }
  }

  return data.map((t) => {
    const {
      date_issued, enforcer_name, enforcer_badge,
      evidence, images: _i, image: _im, photo: _p,
      video: _v, video_url: _vu, videos: _vs, proof_video: _pv,
      ...rest
    } = t

    return {
      ...rest,
      id: t.id,
      plate_number: t.plate_number ?? '',
      location: t.location,
      violation: t.violation,
      datetime: date_issued,
      status: STATUS_MAP[String(t.status ?? '').toLowerCase()] ?? 'Unpaid',
      ...media(t),
      officers: enforcer_badge
        ? { name: enforcer_name, officer_code: enforcer_badge }
        : null,
    }
  })
})