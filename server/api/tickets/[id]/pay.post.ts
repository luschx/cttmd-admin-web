// server/api/tickets/[id]/pay.post.ts
//
// Forwards "Mark as paid" (receipt number, owner name, amount paid,
// payment method, remarks) to Django's admin_mark_paid view.

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id.' })
  }

  // The payment details typed in the form
  const body = await readBody(event)

  return await djangoFetch(event, `/api/admin/tickets/${id}/pay/`, {
    method: 'POST',
    body,
  })
})