export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid officer id.' })
  }

  await djangoFetch(event, `/api/enforcers/${id}/`, { method: 'DELETE' })
  return { ok: true }
})