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
  return t
})