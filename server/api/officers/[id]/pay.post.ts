// server/api/tickets/[id]/pay.post.ts
//
// Forwards "Mark as paid" (receipt number, owner name, amount paid,
// payment method, remarks) to Django's admin_mark_paid view.
//
// TEMPORARY DEBUG: the console.log lines and the "[pay.post]" prefix on the
// error message are only here to find out where the error comes from.
// Remove them once payments work.

export default defineEventHandler(async (event) => {
  console.log('PAY HANDLER REACHED')

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  console.log('PAY BODY:', JSON.stringify(body))

  try {
    const result = await djangoFetch(event, `/api/admin/tickets/${id}/pay/`, {
      method: 'POST',
      body,
    })
    console.log('PAY OK for ticket', id)
    return result
  } catch (err: any) {
    console.error('PAY ERROR:', err?.statusCode, err?.statusMessage, JSON.stringify(err?.data))

    // Django sends errors as { error: "..." }; the page reads statusMessage
    const msg =
      err?.data?.error || err?.statusMessage || 'Failed to mark ticket as paid.'
    throw createError({
      statusCode: err?.statusCode || err?.response?.status || 500,
      statusMessage: `[pay.post] ${msg}`,
    })
  }
})