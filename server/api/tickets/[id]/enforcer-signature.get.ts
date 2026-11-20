// Place at: server/api/tickets/[id]/enforcer-signature.get.ts
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id.' })
  }

  // Same token source as djangoFetch
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not logged in. Please log in again.' })
  }

  const config = useRuntimeConfig(event)
  const base = String(config.djangoBaseUrl ?? '').replace(/\/$/, '')

  const res = await fetch(`${base}/api/admin/tickets/${id}/enforcer-signature/`, {
    headers: { Authorization: `Token ${token}` },
  })
  if (!res.ok) {
    throw createError({ statusCode: res.status, statusMessage: 'No signature on file.' })
  }

  setHeader(event, 'Content-Type', res.headers.get('content-type') || 'image/png')
  setHeader(event, 'Cache-Control', 'private, no-store')
  return Buffer.from(await res.arrayBuffer())
})