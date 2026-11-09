export default defineEventHandler(async (event) => {
  const code = decodeURIComponent(getRouterParam(event, 'code') || '').trim()
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Code is required.' })
  }

  const list: any[] = await djangoFetch(
    event,
    `/api/admin/tickets/search/?q=${encodeURIComponent(code)}`
  )

  const t =
    list.find((x) => x.transaction_code?.toUpperCase() === code.toUpperCase()) ?? list[0]

  if (!t) {
    throw createError({ statusCode: 404, statusMessage: 'No record found.' })
  }

  const base = String(useRuntimeConfig(event).djangoBaseUrl ?? '').replace(/\/$/, '')
  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`)
  const VIDEO_EXT = /\.(mp4|mov|m4v|webm|avi|mkv|3gp)(\?|#|$)/i

  const images: string[] = []
  const videos: string[] = []

  const add = (raw: any, force = false) => {
    const items = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const e of items) {
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

  return { ...t, images: [...new Set(images)], videos: [...new Set(videos)] }
})