export default defineEventHandler(async (event) => {
  const { q = '', status = '' } = getQuery(event)
  const query = new URLSearchParams({ q: String(q), status: String(status) }).toString()
  return await djangoFetch(event, `/api/admin/tickets/search/?${query}`)
})