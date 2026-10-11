export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id.' })
  }
  return await djangoFetch(event, `/api/admin/tickets/${id}/pay/`, { method: 'POST' })
})